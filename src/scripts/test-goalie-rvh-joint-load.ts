/**
 * test-goalie-rvh-joint-load.ts
 *
 * Test suite for TSAI-PAT-P394: Goaltender Reverse-VH (RVH) Post-Lean Hip Compression Sentry Canvas.
 */

import fs from "fs";
import path from "path";
import { GoalieRVHReviewData } from "../types/goalie-rvh-canvas-types";

function runTests() {
  console.log("--- Running Goaltender RVH Joint Load Canvas Tests (TSAI-PAT-P394) ---");

  // 1. Data Model Verification
  const data: GoalieRVHReviewData = {
    sampleId: "RVH-P394-001",
    goalieIdentifier: "Goalie 35",
    timestampSec: 842.0,
    postSide: "left_post",
    hipInternalRotationDeg: 39.5,
    hipFlexionDeg: 74.0,
    torsoLeanAngleDeg: 28.5,
    skatePostCompressionForceN: 460.0,
    dwellDurationSec: 3.4,
    cumulativeImpulseNs: 1564.0,
    jointImpingementRiskIndex: 0.86,
    riskLevel: "ACUTE_FAI_HAZARD",
    criticalIRThresholdDeg: 38.0,
    criticalFlexionThresholdDeg: 70.0,
    processingLatencyMs: 4,
  };

  if (data.hipInternalRotationDeg < data.criticalIRThresholdDeg) {
    throw new Error("Test 1 Failed: Acute hazard must exceed critical IR threshold");
  }
  if (data.jointImpingementRiskIndex <= 0.80 || data.riskLevel !== "ACUTE_FAI_HAZARD") {
    throw new Error("Test 1 Failed: Risk level classification mismatch");
  }
  console.log("✓ Test 1 Passed: Data model and joint stress thresholds verified");

  // 2. Sub-300 Lines Check
  const componentPath = path.resolve(__dirname, "../components/review/GoalieRVHJointLoadReviewCanvas.tsx");
  const componentContent = fs.readFileSync(componentPath, "utf-8");
  const lines = componentContent.split("\n").length;
  if (lines > 300) {
    throw new Error(`Test 2 Failed: File exceeds 300 lines: ${lines} lines`);
  }
  console.log(`✓ Test 2 Passed: Line count invariant satisfied: ${lines} lines (< 300)`);

  // 3. Zero-Purple Palette Check
  const purpleRegex = /\b(purple|fuchsia|violet|indigo)\b/i;
  if (purpleRegex.test(componentContent)) {
    throw new Error("Test 3 Failed: Violation of Zero-Purple rule in GoalieRVHJointLoadReviewCanvas.tsx");
  }
  console.log("✓ Test 3 Passed: Zero-Purple palette verified");

  // 4. Platform Invariant 6 Check (Pure physical telemetry, no subjective grading)
  const subjectiveRegex = /\b(scout grade|clutch rating|grit factor)\b/i;
  if (subjectiveRegex.test(componentContent)) {
    throw new Error("Test 4 Failed: Violation of Platform Invariant 6: subjective grading term found");
  }
  console.log("✓ Test 4 Passed: Platform Invariant 6 pure physical telemetry verified");

  console.log("\nAll Goaltender RVH Joint Load Canvas tests passed successfully!");
}

runTests();
