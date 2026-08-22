#!/usr/bin/env node
/**
 * Fail the build if a credential literal is committed to source.
 *
 * WHY THIS EXISTS
 *   The beta-readiness register logged A2 on 2026-08-13: a hardcoded
 *   SUPABASE_SERVICE_ROLE_KEY fallback in the auth callback. Nine days later it was still there —
 *   and a SECOND one had appeared in api/telemetry/event. The register had pinned it to
 *   "route.ts:88"; a refactor moved the line to 87, which is enough for a line-anchored finding to
 *   read as fixed when nothing was fixed at all.
 *
 *   A register entry is a note. This is a gate. It cannot go stale, because it re-derives the
 *   finding from the source on every run.
 *
 * WHAT IT CATCHES
 *   1. `process.env.SOMETHING_SECRET || "<literal>"` — the fallback pattern. The danger is not the
 *      hardcoding alone: it is that the app SILENTLY KEEPS WORKING when the environment variable is
 *      missing, so a misconfigured deploy authenticates with a committed key instead of failing.
 *   2. Any bare JWT literal (`eyJ…`) anywhere in source, regardless of shape.
 *
 * WHAT IT DELIBERATELY ALLOWS
 *   - Empty-string fallbacks (`|| ""`). Those fail closed, which is the point.
 *   - Obvious placeholders (`your-key-here`, `sk_test_xxx`, `changeme`).
 *   - Anything under the ignore list below, each of which must carry a reason.
 *
 * NOTE ON SEVERITY: a service-role key bypasses RLS entirely — it is unrestricted database access.
 * An anon key is public by design, but hardcoding one still pins the build to one environment and
 * silently survives a bad deploy, so both are refused.
 *
 * Run: pnpm run check:secrets
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
// Auto-detected, NOT hardcoded. The first version listed ["src", "scripts"] and was dropped into a
// repo laid out as app/ + lib/ — where it scanned nothing, found nothing, and printed a green tick.
// A guard that passes because it looked in the wrong place is worse than no guard, so it now
// derives the roots from what exists and REFUSES to run if it finds none.
const CANDIDATE_DIRS = ["src", "app", "lib", "pages", "components", "server", "scripts", "utils"];
const SCAN_DIRS = CANDIDATE_DIRS.filter((d) => {
  try { return statSync(join(ROOT, d)).isDirectory(); } catch { return false; }
});
if (SCAN_DIRS.length === 0) {
  console.error("❌ no source directories found to scan — refusing to report success");
  process.exit(2);
}

const EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const SKIP_DIRS = new Set(["node_modules", ".next", "build", "dist", ".git", "coverage"]);

// Paths allowed to contain a match. Each entry must say WHY.
const ALLOW = [
  // this file necessarily contains the patterns it searches for
  "scripts/check-no-hardcoded-credentials.mjs",
];

const CREDENTIAL_NAME = /(SERVICE_ROLE|ANON_KEY|API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|CREDENTIAL)/;
const PLACEHOLDER = /^(your|xxx|placeholder|changeme|todo|replace|dummy|example|sk_test_x|<)/i;

/** `process.env.X || "literal"` / `process.env.X ?? "literal"` */
const FALLBACK = /process\.env\.([A-Z0-9_]+)\s*(?:\|\||\?\?)\s*(["'`])([^"'`]*)\2/g;
/** a bare JWT anywhere — three base64url segments, `eyJ` header */
const JWT = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e)) continue;
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (EXTS.some((x) => e.endsWith(x))) out.push(p);
  }
  return out;
}

// ALSO scan loose source files at the repo ROOT, non-recursively.
//
// The directory walk misses them entirely, and that is not hypothetical: tsai-watson carried
// add_license.js, check_lucas.js and test_profiles.js at the root, each holding a literal
// service_role JWT, while this guard printed "no hardcoded credentials in source". One-off
// debugging scripts are exactly where a key gets pasted, and exactly where a subdirectory-only
// scanner cannot see.
//
// NOTE the absence of a try/catch swallowing errors here. The first version of this block wrapped
// the readdir in `try { … } catch { return []; }` AND referenced EXTS before its declaration — so
// the TDZ ReferenceError was caught, an empty list was returned, and the guard reported success
// while three credential files sat unscanned. A catch that turns a programming error into a green
// tick is worse than a crash.
function rootSourceFiles() {
  return readdirSync(ROOT)
    .filter((e) => EXTS.some((x) => e.endsWith(x)))
    .map((e) => join(ROOT, e))
    .filter((p) => statSync(p).isFile());
}

const findings = [];

const ALL_FILES = [...SCAN_DIRS.flatMap((d) => walk(join(ROOT, d))), ...rootSourceFiles()];

{
  for (const file of ALL_FILES) {
    const rel = relative(ROOT, file);
    if (ALLOW.includes(rel)) continue;
    const lines = readFileSync(file, "utf8").split("\n");

    lines.forEach((line, i) => {
      // 1. credential-shaped env fallback with a non-empty, non-placeholder literal
      for (const m of line.matchAll(FALLBACK)) {
        const [, varName, , literal] = m;
        if (!CREDENTIAL_NAME.test(varName)) continue;
        if (literal.length === 0) continue;              // fails closed — allowed
        if (PLACEHOLDER.test(literal)) continue;         // not a real secret
        findings.push({
          file: rel, line: i + 1, kind: "env-fallback", varName,
          detail: `${varName} falls back to a committed ${literal.length}-char literal`,
        });
      }
      // 2. a bare JWT, however it got there
      if (JWT.test(line)) {
        findings.push({
          file: rel, line: i + 1, kind: "jwt-literal", varName: "-",
          detail: "a JWT literal is committed on this line",
        });
      }
    });
  }
}

// Deduplicate: a single line can trip both rules.
const seen = new Set();
const unique = findings.filter((f) => {
  const k = `${f.file}:${f.line}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

if (unique.length === 0) {
  console.log("✅ no hardcoded credentials in source");
  process.exit(0);
}

console.error(`\n❌ ${unique.length} hardcoded credential(s) in source\n`);
for (const f of unique) {
  // The VALUE is never printed. Location and shape only.
  console.error(`   ${f.file}:${f.line}  [${f.kind}]  ${f.detail}`);
}
console.error(`
   A committed fallback means a deploy with a MISSING env var keeps working —
   authenticating with whatever was committed instead of failing. Remove the
   literal and let it throw. If the value is real, removing it from HEAD does
   not undo the exposure: it is in git history, so ROTATE it as well.
`);
process.exit(1);
