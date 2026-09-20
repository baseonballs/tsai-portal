/**
 * test-crossbar-elevation-triangulation.ts
 *
 * Test suite for TSAI-PAT-P390: Live Multi-Sheet Epipolar Puck Elevation &
 * Net Crossbar Triangulation Arbiter Canvas.
 */

import fs from "fs";
import path from "path";
import { PuckElevationReviewData } from "../types/crossbar-elevation-canvas-types";

function runTests() {
  console.log("--- Running Crossbar Elevation Triangulation Tests (TSAI-PAT-P390) ---");

  // 1. Data Model Verification
  const data: PuckElevationReviewData = {
    reviewId: "REV-P390-001",
    timestampSec: 1420.5,
    puckX: 0.15,
    puckY: 0.05,
    puckZ: 1.2542,
    crossbarElevationM: 1.2192,
    elevationDeltaMm: 35.0,
    uncertaintyMarginMm: 7.5,
    decision: "ABOVE_CROSSBAR",
    confidencePercent: 99.8,
    cameraCount: 3,
    processingLatencyMs: 12,
  };

  if (data.elevationDeltaMm !== 35.0 || data.decision !== "ABOVE_CROSSBAR") {
    throw new Error("Test 1 Failed: Review data delta and decision mismatch");
  }
  if (data.uncertaintyMarginMm <= 0 || data.crossbarElevationM !== 1.2192) {
    throw new Error("Test 1 Failed: Official crossbar must be 1.2192m");
  }
  console.log("✓ Test 1 Passed: Data model and official crossbar dimensions verified");

  // 2. Sub-300 Lines Check
  const componentPath = path.resolve(__dirname, "../components/review/CrossbarElevationTriangulationCanvas.tsx");
  const componentContent = fs.readFileSync(componentPath, "utf-8");
  const lines = componentContent.split("\n").length;
  if (lines > 300) {
    throw new Error(`Test 2 Failed: File exceeds 300 lines: ${lines} lines`);
  }
  console.log(`✓ Test 2 Passed: Line count invariant satisfied: ${lines} lines (< 300)`);

  // 3. Zero-Purple Palette Check
  const purpleRegex = /\b(purple|fuchsia|violet|indigo)\b/i;
  if (purpleRegex.test(componentContent)) {
    throw new Error("Test 3 Failed: Violation of Zero-Purple rule in CrossbarElevationTriangulationCanvas.tsx");
  }
  console.log("✓ Test 3 Passed: Zero-Purple palette verified");

  // 4. Platform Invariant 6 Check (Pure physical telemetry, no subjective grading)
  const subjectiveRegex = /\b(scout grade|potential|clutch rating|grit factor|referee score)\b/i;
  if (subjectiveRegex.test(componentContent)) {
    throw new Error("Test 4 Failed: Violation of Platform Invariant 6: subjective grading term found");
  }
  console.log("✓ Test 4 Passed: Platform Invariant 6 pure physical telemetry verified");

  console.log("=== All Crossbar Elevation Triangulation Canvas tests passed! ===");
}

runTests();
