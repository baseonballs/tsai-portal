/**
 * surface-guard — the REMOVAL half (T0.7, GA-029 §7.1–7.6).
 *
 * The same file lives in Periodical, Spotlight, Portal and Watson (`scripts/surface-guard/core.ts`). Only
 * `config.ts` and `register-map.json` differ per app. Keep the four copies identical: a fix here is a fix in all four.
 *
 * What it does
 *   1. EXTRACTS the user-visible surface of a source tree (the working tree, or any git revision) into a
 *      sorted, deterministic manifest. It is source-derived: it parses the route tree, the menu sources, the
 *      tab registries, the gates and the unavailable markers. It is not a hand-kept list, so it cannot drift.
 *      A configured source that is missing at HEAD, whose block is gone, or that yields nothing where it must
 *      yield something, FAILS — the extractor is out of date, which is never a pass.
 *   2. DIFFS HEAD against EVERY committed manifest (`docs/6-releases/surface/*.json`): the pre-cleanup baseline
 *      (the retroactive bootstrap) and each release manifest. No manifest is trusted as written: each is
 *      re-extracted from git at its recorded commit (which must be an ancestor of HEAD) and must match byte for
 *      byte, and its version must equal the version file at that commit.
 *      A removal is: an entry of polarity `present` (route, menu entry, tab, deep-link alias, feature, role
 *      destination, docs page) that disappears, OR an entry of polarity `restriction` (gated, superadmin-locked,
 *      unavailable/hollowed) that newly appears.
 *   3. APPROVES a removal only by a LOOKUP in the epic's `gap-register.md` / `retirement-ledger.md`
 *      (tsai-sitedocs). `register-map.json` in this directory only says which register row (or ledger
 *      capability) one exact surface id belongs to; it carries no decision of its own, and has no wildcards.
 *      The row must exist, belong to this app, be in an allowed state (OPEN / AWAITING OWNER / RETIRED with a
 *      dated ledger row), and a deleted surface may not map to a STILL-FAKE row (containment keeps the surface).
 *      An unmapped removal, an invalid mapping and a stale mapping (a surface that is not removed) all FAIL.
 *
 * Reading the register: `TSAI_SITEDOCS_DIR` (default: the sibling `../tsai-sitedocs` of the main checkout)
 * at git ref `TSAI_SITEDOCS_REF` (default `origin/main`; `WORKTREE` reads the files on disk). If the checkout,
 * the ref or either file is missing the guard fails loudly. It never passes without reading them.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// git, safely
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

const SAFE_REF = /^(?!-)[A-Za-z0-9._/-]+$/;

/** A ref or sha handed to git: no leading `-`, nothing outside `[A-Za-z0-9._/-]`. */
export function assertSafeRef(ref: string, what: string): string {
  if (!SAFE_REF.test(ref) || ref.includes("..")) {
    throw new Error(`surface-guard: refusing ${what} ${JSON.stringify(ref)}: a git ref must match ${SAFE_REF} (no leading "-", no "..")`);
  }
  return ref;
}

function git(repo: string, args: string[], input?: string): Buffer {
  return execFileSync("git", ["-C", repo, ...args], { input, maxBuffer: 1 << 30, stdio: ["pipe", "pipe", "pipe"] });
}

export function resolveCommit(repo: string, ref: string): string {
  assertSafeRef(ref, "revision");
  try {
    return git(repo, ["rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`]).toString("utf8").trim();
  } catch {
    throw new Error(
      `surface-guard: git revision ${ref} is not in ${repo}. Fetch full history (git fetch --unshallow) — ` +
        "a committed manifest cannot be verified without its commit.",
    );
  }
}

export function isAncestor(repo: string, ancestor: string, of: string): boolean {
  assertSafeRef(ancestor, "revision");
  assertSafeRef(of, "revision");
  try {
    git(repo, ["merge-base", "--is-ancestor", "--end-of-options", ancestor, of]);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Source trees
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

export interface SourceTree {
  /** "worktree" or the git commit. */
  readonly label: string;
  /** Every file path, repo-relative with `/` separators. */
  files(): string[];
  /** File contents, or null when the file does not exist in this tree. */
  read(path: string): string | null;
  /** Bulk read (one git process for a revision). */
  readMany(paths: string[]): Map<string, string>;
}

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "out", "coverage", "graphify-out", ".turbo"]);

export function fsTree(root: string): SourceTree {
  let cache: string[] | null = null;
  const walk = (dir: string, out: string[]) => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) walk(full, out);
      else out.push(relative(root, full).split(sep).join("/"));
    }
  };
  const read = (p: string): string | null => {
    const full = join(root, p);
    return existsSync(full) && statSync(full).isFile() ? readFileSync(full, "utf8") : null;
  };
  return {
    label: "worktree",
    files() {
      if (!cache) {
        cache = [];
        walk(root, cache);
        cache.sort();
      }
      return cache;
    },
    read,
    readMany(paths) {
      const m = new Map<string, string>();
      for (const p of paths) {
        const s = read(p);
        if (s !== null) m.set(p, s);
      }
      return m;
    },
  };
}

export function gitTree(repo: string, ref: string): SourceTree {
  const rev = resolveCommit(repo, ref);
  const list = git(repo, ["ls-tree", "-r", "-z", "--name-only", "--end-of-options", rev])
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .sort();
  const known = new Set(list);
  const cache = new Map<string, string>();
  const readMany = (paths: string[]) => {
    const want = paths.filter((p) => known.has(p) && !cache.has(p));
    if (want.length) {
      const out = git(repo, ["cat-file", "--batch"], want.map((p) => `${rev}:${p}`).join("\n") + "\n");
      let off = 0;
      for (const p of want) {
        const nl = out.indexOf(10, off);
        const header = out.subarray(off, nl).toString("utf8");
        const parts = header.split(" ");
        if (parts[1] === "missing" || parts.length < 3) throw new Error(`surface-guard: git could not read ${rev}:${p}`);
        const size = Number(parts[2]);
        cache.set(p, out.subarray(nl + 1, nl + 1 + size).toString("utf8"));
        off = nl + 1 + size + 1;
      }
    }
    const m = new Map<string, string>();
    for (const p of paths) {
      const s = cache.get(p);
      if (s !== undefined) m.set(p, s);
    }
    return m;
  };
  return {
    label: rev,
    files: () => list,
    read: (p) => readMany([p]).get(p) ?? null,
    readMany,
  };
}

/** A tree with some files replaced (string) or deleted (null). Used by the mutation tests. */
export function overlayTree(base: SourceTree, overrides: Record<string, string | null>): SourceTree {
  const read = (p: string): string | null => (p in overrides ? overrides[p] : base.read(p));
  return {
    label: `${base.label}+overlay`,
    files() {
      const s = new Set(base.files());
      for (const [p, v] of Object.entries(overrides)) {
        if (v === null) s.delete(p);
        else s.add(p);
      }
      return [...s].sort();
    },
    read,
    readMany(paths) {
      const m = base.readMany(paths.filter((p) => !(p in overrides)));
      for (const p of paths) {
        const v = overrides[p];
        if (p in overrides && v !== null && v !== undefined) m.set(p, v);
      }
      return m;
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Manifest model
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * `present`: disappearing is a removal. `restriction`: appearing is a removal (gated / locked / unavailable).
 * `info`: recorded in the manifest, never diffed. Public tagging is `info`: a public route that now requires a
 * session is a security closure (GA-029 §2, out of scope); a public route that disappears is a route removal.
 */
export type Polarity = "present" | "restriction" | "info";

export interface SurfaceEntry {
  id: string;
  kind: string;
  polarity: Polarity;
  label?: string;
  source: string;
}

export interface Manifest {
  schema: "surface-guard/v1";
  app: string;
  version: string;
  /** The full commit sha the manifest was extracted from (an ancestor of every later HEAD). */
  rev: string;
  notes: string[];
  entries: SurfaceEntry[];
}

export interface Removal {
  id: string;
  kind: string;
  change: "removed" | "newly-restricted";
  label?: string;
  /** Which committed manifest(s) it is a removal against. */
  against: string[];
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

/** A list extracted from one file: optionally the block starting at `block`, then every `item` match (group 1). */
export interface ListSpec {
  name: string;
  file: string;
  block?: RegExp;
  item: RegExp;
  kind: string;
  polarity: Polarity;
  /** Group index for a human label, when the pattern captures one. */
  labelGroup?: number;
  /** The list may legitimately be empty at HEAD (its entries then show up as removals). */
  mayBeEmpty?: boolean;
}

export interface MenuSpec {
  /** The menu this source is (ids are `menu:<name>:<href>`): an entry removed from ONE menu is a removal. */
  name: string;
  file: string;
  /** Only the block starting here (e.g. one array of a file holding two menus). */
  block?: RegExp;
  /**
   * Group 1 = a literal href (or module id); group 2 (optional) = an identifier holding it, resolved from a
   * `const NAME = "…"` in the same file. Must be a global regex.
   */
  item: RegExp;
}

/**
 * Flags on a menu item's own object literal that lock, gate or disable it. Each found one is a restriction
 * entry `gated:menu:<name>:<href>:<flag>`, read order-independently from the item's object (not its children).
 */
export const MENU_FLAG_PATTERNS: { re: RegExp; flag: (m: RegExpExecArray) => string }[] = [
  { re: /\b(superadminOnly|superuserOnly|disabled|comingSoon|isLocked|locked|hidden)\s*:\s*true\b/g, flag: (m) => m[1] },
  { re: /\brequiredRole\s*:\s*["'`]([^"'`]+)["'`]/g, flag: (m) => `requiredRole=${m[1]}` },
  { re: /\brequiredRole\s*:\s*\[([^\]]*)\]/g, flag: (m) => `requiredRole=${m[1].replace(/["'`\s]/g, "")}` },
  { re: /\brequiredTierLevel\s*:\s*(\d+)/g, flag: (m) => `requiredTierLevel=${m[1]}` },
];

export interface UnavailableSpec {
  /** Path prefixes scanned for markers. */
  roots: string[];
  /** Files under the roots that are not shipped UI (tests, scripts). */
  exclude: RegExp;
  /** Each match yields a restriction entry `unavailable:<id(match, file)>`. Global regexes. */
  markers: { re: RegExp; id: (m: RegExpExecArray, file: string) => string; files?: RegExp }[];
}

export interface RouteRestriction {
  /** Applied to each route module's comment-stripped source. */
  re: RegExp;
  /** Entry id prefix, e.g. `superadmin` or `unavailable`: the entry is `<prefix>:route:<path>`. */
  prefix: string;
  /** Restrict to page modules, route handlers, or both. */
  on: "page" | "api" | "both";
}

export interface RouteInfo {
  /** Normalised path: groups stripped, `[x]` → `:param`, `[...x]` → `*`, `[[...x]]` → `*?`. */
  path: string;
  /** Sample path as the no-session route tree tests derive it (dynamic → `x`, optional catch-all dropped). */
  sample: string;
  file: string;
  type: "page" | "api";
}

export interface ExtractContext {
  notes: string[];
  /** True for the tree under test: a custom extractor must then throw when its source block is gone. */
  head: boolean;
}

export interface GuardConfig {
  /** Must equal the register's "Surface" column for this app's rows. */
  app: string;
  /** Route roots, e.g. `src/app`. */
  appDirs: string[];
  /** Returns the set of public route paths, or null when this tree has no public list (HEAD: a failure). */
  publicRoutes?: (tree: SourceTree, routes: RouteInfo[]) => Set<string> | null;
  menus: MenuSpec[];
  lists: ListSpec[];
  unavailable?: UnavailableSpec;
  routeRestrictions?: RouteRestriction[];
  /** App-specific extractors (a feature matrix, a role → destinations function, an access policy). */
  custom?: ((tree: SourceTree, ctx: ExtractContext) => SurfaceEntry[])[];
  /** Files that must exist at HEAD for the extractor to be current. */
  requiredAtHead: string[];
  /** The pre-cleanup release the bootstrap diffs from (GA-029 §7.5). */
  baseline: { rev: string; version: string; why: string };
  /** Repo-relative version file (first line holds the version). */
  versionFile: string;
  /** Prefix of register row ids that belong to this app (sanity check), e.g. ["P-", "N-"]. */
  rowPrefixes: string[];
  /**
   * Extractor false positives, reviewed: entries that match a marker but are not a removal (an honest error
   * state when the backend fails, for instance). Each needs its reason, and goes stale (fails) when the entry
   * no longer appears — so it can never hide a later, real removal under the same id.
   */
  notRemovals?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Extraction
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

export function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

/** From `start`, return the text up to the bracket that closes the first `[`, `{` or `(` after it — or to `;`. */
export function sliceBlock(src: string, start: RegExp): string | null {
  const m = start.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length;
  const open = "[{(";
  const close: Record<string, string> = { "[": "]", "{": "}", "(": ")" };
  // A union type (`type X = | "a" | "b";`) has no bracket: take it to the semicolon.
  while (i < src.length && /\s/.test(src[i])) i++;
  if (!open.includes(src[i]) && /=\s*$/.test(m[0])) {
    const end = src.indexOf(";", i);
    return src.slice(m.index, end === -1 ? src.length : end);
  }
  while (i < src.length && !open.includes(src[i])) {
    if (src[i] === ";") return src.slice(m.index, i);
    i++;
  }
  const j = matchBracket(src, i);
  return j === -1 ? src.slice(m.index) : src.slice(m.index, j + 1);
}

/** Index of the bracket closing the one at `i` (string-aware), or -1. */
export function matchBracket(src: string, i: number): number {
  const open = "[{(";
  const close: Record<string, string> = { "[": "]", "{": "}", "(": ")" };
  const stack: string[] = [];
  let quote: string | null = null;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (quote) {
      if (c === "\\") j++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (open.includes(c)) stack.push(close[c]);
    else if (c === stack[stack.length - 1]) {
      stack.pop();
      if (!stack.length) return j;
    }
  }
  return -1;
}

/** The object literal enclosing position `pos`, with its nested `{…}` / `[…]` bodies removed (its own keys only). */
export function enclosingObject(src: string, pos: number): string | null {
  let depth = 0;
  for (let i = pos; i >= 0; i--) {
    const c = src[i];
    if (c === "}") depth++;
    else if (c === "{") {
      if (depth === 0) {
        const end = matchBracket(src, i);
        if (end === -1) return null;
        let body = src.slice(i + 1, end);
        // Drop nested blocks so a parent item does not inherit its children's flags.
        let k = 0;
        let out = "";
        while (k < body.length) {
          if (body[k] === "{" || body[k] === "[") {
            const e = matchBracket(body, k);
            if (e === -1) break;
            out += " ";
            k = e + 1;
          } else {
            out += body[k];
            k++;
          }
        }
        body = out;
        return body;
      }
      depth--;
    }
  }
  return null;
}

/** The text of a top-level function: from `function <name>(` to the next top-level declaration. */
export function sliceFunction(src: string, name: string): string | null {
  const start = src.search(new RegExp(`(?:^|\\n)(?:export\\s+)?(?:async\\s+)?function\\s+${name}\\s*\\(`));
  if (start === -1) return null;
  const rest = src.slice(start + 1);
  const next = rest.search(/\n(?:export\s|function\s|const\s|let\s|type\s|interface\s)/);
  return next === -1 ? rest : rest.slice(0, next);
}

function globalRe(re: RegExp): RegExp {
  return re.global ? new RegExp(re.source, re.flags) : new RegExp(re.source, re.flags + "g");
}

export function allMatches(re: RegExp, text: string): RegExpExecArray[] {
  const g = globalRe(re);
  const out: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = g.exec(text))) {
    out.push(m);
    if (m[0] === "") g.lastIndex++;
  }
  return out;
}

const ROUTE_FILE = /\/(page|route)\.(tsx?|jsx?)$/;

export function listRoutes(tree: SourceTree, appDirs: string[]): RouteInfo[] {
  const out: RouteInfo[] = [];
  for (const file of tree.files()) {
    const dir = appDirs.find((d) => file.startsWith(`${d}/`));
    if (!dir) continue;
    const m = ROUTE_FILE.exec(file);
    if (!m) continue;
    const segs = file.slice(dir.length + 1).split("/").slice(0, -1);
    // `_private` folders are not routes in the App Router.
    if (segs.some((s) => s.startsWith("_"))) continue;
    const kept = segs.filter((s) => !/^\(.*\)$/.test(s) && !s.startsWith("@"));
    const norm = kept.map((s) =>
      s.startsWith("[[...") ? "*?" : s.startsWith("[...") ? "*" : s.startsWith("[") ? ":param" : s,
    );
    const sample: string[] = [];
    for (const s of kept) {
      if (s.startsWith("[[...")) continue;
      sample.push(s.startsWith("[") ? "x" : s);
    }
    out.push({
      path: `/${norm.join("/")}`,
      sample: `/${sample.join("/")}`,
      file,
      type: m[1] === "page" ? "page" : "api",
    });
  }
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

function outOfDate(what: string): Error {
  return new Error(
    `surface-guard: ${what} — the extractor is out of date. Update scripts/surface-guard/config.ts to read where the ` +
      "surface now lives. A missing source is never a pass.",
  );
}

export function extractSurface(tree: SourceTree, config: GuardConfig, opts: { head: boolean }): Manifest {
  const notes: string[] = [];
  const entries = new Map<string, SurfaceEntry>();
  const add = (e: SurfaceEntry) => {
    if (!entries.has(e.id)) entries.set(e.id, e);
  };

  if (opts.head) {
    const missing = config.requiredAtHead.filter((f) => tree.read(f) === null);
    if (missing.length) throw outOfDate(`these surface sources are gone: ${missing.join(", ")}`);
  }

  // ── routes ──
  const routes = listRoutes(tree, config.appDirs);
  if (opts.head && routes.length < 3) throw outOfDate(`found only ${routes.length} routes (the walker is broken)`);
  for (const r of routes) add({ id: `route:${r.path}`, kind: "route", polarity: "present", label: r.type, source: r.file });

  if (config.publicRoutes) {
    const publicSet = config.publicRoutes(tree, routes);
    if (publicSet === null) {
      if (opts.head) throw outOfDate("the public route list could not be parsed at HEAD");
      notes.push("public tagging: no public list in this tree");
    } else {
      for (const p of publicSet) add({ id: `public:${p}`, kind: "public-route", polarity: "info", source: "public list" });
    }
  } else {
    notes.push("public tagging: this app has no public route list");
  }

  if (config.routeRestrictions?.length) {
    const bodies = tree.readMany(routes.map((r) => r.file));
    for (const r of routes) {
      const src = stripComments(bodies.get(r.file) ?? "");
      for (const rr of config.routeRestrictions) {
        if (rr.on !== "both" && rr.on !== r.type) continue;
        if (globalRe(rr.re).test(src)) add({ id: `${rr.prefix}:route:${r.path}`, kind: rr.prefix, polarity: "restriction", source: r.file });
      }
    }
  }

  // ── menus (scoped by menu name), with each item's own lock / gate flags ──
  for (const spec of config.menus) {
    const raw = tree.read(spec.file);
    if (raw === null) {
      notes.push(`menu ${spec.name}: source absent (${spec.file})`);
      continue;
    }
    const whole = stripComments(raw);
    let src = whole;
    if (spec.block) {
      const b = sliceBlock(whole, spec.block);
      if (b === null) {
        if (opts.head) throw outOfDate(`menu ${spec.name}: ${spec.block} not found in ${spec.file}`);
        notes.push(`menu ${spec.name}: block absent in ${spec.file}`);
        continue;
      }
      src = b;
    }
    const found = allMatches(spec.item, src);
    if (opts.head && !found.length) throw outOfDate(`menu ${spec.name}: no entries parsed from ${spec.file}`);
    // The same href twice in one menu source (a desktop and a mobile rendering) is two entries: `…#2` is the
    // second, so removing either one is a removal.
    const seen = new Map<string, number>();
    for (const m of found) {
      let value = m[1];
      if (value === undefined && m[2] !== undefined) {
        const c = new RegExp(`\\bconst\\s+${m[2]}\\s*=\\s*["'\`]([^"'\`]+)["'\`]`).exec(whole);
        value = c ? c[1] : `const:${m[2]}`;
      }
      if (value === undefined) continue;
      const n = (seen.get(value) ?? 0) + 1;
      seen.set(value, n);
      const id = `menu:${spec.name}:${value}${n > 1 ? `#${n}` : ""}`;
      add({ id, kind: "menu", polarity: "present", source: spec.file });
      const obj = enclosingObject(src, m.index);
      if (obj) {
        for (const fp of MENU_FLAG_PATTERNS) {
          for (const f of allMatches(fp.re, obj)) {
            add({ id: `gated:${id}:${fp.flag(f)}`, kind: "gated", polarity: "restriction", source: spec.file });
          }
        }
      }
    }
  }

  // ── lists: tabs, deep-link aliases, gates ──
  for (const spec of config.lists) {
    const raw = tree.read(spec.file);
    if (raw === null) {
      if (opts.head) throw outOfDate(`${spec.name}: source ${spec.file} is gone`);
      notes.push(`${spec.name}: source absent (${spec.file})`);
      continue;
    }
    const src = stripComments(raw);
    const block = spec.block ? sliceBlock(src, spec.block) : src;
    if (block === null) {
      if (opts.head) throw outOfDate(`${spec.name}: ${spec.block} not found in ${spec.file}`);
      notes.push(`${spec.name}: block absent in ${spec.file}`);
      continue;
    }
    const found = allMatches(spec.item, block);
    if (opts.head && !found.length && spec.polarity === "present" && !spec.mayBeEmpty) {
      throw outOfDate(`${spec.name}: nothing parsed from ${spec.file}`);
    }
    for (const m of found) {
      add({
        id: `${spec.kind}:${spec.name}:${m[1]}`,
        kind: spec.kind,
        polarity: spec.polarity,
        label: spec.labelGroup ? m[spec.labelGroup] : undefined,
        source: spec.file,
      });
    }
  }

  // ── unavailable / hollowed markers ──
  if (config.unavailable) {
    const u = config.unavailable;
    const files = tree.files().filter((f) => u.roots.some((r) => f.startsWith(r)) && /\.(tsx?|jsx?)$/.test(f) && !u.exclude.test(f));
    const bodies = tree.readMany(files);
    for (const f of files) {
      const src = stripComments(bodies.get(f) ?? "");
      for (const mk of u.markers) {
        if (mk.files && !mk.files.test(f)) continue;
        for (const m of allMatches(mk.re, src)) {
          add({ id: `unavailable:${mk.id(m, f)}`, kind: "unavailable", polarity: "restriction", source: f });
        }
      }
    }
  }

  (config.custom ?? []).forEach((fn, i) => {
    const out = fn(tree, { notes, head: opts.head });
    if (opts.head && !out.length) throw outOfDate(`custom extractor #${i + 1} (${fn.name || "anonymous"}) found nothing at HEAD`);
    for (const e of out) add(e);
  });

  const sorted = [...entries.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { schema: "surface-guard/v1", app: config.app, version: "", rev: tree.label, notes, entries: sorted };
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Diff
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

export function diffRemovals(base: Manifest, head: Manifest): Removal[] {
  const headIds = new Map(head.entries.map((e) => [e.id, e]));
  const baseIds = new Map(base.entries.map((e) => [e.id, e]));
  const tag = `${base.version}@${base.rev.slice(0, 10)}`;
  const out: Removal[] = [];
  for (const e of base.entries) {
    if (e.polarity === "present" && !headIds.has(e.id)) out.push({ id: e.id, kind: e.kind, change: "removed", label: e.label, against: [tag] });
  }
  for (const e of head.entries) {
    if (e.polarity === "restriction" && !baseIds.has(e.id)) out.push({ id: e.id, kind: e.kind, change: "newly-restricted", label: e.label, against: [tag] });
  }
  return out;
}

export function mergeRemovals(lists: Removal[][]): Removal[] {
  const m = new Map<string, Removal>();
  for (const list of lists) {
    for (const r of list) {
      const prev = m.get(r.id);
      if (prev) prev.against = [...new Set([...prev.against, ...r.against])];
      else m.set(r.id, { ...r, against: [...r.against] });
    }
  }
  return [...m.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/**
 * A kind that has entries in a committed manifest but none at HEAD means a parser stopped matching (or a whole
 * class of surface vanished). For `present` kinds that shows up as removals anyway; for `restriction` kinds a
 * drop to zero is legitimate only when its source block is still parsed (checked in extractSurface), so this
 * returns the `present` kinds that vanished entirely, which the check reports as a failure of its own.
 */
export function vanishedKinds(bases: Manifest[], head: Manifest): string[] {
  const at = new Set(head.entries.filter((e) => e.polarity === "present").map((e) => e.kind));
  const before = new Set(bases.flatMap((b) => b.entries.filter((e) => e.polarity === "present").map((e) => e.kind)));
  return [...before].filter((k) => !at.has(k)).sort();
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Register + ledger (tsai-sitedocs)
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

export const EPIC_DIR =
  "conductor/tracks/02-transcend-platform/08-real-data-foundation/PLAT-DATA-EPIC-REAL-DATA-FOUNDATION";

export interface RegisterRow {
  id: string;
  aliases: string[];
  surface: string;
  capability: string;
  kind: string;
  status: string;
  state: string;
}

export interface LedgerRow {
  capability: string;
  surfaces: string;
  decision: string;
  commit: string;
}

export interface RegisterSource {
  origin: string;
  register: string;
  ledger: string;
}

/** Split one markdown table row into cells. `\|` and pipes inside backtick spans do not split. */
export function cells(line: string): string[] {
  const s = line.trim();
  const out: string[] = [];
  let cur = "";
  let tick = 0;
  let i = s.startsWith("|") ? 1 : 0;
  for (; i < s.length; i++) {
    const c = s[i];
    if (c === "\\" && s[i + 1] === "|") {
      cur += "|";
      i++;
      continue;
    }
    if (c === "`") {
      let n = 0;
      while (s[i + n] === "`") n++;
      if (tick === 0) tick = n;
      else if (tick === n) tick = 0;
      cur += s.slice(i, i + n);
      i += n - 1;
      continue;
    }
    if (c === "|" && tick === 0) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim() !== "" || !s.endsWith("|")) out.push(cur.trim());
  return out;
}

export function parseRegister(md: string): Map<string, RegisterRow> {
  const rows = new Map<string, RegisterRow>();
  const lines = md.split("\n");
  const headerIdx = lines.findIndex((l) => /^\|\s*ID\s*\|\s*Surface\s*\|/.test(l));
  if (headerIdx === -1) throw new Error("surface-guard: gap-register.md has no `| ID | Surface |` table — its format changed");
  const header = cells(lines[headerIdx]).map((h) => h.toLowerCase());
  const col = (name: string) => {
    const i = header.indexOf(name);
    if (i === -1) throw new Error(`surface-guard: gap-register.md table has no "${name}" column`);
    return i;
  };
  const ci = { surface: col("surface"), capability: col("capability"), kind: col("kind"), status: col("status"), state: col("state") };
  lines.slice(headerIdx + 2).every((line, k) => {
    if (!line.startsWith("|")) return false;
    const c = cells(line);
    if (c.length !== header.length) {
      throw new Error(`surface-guard: gap-register.md line ${headerIdx + 3 + k} has ${c.length} cells, the header has ${header.length}`);
    }
    const ids = allMatches(/\b([A-Z]{1,2}-S?\d+)\b/g, c[0]).map((m) => m[1]);
    if (!ids.length) return true;
    const row: RegisterRow = {
      id: ids[0],
      aliases: ids.slice(1),
      surface: c[ci.surface],
      capability: c[ci.capability],
      kind: c[ci.kind],
      status: c[ci.status],
      state: c[ci.state],
    };
    for (const id of ids) {
      if (rows.has(id)) throw new Error(`surface-guard: gap-register.md has two rows with id ${id}`);
      rows.set(id, row);
    }
    return true;
  });
  if (rows.size < 10) throw new Error(`surface-guard: parsed only ${rows.size} register rows — the parser or the file is broken`);
  return rows;
}

export function parseLedger(md: string): LedgerRow[] {
  const lines = md.split("\n");
  const headerIdx = lines.findIndex((l) => /^\|\s*Capability\s*\|/.test(l));
  if (headerIdx === -1) throw new Error("surface-guard: retirement-ledger.md has no `| Capability |` table — its format changed");
  const header = cells(lines[headerIdx]);
  const out: LedgerRow[] = [];
  const seen = new Set<string>();
  for (const [k, line] of lines.slice(headerIdx + 2).entries()) {
    if (!line.startsWith("|")) break;
    const c = cells(line);
    if (c.length !== header.length) {
      throw new Error(`surface-guard: retirement-ledger.md line ${headerIdx + 3 + k} has ${c.length} cells, the header has ${header.length}`);
    }
    if (!c[0] || /^_\(none/.test(c[0])) continue;
    const key = c[0].toLowerCase();
    if (seen.has(key)) throw new Error(`surface-guard: retirement-ledger.md has two rows for "${c[0]}"`);
    seen.add(key);
    out.push({ capability: c[0], surfaces: c[1] ?? "", decision: c[2] ?? "", commit: c[3] ?? "" });
  }
  return out;
}

/** The main checkout's parent directory (a worktree `<repo>.wt-x` sits beside it). */
function defaultSitedocsDir(repoRoot: string): string {
  return resolve(repoRoot, "..", "tsai-sitedocs");
}

export function loadRegisterSource(repoRoot: string, env: Record<string, string | undefined> = process.env): RegisterSource {
  const dir = env.TSAI_SITEDOCS_DIR ? resolve(env.TSAI_SITEDOCS_DIR) : defaultSitedocsDir(repoRoot);
  const ref = env.TSAI_SITEDOCS_REF || "origin/main";
  const hint =
    "Set TSAI_SITEDOCS_DIR to a tsai-sitedocs checkout (and TSAI_SITEDOCS_REF to a ref, or WORKTREE for the files on disk). " +
    "The guard never passes without reading the gap register and the retirement ledger.";
  if (!existsSync(dir)) throw new Error(`surface-guard: tsai-sitedocs checkout not found at ${dir}. ${hint}`);
  if (ref !== "WORKTREE") assertSafeRef(ref, "TSAI_SITEDOCS_REF");
  const files = [`${EPIC_DIR}/gap-register.md`, `${EPIC_DIR}/retirement-ledger.md`];
  const read = (p: string): string => {
    if (ref === "WORKTREE") {
      const full = join(dir, p);
      if (!existsSync(full)) throw new Error(`surface-guard: ${full} does not exist. ${hint}`);
      return readFileSync(full, "utf8");
    }
    try {
      return git(dir, ["show", "--end-of-options", `${ref}:${p}`]).toString("utf8");
    } catch {
      throw new Error(`surface-guard: cannot read ${ref}:${p} in ${dir} (fetch tsai-sitedocs?). ${hint}`);
    }
  };
  return { origin: `${dir}@${ref}`, register: read(files[0]), ledger: read(files[1]) };
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Approval by lookup
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

export interface RegisterMap {
  /** One EXACT surface id → a register row id, or `ledger:<capability>`. No wildcards. */
  removals: Record<string, string>;
}

export interface Verdict {
  removals: Removal[];
  mapped: { removal: Removal; key: string; target: string; row?: RegisterRow }[];
  unmapped: Removal[];
  invalid: { removal: Removal; key: string; target: string; why: string }[];
  stale: string[];
}

const DATED = /\b\d{4}-\d{2}-\d{2}\b/;
const ALLOWED_STATE = /^(OPEN|AWAITING OWNER|RETIRED)\b/;

function ledgerProblem(l: LedgerRow, app: string): string | null {
  if (!DATED.test(l.decision)) return "the ledger row quotes no dated owner decision";
  if (!l.surfaces.toLowerCase().includes(app.toLowerCase())) return `the ledger row's surfaces do not name ${app}`;
  if (!l.commit || /^[—-]*$/.test(l.commit.trim())) return "the ledger row names no removing commit / PR";
  return null;
}

export function judge(
  removals: Removal[],
  map: RegisterMap,
  rows: Map<string, RegisterRow>,
  ledger: LedgerRow[],
  config: Pick<GuardConfig, "app" | "rowPrefixes" | "notRemovals">,
): Verdict {
  const keys = Object.keys(map.removals);
  const used = new Set<string>();
  const v: Verdict = { removals: [], mapped: [], unmapped: [], invalid: [], stale: [] };
  const not = config.notRemovals ?? {};
  for (const id of Object.keys(not)) {
    if (!removals.some((r) => r.id === id)) v.stale.push(`notRemovals ${id} (it is no longer extracted)`);
  }
  for (const k of keys) {
    if (k.includes("*")) v.invalid.push({ removal: { id: k, kind: "?", change: "removed", against: [] }, key: k, target: map.removals[k], why: "wildcard keys are not allowed: map each exact surface id" });
  }
  for (const r of removals) {
    if (r.id in not) continue;
    v.removals.push(r);
    if (!(r.id in map.removals)) {
      v.unmapped.push(r);
      continue;
    }
    const key = r.id;
    used.add(key);
    const target = map.removals[key];
    if (target.startsWith("ledger:")) {
      const cap = target.slice("ledger:".length).trim().toLowerCase();
      const hit = ledger.find((l) => l.capability.toLowerCase() === cap);
      const why = hit ? ledgerProblem(hit, config.app) : "no retirement-ledger row has that capability";
      if (why) v.invalid.push({ removal: r, key, target, why });
      else v.mapped.push({ removal: r, key, target });
      continue;
    }
    const row = rows.get(target);
    if (!row) {
      v.invalid.push({
        removal: r,
        key,
        target,
        why: "no such row in gap-register.md (if the row is on a tsai-sitedocs branch not yet merged, it resolves when that branch merges)",
      });
      continue;
    }
    if (row.surface !== config.app || !config.rowPrefixes.some((p) => row.id.startsWith(p))) {
      v.invalid.push({ removal: r, key, target, why: `row ${row.id} belongs to ${row.surface}, not ${config.app}` });
      continue;
    }
    const state = row.state.trim().toUpperCase();
    if (!ALLOWED_STATE.test(state)) {
      v.invalid.push({ removal: r, key, target, why: `row ${row.id} is "${row.state}": only OPEN, AWAITING OWNER or RETIRED rows approve a removal` });
      continue;
    }
    if (r.change === "removed" && row.kind.trim().toUpperCase() === "STILL-FAKE") {
      v.invalid.push({
        removal: r,
        key,
        target,
        why: `row ${row.id} is STILL-FAKE: containment keeps the surface, so a deletion needs a REMOVED row or a ledger row`,
      });
      continue;
    }
    if (state.startsWith("RETIRED")) {
      const hit = ledger.find(
        (l) => l.capability.toLowerCase() === row.capability.toLowerCase() || new RegExp(`\\b${row.id}\\b`).test(`${l.capability} ${l.surfaces}`),
      );
      const why = hit ? ledgerProblem(hit, config.app) : `row ${row.id} says RETIRED but retirement-ledger.md has no row for it`;
      if (why) {
        v.invalid.push({ removal: r, key, target, why });
        continue;
      }
    }
    v.mapped.push({ removal: r, key, target, row });
  }
  v.stale.push(...keys.filter((k) => !used.has(k) && !k.includes("*")).sort());
  return v;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Committed manifests
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

export const MANIFEST_DIR = "docs/6-releases/surface";

export function versionKey(v: string): number[] {
  return allMatches(/\d+/g, v).map((m) => Number(m[0]));
}

export function compareVersions(a: string, b: string): number {
  const x = versionKey(a);
  const y = versionKey(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

export function parseVersion(raw: string, from: string): string {
  const line = raw.trim().split("\n")[0].trim();
  // Portal writes `TSAI-PORTAL.v0.4.3.beta`; Spotlight `v0.1.23.beta`. The manifest name keeps the numbers.
  const m = /v?(\d+\.\d+\.\d+(?:[.-][A-Za-z0-9]+)*)$/.exec(line);
  if (!m) throw new Error(`surface-guard: cannot read a version from ${from}: ${line}`);
  return m[1];
}

export function readVersion(repoRoot: string, versionFile: string): string {
  return parseVersion(readFileSync(join(repoRoot, versionFile), "utf8"), versionFile);
}

export function loadManifests(repoRoot: string): Manifest[] {
  const dir = join(repoRoot, MANIFEST_DIR);
  if (!existsSync(dir)) throw new Error(`surface-guard: ${MANIFEST_DIR} is missing — the baseline manifest must be committed`);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const m = JSON.parse(readFileSync(join(dir, f), "utf8")) as Manifest;
      if (`${m.version}.json` !== f) throw new Error(`surface-guard: ${MANIFEST_DIR}/${f} records version ${m.version}`);
      return m;
    })
    .sort((a, b) => compareVersions(a.version, b.version));
}

export function manifestJson(m: Manifest): string {
  return JSON.stringify(m, null, 2) + "\n";
}

/** Extract the manifest of commit `ref`, with its version read from the version file at that commit. */
export function snapshotAt(repoRoot: string, config: GuardConfig, ref: string): Manifest {
  const tree = gitTree(repoRoot, ref);
  const m = extractSurface(tree, config, { head: false });
  const vf = tree.read(config.versionFile);
  if (vf === null) throw new Error(`surface-guard: ${config.versionFile} is missing at ${ref}`);
  m.version = parseVersion(vf, `${config.versionFile}@${ref}`);
  return m;
}

/**
 * Re-derive a committed manifest from git and refuse it unless it matches byte for byte. Its commit must be an
 * ancestor of HEAD, so no manifest can describe a tree that never reached this branch.
 */
export function verifyManifest(repoRoot: string, config: GuardConfig, m: Manifest): void {
  if (!/^[0-9a-f]{40}$/.test(m.rev)) throw new Error(`surface-guard: manifest ${m.version} records rev ${JSON.stringify(m.rev)}, not a full commit sha`);
  if (!isAncestor(repoRoot, m.rev, "HEAD")) {
    throw new Error(`surface-guard: manifest ${m.version} was taken at ${m.rev}, which is not an ancestor of HEAD`);
  }
  const fresh = m.rev === config.baseline.rev ? { ...snapshotAt(repoRoot, config, m.rev), version: config.baseline.version } : snapshotAt(repoRoot, config, m.rev);
  if (manifestJson(fresh) !== manifestJson(m)) {
    throw new Error(
      `surface-guard: the committed manifest ${m.version} does not match a fresh extraction of ${m.rev}. ` +
        "It was edited by hand, or the extractor changed: regenerate it with `surface-guard snapshot`.",
    );
  }
}

export function repoRootFrom(here: string): string {
  let d = here;
  while (!existsSync(join(d, "package.json"))) {
    const up = dirname(d);
    if (up === d) throw new Error("surface-guard: no package.json above " + here);
    d = up;
  }
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// The check
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────

export interface CheckResult {
  verdict: Verdict;
  head: Manifest;
  against: string[];
  vanished: string[];
  registerOrigin: string;
  ok: boolean;
}

export function runCheck(opts: {
  repoRoot: string;
  config: GuardConfig;
  map: RegisterMap;
  tree?: SourceTree;
  manifests?: Manifest[];
  registerSource?: RegisterSource;
}): CheckResult {
  const { repoRoot, config } = opts;
  const tree = opts.tree ?? fsTree(repoRoot);
  const head = extractSurface(tree, config, { head: true });
  head.version = readVersion(repoRoot, config.versionFile);

  const manifests = opts.manifests ?? loadManifests(repoRoot);
  if (!manifests.some((m) => m.rev === config.baseline.rev)) {
    throw new Error(`surface-guard: no committed manifest for the baseline ${config.baseline.rev} in ${MANIFEST_DIR}`);
  }
  // Every committed manifest is re-derived from git; none is trusted as written.
  for (const m of manifests) verifyManifest(repoRoot, config, m);
  const removals = mergeRemovals(manifests.map((b) => diffRemovals(b, head)));
  const vanished = vanishedKinds(manifests, head);

  const src = opts.registerSource ?? loadRegisterSource(repoRoot);
  const rows = parseRegister(src.register);
  const ledger = parseLedger(src.ledger);
  const verdict = judge(removals, opts.map, rows, ledger, config);
  const ok = !verdict.unmapped.length && !verdict.invalid.length && !verdict.stale.length && !vanished.length;
  return { verdict, head, against: manifests.map((b) => `${b.version}@${b.rev.slice(0, 10)}`), vanished, registerOrigin: src.origin, ok };
}

export function formatReport(r: CheckResult, app: string): string {
  const v = r.verdict;
  const lines: string[] = [];
  lines.push(
    `surface-guard (${app}): ${r.head.entries.length} surface entries at HEAD; ${v.removals.length} removal(s) against ${r.against.join(", ")}; ` +
      `${v.mapped.length} mapped to the register/ledger, ${v.unmapped.length} UNMAPPED, ${v.invalid.length} invalid, ${v.stale.length} stale mapping(s).`,
  );
  lines.push(`register: ${r.registerOrigin}`);
  if (r.vanished.length) {
    lines.push("", `A whole surface kind vanished at HEAD (a parser stopped matching?): ${r.vanished.join(", ")}`);
  }
  if (v.unmapped.length) {
    lines.push("", "UNMAPPED removals (no gap-register or retirement-ledger row — add the row, then map the id in scripts/surface-guard/register-map.json):");
    for (const u of v.unmapped) lines.push(`  ${u.change === "removed" ? "-" : "+"} ${u.id}${u.label ? `  [${u.label}]` : ""}`);
  }
  if (v.invalid.length) {
    lines.push("", "INVALID mappings:");
    for (const i of v.invalid) lines.push(`  ${i.removal.id} → ${i.target}: ${i.why}`);
  }
  if (v.stale.length) {
    lines.push(
      "",
      "STALE mappings — the surface is not removed on this branch. Either it was rebuilt (delete the line, so it cannot " +
        "hide a future removal), or this is a mapping for a marker not yet on this branch (it resolves when that branch merges):",
    );
    for (const s of v.stale) lines.push(`  ${s}`);
  }
  return lines.join("\n");
}
