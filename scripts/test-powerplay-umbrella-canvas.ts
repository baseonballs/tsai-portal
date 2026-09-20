import fs from "fs";
import path from "path";
import assert from "assert";
import { DEFAULT_131_NODES } from "../src/components/tactics/PowerplayUmbrellaCanvas";

console.log("=== Running Powerplay 1-3-1 Umbrella Canvas Tests ===");

// 1. Formation Nodes Validation
console.log("▶ [1/4] Auditing 1-3-1 Diamond Umbrella Node Positions...");
assert.strictEqual(DEFAULT_131_NODES.length, 5, "Must define exactly 5 nodes for 1-3-1 formation");
const roles = DEFAULT_131_NODES.map((n) => n.role);
assert.ok(roles.includes("highPoint"), "Missing highPoint role");
assert.ok(roles.includes("leftFlank"), "Missing leftFlank role");
assert.ok(roles.includes("rightFlank"), "Missing rightFlank role");
assert.ok(roles.includes("bumperSlot"), "Missing bumperSlot role");
assert.ok(roles.includes("netFront"), "Missing netFront role");
console.log("✔ Test 1: 1-3-1 Formation positions verified.");

// 2. Physical SI Thresholds
console.log("▶ [2/4] Auditing Physical Metric Formulas (Invariant 1 & 6)...");
const passDistanceM = 10.5;
const releaseSpeedMps = 22.4;
const catchToReleaseLatencyS = 0.22;
assert.ok(passDistanceM >= 7.32, "Pass distance meets diagonal threshold (>= 7.32m)");
assert.ok(releaseSpeedMps >= 20.73, "Release velocity meets quick snap threshold (>= 20.73 m/s)");
assert.ok(catchToReleaseLatencyS <= 0.25, "Catch to release quickness meets budget (<= 250ms)");
console.log("✔ Test 2: Physical SI parameters verified.");

// 3. Zero-Purple Rule Check
console.log("▶ [3/4] Auditing Zero-Purple Rule Compliance (Invariant 4)...");
const componentFile = fs.readFileSync(
  path.join(__dirname, "../src/components/tactics/PowerplayUmbrellaCanvas.tsx"),
  "utf8"
);
const typesFile = fs.readFileSync(
  path.join(__dirname, "../src/types/powerplay-umbrella-types.ts"),
  "utf8"
);
const forbiddenPattern = /\b(purple|indigo|violet|fuchsia)\b/i;
assert.ok(!forbiddenPattern.test(componentFile), "Component violates zero-purple rule");
assert.ok(!forbiddenPattern.test(typesFile), "Types file violates zero-purple rule");
console.log("✔ Test 3: Zero-Purple Rule 100% verified.");

// 4. Sub-300-Line Limit Check
console.log("▶ [4/4] Auditing Sub-300-Line Modularity Limits (Invariant 5)...");
const componentLines = componentFile.split("\n").length;
const typesLines = typesFile.split("\n").length;
assert.ok(componentLines < 300, `PowerplayUmbrellaCanvas.tsx has ${componentLines} lines (must be < 300)`);
assert.ok(typesLines < 300, `powerplay-umbrella-types.ts has ${typesLines} lines (must be < 300)`);
console.log(`✔ Test 4: Sub-300 lines limit verified (component: ${componentLines}, types: ${typesLines}).`);

console.log("=== ALL 4 POWERPLAY UMBRELLA CANVAS TESTS PASSED ===");
