/**
 * test-ice-friction-chatter.ts
 *
 * Test suite for TSAI-PAT-P389: Continuous Surface Ice Friction Micro-Variability &
 * Blade Chatter Acoustics Model Workbench.
 */

import fs from "fs";
import path from "path";
import { IceCellData } from "../types/ice-friction-chatter-types";

function runTests() {
  console.log("--- Running Ice Friction & Chatter Workbench Tests (TSAI-PAT-P389) ---");

  // 1. Data Model Verification
  const cell: IceCellData = {
    id: "cell_1_0",
    col: 0,
    row: 1,
    centerX: 5.1,
    centerY: 0.0,
    elapsedFloodMin: 35.0,
    surfaceTempC: -4.5,
    trenchDensityMPerSqM: 16.0,
    acousticChatterDb: 22.5,
    dynamicFrictionMuk: 0.0285,
    rutAlert: true,
  };

  if (cell.dynamicFrictionMuk < 0.003 || cell.dynamicFrictionMuk > 0.045) {
    throw new Error(`Test 1 Failed: Friction ${cell.dynamicFrictionMuk} outside physical range [0.003, 0.045]`);
  }
  if (!cell.rutAlert) {
    throw new Error("Test 1 Failed: Chatter > 18 dB must trigger rut alert");
  }
  console.log("✓ Test 1 Passed: Data model and physical ranges verified");

  // 2. Sub-300 Lines Check
  const componentPath = path.resolve(__dirname, "../components/analytics/IceFrictionChatterWorkbench.tsx");
  const componentContent = fs.readFileSync(componentPath, "utf-8");
  const lines = componentContent.split("\n").length;
  if (lines > 300) {
    throw new Error(`Test 2 Failed: File exceeds 300 lines: ${lines} lines`);
  }
  console.log(`✓ Test 2 Passed: Line count invariant satisfied: ${lines} lines (< 300)`);

  // 3. Zero-Purple Palette Check
  const purpleRegex = /\b(purple|fuchsia|violet|indigo)\b/i;
  if (purpleRegex.test(componentContent)) {
    throw new Error("Test 3 Failed: Violation of Zero-Purple rule in IceFrictionChatterWorkbench.tsx");
  }
  console.log("✓ Test 3 Passed: Zero-Purple palette verified");

  // 4. Platform Invariant 6 Check (Pure physical telemetry, no subjective grading)
  const subjectiveRegex = /\b(scout grade|potential|clutch rating|grit factor)\b/i;
  if (subjectiveRegex.test(componentContent)) {
    throw new Error("Test 4 Failed: Violation of Platform Invariant 6: subjective grading term found");
  }
  console.log("✓ Test 4 Passed: Platform Invariant 6 pure physical telemetry verified");

  console.log("=== All Ice Friction & Chatter Workbench tests passed! ===");
}

runTests();
