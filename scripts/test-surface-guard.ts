/**
 * T0.7 removal guard (GA-029 §7.1–7.6). Two halves:
 *   1. the guard's own gate: mutations of an overlay of this tree (remove a menu entry, a deep-link alias,
 *      a public route; add an unavailable marker) must fail it, a valid register row must pass it;
 *   2. the real check: every surface removed since the pre-cleanup baseline (0.4.1, the parent of #45) and since the latest
 *      release manifest maps to an open gap-register row or a retirement-ledger row in tsai-sitedocs.
 * Reads tsai-sitedocs from TSAI_SITEDOCS_DIR (default ../tsai-sitedocs) at TSAI_SITEDOCS_REF (default origin/main).
 */
import { config } from "./surface-guard/config";
import { formatReport, repoRootFrom, runCheck } from "./surface-guard/core";
import { loadMap } from "./surface-guard/cli";
import { runSelfTest } from "./surface-guard/selftest";

const root = repoRootFrom(process.cwd());

const checks = runSelfTest({
  root,
  config,
  pageForMarker: "src/app/pricing/page.tsx",
  unavailableSnippet: 'export const Probe = () => <div data-testid="surface-guard-probe-unavailable" />;',
  unavailableId: "unavailable:testid:surface-guard-probe-unavailable",
});
console.log(`✅ surface-guard self-test: ${checks} mutation and refusal checks behave`);

const result = runCheck({ repoRoot: root, config, map: loadMap() });
console.log(formatReport(result, config.app));
if (!result.ok) {
  console.error("❌ test-surface-guard: unapproved removals (see above). Record each in the gap register, then map it.");
  process.exit(1);
}
console.log("✅ test-surface-guard: every removal maps to the register or the ledger");
