/**
 * Embedded-data lint (T2.3, PLAT-DATA-EPIC-REAL-DATA-FOUNDATION; GOV-REAL-DATA-001 rules 1–2).
 *
 * Runtime code that a route can reach may not carry literal people, teams, games or rosters. Those come
 * from hockey-api (`hockey_db`), never from the bundle. This builds on Spotlight's `check:data-tier`, which
 * catches domain data read through the WRONG client; this catches domain data that needs no client at all
 * because it was typed into the source.
 *
 * The engine is this file, IDENTICAL in Periodical, Spotlight, Portal and Watson. Each app has its own
 * `config.ts` (which directories are runtime code) and `baseline.json`.
 *
 * What it reports (TypeScript AST, so a comment or a string that merely mentions a key never counts):
 *   player-records   an array of 2+ objects that each carry a literal jersey number (`number` / `num` count
 *                    only beside a playing position)
 *   person-records   an array of 2+ objects that each carry a person's name AND an email / phone / birth date
 *   team-list        an array of 2+ objects that each name a team (teamName / opponent / homeTeam …), or a
 *                    `name` beside a division, age group, league, record or mascot
 *   game-records     an array of 2+ objects that each carry a date AND an opponent / venue
 *   score-object     an object holding a literal score pair (homeScore + awayScore, goalsFor + goalsAgainst,
 *                    score: { home, away }) that is not all zeros, or a literal "4-2" score string
 *   uuid-keyed-map   an object keyed by a UUID literal, or `new Map([["<uuid>", …]])`
 *   uuid-list        an array of 2+ UUID string literals (the "team-id scope heuristic" shape)
 *
 * What it does NOT scan: test files (`*.test.*`, `*.spec.*`, stories, `__tests__/`), and the repo-level tooling
 * trees `scripts/`, `src/scripts/`, `e2e/` and build output. A `fixtures/` or `__mocks__/` directory inside a
 * runtime root IS scanned — runtime code can import it.
 *
 * Two ways a finding is accepted, and only two:
 *   1. ALLOW-LIST (`config.allow`): one file + one rule + a gap-register row id + a reason. The row must exist in
 *      the register (tsai-sitedocs origin/main, read by the surface guard's loader), belong to THIS app, be OPEN,
 *      and not be CLOSED* or RETIRED. Anything else fails the lint. There are no wildcards.
 *   2. BASELINE (`baseline.json`): the findings on main when the lint landed, per file and rule, as counts. It
 *      is REPORT MODE for what was already there: those are listed, not failed, so the register can route them.
 *      It is a ratchet: a count above the baseline, or a file/rule not in it, fails. A count BELOW it fails too
 *      ("stale baseline") until `--write-baseline` lowers it; `--write-baseline` refuses to raise a count or to
 *      add an entry. And the committed baseline is itself checked against `origin/main`'s (`baselineGrowth`): a
 *      branch may lower a count, never raise one or add a file/rule, so a hand-edited baseline fails too.
 *
 * Fail closed: an unreadable root, an unparseable file, a missing baseline, an allow entry without a register
 * row, or an unreadable register (when there are allow entries) is a failure, never a pass.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import ts from "typescript";

export type RuleId =
  | "player-records"
  | "person-records"
  | "team-list"
  | "game-records"
  | "score-object"
  | "uuid-keyed-map"
  | "uuid-list";

export const RULES: RuleId[] = [
  "player-records",
  "person-records",
  "team-list",
  "game-records",
  "score-object",
  "uuid-keyed-map",
  "uuid-list",
];

export interface AllowEntry {
  /** Repo-relative path, exact. */
  file: string;
  rule: RuleId;
  /** A gap-register row id (e.g. `P-12`). Must exist in the register. */
  register: string;
  reason: string;
}

export interface LintConfig {
  app: string;
  /** Repo-relative directories (or single files) holding runtime code. */
  roots: string[];
  /** Extra repo-relative path prefixes to skip (on top of the built-in test/script exclusions). */
  exclude?: string[];
  allow: AllowEntry[];
}

export interface Finding {
  file: string;
  line: number;
  rule: RuleId;
  detail: string;
}

/** `{ "<file>": { "<rule>": count } }` */
export type Baseline = Record<string, Partial<Record<RuleId, number>>>;

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Which files are runtime code
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

/** Never runtime, wherever they sit. `__tests__` holds only tests; the rest are tooling or build output. */
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", ".turbo", "__tests__"]);
/**
 * Never runtime, but ONLY at these repo-relative prefixes. A `fixtures/`, `__mocks__/`, `scripts/` or `build/`
 * directory INSIDE a runtime root (say `src/lib/fixtures/`) is scanned: if app code can import it, it ships.
 */
const SKIP_PREFIXES = ["scripts/", "src/scripts/", "e2e/", "dist/", "out/", "build/", "coverage/", "graphify-out/"];
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json)$/;
const NOT_RUNTIME = /(\.test\.|\.spec\.|\.stories\.|\.d\.ts$|(^|\/)(tsconfig|package)[^/]*\.json$)/;

export function isRuntimePath(rel: string, exclude: string[] = []): boolean {
  const p = rel.split(sep).join("/");
  if (!CODE_EXT.test(p) || NOT_RUNTIME.test(p)) return false;
  if (p.split("/").some((seg) => SKIP_DIRS.has(seg))) return false;
  if (SKIP_PREFIXES.some((x) => p.startsWith(x))) return false;
  return !exclude.some((e) => p === e || p.startsWith(e.endsWith("/") ? e : e + "/"));
}

export function listRuntimeFiles(root: string, config: LintConfig): string[] {
  const out: string[] = [];
  const walk = (abs: string) => {
    const st = statSync(abs);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(abs.split(sep).pop() as string)) return;
      for (const name of readdirSync(abs).sort()) walk(join(abs, name));
      return;
    }
    const rel = relative(root, abs).split(sep).join("/");
    if (isRuntimePath(rel, config.exclude)) out.push(rel);
  };
  if (!config.roots.length) throw new Error("embedded-data-lint: config.roots is empty — nothing would be scanned");
  for (const r of config.roots) {
    const abs = join(root, r);
    if (!existsSync(abs)) throw new Error(`embedded-data-lint: root ${r} does not exist — the config is stale`);
    walk(abs);
  }
  return [...new Set(out)].sort();
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// The rules
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

const NAME_KEYS = new Set([
  "name",
  "firstName",
  "lastName",
  "fullName",
  "playerName",
  "athleteName",
  "displayName",
  "first_name",
  "last_name",
  "full_name",
  "player_name",
  "athlete_name",
  "display_name",
  "legalName",
  "legal_name",
]);
const JERSEY_KEYS = new Set(["jersey", "jerseyNumber", "jersey_number", "jerseyNo", "jersey_no", "sweater"]);
/** `number` / `num` are generic (an ordinal, a step); they mean a jersey only beside a playing position. */
const LOOSE_JERSEY_KEYS = new Set(["number", "num"]);
const POSITION_KEYS = new Set(["position", "pos", "shoots", "catches"]);
const CONTACT_KEYS = new Set([
  "email",
  "phone",
  "dob",
  "dateOfBirth",
  "date_of_birth",
  "birthDate",
  "birth_date",
  "birthdate",
  "parentEmail",
  "parent_email",
  "guardianEmail",
  "guardian_email",
]);
const TEAM_KEYS = new Set([
  "teamName",
  "team_name",
  "homeTeam",
  "awayTeam",
  "home_team",
  "away_team",
  "opponent",
  "opponentName",
  "opponent_name",
]);
const TEAMISH_BESIDE_NAME = new Set([
  "division",
  "ageGroup",
  "age_group",
  "league",
  "mascot",
  "wins",
  "losses",
  "ties",
  "record",
]);
const DATE_KEYS = new Set(["date", "gameDate", "game_date", "startsAt", "starts_at", "scheduledAt", "scheduled_at"]);
const GAME_BESIDE_DATE = new Set(["opponent", "opponentName", "opponent_name", "homeTeam", "awayTeam", "home_team", "away_team", "venue", "rink", "arena"]);
const SCORE_PAIRS: [string, string][] = [
  ["homeScore", "awayScore"],
  ["home_score", "away_score"],
  ["goalsFor", "goalsAgainst"],
  ["goals_for", "goals_against"],
  ["teamScore", "opponentScore"],
  ["team_score", "opponent_score"],
  ["ourScore", "theirScore"],
  ["scoreFor", "scoreAgainst"],
];
const SCORE_KEY = /^(score|finalScore|final_score|result|scoreline)$/;
const SCORE_STRING = /^\s*\d{1,2}\s*[-–]\s*\d{1,2}\s*(F|OT|SO|\(OT\)|\(SO\))?\s*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function propKey(p: ts.ObjectLiteralElementLike): string | null {
  if (!ts.isPropertyAssignment(p) && !ts.isShorthandPropertyAssignment(p)) return null;
  const n = p.name;
  if (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNumericLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
  if (ts.isComputedPropertyName(n) && (ts.isStringLiteral(n.expression) || ts.isNoSubstitutionTemplateLiteral(n.expression))) {
    return n.expression.text;
  }
  return null;
}

function unwrap(e: ts.Expression): ts.Expression {
  while (ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isParenthesizedExpression(e) || ts.isTypeAssertionExpression(e)) {
    e = e.expression;
  }
  return e;
}

function stringValue(e: ts.Expression | undefined): string | null {
  if (!e) return null;
  e = unwrap(e);
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
  return null;
}

function numberValue(e: ts.Expression | undefined): number | null {
  if (!e) return null;
  e = unwrap(e);
  if (ts.isNumericLiteral(e)) return Number(e.text);
  return null;
}

/** The literal props of an object: key → initializer (string/number literals only are "literal"). */
function literalProps(o: ts.ObjectLiteralExpression): Map<string, ts.Expression> {
  const m = new Map<string, ts.Expression>();
  for (const p of o.properties) {
    if (!ts.isPropertyAssignment(p)) continue;
    const k = propKey(p);
    if (k !== null) m.set(k, p.initializer);
  }
  return m;
}

function hasLiteralString(props: Map<string, ts.Expression>, keys: Set<string>): boolean {
  for (const k of keys) {
    const v = stringValue(props.get(k));
    if (v !== null && v.trim() !== "") return true;
  }
  return false;
}

function hasJersey(props: Map<string, ts.Expression>): boolean {
  const keys = [...props.keys()].some((k) => POSITION_KEYS.has(k)) ? [...JERSEY_KEYS, ...LOOSE_JERSEY_KEYS] : [...JERSEY_KEYS];
  for (const k of keys) {
    const e = props.get(k);
    if (numberValue(e) !== null) return true;
    const s = stringValue(e);
    if (s !== null && /^#?\d{1,3}$/.test(s.trim())) return true;
  }
  return false;
}

type RecordTest = (props: Map<string, ts.Expression>) => boolean;

const RECORD_RULES: { rule: RuleId; test: RecordTest; what: string }[] = [
  { rule: "player-records", what: "a jersey number", test: (p) => hasJersey(p) },
  {
    rule: "person-records",
    what: "name + email/phone/birth date",
    test: (p) => hasLiteralString(p, NAME_KEYS) && hasLiteralString(p, CONTACT_KEYS),
  },
  {
    rule: "team-list",
    what: "team name",
    test: (p) =>
      hasLiteralString(p, TEAM_KEYS) ||
      (stringValue(p.get("name")) !== null && [...TEAMISH_BESIDE_NAME].some((k) => p.has(k) && (stringValue(p.get(k)) !== null || numberValue(p.get(k)) !== null))),
  },
  {
    rule: "game-records",
    what: "date + opponent/venue",
    test: (p) => hasLiteralString(p, DATE_KEYS) && hasLiteralString(p, GAME_BESIDE_DATE),
  },
];

export function lintSource(file: string, text: string): Finding[] {
  const isJson = file.endsWith(".json");
  const src = ts.createSourceFile(
    isJson ? file.replace(/\.json$/, ".ts") : file,
    isJson ? `export default (${text}\n);` : text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") || file.endsWith(".jsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const diags = (src as unknown as { parseDiagnostics?: ts.Diagnostic[] }).parseDiagnostics ?? [];
  if (isJson && diags.length) throw new Error(`embedded-data-lint: ${file} is not valid JSON`);
  const out: Finding[] = [];
  const lineOf = (n: ts.Node) => src.getLineAndCharacterOfPosition(n.getStart(src)).line + 1;
  const push = (n: ts.Node, rule: RuleId, detail: string) => out.push({ file, line: lineOf(n), rule, detail });

  const visit = (node: ts.Node) => {
    if (ts.isArrayLiteralExpression(node)) {
      const objs = node.elements.map((e) => unwrap(e as ts.Expression)).filter(ts.isObjectLiteralExpression);
      if (objs.length >= 2) {
        const props = objs.map(literalProps);
        for (const r of RECORD_RULES) {
          const n = props.filter(r.test).length;
          if (n >= 2) push(node, r.rule, `${n} literal records with ${r.what}`);
        }
      }
      const uuids = node.elements.filter((e) => UUID.test(stringValue(e as ts.Expression) ?? ""));
      if (uuids.length >= 2) push(node, "uuid-list", `${uuids.length} UUID literals`);
    }

    if (ts.isObjectLiteralExpression(node)) {
      const props = literalProps(node);
      for (const [a, b] of SCORE_PAIRS) {
        const x = numberValue(props.get(a));
        const y = numberValue(props.get(b));
        if (x !== null && y !== null && (x !== 0 || y !== 0)) push(node, "score-object", `${a}/${b} = ${x}/${y}`);
      }
      for (const [k, v] of props) {
        if (!SCORE_KEY.test(k)) continue;
        const inner = unwrap(v);
        if (ts.isObjectLiteralExpression(inner)) {
          const ip = literalProps(inner);
          const h = numberValue(ip.get("home") ?? ip.get("us"));
          const a = numberValue(ip.get("away") ?? ip.get("them"));
          if (h !== null && a !== null && (h !== 0 || a !== 0)) push(inner, "score-object", `${k}: { ${h}, ${a} }`);
        }
        const s = stringValue(v);
        if (s !== null && SCORE_STRING.test(s)) push(v, "score-object", `${k}: "${s.trim()}"`);
      }
      const uuidKeys = node.properties.filter((p) => UUID.test(propKey(p) ?? ""));
      if (uuidKeys.length >= 1) push(node, "uuid-keyed-map", `${uuidKeys.length} UUID key(s)`);
    }

    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "Map" && node.arguments?.length) {
      const arg = unwrap(node.arguments[0]);
      if (ts.isArrayLiteralExpression(arg)) {
        const keyed = arg.elements.filter((e) => {
          const u = unwrap(e as ts.Expression);
          return ts.isArrayLiteralExpression(u) && u.elements.length > 0 && UUID.test(stringValue(u.elements[0] as ts.Expression) ?? "");
        });
        if (keyed.length >= 1) push(node, "uuid-keyed-map", `new Map with ${keyed.length} UUID key(s)`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(src);
  return out;
}

export function lintTree(root: string, config: LintConfig): Finding[] {
  const out: Finding[] = [];
  for (const rel of listRuntimeFiles(root, config)) out.push(...lintSource(rel, readFileSync(join(root, rel), "utf8")));
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Judging: allow-list (register-backed) and baseline (ratchet)
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

export function countByFileRule(findings: Finding[]): Baseline {
  const b: Baseline = {};
  for (const f of findings) {
    const e = (b[f.file] ??= {});
    e[f.rule] = (e[f.rule] ?? 0) + 1;
  }
  return b;
}

export interface Verdict {
  findings: Finding[];
  allowed: Finding[];
  baselined: Finding[];
  /** Findings neither allowed nor covered by the baseline: these fail. */
  fresh: Finding[];
  /** Allow entries that are malformed or point at no register row: these fail. */
  invalidAllow: { entry: AllowEntry; why: string }[];
  /** Allow entries that match no finding: these fail (the allow-list must not outlive what it allows). */
  staleAllow: AllowEntry[];
  /** Baseline counts above what the tree has now: these fail until `--write-baseline` lowers them. */
  staleBaseline: { file: string; rule: RuleId; baseline: number; now: number }[];
  ok: boolean;
}

const ROW_ID = /^[A-Z]{1,2}-S?\d+$/;

/** The fields of a gap-register row the allow-list needs (a subset of the surface guard's `RegisterRow`). */
export interface AllowRow {
  surface: string;
  status: string;
  state: string;
}

/** Why a register row cannot back an allow entry for `app`, or null when it can. */
export function allowRowProblem(id: string, row: AllowRow | undefined, app: string): string | null {
  if (!row) return `${id} is not a row in gap-register.md`;
  if (row.surface !== app) return `${id} belongs to ${row.surface}, not ${app}`;
  if (!/^OPEN\b/.test(row.state)) return `${id} is ${row.state || "not OPEN"} — only an OPEN row can carry embedded data`;
  if (/^CLOSED/.test(row.status) || /RETIRED/.test(row.status)) return `${id} has status ${row.status}`;
  return null;
}

export function judge(
  findings: Finding[],
  config: LintConfig,
  baseline: Baseline,
  registerRows: Map<string, AllowRow> | null,
): Verdict {
  const invalidAllow: Verdict["invalidAllow"] = [];
  const allowKey = new Set<string>();
  for (const a of config.allow) {
    if (!a.file || !RULES.includes(a.rule)) invalidAllow.push({ entry: a, why: "needs an exact file and a known rule" });
    else if (!ROW_ID.test(a.register ?? "")) invalidAllow.push({ entry: a, why: "needs a gap-register row id (e.g. P-12)" });
    else if (!registerRows) invalidAllow.push({ entry: a, why: "the gap register could not be read" });
    else if (allowRowProblem(a.register, registerRows.get(a.register), config.app)) {
      invalidAllow.push({ entry: a, why: allowRowProblem(a.register, registerRows.get(a.register), config.app) as string });
    }
    else if (!a.reason?.trim()) invalidAllow.push({ entry: a, why: "needs a reason" });
    else allowKey.add(`${a.file}\0${a.rule}`);
  }
  const allowed: Finding[] = [];
  const rest: Finding[] = [];
  for (const f of findings) (allowKey.has(`${f.file}\0${f.rule}`) ? allowed : rest).push(f);
  const staleAllow = config.allow.filter((a) => allowKey.has(`${a.file}\0${a.rule}`) && !allowed.some((f) => f.file === a.file && f.rule === a.rule));

  const now = countByFileRule(rest);
  const baselined: Finding[] = [];
  const fresh: Finding[] = [];
  const grouped = new Map<string, Finding[]>();
  for (const f of rest) {
    const k = `${f.file}\0${f.rule}`;
    grouped.set(k, [...(grouped.get(k) ?? []), f]);
  }
  for (const [k, fs] of grouped) {
    const [file, rule] = k.split("\0") as [string, RuleId];
    const allowedCount = baseline[file]?.[rule] ?? 0;
    if (fs.length <= allowedCount) baselined.push(...fs);
    else fresh.push(...fs); // over the baseline: the whole file/rule group is reported, the line moved or not
  }
  const staleBaseline: Verdict["staleBaseline"] = [];
  for (const [file, rules] of Object.entries(baseline)) {
    for (const [rule, n] of Object.entries(rules) as [RuleId, number][]) {
      const have = now[file]?.[rule] ?? 0;
      if (have < n) staleBaseline.push({ file, rule, baseline: n, now: have });
    }
  }
  return {
    findings,
    allowed,
    baselined,
    fresh,
    invalidAllow,
    staleAllow,
    staleBaseline,
    ok: !fresh.length && !invalidAllow.length && !staleAllow.length && !staleBaseline.length,
  };
}

/** Lower-only baseline rewrite. Throws if the tree has a finding the old baseline did not cover. */
export function lowerBaseline(old: Baseline, findings: Finding[], config: LintConfig): Baseline {
  const allowKey = new Set(config.allow.map((a) => `${a.file}\0${a.rule}`));
  const now = countByFileRule(findings.filter((f) => !allowKey.has(`${f.file}\0${f.rule}`)));
  const next: Baseline = {};
  for (const [file, rules] of Object.entries(now)) {
    for (const [rule, n] of Object.entries(rules) as [RuleId, number][]) {
      const was = old[file]?.[rule] ?? 0;
      if (n > was) {
        throw new Error(
          `embedded-data-lint: --write-baseline refuses to raise ${file} ${rule} from ${was} to ${n}. ` +
            `Remove the embedded data, or add an allow entry with a gap-register row.`,
        );
      }
      (next[file] ??= {})[rule] = n;
    }
  }
  return next;
}

export function readBaseline(path: string): Baseline {
  if (!existsSync(path)) throw new Error(`embedded-data-lint: ${path} is missing — the lint never passes without its baseline`);
  const raw = JSON.parse(readFileSync(path, "utf8")) as { findings?: Baseline };
  if (!raw || typeof raw.findings !== "object" || raw.findings === null) throw new Error(`embedded-data-lint: ${path} has no "findings" object`);
  return raw.findings;
}

export function baselineTotal(b: Baseline): number {
  return Object.values(b).reduce((s, r) => s + Object.values(r).reduce((x, n) => x + (n ?? 0), 0), 0);
}

export function formatVerdict(v: Verdict, app: string): string {
  const lines: string[] = [];
  const byFile = (fs: Finding[]) => [...new Set(fs.map((f) => f.file))].length;
  lines.push(
    `embedded-data-lint (${app}): ${v.findings.length} finding(s) in ${byFile(v.findings)} file(s) — ` +
      `${v.baselined.length} baselined (report mode), ${v.allowed.length} allowed, ${v.fresh.length} NEW`,
  );
  for (const f of v.fresh) lines.push(`  ✗ NEW ${f.file}:${f.line} ${f.rule} — ${f.detail}`);
  for (const i of v.invalidAllow) lines.push(`  ✗ allow entry ${i.entry.file} ${i.entry.rule}: ${i.why}`);
  for (const a of v.staleAllow) lines.push(`  ✗ allow entry ${a.file} ${a.rule} (${a.register}) matches nothing — remove it`);
  for (const s of v.staleBaseline) {
    lines.push(`  ✗ stale baseline ${s.file} ${s.rule}: baseline ${s.baseline}, now ${s.now} — run with --write-baseline to lower it`);
  }
  return lines.join("\n");
}

/** Every way `next` exceeds `base` (a raised count, or a file/rule `base` does not have). */
export function baselineGrowth(base: Baseline, next: Baseline): string[] {
  const out: string[] = [];
  for (const [file, rules] of Object.entries(next)) {
    for (const [rule, n] of Object.entries(rules) as [RuleId, number][]) {
      const was = base[file]?.[rule] ?? 0;
      if (n > was) out.push(`${file} ${rule}: ${was} on the base, ${n} here`);
    }
  }
  return out;
}
