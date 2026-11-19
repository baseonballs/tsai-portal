/**
 * T0.7 removal guard (GA-029 §7.1–7.6). Two halves:
 *   1. the guard's own gate: mutations of an overlay of this tree (remove a menu entry, a deep-link alias,
 *      a public route; add an unavailable marker) must fail it, a valid register row must pass it;
 *   2. the real removal check: every surface removed since the pre-cleanup baseline (0.4.1, the parent of #45) and since the latest
 *      release manifest maps to an open gap-register row or a retirement-ledger row in tsai-sitedocs.
 *   3. the provenance half (T2.1): its own gate, then the real sidecar, STRICT: every routed surface states its
 *      live source, an open register row, or that it renders no domain data (`pnpm check:provenance` is the same).
 * Reads tsai-sitedocs from TSAI_SITEDOCS_DIR (default ../tsai-sitedocs) at TSAI_SITEDOCS_REF (default origin/main).
 */
import { config } from "./surface-guard/config";
import { formatProvenanceReport, formatReport, repoRootFrom, runCheck, runProvenanceCheck } from "./surface-guard/core";
import { loadMap } from "./surface-guard/cli";
import { runProvenanceSelfTest, runSelfTest } from "./surface-guard/selftest";

const root = repoRootFrom(process.cwd());

const checks = runSelfTest({
  root,
  config,
  pageForMarker: "src/app/pricing/page.tsx",
  unavailableSnippet: 'export const Probe = () => <div data-testid="surface-guard-probe-unavailable" />;',
  unavailableId: "unavailable:testid:surface-guard-probe-unavailable",
  // The Portal extracts no gate and no superadmin lock (the self-test fails if it ever does without a mutation here).
  mutations: [],
});
console.log(`✅ surface-guard self-test: ${checks} mutation and refusal checks behave`);

const result = runCheck({ repoRoot: root, config, map: loadMap() });
console.log(formatReport(result, config.app));
if (!result.ok) {
  console.error("❌ test-surface-guard: unapproved removals (see above). Record each in the gap register, then map it.");
  process.exit(1);
}
console.log("✅ test-surface-guard: every removal maps to the register or the ledger");

const pchecks = runProvenanceSelfTest({ root, config });
console.log(`✅ surface-guard provenance self-test: ${pchecks} checks behave`);
const prov = runProvenanceCheck({ repoRoot: root, config });
console.log(formatProvenanceReport(prov, config.app, true));
// The Portal states provenance for every routed surface, so its suite runs the STRICT form.
if (!prov.complete) {
  console.error("❌ test-surface-guard: invalid or missing provenance entries (see above).");
  process.exit(1);
}
console.log(`✅ test-surface-guard: every routed surface states its provenance`);
