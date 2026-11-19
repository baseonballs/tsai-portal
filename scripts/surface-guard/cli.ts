/**
 * surface-guard CLI (identical in the four apps).
 *
 *   npx tsx scripts/surface-guard/cli.ts check              the guard (run by the test suite); exit 1 on any finding
 *   npx tsx scripts/surface-guard/cli.ts check --json       the same, as JSON
 *   npx tsx scripts/surface-guard/cli.ts snapshot --baseline   (re)write the pre-cleanup baseline manifest from git
 *   npx tsx scripts/surface-guard/cli.ts snapshot --release [--rev <ref>]
 *        write docs/6-releases/surface/<version>.json for a RELEASED commit (default origin/main), extracted from
 *        git at that commit with the version file at that commit. The check re-derives every manifest from its
 *        commit, so a manifest can only describe a tree that really existed on an ancestor of HEAD.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { config } from "./config";
import {
  MANIFEST_DIR,
  formatReport,
  isAncestor,
  manifestJson,
  repoRootFrom,
  resolveCommit,
  runCheck,
  snapshotAt,
  type RegisterMap,
} from "./core";

const ROOT = repoRootFrom(process.cwd());

export function loadMap(): RegisterMap {
  return JSON.parse(readFileSync(join(ROOT, "scripts/surface-guard/register-map.json"), "utf8")) as RegisterMap;
}

function main(argv: string[]): number {
  const cmd = argv[0] ?? "check";
  if (cmd === "snapshot") {
    mkdirSync(join(ROOT, MANIFEST_DIR), { recursive: true });
    if (argv.includes("--baseline")) {
      const m = { ...snapshotAt(ROOT, config, config.baseline.rev), version: config.baseline.version };
      const out = join(ROOT, MANIFEST_DIR, `${m.version}.json`);
      writeFileSync(out, manifestJson(m));
      console.log(`wrote ${out} (${m.entries.length} entries from ${m.rev})`);
      return 0;
    }
    if (argv.includes("--release")) {
      const i = argv.indexOf("--rev");
      const ref = i >= 0 ? argv[i + 1] : "origin/main";
      if (!ref) throw new Error("--rev needs a ref");
      const rev = resolveCommit(ROOT, ref);
      if (!isAncestor(ROOT, rev, "HEAD")) throw new Error(`${ref} (${rev}) is not an ancestor of HEAD`);
      const m = snapshotAt(ROOT, config, rev);
      const out = join(ROOT, MANIFEST_DIR, `${m.version}.json`);
      writeFileSync(out, manifestJson(m));
      console.log(`wrote ${out} (${m.entries.length} entries from ${rev})`);
      return 0;
    }
    console.error("snapshot needs --baseline or --release [--rev <ref>]");
    return 2;
  }
  if (cmd === "check") {
    const r = runCheck({ repoRoot: ROOT, config, map: loadMap() });
    if (argv.includes("--json")) {
      console.log(
        JSON.stringify(
          {
            ok: r.ok,
            against: r.against,
            register: r.registerOrigin,
            removals: r.verdict.removals.length,
            mapped: r.verdict.mapped.map((m) => ({ id: m.removal.id, change: m.removal.change, row: m.target })),
            unmapped: r.verdict.unmapped.map((u) => ({ id: u.id, change: u.change })),
            invalid: r.verdict.invalid.map((i) => ({ id: i.removal.id, target: i.target, why: i.why })),
            stale: r.verdict.stale,
            vanished: r.vanished,
          },
          null,
          2,
        ),
      );
    } else {
      console.log(formatReport(r, config.app));
    }
    if (!r.ok) {
      if (!argv.includes("--json")) console.error(
        `\n❌ surface-guard: a surface was removed, gated or made unavailable without a gap-register or retirement-ledger row ` +
          "(GOV-REAL-DATA-001 rules 2–3, GA-029 §7). Rebuild it, or record the gap and map it.",
      );
      return 1;
    }
    if (!argv.includes("--json")) console.log(`✅ surface-guard: every removal maps to an open register row or a ledger row`);
    return 0;
  }
  console.error(`unknown command ${cmd}`);
  return 2;
}

if (typeof require !== "undefined" && require.main === module) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
