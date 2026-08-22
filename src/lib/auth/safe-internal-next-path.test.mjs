/**
 * Open-redirect regression suite for the portal's post-login `?next` handling.
 *
 * The portal passed `?next` straight into `new URL(next, publicOrigin)`, so an absolute URL in the
 * parameter won over the base and redirected anywhere after a *successful* login — the most
 * convincing possible phishing surface, on the one repo that is public and is the front door.
 *
 * The interesting cases are not the obvious ones. `\t`, `\n`, `\r` and their percent-encoded forms
 * are stripped by the WHATWG URL parser BEFORE parsing, so `/<TAB>/evil.example` becomes
 * `//evil.example`. `searchParams.get()` decodes `%09` for the caller, so an attacker only has to
 * encode it in the link. That is why the sanitizer has two independent fences: an explicit control
 * character reject, and an origin-survival check against a sentinel base.
 *
 * Run: node src/lib/auth/safe-internal-next-path.test.mjs
 */
const SENTINEL_ORIGIN = "https://sentinel.invalid";

function safeInternalNextPath(raw) {
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

const MUST_REJECT = [
  ["absolute https",      "https://evil.example"],
  ["protocol-relative",   "//evil.example"],
  ["embedded TAB",        "/\t/evil.example"],
  ["embedded LF",         "/\n/evil.example"],
  ["embedded CR",         "/\r/evil.example"],
  ["backslash",           "\\\\evil.example"],
  ["userinfo @",          "/path@evil.example"],
  ["javascript:",         "javascript:alert(1)"],
  ["empty",               ""],
  ["null",                null],
  ["not a path",          "dashboard"],
];

const MUST_ALLOW = ["/", "/dashboard", "/licensing?tier=team", "/a/b/c#frag"];

let failed = 0;
for (const [label, input] of MUST_REJECT) {
  const got = safeInternalNextPath(input);
  const ok = got === null;
  if (!ok) failed++;
  console.log(`  ${ok ? "✅ rejected" : "❌ ALLOWED "}  ${label}`);
}
for (const input of MUST_ALLOW) {
  const got = safeInternalNextPath(input);
  const ok = got === input;
  if (!ok) failed++;
  console.log(`  ${ok ? "✅ allowed " : "❌ REJECTED"}  ${JSON.stringify(input)}`);
}

console.log(failed === 0 ? "\n✅ open-redirect suite passed" : `\n❌ ${failed} case(s) wrong`);
process.exit(failed === 0 ? 0 : 1);
