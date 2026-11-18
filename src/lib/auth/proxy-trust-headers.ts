/**
 * Request headers a client must never be able to assert about itself.
 *
 * Nothing in the Portal reads these today, and nothing here sets them: authority comes from a
 * GoTrue-verified session (`getEntitledPortalUser`), never from a header. They are the trust headers
 * Spotlight's proxy stamps for its server components, and the Portal proxy removes them from every
 * inbound request so that code ported from Spotlight cannot start honouring a value the CALLER sent.
 * The strip runs on every request the proxy forwards — an operator-pass holder's included (2026-11-18:
 * in Spotlight a valid pass returned early and skipped it).
 */
export const PROXY_TRUST_HEADERS = [
  "x-guest-mode",
  "x-guest-scope",
  "x-guest-resource",
  "x-is-superuser",
  "x-original-is-superuser",
  "x-dev-impersonated-role",
  "x-approved-user",
] as const;

/** A copy of the inbound headers with every trust header removed, for `NextResponse.next({ request: { headers } })`. */
export function withoutProxyTrustHeaders(headers: Headers): Headers {
  const out = new Headers(headers);
  for (const name of PROXY_TRUST_HEADERS) out.delete(name);
  return out;
}
