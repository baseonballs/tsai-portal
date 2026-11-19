/**
 * surface-guard configuration for the Portal (GA-029 §7.1). The engine is `core.ts` (identical in the four apps).
 *
 * Surface sources, all parsed from source:
 *   routes      every `src/app/**​/page.tsx` and `route.ts`; public = `PUBLIC_PAGES` / `PUBLIC_API` in
 *               `scripts/test-no-session-route-tree.ts` (recorded, not diffed: see core.ts `info`)
 *   menu        `LandingHeader.tsx`, `LandingFooter.tsx` (every href)
 *   docs        every `*_DOCS` list (`src/lib/docs/manifest.ts`; before Phase 156, the /docs page itself):
 *               each published page and each docs tab (spotlight / periodical / watson)
 *   unavailable `*-unavailable` / `*-not-available` test ids; route handlers that answer 501
 */
import { allMatches, sliceBlock, stripComments, type GuardConfig, type SourceTree, type SurfaceEntry } from "./core";

const ROUTE_TREE_TEST = "scripts/test-no-session-route-tree.ts";
const HEADER = "src/components/landing/LandingHeader.tsx";
const FOOTER = "src/components/landing/LandingFooter.tsx";
const DOCS_SOURCES = ["src/lib/docs/manifest.ts", "src/app/docs/[[...slug]]/page.tsx"];

function keysOf(block: string | null): string[] {
  if (!block) return [];
  return allMatches(/^\s*"([^"]+)"\s*:/gm, block).map((m) => m[1]);
}

function publicRoutes(tree: SourceTree, routes: { path: string; sample: string; file: string }[]): Set<string> | null {
  const raw = tree.read(ROUTE_TREE_TEST);
  if (raw === null) return null;
  const src = stripComments(raw);
  const pages = new Set(keysOf(sliceBlock(src, /const PUBLIC_PAGES[^=]*=\s*/)));
  const api = new Set(keysOf(sliceBlock(src, /const PUBLIC_API[^=]*=\s*/)));
  if (!pages.size) return null;
  return new Set(routes.filter((r) => pages.has(r.sample) || api.has(r.file)).map((r) => r.path));
}

/** `docs-tab:<app>` and `docs:<app>:<slug>` for every `<APP>_DOCS` list in the docs sources. */
function docs(tree: SourceTree): SurfaceEntry[] {
  const out: SurfaceEntry[] = [];
  for (const file of DOCS_SOURCES) {
    const raw = tree.read(file);
    if (raw === null) continue;
    const src = stripComments(raw);
    for (const m of allMatches(/const ([A-Z]+)_DOCS\b[^=]*=\s*/g, src)) {
      const app = m[1].toLowerCase();
      const block = sliceBlock(src.slice(m.index), /const [A-Z]+_DOCS\b[^=]*=\s*/);
      out.push({ id: `docs-tab:${app}`, kind: "tab", polarity: "present", source: file });
      for (const s of allMatches(/\{\s*title:\s*"([^"]+)",\s*slug:\s*"([^"]+)"/g, block ?? "")) {
        out.push({ id: `docs:${app}:${s[2]}`, kind: "docs-page", polarity: "present", label: s[1], source: file });
      }
    }
  }
  return out;
}

export const config: GuardConfig = {
  app: "Portal",
  rowPrefixes: ["O-"],
  appDirs: ["src/app"],
  versionFile: "VERSION",
  baseline: {
    rev: "50abfb405e10aa7b89e66815a837a28771d7ffc6",
    version: "0.4.1.beta",
    why: "GA-029 §7.5: the parent of #45, the last Portal commit before the fake-data cleanup",
  },
  requiredAtHead: [HEADER, FOOTER, ROUTE_TREE_TEST, DOCS_SOURCES[0]],
  publicRoutes,
  menus: [HEADER, FOOTER].map((file) => ({ file, item: /href[:=]\s*\{?\s*["'`]([^"'`]+)["'`]/g })),
  lists: [],
  routeRestrictions: [{ re: /\bstatus:\s*501\b/, prefix: "unavailable", on: "api" }],
  unavailable: {
    roots: ["src/app/", "src/components/"],
    exclude: /\/__tests__\/|\.test\.tsx?$/,
    markers: [{ re: /(?:data-testid|testId)=\{?\s*["']([a-z0-9-]+-(?:unavailable|not-available))["']/g, id: (m) => `testid:${m[1]}` }],
  },
  custom: [docs],
};
