/**
 * surface-guard's own gate (GA-029 §7.6), identical in the four apps.
 *
 * Mutations are applied to an OVERLAY of the working tree (nothing on disk changes), against a manifest of the
 * unmutated tree, and judged against a neutral register written here. Each must FAIL the guard; with a valid
 * register row mapped, it must PASS. No mutation may be skipped: a missing candidate fails the self-test.
 * It also proves the guard refuses a CLOSED / missing / foreign / STILL-FAKE row, a wildcard key, a stale
 * mapping, a missing tsai-sitedocs checkout, an option-shaped git ref, a missing surface source, a hand-edited
 * baseline and a manifest that does not come from an ancestor commit.
 */
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  allMatches,
  assertSafeRef,
  cells,
  enclosingObject,
  MENU_FLAG_PATTERNS,
  diffRemovals,
  extractSurface,
  fsTree,
  judge,
  dataAccessIn,
  importAliases,
  jsonc,
  judgeProvenance,
  loadProvenance,
  loadRegisterSource,
  manifestJson,
  overlayTree,
  parseLedger,
  parseProvenance,
  parseRegister,
  PROVENANCE_KINDS,
  runCheck,
  runProvenanceCheck,
  symbolBody,
  type GuardConfig,
  type Manifest,
  type ProvenanceSidecar,
  type WorkspaceReader,
  type RegisterMap,
  type SourceTree,
  type SurfaceEntry,
} from "./core";

/** An app-specific mutation: edit one file; the guard must then report `expectId` as a removal. */
export interface Mutation {
  tag: "gated" | "superadmin" | "unavailable" | "tab" | "menu";
  file: string;
  edit: (src: string) => string;
  expectId: string;
}

export interface SelfTestOptions {
  root: string;
  config: GuardConfig;
  /** A string that, inserted into a page module, makes it render this app's unavailable marker. */
  unavailableSnippet: string;
  /** A page module to insert it into. */
  pageForMarker: string;
  /** The `unavailable:` id the snippet produces. */
  unavailableId: string;
  /** A `gated` mutation when the app extracts gates, a `superadmin` one when it extracts superadmin locks. */
  mutations: Mutation[];
}

/** A neutral register: open, closed, still-fake and awaiting rows for this app, one row for another app. */
function neutralRegister(app: string, prefix: string): { register: string; ledger: string } {
  const other = app === "Portal" ? "Watson" : "Portal";
  const rows = [
    `| ${prefix}901 | ${app} | Neutral open row | REMOVED | P2 | REBUILD-NOW | — | — | T3.1 | OPEN |`,
    `| ${prefix}902 | ${app} | Neutral closed row | REMOVED | P2 | REBUILD-NOW | — | — | T3.1 | CLOSED |`,
    `| ${prefix}904 | ${app} | Neutral still-fake row with \`a | b\` and a \\| pipe | STILL-FAKE | P2 | REBUILD-NOW | — | T0.5 | T3.7 | OPEN |`,
    `| ${prefix}905 | ${app} | Neutral row in an unknown state | REMOVED | P2 | REBUILD-NOW | — | — | T3.1 | CLOSED-CORRECT |`,
    `| ${prefix}906 | ${app} | Neutral closed-correct row awaiting the owner | REMOVED | P3 | CLOSED-CORRECT | — | — | CLOSED | AWAITING OWNER (OD-17) |`,
    `| ZZ-903 | ${other} | Neutral foreign row | REMOVED | P2 | REBUILD-NOW | — | — | T3.1 | OPEN |`,
  ];
  for (let i = 0; i < 10; i++) rows.push(`| ${prefix}91${i} | ${app} | Filler ${i} | REMOVED | P3 | REBUILD-NOW | — | — | T3.1 | OPEN |`);
  const register = [
    "# Gap register",
    "",
    "| ID | Surface | Capability | Kind | P | Status | Backend | Contain | Rebuild / route | State |",
    "|---|---|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
  const ledger = [
    "| Capability | Surface(s) | Owner decision (quote, date) | Removing commit / PR | Replacement, if any |",
    "|---|---|---|---|---|",
    `| Neutral retired capability | ${app} neutral surface | "retire it" (owner, 2026-01-01) | #0 | none |`,
    `| Neutral undated capability | ${app} neutral surface | "retire it" | #0 | none |`,
    `| Neutral other-app capability | ${other} neutral surface | "retire it" (owner, 2026-01-01) | #0 | none |`,
    "",
  ].join("\n");
  return { register, ledger };
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function runSelfTest(o: SelfTestOptions): number {
  const { root, config } = o;
  const prefix = config.rowPrefixes[0];
  const base = fsTree(root);
  const baseManifest = extractSurface(base, config, { head: true });
  const { register, ledger } = neutralRegister(config.app, prefix);
  const rows = parseRegister(register);
  const led = parseLedger(ledger);
  const verdictFor = (tree: SourceTree, map: RegisterMap) => {
    const head = extractSurface(tree, config, { head: true });
    return judge(diffRemovals(baseManifest, head), map, rows, led, { ...config, notRemovals: {} });
  };
  const ok = (v: ReturnType<typeof verdictFor>) => !v.unmapped.length && !v.invalid.length && !v.stale.length;
  let checks = 0;

  /** The quoted value of an entry: everything after `<kind>:<scope>:`. */
  const valueOf = (e: SurfaceEntry) => e.id.split(":").slice(2).join(":");
  const quoted = (v: string) => new RegExp(`["'\`]${escapeRe(v)}["'\`]`, "g");
  /** Entries of these kinds (in this order of preference) whose quoted value occurs in their own source file. */
  const candidates = (kinds: string[]) => {
    const bodies = base.readMany([...new Set(baseManifest.entries.map((e) => e.source))].filter((s) => s.includes(".")));
    const found = baseManifest.entries.filter((e) => {
      if (!kinds.includes(e.kind) || e.polarity !== "present") return false;
      const v = valueOf(e);
      return v !== "" && (bodies.get(e.source)?.match(quoted(v))?.length ?? 0) >= 1;
    });
    return found.sort((a, b) => kinds.indexOf(a.kind) - kinds.indexOf(b.kind));
  };
  const removeEntry = (e: SurfaceEntry) => {
    const src = base.read(e.source);
    assert.ok(src, `fixture source ${e.source} missing`);
    const mutated = src.replace(quoted(valueOf(e)), '""');
    assert.notEqual(mutated, src, `mutation of ${e.id} changed nothing`);
    return overlayTree(base, { [e.source]: mutated });
  };
  const mustFail = (tree: SourceTree, id: string, what: string) => {
    const v = verdictFor(tree, { removals: {} });
    assert.ok(v.unmapped.some((u) => u.id === id), `${what}: ${id} must be an unmapped removal; got ${JSON.stringify(v.unmapped.map((u) => u.id))}`);
    assert.equal(ok(v), false, `${what}: the guard must FAIL`);
    checks++;
    return v;
  };

  // ── 1. a menu entry removed from ONE menu ──
  const menu = candidates(["menu"])[0];
  assert.ok(menu, "self-test: no menu entry at HEAD to mutate — the mutation cannot be skipped");
  const menuTree = removeEntry(menu);
  const mv = mustFail(menuTree, menu.id, "menu entry removed");
  const mvMap: RegisterMap = { removals: Object.fromEntries(mv.unmapped.map((u) => [u.id, `${prefix}901`])) };
  assert.ok(ok(verdictFor(menuTree, mvMap)), `with ${menu.id} mapped to an open register row the guard must pass`);
  checks++;

  // ── 2. a tab, deep-link alias or docs page removed ──
  const tab = candidates(["tab-alias", "tab", "docs-page"])[0];
  assert.ok(tab, "self-test: no tab, deep-link alias or docs page at HEAD to mutate — the mutation cannot be skipped");
  mustFail(removeEntry(tab), tab.id, `${tab.kind} removed`);

  // ── 3. a public route (or any page) removed ──
  const pub = baseManifest.entries.find((e) => e.kind === "public-route");
  const routeEntry = pub
    ? baseManifest.entries.find((e) => e.id === `route:${pub.id.slice("public:".length)}`)
    : baseManifest.entries.find((e) => e.kind === "route" && e.label === "page");
  assert.ok(routeEntry, "self-test: no route at HEAD to remove");
  mustFail(overlayTree(base, { [routeEntry.source]: null }), routeEntry.id, "route removed");

  // ── 4. a page newly renders the unavailable marker ──
  const page = base.read(o.pageForMarker);
  assert.ok(page, `${o.pageForMarker} missing`);
  const uTree = overlayTree(base, { [o.pageForMarker]: `${page}\n${o.unavailableSnippet}\n` });
  mustFail(uTree, o.unavailableId, "unavailable marker added");
  assert.ok(ok(verdictFor(uTree, { removals: { [o.unavailableId]: `${prefix}901` } })), "a mapped unavailable marker passes");
  checks++;

  // ── 5. app-specific gate / superadmin-lock mutations (none may be missing) ──
  // Every restriction class the app extracts must be exercised: a gate or a superadmin lock that no mutation
  // proves would be a check that cannot fail.
  const tags = new Set(o.mutations.map((m) => m.tag));
  const extractsGated = baseManifest.entries.some((e) => e.kind === "gated") || config.lists.some((l) => l.kind === "gated");
  const extractsSuperadmin =
    baseManifest.entries.some((e) => e.kind === "superadmin") || (config.routeRestrictions ?? []).some((r) => r.prefix === "superadmin");
  if (extractsGated) assert.ok(tags.has("gated"), "self-test: this app extracts gates, so a `gated` mutation is required");
  if (extractsSuperadmin) assert.ok(tags.has("superadmin"), "self-test: this app extracts superadmin locks, so a `superadmin` mutation is required");
  for (const mu of o.mutations) {
    const src = base.read(mu.file);
    assert.ok(src, `mutation source ${mu.file} missing`);
    const edited = mu.edit(src);
    assert.notEqual(edited, src, `${mu.tag} mutation of ${mu.file} changed nothing`);
    mustFail(overlayTree(base, { [mu.file]: edited }), mu.expectId, `${mu.tag} mutation`);
  }

  // ── 6. approvals are lookups ──
  const one = (target: string) => verdictFor(menuTree, { removals: { ...mvMap.removals, [menu.id]: target } });
  assert.ok(one(`${prefix}902`).invalid.some((i) => /only OPEN/.test(i.why)), "a CLOSED row cannot approve a removal");
  assert.ok(one(`${prefix}905`).invalid.some((i) => /only OPEN/.test(i.why)), "a row in an unknown state cannot approve a removal");
  assert.ok(one(`${prefix}999`).invalid.some((i) => /no such row/.test(i.why)), "a missing row cannot approve a removal");
  assert.ok(one("ZZ-903").invalid.some((i) => /belongs to/.test(i.why)), "another app's row cannot approve a removal");
  assert.ok(one(`${prefix}904`).invalid.some((i) => /STILL-FAKE/.test(i.why)), "a deletion cannot map to a STILL-FAKE row");
  assert.ok(ok(one("ledger:Neutral retired capability")), "a dated retirement-ledger row for this app approves a removal");
  assert.ok(one("ledger:Neutral undated capability").invalid.length, "an undated ledger row cannot approve a removal");
  assert.ok(one("ledger:Neutral other-app capability").invalid.length, "another app's ledger row cannot approve a removal");
  assert.ok(one("ledger:Nothing like this").invalid.length, "an unknown ledger capability cannot approve a removal");
  assert.ok(one("renamed:menu:x").invalid.length, "a `renamed:` target is not an approval");
  const stale = verdictFor(base, { removals: { [menu.id]: `${prefix}901` } });
  assert.deepEqual(stale.stale, [menu.id], "a mapping for a surface that still exists is stale and fails");
  const wildKey = `${menu.id.slice(0, Math.max(6, menu.id.length - 2))}*`;
  const wild = verdictFor(menuTree, { removals: { [wildKey]: `${prefix}901` } });
  assert.ok(wild.invalid.some((i) => /wildcard/.test(i.why)) && wild.unmapped.some((u) => u.id === menu.id), "a wildcard key approves nothing");
  checks += 12;

  // ── 7. the register parser ──
  assert.deepEqual(cells("| a | `x | y` | b \\| c |"), ["a", "`x | y`", "b | c"], "pipes in code spans and escaped pipes do not split cells");
  assert.equal(rows.get(`${prefix}904`)?.kind, "STILL-FAKE", "a row with pipes in its text keeps its columns");
  assert.throws(() => parseRegister(register.replace(`| ${prefix}910 |`, `| ${prefix}901 |`)), /two rows/, "duplicate register ids fail");
  assert.throws(() => parseRegister(register.replace("| Filler 3 |", "| Filler 3 | extra |")), /cells/, "a row with the wrong column count fails");
  checks += 4;

  // ── 7b. menu item flags: an item's own array-valued role lock is read; a child item's flag is not inherited ──
  const item = '{ url: "/probe", requiredRole: ["coach", "scout"], subItems: [{ url: "/child", disabled: true }] }';
  const own = enclosingObject(item, item.indexOf('"/probe"')) ?? "";
  const flags = MENU_FLAG_PATTERNS.flatMap((fp) => allMatches(fp.re, own).map((m) => fp.flag(m)));
  assert.ok(flags.includes("requiredRole=coach,scout"), `an array-form requiredRole must be read: ${JSON.stringify(flags)}`);
  assert.ok(!flags.includes("disabled"), "a child item's flag must not be inherited by its parent");
  checks += 2;

  // ── 8. fail loudly ──
  assert.throws(
    () => loadRegisterSource(root, { TSAI_SITEDOCS_DIR: join(tmpdir(), "surface-guard-no-such-sitedocs") }),
    /tsai-sitedocs checkout not found/,
    "a missing tsai-sitedocs checkout must fail, never pass",
  );
  assert.throws(() => assertSafeRef("--output=/tmp/x", "ref"), /refusing/, "an option-shaped git ref is refused");
  assert.throws(() => assertSafeRef("a..b", "ref"), /refusing/, "a range is refused");
  assert.throws(() => loadRegisterSource(root, { TSAI_SITEDOCS_DIR: root, TSAI_SITEDOCS_REF: "-p" }), /refusing/, "TSAI_SITEDOCS_REF is validated");
  const required = config.requiredAtHead[0];
  assert.throws(() => extractSurface(overlayTree(base, { [required]: null }), config, { head: true }), /out of date/);
  checks += 5;

  const committed = JSON.parse(base.read(`docs/6-releases/surface/${config.baseline.version}.json`) ?? "null") as Manifest | null;
  assert.ok(committed, `the baseline manifest docs/6-releases/surface/${config.baseline.version}.json must be committed`);
  const neutral = { origin: "neutral", register, ledger };
  const check = (manifests: Manifest[]) => () => runCheck({ repoRoot: root, config, map: { removals: {} }, manifests, registerSource: neutral });
  const tampered: Manifest = { ...committed, entries: committed.entries.slice(1) };
  assert.throws(check([tampered]), /does not match a fresh extraction/, "a hand-edited baseline must be refused");
  const release: Manifest = { ...committed, version: "999.0.0", rev: "release" };
  assert.throws(check([committed, release]), /not a full commit sha/, "a release manifest with no commit is refused");
  const forged: Manifest = { ...committed, version: "999.0.0", rev: "0".repeat(40) };
  assert.throws(check([committed, forged]), /not an ancestor|not in/, "a release manifest from a commit outside HEAD's history is refused");
  checks += 3;

  return checks;
}

/**
 * The provenance half's own gate (T2.1 / T2.2), identical in the four apps. Every case runs against this tree (or an
 * overlay of it) and the neutral register above, and must come out as stated: a check that cannot fail is not a check.
 */
export function runProvenanceSelfTest(o: { root: string; config: GuardConfig }): number {
  const { root, config } = o;
  const prefix = config.rowPrefixes[0];
  const base = fsTree(root);
  const head = extractSurface(base, config, { head: true });
  const { register, ledger } = neutralRegister(config.app, prefix);
  const rows = parseRegister(register);
  const surfaces = head.entries.filter((e) => PROVENANCE_KINDS.includes(e.kind) && e.polarity === "present");
  assert.ok(surfaces.length > 0, "provenance self-test: no route or tab at HEAD");
  const all = (): ProvenanceSidecar => ({ surfaces: Object.fromEntries(surfaces.map((e) => [e.id, { register: `${prefix}901` }])) });
  // A neutral workspace: one sibling repo holding a hockey-api-style model and handlers, and a TS writer.
  const probeRepo: Record<string, string> = {
    "svc/app/models.py": 'class ProbeItem(Base):\n    __tablename__ = "probe_items"\n',
    "svc/app/endpoints.py": [
      '@router.post("/probe-items")',
      "async def create_probe(db):",
      "    db.add(ProbeItem(x=1))",
      '@router.get("/probe-items")',
      "async def list_probe(db):",
      "    return db.query(ProbeItem).all()",
      '@router.post("/probe-items/hidden")',
      "async def hidden(db):",
      "    return create_probe_item(db)",
      "",
    ].join("\n"),
    "web/route.ts": 'export async function POST() {\n  await db.from("probe_rows").insert({ a: 1 });\n}\nexport async function GET() {\n  return db.from("probe_reads").select("*");\n}\n',
    // Symbol citations: a method, a multi-line signature, a name defined twice.
    "svc/app/service.py": [
      "class ProbeService:",
      "    async def save(self, db):",
      "        db.add(ProbeItem(x=1))",
      "",
      "    async def read(self, db):",
      "        return db.query(ProbeItem).all()",
      "",
      "async def create_multi(",
      "    db,",
      ") -> None:",
      "    # a comment's apostrophe isn't a quote",
      "    db.add(ProbeItem(x=1))",
      "",
      "def twice(db):",
      "    db.add(ProbeItem(x=1))",
      "",
      "def twice(db):",
      "    db.add(ProbeItem(x=2))",
      "",
    ].join("\n"),
    "web/service.ts": [
      "// a comment's apostrophe isn't a quote",
      "export class ProbeStore {",
      "  async save(): Promise<{ ok: boolean }> {",
      '    await db.from("probe_rows").insert({ a: 1 });',
      "    return { ok: true };",
      "  }",
      "  async read() {",
      '    return db.from("probe_rows").select("*");',
      "  }",
      "}",
      "export const saveArrow = async () => {",
      '  await db.from("probe_rows").upsert({ a: 1 });',
      "};",
      "",
    ].join("\n"),
    // Each shape a hand-rolled resolver got wrong (review of the first cut): every one must resolve to exactly its own body.
    "web/tricky.ts": [
      "export function helperHost() {",
      "  function helper() { return 1 }",
      "  return helper();",
      "}",
      "export async function GET() {",
      '  const q = s.replace(/"/g, "").replace(/\\{/g, "(").replace(/\'/, "").replace(/\\/\\*/, "");',
      "  const t = `${fn(`can't ${x}`)} {`;",
      '  return db.from("probe_rows").select("*");',
      "}",
      "export function commentedTs() {",
      '  // await db.from("probe_rows").insert({ a: 1 });',
      "  return 1;",
      "}",
      'export const routes = { post() { return db.from("probe_rows").insert({ a: 1 }); } };',
      'export const wrapped = withAuth(async () => { await db.from("probe_rows").insert({ a: 1 }); });',
      "export async function POST() {",
      "  function nestedHelper() { return 1 }",
      '  await db.from("probe_rows").insert({ a: 1 });',
      "}",
      "",
    ].join("\n"),
    "svc/app/tricky.py": [
      "def noop(db): return None",
      "def real_writer(db):",
      "    db.add(ProbeItem(x=1))",
      "",
      'def tagged(db, tag: str = "#none", sep: str = "("):',
      "    return None",
      "",
      "def after_tagged(db):",
      "    db.add(ProbeItem(x=1))",
      "",
      "class MultiHeader(",
      "    Base,",
      "    Mixin,",
      "):",
      "    def save(self, db):",
      "        db.add(ProbeItem(x=1))",
      "",
      "    def read(self, db):",
      "        return db.query(ProbeItem).all()",
      "",
      "def commented(db):",
      "    # db.add(ProbeItem(x=1))",
      "    return None",
      "",
      "def outer(db):",
      "    def inner(db):",
      "        return None",
      "    db.add(ProbeItem(x=1))",
      "",
    ].join("\n"),
    "svc/app/broken.py": "def broken(:\n    db.add(ProbeItem(x=1))\n",
    // A missing `}`: the recovering parser would nest POST inside GET, so GET would "insert".
    "web/unclosed.ts": 'export function GET() {\n  if (x) {\n    return db.from("probe_rows").select("*");\n\nexport async function POST() {\n  await db.from("probe_rows").insert({ a: 1 });\n}\n',
    // A line separator splitlines() honours but ast does not: lines would shift between the two models.
    "svc/app/separators.py": "def reader(db):\n    return None  # note\u2028\ndef writer(db):\n    db.add(ProbeItem(x=1))\n",
    "svc/app/formfeed.py": "def reader(db):\n    return None\n\x0c\ndef writer(db):\n    db.add(ProbeItem(x=1))\n",
    "svc/app/crlf.py": "def reader(db):\r\n    # db.add(ProbeItem(x=1))\r\n    return None\r\ndef writer(db):\r\n    db.add(ProbeItem(x=1))\r\n",
  };
  const ws: WorkspaceReader = {
    origin: "neutral",
    read: (repo, path) => (repo === "tsai-probe" ? probeRepo[path] ?? null : null),
    files: (repo, dir) => (repo === "tsai-probe" ? Object.keys(probeRepo).filter((f) => f.startsWith(dir)) : []),
  };
  const judgeOn = (sc: ProvenanceSidecar, tree: SourceTree = base, strict = false) =>
    judgeProvenance(extractSurface(tree, config, { head: true }), tree, sc, rows, config, ws, { strict });
  const invalidFor = (sc: ProvenanceSidecar, id: string, why: RegExp, what: string, strict = false) => {
    const v = judgeOn(sc, base, strict);
    assert.ok(v.invalid.some((i) => i.id === id && why.test(i.why)), `${what}: must be invalid (${why}); got ${JSON.stringify(v.invalid.slice(0, 3))}`);
    checks++;
  };
  let checks = 0;
  const target = surfaces[0];
  const withEntry = (entry: unknown): ProvenanceSidecar => {
    const sc = all();
    (sc.surfaces as Record<string, unknown>)[target.id] = entry;
    return sc;
  };

  // ── 1. every surface mapped to an open row of this app: complete ──
  const full = judgeOn(all());
  assert.equal(full.invalid.length, 0, `a fully mapped sidecar must be valid: ${JSON.stringify(full.invalid.slice(0, 3))}`);
  assert.equal(full.unresolved.length, 0, "a fully mapped sidecar leaves nothing unresolved");
  checks++;

  // ── 2. a surface with no entry is UNRESOLVED; a NEW route with no entry is UNRESOLVED ──
  const missing = all();
  delete missing.surfaces[target.id];
  assert.deepEqual(judgeOn(missing).unresolved.map((u) => u.id), [target.id], "a surface with no entry must be unresolved");
  checks++;
  const dir = config.appDirs[0];
  const probe = `${dir}/surface-guard-provenance-probe/page.tsx`;
  const added = judgeOn(all(), overlayTree(base, { [probe]: "export default function Probe() { return null; }\n" }));
  assert.deepEqual(added.unresolved.map((u) => u.id), ["route:/surface-guard-provenance-probe"], "a new route with no entry must be unresolved");
  const strictNew = runProvenanceCheck({
    repoRoot: root,
    config,
    tree: overlayTree(base, { [probe]: "export default function Probe() { return null; }\n" }),
    sidecar: all(),
    registerSource: { origin: "neutral", register, ledger },
  });
  assert.ok(strictNew.valid && !strictNew.complete, "strict mode must refuse a new route with no provenance; report mode must not");
  checks += 2;

  // ── 3. endpoint entries: table and a real writer are required ──
  const ok3 = judgeOn(withEntry({ endpoint: "hockey-api GET /api/v1/probe-items", table: "hockey_db.probe_items", writer: "user-action: POST /api/v1/probe-items", writerSource: "tsai-probe:svc/app/endpoints.py:1" }));
  assert.ok(ok3.endpoint.includes(target.id) && !ok3.invalid.length, `a complete endpoint entry whose handler inserts is valid: ${JSON.stringify(ok3.invalid)}`);
  const ok3b = judgeOn(withEntry({ endpoint: "x", table: "supabase:public.probe_rows", writer: "user-action: POST web/route", writerSource: "tsai-probe:web/route.ts:2" }));
  assert.ok(ok3b.endpoint.includes(target.id) && !ok3b.invalid.length, `a TS handler that .insert()s is a writer: ${JSON.stringify(ok3b.invalid)}`);
  const okAuth = judgeOn(withEntry({ endpoint: "GoTrue", table: "auth.users", writer: "user-action: GoTrue sign-up / sign-in" }));
  assert.ok(okAuth.endpoint.includes(target.id), "auth.users written by GoTrue is valid without a handler");
  checks += 3;
  // The cited handler must INSERT into the named table: a select, a helper call, another table or no citation fail.
  invalidFor(withEntry({ endpoint: "x", table: "hockey_db.probe_items", writer: "user-action: POST /api/v1/probe-items" }), target.id, /writerSource/, "no writerSource");
  const mid = judgeOn(withEntry({ endpoint: "x", table: "hockey_db.probe_items", writer: "user-action: POST /api/v1/probe-items", writerSource: "tsai-probe:svc/app/endpoints.py:3" }));
  assert.ok(mid.endpoint.includes(target.id), "a citation inside the handler body resolves to that handler");
  checks++;
  invalidFor(withEntry({ endpoint: "x", table: "hockey_db.probe_items", writer: "user-action: POST /x", writerSource: "tsai-probe:svc/app/endpoints.py:6" }), target.id, /does not insert/, "a handler that only selects (cited inside its body)");
  invalidFor(withEntry({ endpoint: "x", table: "hockey_db.probe_items", writer: "user-action: POST /x", writerSource: "tsai-probe:svc/app/endpoints.py:7" }), target.id, /does not insert/, "an insert hidden in a helper");
  invalidFor(withEntry({ endpoint: "x", table: "hockey_db.other_items", writer: "user-action: POST /x", writerSource: "tsai-probe:svc/app/endpoints.py:1" }), target.id, /no ORM model/, "a handler that inserts another table");
  invalidFor(withEntry({ endpoint: "x", table: "supabase:public.probe_reads", writer: "user-action: GET web/route", writerSource: "tsai-probe:web/route.ts:5" }), target.id, /does not .insert/, "a TS handler that only selects");
  invalidFor(withEntry({ endpoint: "x", table: "supabase:public.probe_rows", writer: "user-action: x", writerSource: "tsai-nope:web/route.ts:2" }), target.id, /cannot be read/, "an unreadable handler");
  invalidFor(withEntry({ endpoint: "x", table: "supabase:public.probe_rows", writer: "user-action: x", writerSource: "web/route.ts" }), target.id, /must be "<repo>/, "a malformed writerSource");
  invalidFor(withEntry({ endpoint: "x", table: "auth.users", writer: "user-action: some app route" }), target.id, /GoTrue/, "auth.users with a non-GoTrue writer");

  // ── 3b. symbol citations (<repo>:<path>#<function>): resolved by parsing, never by line, and fail closed ──
  const hp = (ws: string, table = "hockey_db.probe_items") => withEntry({ endpoint: "x", table, writer: "user-action: POST /api/v1/probe-items", writerSource: ws });
  for (const [cite, table, what] of [
    ["tsai-probe:svc/app/endpoints.py#create_probe", "hockey_db.probe_items", "a Python function that inserts"],
    ["tsai-probe:svc/app/service.py#ProbeService.save", "hockey_db.probe_items", "a Python Class.method that inserts"],
    ["tsai-probe:svc/app/service.py#create_multi", "hockey_db.probe_items", "a Python function with a multi-line signature"],
    ["tsai-probe:web/route.ts#POST", "supabase:public.probe_rows", "a TS route handler that .insert()s"],
    ["tsai-probe:web/service.ts#ProbeStore.save", "supabase:public.probe_rows", "a TS Class.method that .insert()s"],
    ["tsai-probe:web/service.ts#saveArrow", "supabase:public.probe_rows", "a TS const arrow that .upsert()s"],
  ] as const) {
    for (const strict of [false, true]) {
      const v = judgeOn(hp(cite, table), base, strict);
      assert.ok(v.endpoint.includes(target.id) && !v.invalid.length, `${what} (${cite}, strict=${strict}) is a writer: ${JSON.stringify(v.invalid)}`);
      checks++;
    }
  }
  invalidFor(hp("tsai-probe:svc/app/endpoints.py#no_such_fn"), target.id, /defines no function no_such_fn/, "a symbol that is not defined");
  invalidFor(hp("tsai-probe:svc/app/service.py#NoSuchClass.save"), target.id, /defines no class NoSuchClass/, "a method of a class that is not defined");
  invalidFor(hp("tsai-probe:svc/app/service.py#ProbeService.gone"), target.id, /defines no function ProbeService.gone/, "a method that is not defined");
  invalidFor(hp("tsai-probe:svc/app/service.py#twice"), target.id, /twice 2 times \(ambiguous\)/, "a symbol defined twice");
  invalidFor(hp("tsai-probe:svc/app/endpoints.py#list_probe"), target.id, /does not insert/, "a Python symbol that only selects");
  invalidFor(hp("tsai-probe:svc/app/endpoints.py#hidden"), target.id, /does not insert/, "a Python symbol whose insert is hidden in a helper");
  invalidFor(hp("tsai-probe:svc/app/service.py#ProbeService.read"), target.id, /does not insert/, "a Python method that only selects (its sibling inserts)");
  invalidFor(hp("tsai-probe:web/route.ts#GET", "supabase:public.probe_rows"), target.id, /does not .insert/, "a TS symbol that only selects (its sibling inserts)");
  invalidFor(hp("tsai-probe:web/service.ts#ProbeStore.read", "supabase:public.probe_rows"), target.id, /does not .insert/, "a TS method that only selects");
  invalidFor(hp("tsai-probe:web/service.ts#ProbeStore.gone", "supabase:public.probe_rows"), target.id, /defines no method/, "a TS method that is not defined");
  invalidFor(hp("tsai-probe:svc/app/endpoints.py#not a name"), target.id, /must be "<repo>/, "a symbol that is not a function name");
  // Real parsers (TypeScript, Python ast): nested helpers, literals, one-line defs and multi-line headers never overrun.
  const rows3 = (cite: string) => hp(cite, cite.includes(".ts#") ? "supabase:public.probe_rows" : "hockey_db.probe_items");
  for (const [cite, why, what] of [
    ["tsai-probe:web/tricky.ts#helper", /defines no function helper/, "a nested TS helper is not a top-level symbol"],
    ["tsai-probe:web/tricky.ts#nestedHelper", /defines no function nestedHelper/, "a TS helper nested in a writer is not a symbol"],
    ["tsai-probe:web/tricky.ts#GET", /does not .insert/, "a TS reader with regex and template literals (quotes, braces) stays its own body"],
    ["tsai-probe:web/tricky.ts#commentedTs", /does not .insert/, "a commented-out TS insert is no evidence"],
    ["tsai-probe:web/tricky.ts#routes", /not a function/, "a const that is an object of handlers is not a function"],
    ["tsai-probe:web/tricky.ts#wrapped", /not a function/, "a const bound to a call is not a function"],
    ["tsai-probe:svc/app/tricky.py#noop", /does not insert/, "a one-line Python def does not absorb the next def"],
    ["tsai-probe:svc/app/tricky.py#tagged", /does not insert/, "a # and an unbalanced bracket in a default argument do not overrun"],
    ["tsai-probe:svc/app/tricky.py#MultiHeader.read", /does not insert/, "a method of a class with a multi-line header that only selects"],
    ["tsai-probe:svc/app/tricky.py#commented", /does not insert/, "a commented-out Python insert is no evidence"],
    ["tsai-probe:svc/app/tricky.py#inner", /defines no function inner/, "a nested Python def is not a module-level symbol"],
    ["tsai-probe:svc/app/broken.py#broken", /does not parse as Python/, "a file Python cannot parse fails closed"],
    ["tsai-probe:web/unclosed.ts#GET", /does not parse cleanly as TypeScript/, "a TS file with a syntax error fails closed (no recovered nesting)"],
    ["tsai-probe:web/unclosed.ts#POST", /does not parse cleanly as TypeScript/, "even the true writer of a file with a syntax error is refused"],
    ["tsai-probe:svc/app/separators.py#reader", /line separator/, "a Unicode line separator fails closed"],
    ["tsai-probe:svc/app/separators.py#writer", /line separator/, "a Unicode line separator fails closed for every symbol"],
    ["tsai-probe:svc/app/formfeed.py#reader", /form feed/, "a form feed fails closed"],
    ["tsai-probe:svc/app/crlf.py#reader", /does not insert/, "CRLF lines: a commented-out insert is blanked and the next def is not absorbed"],
  ] as const) invalidFor(rows3(cite), target.id, why, what);
  for (const cite of ["tsai-probe:svc/app/crlf.py#writer", "tsai-probe:web/tricky.ts#POST", "tsai-probe:svc/app/tricky.py#MultiHeader.save", "tsai-probe:svc/app/tricky.py#outer", "tsai-probe:svc/app/tricky.py#real_writer"]) {
    const v = judgeOn(rows3(cite));
    assert.ok(v.endpoint.includes(target.id) && !v.invalid.length, `${cite} resolves and inserts: ${JSON.stringify(v.invalid)}`);
    checks++;
  }
  // The resolved region never runs past its function: it ends before the next top-level declaration starts.
  const tsSrc = probeRepo["web/tricky.ts"];
  for (const [sym, next] of [["GET", "export function commentedTs"], ["helperHost", "export async function GET"], ["commentedTs", "export const routes"]] as const) {
    const r = symbolBody(tsSrc, sym, false, "web/tricky.ts");
    assert.ok(!("problem" in r) && r.end < tsSrc.indexOf(next), `#${sym} must end before \`${next}\`: ${JSON.stringify(r)}`);
    checks++;
  }
  const pyLines = probeRepo["svc/app/tricky.py"].split("\n");
  const lineOf = (head: string) => pyLines.findIndex((l) => l.startsWith(head)) + 1;
  for (const [sym, next] of [["noop", "def real_writer"], ["tagged", "def after_tagged"], ["MultiHeader.save", "    def read"], ["commented", "def outer"]] as const) {
    const r = symbolBody(probeRepo["svc/app/tricky.py"], sym, true);
    assert.ok(!("problem" in r) && r.end < lineOf(next), `#${sym} must end before \`${next}\` (line ${lineOf(next)}): ${JSON.stringify(r)}`);
    checks++;
  }
  // A `:line` citation into ANOTHER repo drifts on its unrelated edits: strict refuses it; a `self` line stays allowed.
  invalidFor(hp("tsai-probe:svc/app/endpoints.py:1"), target.id, /cites a line in another repo/, "a cross-repo line citation in strict mode", true);
  const selfWriter = "scripts/surface-guard-probe-writer.ts";
  const selfTree = overlayTree(base, { [selfWriter]: 'export async function POST() {\n  await db.from("probe_rows").insert({ a: 1 });\n}\n' });
  const selfLine = judgeOn(withEntry({ endpoint: "x", table: "supabase:public.probe_rows", writer: "user-action: POST x", writerSource: `self:${selfWriter}:2` }), selfTree, true);
  assert.ok(selfLine.endpoint.includes(target.id) && !selfLine.invalid.length, `a self line citation is still allowed in strict mode: ${JSON.stringify(selfLine.invalid)}`);
  const strictLine = runProvenanceCheck({ repoRoot: root, config, sidecar: hp("tsai-probe:svc/app/endpoints.py:1"), registerSource: { origin: "neutral", register, ledger }, workspace: ws, strict: true });
  const reportLine = runProvenanceCheck({ repoRoot: root, config, sidecar: hp("tsai-probe:svc/app/endpoints.py:1"), registerSource: { origin: "neutral", register, ledger }, workspace: ws });
  assert.ok(!strictLine.valid && reportLine.valid, "the release check (strict) refuses a cross-repo line citation; report mode still accepts it");
  checks += 2;
  invalidFor(withEntry({ endpoint: "hockey-api GET /api/v1/probe", writer: "user-action: POST /api/v1/probe" }), target.id, /must name table/, "an endpoint with no table");
  invalidFor(withEntry({ endpoint: "hockey-api GET /api/v1/probe", table: "hockey_db.probe" }), target.id, /must name writer/, "an endpoint with no writer");
  invalidFor(withEntry({ endpoint: "hockey-api GET /api/v1/probe", table: "unknown", writer: "user-action: x" }), target.id, /must name table/, "an `unknown` table");
  invalidFor(withEntry({ endpoint: "x", table: "t", writer: "importer: scripts/seed_probe.py" }), target.id, /never count/, "a seed script as the writer");
  invalidFor(withEntry({ endpoint: "x", table: "t", writer: "importer: alembic migration 0042" }), target.id, /never count/, "a migration as the writer");
  invalidFor(withEntry({ endpoint: "x", table: "t", writer: "seed.sql" }), target.id, /must be "user-action/, "a writer with no real kind");
  invalidFor(withEntry({ endpoint: "x", table: "t", writer: "user-action: GET /api/v1/probe" }), target.id, /not a writer/, "a GET endpoint as the writer");
  invalidFor(withEntry({ endpoint: "x", table: "t", writer: "user-action: DELETE /api/v1/probe/{id}" }), target.id, /not a writer/, "a DELETE endpoint as the writer");
  invalidFor(withEntry({ endpoint: "x", table: "hockey_db.cb_audit_events", writer: "user-action: POST /api/v1/probe" }), target.id, /audit table/, "an audit table as the backing table");

  // ── 4. register entries: an OPEN row of this app only ──
  assert.ok(judgeOn(withEntry({ register: `${prefix}901` })).register.includes(target.id), "an open row of this app is valid");
  checks++;
  invalidFor(withEntry({ register: `${prefix}902` }), target.id, /only an OPEN/, "a CLOSED row");
  invalidFor(withEntry({ register: `${prefix}905` }), target.id, /only an OPEN/, "a row in an unknown state");
  invalidFor(withEntry({ register: `${prefix}906` }), target.id, /closed or retired row/, "a CLOSED-CORRECT row, even one AWAITING OWNER");
  invalidFor(withEntry({ register: `${prefix}999` }), target.id, /not in gap-register/, "a missing row");
  invalidFor(withEntry({ register: "ZZ-903" }), target.id, /belongs to/, "another app's row");

  // ── 5. shape ──
  invalidFor(withEntry({ register: `${prefix}901`, static: "x" }), target.id, /exactly one/, "two shapes at once");
  invalidFor(withEntry({}), target.id, /exactly one/, "an empty entry");
  invalidFor(withEntry({ register: `${prefix}901`, writer: "user-action: x" }), target.id, /may not carry/, "a stray field");
  const stale = all();
  stale.surfaces["route:/surface-guard-no-such-route"] = { register: `${prefix}901` };
  invalidFor(stale, "route:/surface-guard-no-such-route", /stale/, "an entry for a surface that does not exist");

  // ── 6. static: the tripwire refuses a static surface whose module reads data ──
  // A page whose import graph reaches no data today, so each mutation below is the only thing the tripwire can see.
  // An app whose every page reaches data (shared session chrome) gets a data-free probe page in the overlay instead.
  const found = surfaces.find((e) => e.kind === "route" && e.label === "page" && base.read(e.source) !== null && dataAccessIn(base, e.source) === null);
  const probeFile = `${config.appDirs[0]}/surface-guard-static-probe/page.tsx`;
  const sbase = found ? base : overlayTree(base, { [probeFile]: "export default function StaticProbe() { return null; }\n" });
  const page = found ?? { id: "route:/surface-guard-static-probe", source: probeFile, kind: "route", polarity: "present" as const };
  const clean = judgeOn({ surfaces: { ...all().surfaces, [page.id]: { static: "probe" } } }, sbase);
  assert.ok(clean.static.includes(page.id) && !clean.invalid.length, `a data-free page is a valid static surface: ${JSON.stringify(clean.invalid.slice(0, 2))}`);
  checks++;
  const st: ProvenanceSidecar = { surfaces: { ...all().surfaces, [page.id]: { static: "probe" } } };
  const fetching = overlayTree(sbase, { [page.source]: `${sbase.read(page.source)}\nexport async function probe() { return fetch("/api/probe"); }\n` });
  const sv = judgeOn(st, fetching);
  assert.ok(sv.invalid.some((i) => i.id === page.id && /fetch\(/.test(i.why)), "a static surface that fetches must be invalid");
  // The tripwire follows local imports: a store or a fetch two hops away (one through a tsconfig alias) still counts.
  const dirOf = page.source.split("/").slice(0, -1).join("/");
  const viaStore = overlayTree(sbase, {
    [page.source]: `import { probeStore } from "./surface-guard-probe-store";\n${sbase.read(page.source)}`,
    [`${dirOf}/surface-guard-probe-store.ts`]: "export const probeStore = new Map<string, number>();\n",
  });
  assert.ok(judgeOn(st, viaStore).invalid.some((i) => i.id === page.id && /in-process store/.test(i.why)), "a static page importing an in-process store is invalid");
  const alias = importAliases(base)[0];
  assert.ok(alias, "provenance self-test: tsconfig.json declares no path alias to exercise");
  const hop2 = `${alias[1]}surface-guard-probe/deep.ts`;
  const viaAlias = overlayTree(sbase, {
    [page.source]: `import { probe } from "./surface-guard-probe-mid";\n${sbase.read(page.source)}`,
    [`${dirOf}/surface-guard-probe-mid.ts`]: `export { probe } from "${alias[0]}surface-guard-probe/deep";\n`,
    [hop2]: 'export const probe = () => fetch("/api/probe");\n',
  });
  assert.ok(judgeOn(st, viaAlias).invalid.some((i) => i.id === page.id && /fetch/.test(i.why)), "a fetch two imports away (through an alias) is found");
  const viaStub = overlayTree(sbase, { [page.source]: `${sbase.read(page.source)}\nexport function probe() { notFound(); }\n` });
  assert.ok(judgeOn(st, viaStub).invalid.some((i) => i.id === page.id && /notFound/.test(i.why)), "a hollowed notFound() page cannot be static");
  const tab = surfaces.find((e) => e.kind === "tab");
  if (tab) {
    assert.ok(judgeOn({ surfaces: { ...all().surfaces, [tab.id]: { static: "probe" } } }).invalid.some((i) => i.id === tab.id && /cannot be static/.test(i.why)), "a tab is never static");
    checks++;
  }
  checks += 3;
  const empty: ProvenanceSidecar = { surfaces: { ...all().surfaces, [page.id]: { static: "" } } };
  assert.ok(judgeOn(empty, sbase).invalid.some((i) => i.id === page.id), "a static entry with no reason is invalid");
  checks += 2;

  // ── 6b. ops entries: real infra/ops connector + verified AST handlerSource without fake literals, import-hop stubs, or unguarded HTTP handlers ──
  const opsHandlerPath = "app/api/surface-guard-ops-probe/route.ts";
  const fakeOpsHandlerPath = "app/api/surface-guard-fake-ops-probe/route.ts";
  const commentOnlyOpsPath = "app/api/surface-guard-comment-ops-probe/route.ts";
  const hopOpsHelperPath = "app/api/surface-guard-hop-ops-probe/helper.ts";
  const hopOpsHandlerPath = "app/api/surface-guard-hop-ops-probe/route.ts";
  const unauthOpsHandlerPath = "app/api/surface-guard-unauth-ops-probe/route.ts";
  const arrowUnauthOpsPath = "app/api/surface-guard-arrow-unauth-ops-probe/route.ts";
  const reexportUnauthOpsPath = "app/api/surface-guard-reexport-unauth-ops-probe/route.ts";
  const deepChainOverlay: Record<string, string> = {};
  for (let d = 0; d <= 13; d++) {
    const p = `app/api/surface-guard-deep-ops-probe/${d === 0 ? "route" : `hop-${d}`}.ts`;
    const nextImp = d < 13 ? `import { v${d + 1} } from "./hop-${d + 1}";\n` : "";
    deepChainOverlay[p] =
      d === 0
        ? `${nextImp}export async function GET() {\n  await requireSuperadminSession();\n  return Response.json({ ok: v1 });\n}\n`
        : `${nextImp}export const v${d} = ${d < 13 ? `v${d + 1}` : "1"};\n`;
  }
  const opsTree = overlayTree(base, {
    ...deepChainOverlay,
    [opsHandlerPath]:
      'export async function GET() {\n  await requireSuperadminSession();\n  return Response.json({ ok: true, metric: "prometheus" });\n}\nexport async function POST() {\n  await requireSuperadminSession();\n  return Response.json({ ok: true });\n}\n',
    [commentOnlyOpsPath]:
      'export async function GET() {\n  await requireSuperadminSession();\n  const endpoint = "https://prom.internal"; // never Math.random()\n  return Response.json({ endpoint });\n}\n',
    [fakeOpsHandlerPath]:
      'export async function GET() {\n  await requireSuperadminSession();\n  return Response.json({ value: Math.random() });\n}\n',
    [hopOpsHelperPath]: "export const issuedTokens: string[] = [];\n",
    [hopOpsHandlerPath]:
      'import { issuedTokens } from "./helper";\nexport async function GET() {\n  await requireSuperadminSession();\n  return Response.json({ tokens: issuedTokens });\n}\n',
    [unauthOpsHandlerPath]:
      'export async function GET() {\n  await requireSuperadminSession();\n  return Response.json({ ok: true });\n}\nexport async function POST() {\n  return Response.json({ ok: false });\n}\n',
    [arrowUnauthOpsPath]:
      'export async function GET() {\n  await requireSuperadminSession();\n  return Response.json({ ok: true });\n}\nexport const POST = async () => Response.json({ ok: true });\n',
    [reexportUnauthOpsPath]:
      'export async function GET() {\n  await requireSuperadminSession();\n  return Response.json({ ok: true });\n}\nasync function unguardedPatch() {\n  return Response.json({ ok: true });\n}\nexport { unguardedPatch as PATCH };\n',
  });
  for (const cleanPath of [opsHandlerPath, commentOnlyOpsPath]) {
    const okOps = judgeOn(
      withEntry({ ops: "prometheus CPU query", connector: "prometheus:node_cpu", handlerSource: `self:${cleanPath}#GET` }),
      opsTree,
      true,
    );
    assert.ok(okOps.ops.includes(target.id) && !okOps.invalid.length, `a valid ops entry (${cleanPath}) must pass: ${JSON.stringify(okOps.invalid)}`);
    checks++;
  }
  for (const [entry, why, what] of [
    [{ ops: "x", connector: "prometheus:up" }, /must name handlerSource/, "ops without handlerSource"],
    [{ ops: "x", handlerSource: `self:${opsHandlerPath}#GET` }, /must name connector/, "ops without connector"],
    [{ ops: "x", connector: "madeup:thing", handlerSource: `self:${opsHandlerPath}#GET` }, /allowlisted prefix/, "ops with unknown connector prefix"],
    [{ ops: "x", connector: "prometheus:", handlerSource: `self:${opsHandlerPath}#GET` }, /allowlisted prefix/, "ops with empty connector target"],
    [{ ops: "x", connector: "prometheus:up", handlerSource: "self:app/api/no-such-ops/route.ts#GET" }, /cannot be read/, "ops with nonexistent handlerSource file"],
    [{ ops: "x", connector: "prometheus:up", handlerSource: `self:${opsHandlerPath}#DELETE` }, /defines no function DELETE/, "ops with nonexistent handler symbol"],
    [{ ops: "x", connector: "prometheus:up", handlerSource: `self:${opsHandlerPath}:1` }, /cites a line number/, "ops handlerSource using line number"],
    [{ ops: "x", connector: "prometheus:up", handlerSource: `self:${fakeOpsHandlerPath}#GET` }, /forbidden fake\/stub literal/, "ops handler carrying Math.random"],
    [{ ops: "x", connector: "prometheus:up", handlerSource: `self:${hopOpsHandlerPath}#GET` }, /forbidden fake\/stub literal/, "ops handler hiding in-memory stub via local import"],
    [{ ops: "x", connector: "prometheus:up", handlerSource: `self:${unauthOpsHandlerPath}#GET` }, /no recognized ops auth\/HMAC guard/, "ops route with unauthenticated sibling POST"],
    [{ ops: "x", connector: "prometheus:up", handlerSource: `self:${arrowUnauthOpsPath}#GET` }, /no recognized ops auth\/HMAC guard/, "ops route with unauthenticated arrow const POST"],
    [{ ops: "x", connector: "prometheus:up", handlerSource: `self:${reexportUnauthOpsPath}#GET` }, /no recognized ops auth\/HMAC guard/, "ops route with unauthenticated re-exported PATCH"],
    [{ ops: "x", connector: "prometheus:up", handlerSource: "self:app/api/surface-guard-deep-ops-probe/route.ts#GET" }, /deeper than 12 hops/, "ops route exceeding import walk depth"],
    [
      { ops: "x", connector: "prometheus:up", handlerSource: `self:${opsHandlerPath}#GET`, endpoint: "x", table: "t", writer: "user-action: y" },
      /exactly one/,
      "combining ops + endpoint",
    ],
  ] as const) {
    const v = judgeOn(withEntry(entry), opsTree, true);
    assert.ok(
      v.invalid.some((i) => i.id === target.id && why.test(i.why)),
      `ops negative check failed (${what}): ${JSON.stringify(v.invalid)}`,
    );
    checks++;
  }

  assert.deepEqual(JSON.parse(jsonc('{"a": "**/*.ts", /* c */ "b": [1,], // d\n}')), { a: "**/*.ts", b: [1] }, "tsconfig globs are not comments");
  checks++;

  // ── 7. fail loudly ──
  assert.throws(() => loadProvenance(join(tmpdir(), "surface-guard-no-such-app")), /missing/, "a missing sidecar must fail, never pass");
  assert.throws(() => parseProvenance("{", "probe"), /not valid JSON/, "a broken sidecar must fail");
  assert.throws(() => parseProvenance("{}", "probe"), /no "surfaces"/, "a sidecar with no surfaces object must fail");
  const none = judgeProvenance({ ...head, entries: head.entries.filter((e) => !PROVENANCE_KINDS.includes(e.kind)) }, base, all(), rows, config, ws);
  assert.ok(none.invalid.length > 0, "an extractor that finds no routed surface must fail, never pass");
  checks += 4;

  // ── 8. the committed sidecar is the one the suite reads ──
  loadProvenance(root);
  checks++;
  return checks;
}
