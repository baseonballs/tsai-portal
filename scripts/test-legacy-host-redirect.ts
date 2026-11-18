import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  LEGACY_APEX,
  OFFICIAL_HOST,
  isLegacyHost,
  legacyHostRedirect,
  officialHostFor,
} from "../src/lib/legacy-host-redirect";
import { maintenanceResponse } from "../src/lib/maintenance";
import { proxy } from "../src/proxy";

/**
 * The old domain answers every request with a 308 to the official host (owner rule 2026-11-18),
 * before the maintenance gate, with the target taken from a fixed table — never from the request.
 */

function req(url: string, headers: Record<string, string> = {}, method = "GET"): NextRequest {
  const u = new URL(url);
  return new NextRequest(url, { method, headers: { host: u.host, ...headers } });
}

console.log("▶ [1/5] Host classification and the mapping table...");
assert.equal(LEGACY_APEX, ["tsai-spotlight", "com"].join("."));
assert.equal(OFFICIAL_HOST, "hub.transcendental-sports.ai");
for (const h of [
  "tsai-spotlight.com",
  "www.tsai-spotlight.com",
  "HUB.TSAI-SPOTLIGHT.COM",
  "portal.tsai-spotlight.com:443",
  "tsai-spotlight.com.",
  "a.b.tsai-spotlight.com",
]) {
  assert.equal(isLegacyHost(h), true, h);
}
for (const h of [
  "hub.transcendental-sports.ai",
  "transcendental-sports.ai",
  "eviltsai-spotlight.com",
  "tsai-spotlight.com.evil.example",
  "tsai-portal-usioswhvqq-uw.a.run.app",
  "localhost:3040",
  "",
]) {
  assert.equal(isLegacyHost(h), false, h);
}
const MAP: Array<[string, string]> = [
  ["tsai-spotlight.com", "transcendental-sports.ai"],
  ["www.tsai-spotlight.com", "www.transcendental-sports.ai"],
  ["hub.tsai-spotlight.com", "hub.transcendental-sports.ai"],
  ["portal.tsai-spotlight.com", "portal.transcendental-sports.ai"],
  ["unknown.tsai-spotlight.com", OFFICIAL_HOST],
  ["app.tsai-spotlight.com", OFFICIAL_HOST],
];
for (const [from, to] of MAP) assert.equal(officialHostFor(from), to, from);
assert.equal(officialHostFor("hub.transcendental-sports.ai"), null);
console.log("  ✓ apex, www, hub, portal map one-for-one; unknown old subdomains → hub; look-alikes are not legacy.");

console.log("▶ [2/5] 308 to the same path and query on the official host...");
for (const [from, to] of MAP) {
  const res = legacyHostRedirect(req(`https://${from}/pricing?plan=teams&ref=email`));
  assert.ok(res, from);
  assert.equal(res.status, 308, from);
  assert.equal(res.headers.get("location"), `https://${to}/pricing?plan=teams&ref=email`, from);
}
{
  const r = new NextRequest("https://tsai-portal-usioswhvqq-uw.a.run.app/login", {
    headers: { host: "tsai-portal-usioswhvqq-uw.a.run.app", "x-forwarded-host": "www.tsai-spotlight.com" },
  });
  assert.equal(legacyHostRedirect(r)?.headers.get("location"), "https://www.transcendental-sports.ai/login");
}
assert.equal(legacyHostRedirect(req("https://hub.tsai-spotlight.com/api/beta-requests", {}, "POST"))?.status, 308);
console.log("  ✓ path, query and method preserved; X-Forwarded-Host honoured.");

console.log("▶ [3/5] No open redirect...");
for (const path of ["//evil.example/x", "/\\evil.example", "/%2F%2Fevil.example", "/@evil.example"]) {
  const res = legacyHostRedirect(req(`https://hub.tsai-spotlight.com${path}`));
  assert.ok(res, path);
  assert.equal(new URL(res.headers.get("location")!).host, "hub.transcendental-sports.ai", path);
}
{
  const r = new NextRequest("https://hub.transcendental-sports.ai/", {
    headers: { host: "hub.transcendental-sports.ai", "x-forwarded-host": "evil.example" },
  });
  assert.equal(legacyHostRedirect(r), null);
}
assert.equal(legacyHostRedirect(req("https://transcendental-sports.ai/")), null);
console.log("  ✓ the target is always the table's host; official and foreign hosts pass through.");

console.log("▶ [4/5] Health paths are never redirected...");
for (const p of ["/healthz", "/api/health", "/api/x/health"]) {
  assert.equal(legacyHostRedirect(req(`https://hub.tsai-spotlight.com${p}`)), null, p);
}
console.log("  ✓ probes keep reaching the container whatever Host they send.");

async function proxyOrder(): Promise<void> {
  console.log("▶ [5/5] Runs before the maintenance gate in the proxy...");
  const saved = process.env.MAINTENANCE_MODE;
  process.env.MAINTENANCE_MODE = "1";
  try {
    const legacy = await proxy(req("https://tsai-spotlight.com/pricing?x=1"));
    assert.equal(legacy.status, 308, "old host redirects even while maintenance is on");
    assert.equal(legacy.headers.get("location"), "https://transcendental-sports.ai/pricing?x=1");
    const official = await proxy(req("https://hub.transcendental-sports.ai/pricing"));
    assert.equal(official.status, 503, "the official host is the one that answers 503");
    assert.equal(await maintenanceResponse(req("https://hub.tsai-spotlight.com/healthz"), "Transcend"), null);
  } finally {
    if (saved === undefined) delete process.env.MAINTENANCE_MODE;
    else process.env.MAINTENANCE_MODE = saved;
  }
  const open = await proxy(req("https://hub.transcendental-sports.ai/"));
  assert.notEqual(open.status, 308, "the official host is never redirected");
  console.log("  ✓ 308 first, then the official host's maintenance 503; health stays open.");
}

proxyOrder().then(
  () => console.log("\n✅ legacy-host-redirect: old links land on the official host."),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
