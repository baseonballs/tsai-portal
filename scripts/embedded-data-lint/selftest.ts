/**
 * embedded-data-lint self-test (T2.3). Identical in the four apps. Proves the lint FAILS on introduced
 * violations and refuses every bad approval, then that the real tree passes. Neutral probes only: no real
 * person, team or game appears here ("Player A", "Team One").
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { BASELINE_PATH, registerRowsFor, runLint } from "./cli";
import { baselineGrowth, isRuntimePath, judge, lintSource, lintTree, lowerBaseline, readBaseline, RULES, type AllowRow, type LintConfig, type RuleId } from "./core";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`embedded-data-lint self-test: ${msg}`);
}

/** One probe per rule. Each MUST be reported under exactly that rule. */
export const VIOLATIONS: Record<RuleId, string> = {
  "player-records": `export const ROSTER = [{ name: "Player A", jersey: 9 }, { playerId: "p2", jerseyNumber: "12" }];`,
  "person-records": `export const PEOPLE = [{ fullName: "Person A", email: "a@example.com" }, { fullName: "Person B", phone: "000-0000" }];`,
  "team-list": `export const TEAMS = [{ teamName: "Team One" }, { teamName: "Team Two" }];`,
  "game-records": `const games = [{ date: "2000-01-01", venue: "Rink X" }, { date: "2000-01-02", venue: "Rink Y" }];`,
  "score-object": `const g = { homeScore: 4, awayScore: 2 };`,
  "uuid-keyed-map": `const BY_ID = { "00000000-0000-4000-8000-000000000001": "Team One" };`,
  "uuid-list": `const IDS = ["00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002"];`,
};

/** Shapes that look close but are not domain data. None may be reported. */
export const NEUTRAL = [
  `const NAV = [{ name: "Settings", href: "/settings" }, { name: "Profile", href: "/profile" }];`,
  `const EMPTY = { homeScore: 0, awayScore: 0 };`,
  `function f(p: { name: string; jersey: number }[]) { return p.map((x) => ({ name: x.name, jersey: x.jersey })); }`,
  `// [{ name: "Player A", jersey: 9 }, { name: "Player B", jersey: 12 }]`,
  `const S = "[{ name: 'Player A', jersey: 9 }, { name: 'Player B', jersey: 12 }]";`,
  `const ONE = { teamName: "Team One" };`,
  `const ID = "00000000-0000-4000-8000-000000000001";`,
  `const TIERS = [{ name: "Free", price: 0 }, { name: "Pro", price: 10 }];`,
  `const STEPS = [{ number: 1, name: "Plan" }, { number: 2, name: "Compete" }];`,
];

export function runSelfTest(root: string, config: LintConfig, probeFile: string): number {
  let checks = 0;
  for (const rule of RULES) {
    const found = lintSource("probe.ts", VIOLATIONS[rule]).map((f) => f.rule);
    assert(found.includes(rule), `the ${rule} probe was not reported (got ${JSON.stringify(found)})`);
    checks++;
  }
  // JSON is runtime data too when code imports it.
  assert(lintSource("probe.json", `[{"name":"Player A","jersey":9},{"name":"Player B","jersey":12}]`).length > 0, "a JSON roster was not reported");
  checks++;
  for (const n of NEUTRAL) {
    const found = lintSource("neutral.tsx", n);
    assert(found.length === 0, `false positive on ${JSON.stringify(n)}: ${JSON.stringify(found)}`);
    checks++;
  }

  // The real tree, with one violation INTRODUCED at a real runtime path, must fail.
  const baseline = readBaseline(join(root, BASELINE_PATH));
  const real = lintTree(root, config);
  const register = registerRowsFor(root, config);
  const probeText = readFileSync(join(root, probeFile), "utf8") + "\n" + VIOLATIONS["player-records"] + "\n";
  const overlaid = real.filter((f) => f.file !== probeFile).concat(lintSource(probeFile, probeText));
  const v = judge(overlaid, config, baseline, register);
  assert(!v.ok && v.fresh.some((f) => f.file === probeFile && f.rule === "player-records"), `an introduced roster in ${probeFile} did not fail the lint`);
  checks++;

  // Bad approvals fail: unknown, malformed, unreadable, foreign, closed, retired, unmatched.
  const probeFinding = { file: probeFile, line: 1, rule: "player-records" as RuleId, detail: "probe" };
  const withAllow = (register: string) => ({ ...config, allow: [{ file: probeFile, rule: "player-records" as RuleId, register, reason: "probe" }] });
  const rows = (row: Partial<AllowRow>) => new Map<string, AllowRow>([["P-01", { surface: config.app, status: "REBUILD-NOW", state: "OPEN", ...row }]]);
  assert(!judge([probeFinding], withAllow("ZZ-999999"), {}, rows({})).ok, "an allow entry with an unknown register row passed");
  assert(!judge([probeFinding], withAllow("not a row"), {}, rows({})).ok, "an allow entry without a row id passed");
  assert(!judge([probeFinding], withAllow("P-01"), {}, null).ok, "an allow entry passed with no register to check it against");
  assert(!judge([probeFinding], withAllow("P-01"), {}, rows({ surface: "Another App" })).ok, "an allow entry on another app's row passed");
  assert(!judge([probeFinding], withAllow("P-01"), {}, rows({ state: "CLOSED" })).ok, "an allow entry on a CLOSED row passed");
  assert(!judge([probeFinding], withAllow("P-01"), {}, rows({ state: "RETIRED" })).ok, "an allow entry on a RETIRED row passed");
  assert(!judge([probeFinding], withAllow("P-01"), {}, rows({ state: "AWAITING OWNER (OD-17)", status: "CLOSED-CORRECT" })).ok, "an allow entry on a CLOSED-CORRECT row passed");
  assert(judge([probeFinding], withAllow("P-01"), {}, rows({})).ok, "a valid allow entry was refused");
  assert(!judge([], withAllow("P-01"), {}, rows({})).ok, "an allow entry that matches nothing passed");
  checks += 9;

  // Fixtures and mocks inside a runtime root are runtime code; only test files and tooling trees are skipped.
  assert(isRuntimePath("src/lib/fixtures/roster.ts") && isRuntimePath("src/__mocks__/teams.ts"), "fixtures/ or __mocks__/ inside src/ was skipped");
  assert(!isRuntimePath("src/lib/roster.test.ts") && !isRuntimePath("src/scripts/probe.ts") && !isRuntimePath("src/a/__tests__/b.ts"), "a test file was scanned");
  checks += 2;

  // The committed baseline may only shrink against the base branch.
  assert(baselineGrowth({ [probeFile]: { "player-records": 1 } }, { [probeFile]: { "player-records": 2 } }).length === 1, "a raised baseline count was not caught");
  assert(baselineGrowth({}, { [probeFile]: { "team-list": 1 } }).length === 1, "a new baseline entry was not caught");
  assert(baselineGrowth({ [probeFile]: { "player-records": 2 } }, { [probeFile]: { "player-records": 1 } }).length === 0, "a lowered baseline was refused");
  checks += 3;

  // The baseline is a ratchet.
  assert(!judge([probeFinding, probeFinding], { ...config, allow: [] }, { [probeFile]: { "player-records": 1 } }, null).ok, "a count above the baseline passed");
  assert(judge([probeFinding], { ...config, allow: [] }, { [probeFile]: { "player-records": 1 } }, null).ok, "a baselined finding failed");
  assert(!judge([], { ...config, allow: [] }, { [probeFile]: { "player-records": 1 } }, null).ok, "a stale baseline passed");
  let raised = false;
  try {
    lowerBaseline({}, [probeFinding], { ...config, allow: [] });
  } catch {
    raised = true;
  }
  assert(raised, "--write-baseline raised a count");
  let missing = false;
  try {
    readBaseline(join(root, "scripts/embedded-data-lint/does-not-exist.json"));
  } catch {
    missing = true;
  }
  assert(missing, "a missing baseline did not fail");
  checks += 5;

  // And the real tree passes, baseline checked against the base branch.
  const now = runLint(root, config);
  assert(
    now.ok,
    `the tree fails the lint:\n${[...now.fresh.map((f) => `${f.file}:${f.line} ${f.rule}`), ...now.baseGrowth, ...now.staleBaseline.map((s) => `stale ${s.file} ${s.rule}`)].join("\n")}`,
  );
  checks++;
  return checks;
}
