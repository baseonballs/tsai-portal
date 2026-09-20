//
//  test-tournament-war-room-workbench.ts
//  tsai-portal
//
//  Transcend Platform - Patent Candidate P398 (TSAI-PAT-P398)
//  Multi-Camera Cross-Sheet Tournament War Room Centralizer Test Suite
//

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_ALERTS,
  DEFAULT_SHEETS,
} from "../src/components/review/TournamentWarRoomWorkbench";

console.log("================================================================================");
console.log("🏒 RUNNING TOURNAMENT WAR ROOM WORKBENCH TESTS (PATENT P398)");
console.log("================================================================================");

// 1. Data Model Verification
assert.ok(DEFAULT_SHEETS.length >= 3, "Must have at least 3 active tournament sheets");
assert.ok(DEFAULT_ALERTS.length >= 2, "Must have initial incident alerts");

const criticalAlert = DEFAULT_ALERTS.find((a) => a.severity === "critical");
assert.ok(criticalAlert, "Critical severity alert must exist for concussion screening");
assert.strictEqual(criticalAlert?.sheetId, "sheet-1", "Critical alert mapped to sheet-1");
console.log("✓ TournamentWarRoom state contracts and alert models validated.");

// 2. Zero-Purple AST / Token Audit
const componentPath = path.resolve(
  __dirname,
  "../src/components/review/TournamentWarRoomWorkbench.tsx"
);
const componentSource = fs.readFileSync(componentPath, "utf-8");

const forbiddenPurplePatterns = [
  /purple/i,
  /violet/i,
  /indigo/i,
  /#8[0-9a-fA-F]{5}/,
  /#7[0-9a-fA-F]{5}/,
];

for (const pattern of forbiddenPurplePatterns) {
  assert.ok(
    !pattern.test(componentSource),
    `Violation: Component source contains forbidden chromatic token: ${pattern}`
  );
}
console.log("✓ Zero-Purple invariant satisfied in TournamentWarRoomWorkbench.tsx.");

// 3. File Line Limit (INV-5) Audit
const lines = componentSource.split("\n").length;
assert.ok(
  lines < 300,
  `Violation: Component file must stay below 300 lines (current: ${lines})`
);
console.log(`✓ Component line count invariant satisfied: ${lines} lines (< 300 lines).`);

const typesPath = path.resolve(
  __dirname,
  "../src/types/tournament-war-room-portal-types.ts"
);
const typeLines = fs.readFileSync(typesPath, "utf-8").split("\n").length;
assert.ok(
  typeLines < 300,
  `Violation: Types file must stay below 300 lines (current: ${typeLines})`
);
console.log(`✓ Types line count invariant satisfied: ${typeLines} lines (< 300 lines).`);

console.log("================================================================================");
console.log("🎉 ALL TOURNAMENT WAR ROOM WORKBENCH TESTS PASSED (100%)");
console.log("================================================================================");
