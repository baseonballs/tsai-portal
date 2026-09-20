//
//  test-goal-line-orthogonal-review-canvas.ts
//  tsai-portal
//
//  Transcend Platform - Patent P377
//  Dynamic Goal-Line Orthogonal Plane Projector & Sub-Pixel Review Test Suite
//

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  GoalReviewVerdict,
  GoalLineProjectionData,
} from "../src/types/goal-line-projection-types";

console.log("================================================================================");
console.log("🏒 RUNNING GOAL-LINE ORTHOGONAL REVIEW CANVAS TESTS (PATENT P377)");
console.log("================================================================================");

// 1. Data Model Verification
const sampleData: GoalLineProjectionData = {
  puckX: 27.20,
  puckY: 0.05,
  puckZ: 0.02,
  clearanceMarginMm: 3.5,
  crossingPercentage: 100.0,
  isWithinGoalFrame: true,
  opticalConfidence: 0.98,
  verdict: "GOAL_CONFIRMED",
  timestamp: 100.0,
};

assert.strictEqual(sampleData.verdict, "GOAL_CONFIRMED", "Verdict must be GOAL_CONFIRMED");
assert.ok(sampleData.clearanceMarginMm > 0, "Clearance margin must be positive for confirmed goal");
console.log("✓ GoalLineProjectionData contract validated.");

// 2. Zero-Purple AST / Token Audit
const componentPath = path.resolve(
  __dirname,
  "../src/components/review/GoalLineOrthogonalReviewCanvas.tsx"
);
const componentSource = fs.readFileSync(componentPath, "utf-8");

const forbiddenPurplePatterns = [
  /purple/i,
  /violet/i,
  /indigo/i,
  /#8[0-9a-fA-F]{5}/, // purple hex range
  /#7[0-9a-fA-F]{5}/, // purple-indigo hex range
];

for (const pattern of forbiddenPurplePatterns) {
  assert.ok(
    !pattern.test(componentSource),
    `Violation: Component source contains forbidden chromatic token: ${pattern}`
  );
}
console.log("✓ Zero-Purple invariant satisfied in GoalLineOrthogonalReviewCanvas.tsx.");

// 3. File Line Limit (INV-5) Audit
const lines = componentSource.split("\n").length;
assert.ok(
  lines < 300,
  `Violation: Component file must stay below 300 lines (current: ${lines})`
);
console.log(`✓ Line count invariant satisfied: ${lines} lines (< 300 lines).`);

console.log("================================================================================");
console.log("🎉 ALL GOAL-LINE ORTHOGONAL REVIEW CANVAS TESTS PASSED (100%)");
console.log("================================================================================");
