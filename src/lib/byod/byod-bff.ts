import "server-only";

import { NextRequest, NextResponse } from "next/server";

import type { PortalAccess } from "@/lib/auth/portal-entitlement";
import { errorMessage } from "@/lib/errors";
import {
  forwardHockeyApi,
  getCallerAccessToken,
  jsonNoStore,
  mapUpstreamResponse,
  unauthorizedResponse,
  type UpstreamCallOptions,
  type UpstreamCallResult,
} from "@/lib/hockey-api";
import { findForbiddenRtmpsSecretField, redactByodSecrets } from "@/lib/byod/byod-mappers";
import { createClient } from "@/utils/supabase/server";

export type ByodCallerResult =
  | { ok: true; accessToken: string; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Enforce GoTrue authentication + Portal licence entitlement + caller JWT extraction.
 * Wraps entitlement lookup failures cleanly as redacted HTTP 503.
 */
export async function resolveByodCaller(
  getAccess: () => Promise<PortalAccess>,
): Promise<ByodCallerResult> {
  let access: PortalAccess;
  try {
    access = await getAccess();
  } catch (err) {
    console.error("[byod-bff] Entitlement check failed:", redactByodSecrets(errorMessage(err)));
    return {
      ok: false,
      response: jsonNoStore({ error: "Portal entitlement service is temporarily unavailable." }, 503),
    };
  }

  if (access.status === "signed-out") {
    return { ok: false, response: unauthorizedResponse() };
  }
  if (access.status === "not-entitled") {
    return {
      ok: false,
      response: jsonNoStore(
        { error: "Active Transcend Portal licence required for BYOD hardware access." },
        403,
      ),
    };
  }

  const supabase = await createClient();
  const accessToken = await getCallerAccessToken(supabase);
  if (!accessToken) {
    return { ok: false, response: unauthorizedResponse() };
  }

  return { ok: true, accessToken, userId: access.userId };
}

export function parseByodPagination(
  req: NextRequest,
): { ok: true; query: URLSearchParams } | { ok: false; response: NextResponse } {
  const query = new URLSearchParams();
  const rawLimit = req.nextUrl.searchParams.get("limit");
  if (rawLimit !== null && rawLimit.trim() !== "") {
    if (!/^\d+$/.test(rawLimit.trim())) {
      return { ok: false, response: jsonNoStore({ error: "limit must be an integer between 1 and 100." }, 400) };
    }
    const limit = Number(rawLimit.trim());
    if (limit < 1 || limit > 100) {
      return { ok: false, response: jsonNoStore({ error: "limit must be between 1 and 100." }, 400) };
    }
    query.set("limit", String(limit));
  }

  const rawOffset = req.nextUrl.searchParams.get("offset");
  if (rawOffset !== null && rawOffset.trim() !== "") {
    if (!/^\d+$/.test(rawOffset.trim())) {
      return { ok: false, response: jsonNoStore({ error: "offset must be a non-negative integer." }, 400) };
    }
    const offset = Number(rawOffset.trim());
    if (offset < 0) {
      return { ok: false, response: jsonNoStore({ error: "offset must be >= 0." }, 400) };
    }
    query.set("offset", String(offset));
  }

  return { ok: true, query };
}

export function rejectForbiddenByodSecrets(body: Record<string, unknown>): NextResponse | null {
  const hit = findForbiddenRtmpsSecretField(body);
  if (!hit) return null;
  console.warn("[byod-bff] Blocked forbidden RTMPS/secret payload field at BFF boundary.");
  return jsonNoStore(
    {
      error:
        "Raw RTMPS stream keys, ingest URLs, and pairing secrets are forbidden on Portal APIs and must stay on capture hardware.",
    },
    422,
  );
}

async function sanitizeUpstreamFailure(response: NextResponse): Promise<NextResponse> {
  const parsed = (await response.json().catch(() => null)) as { error?: unknown } | null;
  const rawMessage = typeof parsed?.error === "string" ? parsed.error : "BYOD service error.";

  if (
    rawMessage === "Tournament service is currently unreachable." ||
    rawMessage === "Tournament service request timed out."
  ) {
    const isTimeout = rawMessage.includes("timed out");
    return jsonNoStore(
      {
        error: isTimeout
          ? "BYOD service request timed out."
          : "BYOD service is currently unreachable.",
      },
      503,
    );
  }

  const normalized =
    rawMessage === "Tournament service returned an unexpected error."
      ? "BYOD service returned an unexpected error."
      : rawMessage === "Tournament service temporarily unavailable."
      ? "BYOD service temporarily unavailable."
      : rawMessage === "Tournament service is not configured."
      ? "BYOD service is not configured."
      : rawMessage;

  const redacted = redactByodSecrets(normalized);
  if (redacted !== normalized) {
    console.warn("[byod-bff] Redacted secret-like material from upstream error response.");
  }

  return jsonNoStore({ error: redacted }, response.status);
}

export async function forwardByodHockeyApi(opts: UpstreamCallOptions): Promise<UpstreamCallResult> {
  const res = await forwardHockeyApi(opts);
  if (!res.ok) {
    return { ok: false, response: await sanitizeUpstreamFailure(res.response) };
  }
  return res;
}

export function mapByodResponse<T>(
  fn: () => T,
): { ok: true; data: T } | { ok: false; response: NextResponse } {
  return mapUpstreamResponse(fn);
}
