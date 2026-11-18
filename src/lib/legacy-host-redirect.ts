import { NextResponse, type NextRequest } from "next/server";

/**
 * Legacy-domain redirect — the old DNS never answers a customer.
 *
 * Owner rule (2026-11-18): the platform's ONLY customer-facing domain is
 * transcendental-sports.ai. The old domain is still mapped to this service so
 * that links already in people's inboxes and bookmarks resolve, but it must not
 * serve a page: every request whose Host is the old apex or any subdomain of it
 * gets a 308 to the same path and query on the official host.
 *
 * Security: the target host is NEVER taken from the request. It comes from the
 * exact-match table below; an old subdomain that is not in the table goes to
 * this app's primary official host. Only the path and query are carried over,
 * and they are re-attached to a fixed https origin, so this cannot be turned
 * into an open redirect.
 *
 * 308 (not 301) so a POST stays a POST — an old-host form or API call is
 * forwarded rather than silently turned into a GET.
 *
 * Health paths are left alone: orchestrator probes must keep seeing a live
 * container whatever Host header they send.
 */

/** The legacy apex. This module and its test are the only places that name it. */
export const LEGACY_APEX = "tsai-spotlight.com";

/**
 * This app's primary official host. The hub is the portal's canonical public origin: the OAuth
 * callback falls back to it (src/app/auth/callback/route.ts) and portal. has always forwarded to it.
 */
export const OFFICIAL_HOST = "hub.transcendental-sports.ai";

/**
 * Exact old host → official host, one-for-one with the portal's domain mappings. Anything else
 * under the old apex → OFFICIAL_HOST.
 */
const LEGACY_HOST_MAP: Readonly<Record<string, string>> = {
  "tsai-spotlight.com": "transcendental-sports.ai",
  "www.tsai-spotlight.com": "www.transcendental-sports.ai",
  "hub.tsai-spotlight.com": "hub.transcendental-sports.ai",
  "portal.tsai-spotlight.com": "portal.transcendental-sports.ai",
};

function normaliseHost(raw: string | null | undefined): string {
  if (!raw) return "";
  // First value only (a proxy may append), strip the port and any trailing dot.
  const first = raw.split(",")[0].trim().toLowerCase();
  const noPort = first.startsWith("[") ? first : first.replace(/:\d+$/, "");
  return noPort.replace(/\.$/, "");
}

export function isLegacyHost(host: string | null | undefined): boolean {
  const h = normaliseHost(host);
  return h === LEGACY_APEX || h.endsWith(`.${LEGACY_APEX}`);
}

/** The official host for a legacy host, or null when the host is not legacy. */
export function officialHostFor(host: string | null | undefined): string | null {
  if (!isLegacyHost(host)) return null;
  return LEGACY_HOST_MAP[normaliseHost(host)] ?? OFFICIAL_HOST;
}

function isHealthPath(pathname: string): boolean {
  return pathname === "/healthz" || pathname === "/api/health" || pathname.endsWith("/health");
}

/**
 * The 308 for a legacy-host request, or null.
 *
 * Decided on the Host header ONLY. Cloud Run domain mappings set Host to the mapped
 * hostname; X-Forwarded-Host is client-controllable here, and honouring it would let a
 * request to an official host carrying a legacy X-Forwarded-Host earn a 308 back to
 * itself — a loop, and a cacheable one for an official URL. So an official (or any
 * non-legacy) Host is never redirected, whatever else the request says.
 *
 * The 308 is `Cache-Control: private, no-store` so no shared cache keeps it.
 */
export function legacyHostRedirect(request: NextRequest): NextResponse | null {
  if (isHealthPath(request.nextUrl.pathname)) return null;
  const target = officialHostFor(request.headers.get("host"));
  if (!target) return null;
  // Built field by field, never by resolving the path against a base: a path such as
  // "//evil.example/x" resolves to another host, but assigned to .pathname it stays a path.
  const location = new URL(`https://${target}/`);
  location.pathname = request.nextUrl.pathname;
  location.search = request.nextUrl.search;
  const res = NextResponse.redirect(location, 308);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
