import { NextRequest } from "next/server";

import { findForbiddenRtmpsSecretField, redactByodSecrets } from "@/lib/byod/byod-mappers";
import { isValidUuid, jsonNoStore, NO_STORE, resolveHockeyApiBase } from "@/lib/hockey-api";

type Params = { params: Promise<{ deviceId: string; action: string }> };

const ALLOWED_DEVICE_ACTIONS = new Set(["handshake", "heartbeat", "telemetry"]);
const PRESERVED_STATUSES = new Set([400, 401, 403, 404, 409, 410, 422, 429, 503]);
const MAX_PROXY_BODY_BYTES = 16 * 1024;
const INTERNAL_URL_PATTERN = /\bhttps?:\/\/[^\s"'`,;)}\]]+/gi;
const TAILNET_HOST_PATTERN = /\b[a-z0-9.-]+\.tail[a-z0-9-]+\.[a-z]{2,}(?::\d+)?/gi;

function sanitizeProxyErrorMessage(raw: string, upstreamHosts: string[] = []): string {
  let sanitized = raw
    .replace(INTERNAL_URL_PATTERN, "[REDACTED_URL]")
    .replace(TAILNET_HOST_PATTERN, "[REDACTED_HOST]");
  for (const host of upstreamHosts) {
    if (host) {
      sanitized = sanitized.split(host).join("[REDACTED_HOST]");
    }
  }
  return redactByodSecrets(sanitized);
}

function resolveValidatedUpstreamOrigin():
  | { ok: true; apiV1Base: string; upstreamHosts: string[] }
  | { ok: false; response: ReturnType<typeof jsonNoStore> } {
  let base: string;
  try {
    base = resolveHockeyApiBase();
  } catch (err) {
    console.error(
      "[byod-device-proxy] Configuration error:",
      sanitizeProxyErrorMessage(err instanceof Error ? err.message : String(err)),
    );
    return { ok: false, response: jsonNoStore({ error: "BYOD upstream service is not configured." }, 503) };
  }

  let parsed: URL;
  try {
    parsed = new URL(base);
  } catch {
    return { ok: false, response: jsonNoStore({ error: "Invalid BYOD upstream base URL configuration." }, 503) };
  }

  const upstreamHosts = parsed.host === parsed.hostname ? [parsed.host] : [parsed.host, parsed.hostname];
  return { ok: true, apiV1Base: base.replace(/\/+$/, ""), upstreamHosts };
}

function hasValidDeviceAuthorization(headerValue: string | null): headerValue is string {
  if (!headerValue) return false;
  const trimmed = headerValue.trim();
  const match = /^Device\s+(.+)$/i.exec(trimmed);
  return Boolean(match && match[1].trim().length > 0);
}

async function readBoundedJsonObject(
  req: NextRequest,
  required: boolean,
): Promise<
  | { ok: true; data: Record<string, unknown> | undefined }
  | { ok: false; response: ReturnType<typeof jsonNoStore> }
> {
  const lenHeader = req.headers.get("content-length");
  if (lenHeader !== null) {
    const declared = Number(lenHeader);
    if (Number.isFinite(declared) && declared > MAX_PROXY_BODY_BYTES) {
      return { ok: false, response: jsonNoStore({ error: "Request payload too large." }, 413) };
    }
  }

  const rawText = await req.text().catch(() => null);
  if (rawText === null) {
    return { ok: false, response: jsonNoStore({ error: "Unable to read request body." }, 400) };
  }
  if (Buffer.byteLength(rawText, "utf8") > MAX_PROXY_BODY_BYTES) {
    return { ok: false, response: jsonNoStore({ error: "Request payload too large." }, 413) };
  }
  if (rawText.trim().length === 0) {
    if (required) {
      return { ok: false, response: jsonNoStore({ error: "JSON object request body is required." }, 400) };
    }
    return { ok: true, data: undefined };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    return { ok: false, response: jsonNoStore({ error: "Invalid JSON request body." }, 400) };
  }
  if (!parsedJson || typeof parsedJson !== "object" || Array.isArray(parsedJson)) {
    return { ok: false, response: jsonNoStore({ error: "Request body must be a JSON object." }, 400) };
  }
  return { ok: true, data: parsedJson as Record<string, unknown> };
}

function formatUpstreamError(parsedResp: unknown, status: number, upstreamHosts: string[]): Record<string, string> {
  const fallback = `BYOD upstream error (HTTP ${status}).`;
  if (!parsedResp || typeof parsedResp !== "object" || Array.isArray(parsedResp)) {
    return { error: fallback };
  }
  const obj = parsedResp as Record<string, unknown>;
  if (typeof obj.detail === "string" && obj.detail.trim()) {
    return { detail: sanitizeProxyErrorMessage(obj.detail, upstreamHosts) };
  }
  if (Array.isArray(obj.detail)) {
    const msgs = obj.detail
      .map((item) => (item && typeof item === "object" && typeof (item as { msg?: unknown }).msg === "string"
        ? (item as { msg: string }).msg
        : ""))
      .filter(Boolean);
    if (msgs.length > 0) {
      return { detail: sanitizeProxyErrorMessage(msgs.join("; "), upstreamHosts) };
    }
  }
  if (typeof obj.error === "string" && obj.error.trim()) {
    return { error: sanitizeProxyErrorMessage(obj.error, upstreamHosts) };
  }
  return { error: fallback };
}

/**
 * Release HTTPS BFF proxy for bench-side Edge/iOS BYOD devices (`O-09` / `T6.3`).
 *
 * Forwards `pairing_code` `handshake` and `Authorization: Device <token>`
 * `heartbeat`/`telemetry` requests from `hub.transcendental-sports.ai` to `hockey-api`
 * `/api/v1/byod/devices/{device_id}/{handshake|heartbeat|telemetry}` without exposing upstream URLs to clients.
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

  const bodyResult = await readBoundedJsonObject(req, cleanAction === "handshake" || cleanAction === "telemetry");
  if (!bodyResult.ok) return bodyResult.response;

  const forwardBody = bodyResult.data;
  if (cleanAction === "handshake" && forwardBody) {
    const rawCode = forwardBody.pairing_code;
    if (typeof rawCode !== "string" || !rawCode.trim()) {
      return jsonNoStore({ error: "pairing_code is required." }, 400);
    }
    const bodyWithoutPairingCode = { ...forwardBody };
    delete bodyWithoutPairingCode.pairing_code;
    if (/\brtmps?:\/\//i.test(rawCode) || findForbiddenRtmpsSecretField(bodyWithoutPairingCode)) {
      return jsonNoStore(
        {
          error:
            "RTMPS stream keys and credentials must remain on the device or OS Keychain and cannot be sent through the API.",
        },
        422,
      );
    }
  } else if (forwardBody && findForbiddenRtmpsSecretField(forwardBody)) {
    return jsonNoStore(
      {
        error:
          "RTMPS stream keys and credentials must remain on the device or OS Keychain and cannot be sent through the API.",
      },
      422,
    );
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
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    console.error(
      "[byod-device-proxy] Upstream network error:",
      sanitizeProxyErrorMessage(err instanceof Error ? err.message : String(err), upstream.upstreamHosts),
    );
    return jsonNoStore(
      { error: isTimeout ? "BYOD upstream request timed out." : "BYOD upstream service is currently unreachable." },
      isTimeout ? 504 : 502,
    );
  }

  if (res.status >= 300 && res.status < 400) {
    return jsonNoStore({ error: "BYOD upstream returned an unexpected redirect." }, 502);
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
    return jsonNoStore(formatUpstreamError(parsedResp, res.status, upstream.upstreamHosts), outStatus);
  }

  if (parsedResp === null) {
    return jsonNoStore({ error: "BYOD upstream returned a non-JSON payload." }, 502);
  }

  return jsonNoStore(parsedResp, res.status);
}
