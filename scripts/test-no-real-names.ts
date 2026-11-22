/**
 * No real person's name (or listed email / phone) in what the Portal ships — Phase 156.
 *
 * Same owner-only list, loader and matcher as tsai-spotlight / tsai-periodical test-no-real-names.ts
 * (scripts/lib/real-names.ts): the list is never in the repo; set-but-unusable FAILS, unset-and-absent
 * SKIPS, and strict mode (TSAI_TESTS_STRICT=1 or HOCKEY_TESTS_STRICT=1) turns the skip into a failure.
 *
 * Scanned: every text file under src/ (the copied docs in src/content/docs included), public/,
 * scripts/, infra/, docs/ and the repository's root files. Phase 156 found a real minor used as a
 * public-page case study and real people in test fixtures; this is the class check for that.
 *
 * Documented exceptions are keyed by sha256(path)[0:12] -> {"<kind>:<sha256(token)[0:12]>": exact count}:
 * a different name in the same file, or one more occurrence, FAILS. REPORT=1 prints each failing file's
 * key and signature. Messages carry paths, hashes, kinds and counts only — never a name.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { NameMatcher, loadRealNameList } from "./lib/real-names";

const ROOT = process.cwd();
const SCAN_DIRS = ["src", "public", "scripts", "infra", "docs"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "graphify-out", "coverage", "dist", "out"]);
const BINARY = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".woff", ".woff2", ".ttf", ".mp4", ".mov", ".webm", ".zip"]);
const ROOT_SKIP = /(^\.env|\.tsbuildinfo$|^\.DS_Store$)/;
const sha = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 12);

// Documented collisions (a common word / package name that is also a listed token):
const KNOWN_COLLISIONS: Record<string, Record<string, number>> = {
  // pnpm-lock.yaml: a third-party package name
  [sha("pnpm-lock.yaml")]: { "name:eb687afb0f48": 1 },
};

function files(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (SKIP_DIRS.has(e.name)) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile()) out.push(full);
    }
  };
  for (const d of SCAN_DIRS) {
    try {
      if (statSync(join(ROOT, d)).isDirectory()) walk(join(ROOT, d));
    } catch {
      /* directory absent */
    }
  }
  for (const e of readdirSync(ROOT, { withFileTypes: true })) {
    if (e.isFile() && !ROOT_SKIP.test(e.name)) out.push(join(ROOT, e.name));
  }
  return out;
}

const verdict = loadRealNameList();
if (verdict.verdict === "skip") {
  console.log(`test-no-real-names: SKIPPED — ${verdict.reason}`);
  process.exit(0);
}
if (verdict.verdict === "fail") {
  console.error(`test-no-real-names: FAILED — ${verdict.reason}`);
  process.exit(1);
}
if (verdict.verdict !== "ok") throw new Error("unreachable: the list verdict was handled above");
const matcher = new NameMatcher(verdict.data);
const tokens = matcher.tokens();

const failures: string[] = [];
let scanned = 0;
for (const file of files()) {
  const rel = relative(ROOT, file);
  if (rel === "scripts/lib/real-names.ts") continue; // the matcher itself carries no names, only rules
  const binary = BINARY.has(extname(file).toLowerCase());
  if (binary || statSync(file).size > 20_000_000) continue;
  scanned += 1;
  const sig: Record<string, number> = {};
  for (const h of matcher.hits(readFileSync(file, "utf8"))) {
    const key = `${h.kind}:${h.ref >= 0 ? sha(tokens[h.ref]) : "-"}`;
    sig[key] = (sig[key] ?? 0) + 1;
  }
  if (Object.keys(sig).length === 0) continue;
  const allowed = KNOWN_COLLISIONS[sha(rel)];
  const ok =
    allowed &&
    Object.keys(sig).length === Object.keys(allowed).length &&
    Object.entries(sig).every(([k, n]) => k.startsWith("name:") && allowed[k] === n);
  if (!ok) {
    failures.push(`${rel} ${JSON.stringify(sig)}${process.env.REPORT === "1" ? ` key=${sha(rel)}` : ""}`);
  }
}

assert.ok(scanned > 100, `expected to scan the tree, scanned ${scanned} files`);
if (failures.length > 0) {
  console.error(`test-no-real-names: ${failures.length} file(s) carry a listed real name, email or phone:`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`test-no-real-names: ${scanned} files, no listed real name, email or phone`);
