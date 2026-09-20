//
//  test-voronoi-passing-lane-workbench.ts
//  tsai-portal
//

import fs from "fs";
import path from "path";
import {
  DEFAULT_PASSER,
  DEFAULT_RECEIVER,
  DEFAULT_DEFENDERS,
} from "../src/components/tactics/VoronoiPassingLaneWorkbench";

function runTests() {
  console.log("=== Testing VoronoiPassingLaneWorkbench and Types ===");

  // 1. Verify default values
  if (!DEFAULT_PASSER || !DEFAULT_RECEIVER || DEFAULT_DEFENDERS.length !== 3) {
    throw new Error("Default node definitions are invalid");
  }
  console.log("✓ Default skater and defender nodes initialized correctly");

  // 2. Verify sub-300 lines invariant
  const componentPath = path.resolve(__dirname, "../src/components/tactics/VoronoiPassingLaneWorkbench.tsx");
  const componentContent = fs.readFileSync(componentPath, "utf-8");
  const lines = componentContent.split("\n").length;
  if (lines > 300) {
    throw new Error(`File ${componentPath} exceeds 300 lines: ${lines} lines`);
  }
  console.log(`✓ Line count invariant satisfied: ${lines} lines (< 300)`);

  // 3. Verify Zero Unanchored Purple invariant
  const purpleRegex = /\b(purple|fuchsia|violet)\b/i;
  if (purpleRegex.test(componentContent)) {
    throw new Error("Violation of INV-4: purple/fuchsia/violet found in VoronoiPassingLaneWorkbench.tsx");
  }
  console.log("✓ INV-4 Zero Unanchored Purple verified");

  console.log("=== All Voronoi Passing Lane Workbench tests passed! ===");
}

runTests();
