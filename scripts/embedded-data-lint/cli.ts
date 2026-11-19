/**
 * embedded-data-lint CLI (T2.3). The engine is `core.ts` (identical in the four apps); this file is too.
 *
 *   npx tsx scripts/embedded-data-lint/cli.ts                 check: fail on a NEW finding (exit 1)
 *   npx tsx scripts/embedded-data-lint/cli.ts --list          also list every baselined finding, by file
 *   npx tsx scripts/embedded-data-lint/cli.ts --json          machine-readable verdict
 *   npx tsx scripts/embedded-data-lint/cli.ts --write-baseline   LOWER the baseline to the tree (never raises)
 *   npx tsx scripts/embedded-data-lint/cli.ts --init-baseline    create the baseline; refuses if one exists
 *
 * Allow entries are checked against tsai-sitedocs gap-register.md through the surface guard's loader
 * (TSAI_SITEDOCS_DIR / TSAI_SITEDOCS_REF, default ../tsai-sitedocs at origin/main).
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadRegisterSource, parseRegister, repoRootFrom } from "../surface-guard/core";
import { config } from "./config";
import { baselineTotal, countByFileRule, formatVerdict, judge, lintTree, lowerBaseline, readBaseline, type Baseline, type LintConfig, type Verdict } from "./core";

export const BASELINE_PATH = "scripts/embedded-data-lint/baseline.json";

export function registerIdsFor(root: string, cfg: LintConfig): Set<string> | null {
  if (!cfg.allow.length) return null;
  const src = loadRegisterSource(root);
  const rows = parseRegister(src.register);
  return new Set(rows.keys());
}

export function runLint(root: string, cfg: LintConfig = config): Verdict {
  const baseline = readBaseline(join(root, BASELINE_PATH));
  const findings = lintTree(root, cfg);
  return judge(findings, cfg, baseline, registerIdsFor(root, cfg));
}

function writeBaseline(root: string, b: Baseline) {
  const sorted: Baseline = {};
  for (const f of Object.keys(b).sort()) sorted[f] = b[f];
  writeFileSync(
    join(root, BASELINE_PATH),
    JSON.stringify(
      {
        note:
          "T2.3 embedded-data lint baseline (REPORT MODE). Findings already on main when the lint landed, per file and rule. " +
          "A count above this, or a file/rule not listed, fails the suite. Lower it with --write-baseline; it never raises.",
        total: baselineTotal(sorted),
        files: Object.keys(sorted).length,
        findings: sorted,
      },
      null,
      2,
    ) + "\n",
  );
}

function main(argv: string[]) {
  const root = repoRootFrom(process.cwd());
  const path = join(root, BASELINE_PATH);
  if (argv.includes("--init-baseline")) {
    if (existsSync(path)) throw new Error(`embedded-data-lint: ${BASELINE_PATH} exists — use --write-baseline (lower-only)`);
    const findings = lintTree(root, config);
    const allowKey = new Set(config.allow.map((a) => `${a.file}\0${a.rule}`));
    writeBaseline(root, countByFileRule(findings.filter((f) => !allowKey.has(`${f.file}\0${f.rule}`))));
    console.log(`embedded-data-lint: wrote ${BASELINE_PATH}`);
    return;
  }
  if (argv.includes("--write-baseline")) {
    const next = lowerBaseline(readBaseline(path), lintTree(root, config), config);
    writeBaseline(root, next);
    console.log(`embedded-data-lint: lowered ${BASELINE_PATH} to ${baselineTotal(next)} finding(s)`);
    return;
  }
  const v = runLint(root);
  if (argv.includes("--json")) console.log(JSON.stringify(v, null, 2));
  else {
    console.log(formatVerdict(v, config.app));
    if (argv.includes("--list")) {
      const files = new Map<string, Set<string>>();
      for (const f of v.baselined) files.set(f.file, (files.get(f.file) ?? new Set()).add(f.rule));
      for (const [f, rules] of [...files].sort()) console.log(`  · ${f} (${[...rules].sort().join(", ")})`);
    }
  }
  if (!v.ok) {
    console.error(
      "\n❌ embedded-data-lint: route-reachable code carries literal people, teams, games or rosters (GOV-REAL-DATA-001). " +
        "Read them from hockey-api, or show an honest empty state.",
    );
    process.exit(1);
  }
  if (!argv.includes("--json")) console.log("✅ embedded-data-lint: no new embedded data");
}

if (process.argv[1] && /embedded-data-lint[\\/]cli\.ts$/.test(process.argv[1])) {
  try {
    main(process.argv.slice(2));
  } catch (e) {
    console.error(`❌ ${(e as Error).message}`);
    process.exit(1);
  }
}
