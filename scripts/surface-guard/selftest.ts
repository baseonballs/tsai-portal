/**
 * surface-guard's own gate (GA-029 §7.6), identical in the four apps.
 *
 * Mutations are applied to an OVERLAY of the working tree (nothing on disk changes), against a manifest of the
 * unmutated tree, and judged against a neutral register written here. Each must FAIL the guard; with a valid
 * register row mapped, it must PASS. It also proves the guard refuses a CLOSED / missing / foreign row, a stale
 * mapping, a missing tsai-sitedocs checkout, a missing surface source and a hand-edited baseline.
 */
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
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

export interface SelfTestOptions {
  root: string;
  config: GuardConfig;
  /** A string that, inserted into a page module, makes it render this app's unavailable marker. */
  unavailableSnippet: string;
  /** A page module to insert it into. */
  pageForMarker: string;
  /** The `unavailable:` id the snippet produces. */
  unavailableId: string;
}

/** A neutral register: one open row for this app, one CLOSED, one belonging to another app. */
function neutralRegister(app: string, prefix: string): { register: string; ledger: string } {
  const other = app === "Portal" ? "Watson" : "Portal";
  const rows = [
    `| ${prefix}901 | ${app} | Neutral open row | REMOVED | P2 | REBUILD-NOW | — | — | T3.1 | OPEN |`,
    `| ${prefix}902 | ${app} | Neutral closed row | REMOVED | P2 | REBUILD-NOW | — | — | T3.1 | CLOSED |`,
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
    "| Neutral retired capability | neutral | \"retire it\" (owner, 2026-01-01) | #0 | none |",
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
    const removals = diffRemovals(baseManifest, head);
    return judge(removals, map, rows, led, { ...config, notRemovals: {} }, new Set(head.entries.map((e) => e.id)));
  };
  const ok = (v: ReturnType<typeof verdictFor>) => !v.unmapped.length && !v.invalid.length && !v.stale.length;
  let checks = 0;

  /** Remove every textual occurrence of one entry in its source, so that exactly that id disappears. */
  const removeEntry = (e: SurfaceEntry, pattern: RegExp) => {
    const src = base.read(e.source);
    assert.ok(src, `fixture source ${e.source} missing`);
    const mutated = src.replace(pattern, "");
    assert.notEqual(mutated, src, `mutation of ${e.id} changed nothing`);
    return overlayTree(base, { [e.source]: mutated });
  };

  /** Entries of `kind` whose quoted value occurs in exactly one configured source file. */
  const sole = (kind: string) => {
    // Only the sources of the same kind: a sidebar id that the dashboard also renders is still one menu entry.
    const files = [...new Set(kind === "menu" ? config.menus.map((m) => m.file) : config.lists.map((l) => l.file))];
    const bodies = base.readMany(files);
    return baseManifest.entries.filter((e) => {
      if (e.kind !== kind) return false;
      const value = kind === "menu" ? e.id.slice("menu:".length) : e.id.split(":").slice(2).join(":");
      const re = new RegExp(`["'\`]${escapeRe(value)}["'\`]`);
      return files.filter((f) => re.test(bodies.get(f) ?? "")).length === 1;
    });
  };

  // ── 1. a menu entry removed ──
  const menu = sole("menu")[0];
  assert.ok(menu, "no menu entry at HEAD to mutate");
  const menuValue = menu.id.slice("menu:".length);
  const menuTree = removeEntry(menu, new RegExp(`["'\`]${escapeRe(menuValue)}["'\`]`, "g"));
  const mv = verdictFor(menuTree, { removals: {} });
  assert.ok(mv.unmapped.some((u) => u.id === menu.id), `removing ${menu.id} must be an unmapped removal`);
  assert.equal(ok(mv), false, "the guard must FAIL when a menu entry disappears");
  const mvOk = verdictFor(menuTree, { removals: { [menu.id]: `${prefix}901` } });
  assert.ok(ok(mvOk), `with ${menu.id} mapped to an open register row the guard must pass: ${JSON.stringify(mvOk)}`);
  checks += 2;

  // ── 2. a deep-link alias (or, in an app without aliases, a tab) removed ──
  const alias = sole("tab-alias")[0] ?? sole("tab")[0];
  if (alias) {
    const value = alias.id.split(":").slice(2).join(":");
    const t = removeEntry(alias, new RegExp(`["'\`]${escapeRe(value)}["'\`]`, "g"));
    const v = verdictFor(t, { removals: {} });
    assert.ok(v.unmapped.some((u) => u.id === alias.id), `removing ${alias.id} must be an unmapped removal`);
    assert.equal(ok(v), false, `the guard must FAIL when ${alias.kind} ${alias.id} disappears`);
    checks++;
  }

  // ── 3. a public route removed ──
  const pub = baseManifest.entries.find((e) => e.kind === "public-route");
  const routeEntry = pub
    ? baseManifest.entries.find((e) => e.id === `route:${pub.id.slice("public:".length)}`)
    : baseManifest.entries.find((e) => e.kind === "route" && e.label === "page");
  assert.ok(routeEntry, "no route at HEAD to remove");
  const rv = verdictFor(overlayTree(base, { [routeEntry.source]: null }), { removals: {} });
  assert.ok(rv.unmapped.some((u) => u.id === routeEntry.id), `deleting ${routeEntry.source} must remove ${routeEntry.id}`);
  assert.equal(ok(rv), false, "the guard must FAIL when a route disappears");
  checks++;

  // ── 4. a page newly renders the unavailable marker ──
  const page = base.read(o.pageForMarker);
  assert.ok(page, `${o.pageForMarker} missing`);
  const uTree = overlayTree(base, { [o.pageForMarker]: `${page}\n${o.unavailableSnippet}\n` });
  const uv = verdictFor(uTree, { removals: {} });
  assert.ok(uv.unmapped.some((u) => u.id === o.unavailableId), `the marker must yield ${o.unavailableId}: ${JSON.stringify(uv.unmapped)}`);
  assert.equal(ok(uv), false, "the guard must FAIL when a surface newly shows 'unavailable'");
  assert.ok(ok(verdictFor(uTree, { removals: { [o.unavailableId]: `${prefix}901` } })), "a mapped unavailable marker passes");
  checks += 2;

  // ── 5. approvals are lookups: a CLOSED, missing or foreign row, a stale key, a ledger row ──
  const closed = verdictFor(menuTree, { removals: { [menu.id]: `${prefix}902` } });
  assert.ok(closed.invalid.some((i) => /CLOSED/.test(i.why)), "a CLOSED row cannot approve a removal");
  const missing = verdictFor(menuTree, { removals: { [menu.id]: `${prefix}999` } });
  assert.ok(missing.invalid.some((i) => /no such row/.test(i.why)), "a missing row cannot approve a removal");
  const foreign = verdictFor(menuTree, { removals: { [menu.id]: "ZZ-903" } });
  assert.ok(foreign.invalid.some((i) => /belongs to/.test(i.why)), "another app's row cannot approve a removal");
  const stale = verdictFor(base, { removals: { [menu.id]: `${prefix}901` } });
  assert.deepEqual(stale.stale, [menu.id], "a mapping for a surface that still exists is stale and fails");
  const viaLedger = verdictFor(menuTree, { removals: { [menu.id]: "ledger:Neutral retired capability" } });
  assert.ok(ok(viaLedger), "a dated retirement-ledger row approves a removal");
  const badLedger = verdictFor(menuTree, { removals: { [menu.id]: "ledger:Nothing like this" } });
  assert.ok(badLedger.invalid.length, "an unknown ledger capability cannot approve a removal");
  const renamedBad = verdictFor(menuTree, { removals: { [menu.id]: "renamed:menu:/nowhere-at-all" } });
  assert.ok(renamedBad.invalid.length, "a rename to a surface that does not exist is refused");
  checks += 7;

  // ── 6. fail loudly: no sitedocs, a missing source, a hand-edited baseline ──
  assert.throws(
    () => loadRegisterSource(root, { TSAI_SITEDOCS_DIR: join(tmpdir(), "surface-guard-no-such-sitedocs") }),
    /tsai-sitedocs checkout not found/,
    "a missing tsai-sitedocs checkout must fail, never pass",
  );
  const required = config.requiredAtHead[0];
  assert.throws(() => extractSurface(overlayTree(base, { [required]: null }), config, { head: true }), /out of date/);
  checks += 2;

  const committed = JSON.parse(base.read(`docs/6-releases/surface/${config.baseline.version}.json`) ?? "null") as Manifest | null;
  assert.ok(committed, `the baseline manifest docs/6-releases/surface/${config.baseline.version}.json must be committed`);
  const tampered: Manifest = { ...committed, entries: committed.entries.slice(1) };
  assert.notEqual(manifestJson(tampered), manifestJson(committed));
  assert.throws(
    () =>
      runCheck({
        repoRoot: root,
        config,
        map: { removals: {} },
        manifests: [tampered],
        registerSource: { origin: "neutral", register, ledger },
      }),
    /does not match a fresh extraction/,
    "a hand-edited baseline must be refused",
  );
  checks++;

  return checks;
}
