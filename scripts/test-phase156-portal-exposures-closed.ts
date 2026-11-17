/**
 * Phase 156 gate — the Portal's public exposures stay closed.
 *
 * Each check scans for the CLASS, not a list of files, so a new instance anywhere fails it:
 *   1. docs: only Spotlight's manual is copied, and the copy is content-checked before packaging;
 *   2. the content check refuses contact details and internal identifiers (exercised, not read);
 *   3. the loader serves only manifest slugs — never another tree, a traversal or an unlisted file;
 *   4. /docs verifies entitlement on the server and links to no other tree;
 *   5. entitlement: verified user (getUser), real licence rows, lookup errors fail loudly;
 *   6. password sign-in passes the same licence check as OAuth, and is signed out without one;
 *   7. the unauthenticated roster import and Stripe routes are gone, with their committed secret
 *      and their "simulated success" branches;
 *   8. telemetry takes the user from the verified session, never from the request body;
 *   9. no runtime code carries a tailnet host or the DGX host name;
 *  10. auth, API, proxy and docs responses are private and never stored by a shared cache;
 *  11. no public page, component or copied doc names a persona: no "#<jersey> <Name>" case study,
 *      no contact address outside reserved example names and the company's own. (Listed real names
 *      are matched by scripts/test-no-real-names.ts against the owner-only list.)
 *
 * Run: npx tsx scripts/test-phase156-portal-exposures-closed.ts
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { findDocsContentViolations } from "./check-docs-content.mjs";
import { resolvePublishedSpotlightSlug, SPOTLIGHT_DOCS } from "../src/lib/docs/manifest";
import { isUserEntitledToPortal } from "../src/lib/auth/portal-entitlement";

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel: string) => fs.existsSync(path.join(ROOT, rel));
/** Source with comments removed, so a check never passes or fails on prose. */
const code = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

function* walk(dir: string): Generator<string> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.(tsx?|mjs|js|mdx?)$/.test(e.name)) yield path.relative(ROOT, full);
  }
}
const SRC = [...walk(path.join(ROOT, "src"))];
const CODE_SRC = SRC.filter((f) => !/\.mdx?$/.test(f));
const APP_SRC = CODE_SRC.filter((f) => !/\.test\.m?[jt]s$/.test(f) && !f.startsWith("src/scripts/"));

let passed = 0;
async function check(name: string, fn: () => void | Promise<void>) {
  await fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

async function main() {
  console.log("Phase 156 gate: Portal exposures closed");

  await check("1. docs copy: Spotlight manual only, strict, content-checked", () => {
    const sh = read("scripts/copy-docs.sh");
    assert.match(sh, /^set -euo pipefail$/m, "copy-docs.sh must stop on any failure");
    assert.doesNotMatch(sh, /tsai-periodical|tsai-watson/, "copy-docs.sh must not copy Periodical or Watson docs");
    assert.match(sh, /check-docs-content\.mjs/, "copy-docs.sh must content-check the copy");
    assert.match(sh, /exit 1/, "a missing Spotlight manual must fail the copy");
    const build = JSON.parse(read("package.json")).scripts.build as string;
    assert.doesNotMatch(build, /\|\|\s*true/, "the build must not swallow a failed docs copy");
    assert.match(read("infra/builds/cloudrun/deploy.sh"), /^set -euo pipefail$/m);
  });

  await check("2. content check refuses contact details and internal identifiers", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "phase156-docs-"));
    try {
      const bad: Record<string, string> = {
        "email.mdx": "Write to someone@realdomain.org for access.",
        "phone.mdx": "Call (555) 123-4567.",
        "host.mdx": "Served from node-1.tailabc123.ts.net:8443.",
        "dgx.mdx": "Runs on spark-62db.",
        "ip.mdx": "Reach it at 100.101.102.103 or 192.168.1.20.",
        "jwt.mdx": "token eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.sig",
        "role.mdx": "Uses the service_role key.",
      };
      const sub = path.join(dir, "nested");
      fs.mkdirSync(sub);
      for (const [f, body] of Object.entries(bad)) fs.writeFileSync(path.join(sub, f), body);
      fs.writeFileSync(path.join(dir, "ok.mdx"), "Contact coach@example.com or help@sub.example.org.");
      const rules = new Set(findDocsContentViolations(dir).map((v) => v.file.split(path.sep).pop()));
      for (const f of Object.keys(bad)) assert.ok(rules.has(f), `${f} must be refused`);
      assert.ok(!rules.has("ok.mdx"), "reserved example domains are allowed");
      const cli = spawnSync(process.execPath, ["scripts/check-docs-content.mjs", dir], { encoding: "utf8" });
      assert.equal(cli.status, 1, "the CLI must exit non-zero on findings");
      assert.doesNotMatch(cli.stderr, /someone@realdomain|555\) 123/, "findings never echo the matched text");
      for (const f of Object.keys(bad)) fs.rmSync(path.join(sub, f));
      const clean = spawnSync(process.execPath, ["scripts/check-docs-content.mjs", dir], { encoding: "utf8" });
      assert.equal(clean.status, 0, "a clean tree passes");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  await check("3. loader serves manifest slugs only", () => {
    assert.equal(resolvePublishedSpotlightSlug(""), "welcome");
    for (const d of SPOTLIGHT_DOCS) assert.equal(resolvePublishedSpotlightSlug(d.slug), d.slug);
    for (const s of ["../../.env", "README", "ecosystem", "user-guide", "welcome.mdx", "periodical/README", "watson/LOCAL-DEV", "/etc/passwd", "user-guide/../roadmap"]) {
      assert.equal(resolvePublishedSpotlightSlug(s), null, `${s} must not resolve`);
    }
    const loader = code("src/utils/docs.tsx");
    assert.match(loader, /export async function loadDoc\(slug: string\)/, "loadDoc takes a slug, not a tree");
    assert.match(loader, /resolvePublishedSpotlightSlug\(slug\)/, "loadDoc must resolve through the manifest");
    assert.doesNotMatch(loader, /periodical|watson/i);
  });

  await check("4. /docs verifies entitlement on the server and links no other tree", () => {
    const page = code("src/app/docs/[[...slug]]/page.tsx");
    assert.match(page, /await getEntitledPortalUser\(\)/);
    assert.doesNotMatch(page, /auth\.getSession\(/, "a cookie session is not a verified user");
    assert.doesNotMatch(page, /\/docs\/(periodical|watson)/);
    assert.match(page, /isEntitled && isSpotlightPath \? await loadDoc\(docPath\) : null/, "no document loads without entitlement");
    assert.match(page, /isEntitled \? SPOTLIGHT_DOCS : \[\]/, "no index without entitlement");
  });

  await check("5. entitlement: verified user, real licence rows, loud failures", async () => {
    const lib = code("src/lib/auth/portal-entitlement.ts");
    assert.match(lib, /auth\.getUser\(\)/);
    assert.doesNotMatch(lib, /auth\.getSession\(|user_metadata/);
    type Rows = { profile?: Record<string, unknown> | null; licences?: { status: string }[]; profileError?: string; licenceError?: string };
    const client = (rows: Rows) =>
      ({
        from(table: string) {
          const q = {
            select: () => q,
            or: () => q,
            eq: async () => ({ data: rows.licences ?? [], error: rows.licenceError ? { message: rows.licenceError } : null }),
            maybeSingle: async () => ({ data: rows.profile ?? null, error: rows.profileError ? { message: rows.profileError } : null }),
          };
          assert.ok(table === "profiles" || table === "user_product_licenses", `unexpected table ${table}`);
          return q;
        },
      }) as unknown as SupabaseClient;
    const id = "00000000-0000-0000-0000-000000000001";
    assert.equal((await isUserEntitledToPortal(client({ profile: { id, is_superadmin: true } }), id, "a@example.com")).isEntitled, true);
    assert.equal((await isUserEntitledToPortal(client({ profile: { id }, licences: [{ status: "active" }] }), id, "a@example.com")).isEntitled, true);
    assert.equal((await isUserEntitledToPortal(client({ profile: { id }, licences: [{ status: "revoked" }] }), id, "a@example.com")).isEntitled, false);
    assert.equal((await isUserEntitledToPortal(client({}), id, "a@example.com", { licenses: [] })).isEntitled, false);
    await assert.rejects(isUserEntitledToPortal(client({ profileError: "down" }), id, "a@example.com"), /profile lookup failed/);
    await assert.rejects(isUserEntitledToPortal(client({ profile: { id }, licenceError: "down" }), id, "a@example.com"), /licence lookup failed/);
    const callback = code("src/app/auth/callback/route.ts");
    assert.match(callback, /from "@\/lib\/auth\/portal-entitlement"/, "the callback uses the one entitlement rule");
    assert.doesNotMatch(callback, /async function isUserEntitledToPortal/, "no second copy of the rule");
  });

  await check("6. password sign-in passes the licence check or is signed out", () => {
    const login = code("src/app/login/page.tsx");
    const signIn = login.indexOf("signInWithPassword(");
    const gate = login.indexOf('fetch("/auth/entitlement"');
    assert.ok(signIn > 0 && gate > signIn, "the licence check must follow the password sign-in");
    assert.match(login.slice(gate), /if \(!check\.ok\) \{\s*await supabase\.auth\.signOut\(/);
    assert.doesNotMatch(login, /window\.location\.href = "\/";/, "no unconditional redirect after sign-in");
    const route = code("src/app/auth/entitlement/route.ts");
    assert.match(route, /getEntitledPortalUser\(\)/);
    assert.match(route, /signOut\(\{ scope: "global" \}\)/);
  });

  await check("7. open roster import and Stripe routes gone, with secret and simulations", () => {
    for (const f of [
      "src/app/api/rosters/import/route.ts",
      "src/lib/roster/gamesheet-roster-service.ts",
      "src/app/api/billing/stripe/connect/route.ts",
      "src/app/api/billing/hardware/checkout/route.ts",
      "src/app/api/billing/stripe/checkout/route.ts",
      "src/components/commercial/ClubMonetizationWorkbench.tsx",
    ]) {
      assert.equal(exists(f), false, `${f} must not exist`);
    }
    assert.doesNotMatch(read("package.json"), /roster-import/);
    for (const f of CODE_SRC) {
      const c = code(f);
      assert.doesNotMatch(c, /tsai-vpc-secret|acct_sim_|_sim_\$\{|isSimulation/, `${f}: simulated or committed-secret path`);
      if (/route\.ts$/.test(f) && /stripe/i.test(c)) assert.fail(`${f}: a Stripe route needs auth and a webhook first`);
    }
  });

  await check("8. telemetry: user from the verified session, never the body", () => {
    const t = code("src/app/api/telemetry/event/route.ts");
    const destructure = t.slice(t.indexOf("const {"), t.indexOf("} = body;"));
    assert.doesNotMatch(destructure, /user_id|lead_id/, "user_id / lead_id must not come from the body");
    assert.doesNotMatch(t, /body\s*(?:\.|\[\s*["'`])\s*(?:user_id|lead_id|userId|leadId)/, "no read of an identity field from the body anywhere");
    assert.match(t, /const user_id: string \| null = sessionUser\?\.id \?\? null;/, "user_id is the verified session user");
    assert.match(t, /const lead_id: string \| null = null;/, "lead_id is never client-supplied");
    assert.equal((t.match(/const (?:user_id|lead_id)\b/g) ?? []).length, 2, "exactly one binding each for user_id and lead_id");
    assert.match(t, /auth\.getUser\(\)/);
    assert.match(t, /throw new Error\(`telemetry event insert failed/);
    assert.doesNotMatch(code("src/lib/telemetry/tracker.ts"), /user_id\?:|lead_id\?:/);
    // Journey writes follow the live table: these columns / stages do not exist there, and
    // writing them failed silently for every visitor.
    assert.doesNotMatch(t, /total_pageviews|total_session_sec|funnel_stage|first_touch_source|first_landing_page|"active_user"|"lead_captured"/);
  });

  await check("9. no tailnet host or DGX host name in runtime code", () => {
    for (const f of APP_SRC) {
      assert.doesNotMatch(read(f), /\.ts\.net\b|spark-62db/, `${f}: internal host in runtime code`);
    }
    assert.match(code("src/app/supabase/[[...path]]/route.ts"), /required\(process\.env\.TSAI_DGX_ORIGIN, "TSAI_DGX_ORIGIN"\)/);
  });

  await check("10. auth, API, proxy and docs responses are never shared-cached", async () => {
    const { default: config } = await import("../next.config");
    const rules = (await config.headers!()) as { source: string; headers: { key: string; value: string }[] }[];
    const cacheOf = (p: string) => {
      const hits = rules.filter((r) => {
        const src = r.source.replace(/:path\*$/, "").replace(/\/$/, "");
        if (r.source.startsWith("/((?!")) {
          const inner = r.source.slice(2, -1);
          return new RegExp(`^/${inner}$`).test(p);
        }
        return r.source.endsWith(":path*") ? p === src || p.startsWith(src + "/") : p === r.source;
      });
      return hits.flatMap((r) => r.headers.filter((h) => h.key === "Cache-Control").map((h) => h.value));
    };
    for (const p of ["/supabase/auth/v1/token", "/auth/callback", "/auth/entitlement", "/api/telemetry/event", "/api/beta-requests", "/docs", "/docs/", "/docs/spotlight/roadmap", "/login", "/login/"]) {
      const values = cacheOf(p);
      assert.deepEqual(values, ["private, no-store"], `${p} must be private, no-store (got ${JSON.stringify(values)})`);
    }
    for (const p of ["/", "/pricing", "/coachs-corner"]) {
      assert.ok(cacheOf(p).every((v) => v.startsWith("public")), `${p} keeps its public caching`);
    }
    // A route handler's own Cache-Control wins over next.config, so no handler may set a public one.
    for (const f of CODE_SRC.filter((x) => /\/route\.ts$/.test(x))) {
      for (const m of code(f).matchAll(/["']Cache-Control["']\s*:\s*["'`]([^"'`]+)/gi)) {
        assert.match(m[1], /^private\b/, `${f}: a route handler sets a non-private Cache-Control (${m[1]})`);
      }
    }
  });

  await check("11. no real person on a public page: no jersey case study, no outside contact", () => {
    // RFC 2606 reserved names (example.com/.org/.net, the .example TLD) and the company domain.
    const allowedDomain = /@(?:(?:[a-z0-9-]+\.)*example(?:\.(?:com|org|net|edu))?|transcendental-sports\.ai)$/i;
    for (const f of SRC) {
      const raw = read(f);
      // A jersey number followed by a capitalised word is a persona ("#26 <First>", "#26 <First> <I>."),
      // unless the word is a generic role.
      assert.doesNotMatch(
        raw,
        /#\d{1,2} (?!(?:Skater|Athlete|Player|Goalie|Forward|Defen[cs]eman|Defen[cs]e|Center|Centre|Wing|Winger)\b)[A-Z][a-z]+/,
        `${f}: a "#<jersey> <Name>" persona`,
      );
      for (const m of raw.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g)) {
        if (/\.(png|svg|jpe?g|webp)$/i.test(m[0])) continue;
        assert.match(m[0], allowedDomain, `${f}: contact address outside the allowed domains`);
      }
    }
  });

  assert.equal(passed, 11);
  console.log(`Phase 156 gate: ${passed}/11 checks passed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
