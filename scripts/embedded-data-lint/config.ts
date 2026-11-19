/**
 * embedded-data-lint configuration for Portal (T2.3). The engine is `core.ts` (identical in the four apps).
 * Runtime code is everything under `src/` that ships: tests, `src/scripts/` and fixtures are excluded by the engine.
 * An allow entry needs an exact file, one rule, a gap-register row id and a reason (no wildcards).
 */
import type { LintConfig } from "./core";

export const config: LintConfig = {
  app: "Portal",
  roots: ["src"],
  allow: [],
};
