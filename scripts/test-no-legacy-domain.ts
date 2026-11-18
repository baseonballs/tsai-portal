import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

/**
 * Repo guard: the old domain does not reach customers.
 *
 * Owner rule (2026-11-18): the platform's ONLY customer-facing domain is transcendental-sports.ai.
 * The old domain is still mapped so old links resolve, and src/proxy.ts answers every request on
 * it with a 308 to the official host — but nothing this app ships may point anyone at it.
 *
 * Scanned (case-insensitive):
 *   1. application source: src/ except src/scripts/ (tests are not bundled);
 *   2. public/ (served as-is) and the build-time scripts/ (copy-docs, checks) — but not the
 *      scripts/test-*.ts tests or scripts/lib/ test helpers;
 *   3. config that becomes runtime: next.config.ts, Dockerfile, deploy.sh, .env.example,
 *      .env.production, infra/;
 *   4. src/content/docs/ — the published /docs copy — when a build has produced it;
 *   5. the built public output, .next/static/, when a build exists: zero hits, no exceptions.
 *
 * The published Spotlight manual is also checked at its source by scripts/check-docs-content.mjs.
 *
 * ALLOWED is the complete list of exceptions, each with an exact count and the reason. A file not
 * in it must have none; a listed file must match its count exactly, so a removal has to lower the
 * entry and nothing can be added silently. History (docs/, conductor/, CHANGELOG) is not scanned:
 * past release notes and specs record what was true when they were written.
 */

const ROOT = process.cwd();
// Spelled in pieces so this guard does not count itself.
const NEEDLE = ["tsai-spotlight", "com"].join(".");

const SCAN_DIRS = ["src", "public", "scripts", "infra"];
const SCAN_FILES = ["next.config.ts", "Dockerfile", "deploy.sh", ".env.example", ".env.production"];
const SKIP_PREFIXES = ["src/scripts/", "scripts/test-", "scripts/lib/"];
const TEXT_EXT = /\.(ts|tsx|js|mjs|cjs|jsx|json|html|css|txt|md|mdx|yaml|yml|toml|sh|xml|webmanifest|env|template|svg)$/i;

const ALLOWED: Record<string, { count: number; why: string }> = {
  // The redirect itself has to name the hosts it redirects FROM (apex constant + exact-host table).
  "src/lib/legacy-host-redirect.ts": { count: 5, why: "legacy-host redirect table (308 to official)" },
};

function* walk(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git") continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (st.isFile()) yield p;
  }
}

function countIn(text: string): number {
  return text.toLowerCase().split(NEEDLE).length - 1;
}

const rel = (abs: string) => relative(ROOT, abs).split("\\").join("/");

console.log("▶ [1/4] Application source, public assets, scripts and runtime config...");
const found: Record<string, number> = {};
let scanned = 0;
const candidates = [
  ...SCAN_DIRS.flatMap((d) => [...walk(join(ROOT, d))]),
  ...SCAN_FILES.map((f) => join(ROOT, f)).filter((f) => existsSync(f)),
];
for (const abs of candidates) {
  const path = rel(abs);
  if (SKIP_PREFIXES.some((p) => path.startsWith(p))) continue;
  if (!TEXT_EXT.test(path) && !SCAN_FILES.includes(path)) continue;
  scanned++;
  const n = countIn(readFileSync(abs, "utf8"));
  if (n > 0) found[path] = n;
}
assert.ok(scanned > 100, `scanned only ${scanned} files — the walk is not seeing the app`);
assert.ok(candidates.some((c) => rel(c) === "src/proxy.ts"), "src/proxy.ts must be in the scanned set");

const problems: string[] = [];
for (const [path, n] of Object.entries(found)) {
  const allowed = ALLOWED[path];
  if (!allowed) problems.push(`${path}: ${n} hit(s), not in ALLOWED — use the official transcendental-sports.ai host`);
  else if (allowed.count !== n) problems.push(`${path}: ${n} hit(s), ALLOWED says ${allowed.count} — update the entry`);
}
for (const [path, allowed] of Object.entries(ALLOWED)) {
  if (!found[path]) problems.push(`${path}: ALLOWED lists ${allowed.count} but none remain — delete the entry`);
}
assert.deepEqual(problems, [], `old domain in shipped code:\n  ${problems.join("\n  ")}`);
console.log(`  ✓ ${scanned} files; ${Object.keys(ALLOWED).length} commented exceptions, each exact.`);

console.log("▶ [2/4] The guard itself can fail...");
assert.equal(countIn(`https://periodical.${NEEDLE}/x and HTTPS://APP.${NEEDLE.toUpperCase()}`), 2);
assert.equal(countIn("https://periodical.transcendental-sports.ai"), 0);
console.log("  ✓ counts mixed-case hits, ignores the official host.");

console.log("▶ [3/4] Built public output (.next/static)...");
const STATIC_DIR = join(ROOT, ".next/static");
if (!existsSync(STATIC_DIR)) {
  console.log("  - no build present; run after `pnpm build` to scan the client bundle.");
} else {
  const leaks: string[] = [];
  for (const abs of walk(STATIC_DIR)) {
    if (!/\.(js|css|html|json|txt)$/i.test(abs)) continue;
    const n = countIn(readFileSync(abs, "utf8"));
    if (n > 0) leaks.push(`${rel(abs)}: ${n}`);
  }
  assert.deepEqual(leaks, [], `old domain in the public bundle:\n  ${leaks.join("\n  ")}`);
  console.log("  ✓ zero hits in .next/static.");
}

async function docsCheckRefusesIt(): Promise<void> {
  console.log("▶ [4/4] The published-docs check refuses the old domain...");
  {
    const { findDocsContentViolations } = await import("./check-docs-content.mjs");
    const dir = mkdtempSync(join(tmpdir(), "docs-legacy-"));
    try {
      writeFileSync(join(dir, "a.md"), `See https://APP.${NEEDLE.toUpperCase()}/x\nand https://spotlight.transcendental-sports.ai/x\n`);
      const findings = findDocsContentViolations(dir) as Array<{ rule: string; line: number }>;
      assert.deepEqual(
        findings.map((f) => [f.rule, f.line]),
        [["old domain (use transcendental-sports.ai)", 1]],
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  console.log("  ✓ scripts/check-docs-content.mjs flags it; the official host passes.");
}

docsCheckRefusesIt().then(
  () => console.log("\n✅ no-legacy-domain: the old domain reaches no customer."),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
