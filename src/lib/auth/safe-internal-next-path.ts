/**
 * PORTED VERBATIM from tsai-spotlight/src/lib/auth/safe-internal-next-path.ts on 2026-08-22.
 *
 * tsai-portal's OAuth callback passed the raw `?next` parameter straight into
 * `new URL(next, publicOrigin)` (route.ts:75 + :106), which is an open redirect: an absolute
 * URL in `next` wins over the base and sends the user anywhere after a successful login.
 * Spotlight and periodical both fixed this; the fix was never ported to the one repo that is
 * PUBLIC and is the front door.
 *
 * Deliberately copied rather than rewritten. The subtle case below — an embedded tab/LF/CR
 * that the WHATWG URL parser strips BEFORE parsing, turning `/<TAB>/evil.com` into
 * `//evil.com` — was found the hard way in spotlight. A fresh implementation would very
 * likely reintroduce it.
 */
/**
 * Same-origin relative path only (open-redirect hardening for post-login `next` redirects).
 *
 * Every caller ultimately does `new URL(returnedValue, someOrigin)`. The contract of this function is
 * therefore precise: **return a value only if that composition cannot leave `someOrigin`.**
 *
 * The string-sniffing rules below are necessary but were NOT sufficient on their own. `raw.trim()`
 * strips only *leading and trailing* whitespace, so an ASCII tab/LF/CR embedded after the first slash
 * passed every check — and the WHATWG URL parser strips those characters *before* parsing, so
 * `/<TAB>/evil.com` became `//evil.com` and resolved to `https://evil.com/`. `searchParams.get()`
 * decodes `%09`/`%0a`/`%0d` for the caller, so the attacker only had to percent-encode it in the link.
 * That defeated the sanitizer at every sink, including `proxy.ts`'s already-authenticated
 * `/login?next=` redirect, which needs no OAuth flow at all.
 *
 * Two independent fences now, deliberately:
 *   1. reject C0 controls and DEL outright (the specific class above, named so it cannot silently
 *      regress);
 *   2. resolve against a throwaway origin and require the origin to survive — a generic fence that
 *      holds for whatever parser quirk comes next, rather than one more blocklist entry.
 *
 * The original (trimmed) string is returned, not the normalized one, so callers keep exact paths: if
 * fence 2 proves `t` resolves on-origin against a sentinel base, it resolves on-origin against the
 * real base too, because it is the same algorithm.
 */

/** Any base works; it just must be an origin the input can be compared against. */
const SENTINEL_ORIGIN = "https://sentinel.invalid";

/**
 * The one line every post-auth redemption route runs: sanitize `next`, else fall back.
 *
 * Exists so the routes share a *testable* seam. Review caught that the redirect-safety suite passed
 * even with the sanitizer calls deleted from `/auth/callback` and `/auth/confirm`, because it only
 * exercised `safeInternalNextPath` directly — the routes themselves are not unit-invokable (`GET`
 * needs a request scope for `cookies()`). Both routes now call this, and the suite asserts on it, so
 * reverting either route breaks a test.
 */
export function resolveAuthRedirectPath(raw: string | null | undefined, fallback: string): string {
  return safeInternalNextPath(raw) ?? fallback;
}

export function safeInternalNextPath(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.trim();
  if (t === "" || !t.startsWith("/") || t.startsWith("//")) return null;
  if (t.includes("://") || t.includes("\\") || t.includes("@")) return null;
  // eslint-disable-next-line no-control-regex -- rejecting control characters is the point
  if (/[\u0000-\u001f\u007f]/.test(t)) return null;

  try {
    if (new URL(t, SENTINEL_ORIGIN).origin !== SENTINEL_ORIGIN) return null;
  } catch {
    return null;
  }

  return t;
}
