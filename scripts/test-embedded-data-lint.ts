/**
 * T2.3 embedded-data lint, run by `pnpm test`. The self-test proves the lint FAILS on an introduced roster at a
 * real runtime path and on every bad approval, then that this tree passes (new findings fail; findings already on
 * main are listed in scripts/embedded-data-lint/baseline.json — report mode, a ratchet that only lowers).
 */
import { formatVerdict } from "../scripts/embedded-data-lint/core";
import { config } from "../scripts/embedded-data-lint/config";
import { runLint } from "../scripts/embedded-data-lint/cli";
import { runSelfTest } from "../scripts/embedded-data-lint/selftest";
import { repoRootFrom } from "../scripts/surface-guard/core";

const root = repoRootFrom(process.cwd());
const checks = runSelfTest(root, config, "src/app/pricing/page.tsx");
console.log(formatVerdict(runLint(root), config.app));
console.log(`✅ embedded-data-lint self-test: ${checks} checks passed`);
