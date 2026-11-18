/**
 * The maintenance operator pass opens the maintenance gate and does NOTHING else.
 *
 * THE GAP (found in Spotlight 2026-11-18, v0.1.23.beta; the same line was here)
 *   `maintenanceResponse` answered a valid `tsai_operator_pass` cookie with `NextResponse.next()`, and
 *   the proxy returned any non-null verdict as its FINAL answer, skipping everything after the gate.
 *   The Portal's proxy does no session work of its own — `/docs` and `/auth/entitlement` verify the
 *   caller themselves with `getEntitledPortalUser()` — so here the pass must (a) be "no objection"
 *   and nothing more, (b) never stand in for a session on those surfaces, and (c) not let a client's
 *   own trust headers through.
 *
 * WHAT THIS PROVES, against the real `proxy()`, the real `/docs` page and `/auth/entitlement` route,
 * and a local stand-in for GoTrue + PostgREST (127.0.0.1, no network, no secrets; fixtures neutral
 * and local to this file):
 *   1. `maintenanceResponse` returns null for a valid pass — "no objection", never a response
 *   2. pass cookie alone → /docs redirects to /login, /auth/entitlement answers 401
 *   3. pass + a token GoTrue rejects → the same signed-out answers
 *   4. pass + a session GoTrue accepts, licensed → /docs renders, /auth/entitlement 200
 *   5. pass + forged trust headers → stripped from the forwarded request
 *   6. no pass, maintenance on → 503 (page and API); an expired pass is cleared on that 503
 *   7. health and legal paths → unaffected (null) with or without a pass
 *   8. maintenance off → the proxy forwards, still without the trust headers
 */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import Module from "node:module";
import type { AddressInfo } from "node:net";

import { NextRequest } from "next/server";

const PASS_SECRET = "unit-test-only-operator-secret";
const TEST_USER_ID = "00000000-0000-4000-8000-000000000001";

// ── `cookies()` outside a request: the jar is whatever the case under test says the browser holds ──
const jar = new Map<string, string>();
const fakeHeaders = {
  async cookies() {
    return {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
      set: () => undefined,
    };
  },
  async headers() {
    return new Headers();
  },
};
const MI = Module as unknown as { _load: (r: string, p: unknown, m: boolean) => unknown };
const origLoad = MI._load;
MI._load = function (r: string, p: unknown, m: boolean) {
  if (r === "server-only") return {};
  if (r === "next/headers") return fakeHeaders;
  // The MDX loader is not what is under test (and does not load outside Next); the entitlement gate in
  // front of it is. An entitled caller is answered with "no page", which /docs renders as its index.
  if (r === "@/utils/docs") return { loadDoc: async () => null };
  return origLoad.call(this, r, p, m);
};

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function mintPass(expSecondsFromNow = 600): string {
  const payload = b64url(
    JSON.stringify({
      sub: "operator@example.test",
      exp: Math.floor(Date.now() / 1000) + expSecondsFromNow,
      jti: "unit-test-jti",
      scope: "operator-access",
    }),
  );
  return `${payload}.${b64url(createHmac("sha256", PASS_SECRET).update(payload).digest())}`;
}

/** A JWT-shaped access token. Its signature means nothing: only the stand-in decides what verifies. */
function accessToken(label: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({ sub: TEST_USER_ID, aud: "authenticated", role: "authenticated", exp: now + 3600, iat: now, jti: label }));
  return `${header}.${body}.${b64url(`unit-test-${label}`)}`;
}
const GOOD_TOKEN = accessToken("good");
const BAD_TOKEN = accessToken("forged");

function sessionCookie(token: string): string {
  const now = Math.floor(Date.now() / 1000);
  return `base64-${b64url(
    JSON.stringify({
      access_token: token,
      refresh_token: "unit-test-refresh-token",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: now + 3600,
      user: { id: TEST_USER_ID, aud: "authenticated", role: "authenticated", email: "member@example.test" },
    }),
  )}`;
}

/** A stand-in for GoTrue + PostgREST: one access token verifies; that user has one active licence. */
function fakeBackend(): Promise<{ url: string; close: () => Promise<void> }> {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const path = (req.url ?? "").split("?")[0];
    const json = (status: number, body: unknown) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (path === "/auth/v1/user") {
      if (req.headers.authorization === `Bearer ${GOOD_TOKEN}`) {
        return json(200, {
          id: TEST_USER_ID,
          aud: "authenticated",
          role: "authenticated",
          email: "member@example.test",
          app_metadata: { provider: "email", providers: ["email"] },
          user_metadata: {},
          created_at: "2026-01-01T00:00:00Z",
        });
      }
      return json(401, { code: 401, error_code: "bad_jwt", msg: "invalid JWT" });
    }
    if (path === "/auth/v1/token") return json(400, { error: "invalid_grant", error_description: "refused" });
    if (path.startsWith("/auth/v1/logout")) {
      res.writeHead(204);
      return res.end();
    }
    if (path === "/rest/v1/profiles") {
      return json(200, { id: TEST_USER_ID, approval_status: "approved", user_type: "athlete", is_superadmin: false, email: "member@example.test" });
    }
    if (path === "/rest/v1/user_product_licenses") return json(200, [{ id: "lic-1", product_id: "p-1", status: "active" }]);
    return json(404, { error: "not found" });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({ url: `http://127.0.0.1:${port}`, close: () => new Promise<void>((r) => server.close(() => r())) });
    });
  });
}

const HOST = "transcendental-sports.ai";
function request(path: string, cookies: Record<string, string>, headers: Record<string, string> = {}): NextRequest {
  const cookie = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(`https://${HOST}${path}`, {
    headers: { host: HOST, accept: "text/html", ...(cookie ? { cookie } : {}), ...headers },
  });
}

/** Runs the real /docs page with the given browser cookies; returns where it redirected, or "rendered". */
async function docsAs(cookies: Record<string, string>): Promise<string> {
  jar.clear();
  for (const [k, v] of Object.entries(cookies)) jar.set(k, v);
  const { default: DocsPage } = await import("../src/app/docs/[[...slug]]/page");
  try {
    await DocsPage({ params: Promise.resolve({ slug: [] }) });
    return "rendered";
  } catch (err) {
    const digest = (err as { digest?: string }).digest ?? "";
    if (digest.startsWith("NEXT_REDIRECT")) return new URL(digest.split(";")[2] ?? "", "https://x").pathname;
    throw err;
  }
}

async function entitlementAs(cookies: Record<string, string>): Promise<number> {
  jar.clear();
  for (const [k, v] of Object.entries(cookies)) jar.set(k, v);
  const { POST } = await import("../src/app/auth/entitlement/route");
  return (await POST()).status;
}

async function main() {
  const backend = await fakeBackend();
  process.env.SUPABASE_INTERNAL_URL = backend.url;
  process.env.NEXT_PUBLIC_SUPABASE_URL = backend.url;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "unit-test-anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "unit-test-service-role-key";
  process.env.MAINTENANCE_OPERATOR_SECRET = PASS_SECRET;
  process.env.MAINTENANCE_MODE = "1";

  const { proxy } = await import("../src/proxy");
  const { maintenanceResponse } = await import("../src/lib/maintenance");
  const { PROXY_TRUST_HEADERS } = await import("../src/lib/auth/proxy-trust-headers");

  const pass = { tsai_operator_pass: mintPass(), tsai_operator_banner: "%7B%7D" };

  try {
    // 1. The gate's verdict for a valid pass is "no objection", never a response of its own.
    assert.equal(
      await maintenanceResponse(request("/docs", pass), "Transcend"),
      null,
      "a valid operator pass must return null from maintenanceResponse — a response there is the proxy's final answer",
    );

    // 2. Pass alone: the signed-in surfaces answer exactly as they do to a stranger.
    assert.equal(await docsAs(pass), "/login", "pass cookie alone: /docs must redirect to /login");
    assert.equal(await entitlementAs(pass), 401, "pass cookie alone: /auth/entitlement must answer 401");

    // 3. Pass + a token GoTrue rejects → the same.
    const forgedSession = { ...pass, "tsai-portal-auth": sessionCookie(BAD_TOKEN) };
    assert.equal(await docsAs(forgedSession), "/login", "a session GoTrue rejects is no session");
    assert.equal(await entitlementAs(forgedSession), 401);

    // 4. Pass + a verified, licensed session → allowed.
    const goodSession = { ...pass, "tsai-portal-auth": sessionCookie(GOOD_TOKEN) };
    assert.equal(await docsAs(goodSession), "rendered", "pass + verified licensed session must reach /docs");
    assert.equal(await entitlementAs(goodSession), 200);

    // 5. Forged trust headers sent with the pass are stripped from the forwarded request.
    const forged = Object.fromEntries(PROXY_TRUST_HEADERS.map((h) => [h, "true"]));
    for (const path of ["/", "/docs", "/api/telemetry/event"]) {
      const res = await proxy(request(path, pass, forged));
      assert.equal(res.headers.get("x-middleware-next"), "1", `${path}: a valid pass must let the request continue`);
      const overrideList = res.headers.get("x-middleware-override-headers");
      assert.ok(overrideList, `${path}: the proxy must rewrite the request headers, or the client's own pass through`);
      const forwarded = overrideList.split(",").map((h) => h.trim().toLowerCase());
      for (const h of PROXY_TRUST_HEADERS) {
        assert.ok(!forwarded.includes(h), `${path}: ${h} must not be forwarded`);
        assert.equal(res.headers.get(`x-middleware-request-${h}`), null, `${path}: a client-sent ${h} must be stripped`);
      }
      assert.ok(forwarded.includes("cookie"), `${path}: ordinary request headers are still forwarded`);
    }

    // 6. No pass, maintenance on → 503. A session is not a pass. An expired pass is cleared on the 503.
    {
      assert.equal((await proxy(request("/docs", {}))).status, 503, "with no pass the gate must stay closed");
      assert.equal((await proxy(request("/api/beta-requests", {}, { accept: "application/json" }))).status, 503);
      assert.equal((await proxy(request("/docs", { "tsai-portal-auth": sessionCookie(GOOD_TOKEN) }))).status, 503);
      const expired = await proxy(request("/docs", { tsai_operator_pass: mintPass(-60) }));
      assert.equal(expired.status, 503, "an expired pass does not open the gate");
      const cleared = expired.headers.getSetCookie().filter((c) => /^tsai_operator_(pass|banner)=;/.test(c));
      assert.equal(cleared.length, 2, "an expired pass and its banner are cleared on the 503");
    }

    // 7. Health and legal paths answer during maintenance, with or without a pass.
    for (const path of ["/healthz", "/api/health", "/legal/privacy", "/legal/terms"]) {
      assert.equal(await maintenanceResponse(request(path, {}), "Transcend"), null, `${path} must stay open`);
      assert.equal(await maintenanceResponse(request(path, pass), "Transcend"), null, `${path} must stay open with a pass`);
    }

    // 8. Maintenance off: the proxy forwards, and still strips the trust headers.
    process.env.MAINTENANCE_MODE = "0";
    {
      const res = await proxy(request("/", {}, forged));
      assert.equal(res.headers.get("x-middleware-next"), "1");
      const forwarded = (res.headers.get("x-middleware-override-headers") ?? "").split(",").map((h) => h.trim());
      for (const h of PROXY_TRUST_HEADERS) assert.ok(!forwarded.includes(h), `gate off: ${h} must not be forwarded`);
      assert.equal(await docsAs({}), "/login", "no session, gate off: /docs redirects to /login");
    }
  } finally {
    await backend.close();
  }
  console.log("✅ test-operator-pass-is-not-a-session: the pass opens the gate and grants no session, user, role or plan");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : err);
  process.exit(1);
});
