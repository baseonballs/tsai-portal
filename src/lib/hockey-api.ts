import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

const PROXY_PATH = "/api/sports/ice-hockey";

export const NO_STORE = { "Cache-Control": "private, no-store" } as const;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

/**
 * Resolve hockey-api's `/api/v1` base URL.
 *
 * Resolution order:
 * 1. `HOCKEY_API_URL` (direct upstream URL)
 * 2. `API_GATEWAY_URL` (Traefik gateway proxy at `/api/sports/ice-hockey/api/v1`)
 * 3. Development-only loopback fallback `http://127.0.0.1:8010/api/v1`
 *
 * Fails closed in production when neither `HOCKEY_API_URL` nor `API_GATEWAY_URL` is configured.
 */
export function resolveHockeyApiBase(): string {
  const direct = process.env.HOCKEY_API_URL?.trim().replace(/\/$/, "");
  if (direct) {
    return direct.endsWith("/api/v1") ? direct : `${direct}/api/v1`;
  }

  const gateway = process.env.API_GATEWAY_URL?.trim().replace(/\/$/, "");
  if (gateway) {
    if (gateway.endsWith("/api/v1")) return gateway;
    if (gateway.endsWith(PROXY_PATH)) return `${gateway}/api/v1`;
    return `${gateway}${PROXY_PATH}/api/v1`;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("HOCKEY_API_URL or API_GATEWAY_URL must be configured in production.");
  }

  return "http://127.0.0.1:8010/api/v1";
}

/**
 * Extract the verified caller's Supabase access token from the request cookie session.
 * Callers MUST verify `supabase.auth.getUser()` before calling this helper.
 */
export async function getCallerAccessToken(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token?.trim();
  return token || null;
}

export function jsonNoStore(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function unauthorizedResponse(): NextResponse {
  return jsonNoStore({ error: "Authentication required." }, 401);
}

export async function readJsonObject(
  req: NextRequest,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: jsonNoStore({ error: "Invalid JSON request body." }, 400) };
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, response: jsonNoStore({ error: "Request body must be a JSON object." }, 400) };
  }
  return { ok: true, data: raw as Record<string, unknown> };
}

export function extractValidatedTeamId(
  req: NextRequest,
  body?: Record<string, unknown>,
): { ok: true; teamId: string } | { ok: false; response: NextResponse } {
  const raw =
    req.nextUrl.searchParams.get("teamId") ??
    req.nextUrl.searchParams.get("team_id") ??
    (typeof body?.teamId === "string" ? body.teamId : undefined) ??
    (typeof body?.team_id === "string" ? body.team_id : undefined);
  const cleaned = raw?.trim();
  if (!isValidUuid(cleaned)) {
    return { ok: false, response: jsonNoStore({ error: "Valid teamId is required." }, 400) };
  }
  return { ok: true, teamId: cleaned };
}

function formatUpstreamError(status: number, parsed: unknown): string {
  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "detail" in parsed) {
    const detail = (parsed as { detail: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail.trim();
    }
    if (Array.isArray(detail)) {
      const msgs = detail
        .map((item) =>
          item && typeof item === "object" && "msg" in item && typeof item.msg === "string"
            ? item.msg
            : null,
        )
        .filter((m): m is string => Boolean(m));
      if (msgs.length > 0) return msgs.join("; ");
    }
  }

  switch (status) {
    case 400:
      return "Invalid request.";
    case 403:
      return "Teams plan required or permission denied.";
    case 404:
      return "Resource not found.";
    case 409:
      return "Request conflicts with current tournament state.";
    case 422:
      return "Validation failed.";
    case 503:
      return "Tournament service temporarily unavailable.";
    default:
      return "Tournament service error.";
  }
}

export function mapUpstreamResponse<T>(
  fn: () => T,
): { ok: true; data: T } | { ok: false; response: NextResponse } {
  try {
    return { ok: true, data: fn() };
  } catch (err) {
    console.error("[hockey-api] Response contract mismatch:", err instanceof Error ? err.message : String(err));
    return {
      ok: false,
      response: jsonNoStore({ error: "Upstream tournament response violated expected contract." }, 502),
    };
  }
}

export interface UpstreamCallOptions {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  accessToken: string;
  body?: unknown;
  query?: URLSearchParams;
}

export type UpstreamCallResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; response: NextResponse };

const PRESERVED_STATUSES = new Set([400, 401, 403, 404, 409, 422, 503]);

export async function forwardHockeyApi(opts: UpstreamCallOptions): Promise<UpstreamCallResult> {
  let base: string;
  try {
    base = resolveHockeyApiBase();
  } catch (err) {
    console.error("[hockey-api] Configuration error:", err instanceof Error ? err.message : String(err));
    return { ok: false, response: jsonNoStore({ error: "Tournament service is not configured." }, 503) };
  }

  const normalizedPath = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  const qs = opts.query && opts.query.toString() ? `?${opts.query.toString()}` : "";
  const url = `${base}${normalizedPath}${qs}`;
  const method = opts.method ?? "GET";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${opts.accessToken}`,
    Accept: "application/json",
  };
  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    console.error("[hockey-api] Network failure:", err instanceof Error ? err.message : String(err));
    return {
      ok: false,
      response: jsonNoStore(
        { error: isTimeout ? "Tournament service request timed out." : "Tournament service is currently unreachable." },
        isTimeout ? 504 : 502,
      ),
    };
  }

  if (res.status === 204) {
    return { ok: true, status: 204, data: null };
  }

  const parsed = await res.json().catch(() => null);
  if (!res.ok) {
    const outStatus = PRESERVED_STATUSES.has(res.status) ? res.status : 502;
    const message =
      outStatus === 502 ? "Tournament service returned an unexpected error." : formatUpstreamError(res.status, parsed);
    return { ok: false, response: jsonNoStore({ error: message }, outStatus) };
  }

  return { ok: true, status: res.status, data: parsed };
}
