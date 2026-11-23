import { NextRequest } from "next/server";

import { findForbiddenRtmpsSecretField, redactByodSecrets } from "@/lib/byod/byod-mappers";
import { isValidUuid, jsonNoStore, NO_STORE, readJsonObject, resolveHockeyApiBase } from "@/lib/hockey-api";

type Params = { params: Promise<{ deviceId: string; action: string }> };

const ALLOWED_DEVICE_ACTIONS = new Set(["handshake", "heartbeat", "telemetry"]);
const PRESERVED_STATUSES = new Set([400, 401, 403, 404, 409, 410, 422, 429, 503]);

function resolveValidatedUpstreamOrigin():
  | { ok: true; apiV1Base: string }
  | { ok: false; response: ReturnType<typeof jsonNoStore> } {
  let base: string;
  try {
    base = resolveHockeyApiBase();
  } catch (err) {
    console.error(
      "[byod-device-proxy] Configuration error:",
      redactByodSecrets(err instanceof Error ? err.message : String(err)),
    );
    return { ok: false, response: jsonNoStore({ error: "BYOD upstream service is not configured." }, 503) };
  }

  let parsed: URL;
  try {
    parsed = new URL(base);
  } catch {
    return { ok: false, response: jsonNoStore({ error: "Invalid BYOD upstream base URL configuration." }, 503) };
  }

  const host = parsed.hostname.toLowerCase().replace(/\.+$/, "");
  if (!host || host === "ts.net" || host.endsWith(".ts.net")) {
    return {
      ok: false,
      response: jsonNoStore({ error: "BYOD upstream URL must not use a tailnet host." }, 503),
    };
  }

  return { ok: true, apiV1Base: base.replace(/\/+$/, "") };
}

function hasValidDeviceAuthorization(headerValue: string | null): headerValue is string {
  if (!headerValue) return false;
  const trimmed = headerValue.trim();
  const match = /^Device\s+(.+)$/i.exec(trimmed);
  return Boolean(match && match[1].trim().length > 0);
}

/**
 * Release HTTPS BFF proxy for bench-side Edge/iOS BYOD devices (`O-09` / `T6.3`).
 *
 * Forwards unauthenticated crockford-code `handshake` and `Authorization: Device <token>`
 * `heartbeat`/`telemetry` requests from `hub.transcendental-sports.ai` to `hockey-api`
 * `/api/v1/byod/devices/{device_id}/{handshake|heartbeat|telemetry}` without exposing `.ts.net` URLs.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { deviceId, action } = await params;
  const cleanAction = action.trim().toLowerCase();
  if (!ALLOWED_DEVICE_ACTIONS.has(cleanAction)) {
    return jsonNoStore({ error: "Unsupported BYOD device action." }, 404);
  }
  if (!isValidUuid(deviceId)) {
    return jsonNoStore({ error: "Invalid deviceId." }, 400);
  }

  const upstream = resolveValidatedUpstreamOrigin();
  if (!upstream.ok) return upstream.response;

  const authHeader = req.headers.get("authorization");
  if (cleanAction !== "handshake" && !hasValidDeviceAuthorization(authHeader)) {
    return jsonNoStore({ error: "Device authorization token required." }, 401);
  }

  let forwardBody: Record<string, unknown> | undefined;
  if (cleanAction === "handshake") {
    const parsedBody = await readJsonObject(req);
    if (!parsedBody.ok) return parsedBody.response;
    const rawCode = parsedBody.data.pairing_code;
    const bodyWithoutPairingCode = { ...parsedBody.data };
    delete bodyWithoutPairingCode.pairing_code;
    if (
      (typeof rawCode === "string" && /\brtmps?:\/\//i.test(rawCode)) ||
      findForbiddenRtmpsSecretField(bodyWithoutPairingCode)
    ) {
      return jsonNoStore(
        {
          error:
            "RTMPS stream keys and credentials must remain on the device or OS Keychain and cannot be sent through the API.",
        },
        422,
      );
    }
    forwardBody = parsedBody.data;
  } else if (cleanAction === "telemetry") {
    const parsedBody = await readJsonObject(req);
    if (!parsedBody.ok) return parsedBody.response;
    if (findForbiddenRtmpsSecretField(parsedBody.data)) {
      return jsonNoStore(
        {
          error:
            "RTMPS stream keys and credentials must remain on the device or OS Keychain and cannot be sent through the API.",
        },
        422,
      );
    }
    forwardBody = parsedBody.data;
  } else {
    const rawText = await req.text().catch(() => "");
    if (rawText.trim().length > 0) {
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        return jsonNoStore({ error: "Invalid JSON request body." }, 400);
      }
      if (!parsedJson || typeof parsedJson !== "object" || Array.isArray(parsedJson)) {
        return jsonNoStore({ error: "Request body must be a JSON object." }, 400);
      }
      const obj = parsedJson as Record<string, unknown>;
      if (findForbiddenRtmpsSecretField(obj)) {
        return jsonNoStore(
          {
            error:
              "RTMPS stream keys and credentials must remain on the device or OS Keychain and cannot be sent through the API.",
          },
          422,
        );
      }
      forwardBody = obj;
    }
  }

  const canonicalId = deviceId.trim().toLowerCase();
  const targetUrl = `${upstream.apiV1Base}/byod/devices/${encodeURIComponent(canonicalId)}/${cleanAction}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (cleanAction !== "handshake" && authHeader) {
    headers.Authorization = authHeader.trim();
  }
  if (forwardBody !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: forwardBody !== undefined ? JSON.stringify(forwardBody) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    console.error(
      "[byod-device-proxy] Upstream network error:",
      redactByodSecrets(err instanceof Error ? err.message : String(err)),
    );
    return jsonNoStore(
      { error: isTimeout ? "BYOD upstream request timed out." : "BYOD upstream service is currently unreachable." },
      isTimeout ? 504 : 502,
    );
  }

  if (res.status === 204) {
    return new Response(null, { status: 204, headers: NO_STORE });
  }

  const rawResp = await res.text().catch(() => "");
  let parsedResp: unknown = null;
  if (rawResp.trim().length > 0) {
    try {
      parsedResp = JSON.parse(rawResp);
    } catch {
      parsedResp = null;
    }
  }

  if (!res.ok) {
    const outStatus = PRESERVED_STATUSES.has(res.status) ? res.status : 502;
    if (parsedResp && typeof parsedResp === "object") {
      return jsonNoStore(parsedResp, outStatus);
    }
    return jsonNoStore({ error: `BYOD upstream error (HTTP ${res.status}).` }, outStatus);
  }

  if (parsedResp === null) {
    return jsonNoStore({ error: "BYOD upstream returned a non-JSON payload." }, 502);
  }

  return jsonNoStore(parsedResp, res.status);
}
