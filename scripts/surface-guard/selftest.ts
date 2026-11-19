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
  loadRegisterSource,
  manifestJson,
  overlayTree,
  parseLedger,
  parseRegister,
  runCheck,
  type GuardConfig,
  type Manifest,
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
