/**
 * Walks EVERY route in `src/app` and fails if anything answers a caller who has no GoTrue session,
 * unless it is on a reviewed public list below.
 *
 * WHY (2026-11-18): with maintenance on, a valid operator pass made the proxy's maintenance gate
 * return a final `NextResponse.next()`. The Portal's proxy does no session work — the Portal is
 * mostly public marketing, and its signed-in surfaces verify the caller themselves — so the question
 * the pass raises here is: does any route trust that it was let through? This pins the answer.
 *
 * WHAT IT DOES
 *   1. Every page and route handler is turned into a concrete path and sent through the real
 *      `proxy()` with the maintenance operator pass and NO session. The proxy must let it continue
 *      (the pass opens the gate) and must not answer it itself — it never authenticates anything.
 *   2. Because the proxy lets everything through, each module must then verify a session ITSELF in
 *      source (`getEntitledPortalUser()` or `auth.getUser()`), or be on PUBLIC_PAGES / PUBLIC_API
 *      with the reason a stranger may reach it. Compared as SETS: a new unauthenticated route fails,
 *      and so does a reviewed entry that now authenticates or no longer exists.
 *   What each authenticated surface does with a pass and no session is exercised end to end by
 *   `test-operator-pass-is-not-a-session.ts`.
 *
 * KNOWN LIMIT, stated: (2) proves an auth call is present in the module, not that every branch
 * reaches it. The surfaces that matter are exercised end to end in the companion test.
 */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { NextRequest } from "next/server";

const ROOT = process.cwd();
const APP = join(ROOT, "src", "app");

/** Pages a stranger may reach, and why. Dynamic segments become `x`; `[[...x]]` may be empty. */
const PUBLIC_PAGES: Record<string, string> = {
  "/": "marketing landing page, no account data",
  "/beta": "beta sign-up form (posts to /api/beta-requests)",
  "/byod-setup": "camera set-up guide, client-side only, reads no account data",
  "/club-revshare": "pricing illustration, client-side only, reads no account data",
  "/coachs-corner": "marketing page, no account data",
  "/legal/privacy": "public policy (Google OAuth consent screen links it)",
  "/legal/terms": "public policy (Google OAuth consent screen links it)",
  "/locker-room": "marketing page with the beta sign-up form, no account data",
  "/login": "sign-in",
  "/players-development": "marketing page, no account data",
  "/pricing": "public pricing catalog; checkout initiation requires a verified GoTrue session on POST /api/billing/stripe/checkout",
  "/spotlight-and-periodical": "marketing page, no account data",
  "/technology-solutions": "marketing page, no account data",
  "/tournament/director":
    "client-side director shell; renders no account data and loads live tournaments via authenticated /api/tournaments* BFF (401 -> sign-in prompt)",
};

/** Route handlers with no session check, and why that is correct. */
const PUBLIC_API: Record<string, string> = {
  "src/app/api/beta-requests/route.ts": "beta sign-up intake: writes a pending request, returns nothing about anyone",
  "src/app/api/billing/stripe/webhook/route.ts": "Stripe webhook intake: authenticated by Stripe HMAC signature (stripe-signature + STRIPE_WEBHOOK_SECRET), never a browser session",
  "src/app/api/v1/byod/devices/[deviceId]/[action]/route.ts": "bench-side BYOD device proxy: handshake validates single-use pairing code and heartbeat/telemetry require Authorization: Device <token> verified by hockey-api, never a browser session",
  "src/app/auth/callback/route.ts": "OAuth/PKCE code exchange: GoTrue verifies the code, then the licence check runs",
  "src/app/supabase/[[...path]]/route.ts": "same-origin GoTrue/PostgREST gateway; GoTrue + RLS authorise",
};

const AUTH_CALL = /\bgetEntitledPortalUser\s*\(|\bauth\s*\.\s*getUser\s*\(/;

function stripComments(src: string): string {
  return src.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!entry.startsWith("_")) walk(full, out);
    } else if (/^(page|route)\.(tsx?|js)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function samplePath(file: string): string {
  const segs = relative(APP, file)
    .split(sep)
    .slice(0, -1)
    .filter((s) => !/^\(.*\)$/.test(s) && !s.startsWith("@"))
    .flatMap((s) => (s.startsWith("[[...") ? [] : s.startsWith("[") ? ["x"] : [s]));
  return `/${segs.join("/")}`;
}

function b64url(s: string | Buffer): string {
  return Buffer.from(s).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function main() {
  const secret = "unit-test-only-operator-secret";
  process.env.MAINTENANCE_MODE = "1";
  process.env.MAINTENANCE_OPERATOR_SECRET = secret;
  const payload = b64url(
    JSON.stringify({ sub: "operator@example.test", exp: Math.floor(Date.now() / 1000) + 600, jti: "t", scope: "operator-access" }),
  );
  const pass = `${payload}.${b64url(createHmac("sha256", secret).update(payload).digest())}`;

  const { proxy } = await import("../src/proxy");

  const files = walk(APP);
  assert.ok(files.length >= 15, `walked only ${files.length} route files — the walker is broken, not the app`);

  // ── 1. Through the real proxy: the pass opens the gate and the proxy answers nothing itself ──
  for (const file of files) {
    const path = samplePath(file);
    const res = await proxy(
      new NextRequest(`https://transcendental-sports.ai${path}`, {
        headers: {
          host: "transcendental-sports.ai",
          accept: path.startsWith("/api/") ? "application/json" : "text/html",
          cookie: `tsai_operator_pass=${pass}; tsai_operator_banner=%7B%7D`,
        },
      }),
    );
    assert.notEqual(res.status, 503, `${path}: a valid operator pass must open the maintenance gate`);
    assert.equal(res.headers.get("x-middleware-next"), "1", `${path}: the proxy must hand the request on, not answer it`);
    assert.ok(res.headers.get("x-middleware-override-headers"), `${path}: forwarded with an explicit header list`);
  }

  // ── 2. Every module verifies a session itself, or is reviewed public ─────────────────────────
  const pages = files.filter((f) => /page\.tsx?$/.test(f));
  const handlers = files.filter((f) => /route\.tsx?$/.test(f));
  const authenticates = (f: string) => AUTH_CALL.test(stripComments(readFileSync(f, "utf8")));

  const publicPages = new Map(pages.filter((f) => !authenticates(f)).map((f) => [samplePath(f), relative(ROOT, f)]));
  const unexpectedPages = [...publicPages].filter(([p]) => !(p in PUBLIC_PAGES));
  assert.deepEqual(
    unexpectedPages,
    [],
    `these pages verify no session and are not on PUBLIC_PAGES:\n${unexpectedPages.map(([p, f]) => `  ${p}  (${f})`).join("\n")}\n` +
      "Call getEntitledPortalUser() on the server, or add the path with the reason a stranger may see it.",
  );
  const stalePages = Object.keys(PUBLIC_PAGES).filter((p) => !publicPages.has(p));
  assert.deepEqual(stalePages, [], `PUBLIC_PAGES lists pages that now authenticate or no longer exist: ${stalePages.join(", ")}`);

  const publicApi = handlers.map((f) => relative(ROOT, f).split(sep).join("/")).filter((r) => !authenticates(join(ROOT, r)));
  const unexpectedApi = publicApi.filter((r) => !(r in PUBLIC_API));
  assert.deepEqual(
    unexpectedApi,
    [],
    `these route handlers verify no session and are not on PUBLIC_API:\n${unexpectedApi.map((r) => `  ${r}`).join("\n")}`,
  );
  const staleApi = Object.keys(PUBLIC_API).filter((r) => !publicApi.includes(r));
  assert.deepEqual(staleApi, [], `PUBLIC_API lists handlers that now authenticate or no longer exist: ${staleApi.join(", ")}`);

  // ── 3. The signed-in surfaces: /docs redirects a stranger; entitlement answers 401 ───────────
  const docs = stripComments(readFileSync(join(APP, "docs/[[...slug]]/page.tsx"), "utf8"));
  assert.match(
    docs,
    /const access = await getEntitledPortalUser\(\);\s*if \(access\.status === "signed-out"\) \{\s*redirect\(`\/login/,
    "/docs must verify the caller before rendering and send a stranger to /login",
  );

  console.log(
    `✅ test-no-session-route-tree: ${files.length} route(s) passed through the proxy with only the operator pass; ` +
      `${pages.length - publicPages.size}/${pages.length} pages and ${handlers.length - publicApi.length}/${handlers.length} handlers ` +
      `verify a session themselves, ${publicPages.size + publicApi.length} reviewed public`,
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
