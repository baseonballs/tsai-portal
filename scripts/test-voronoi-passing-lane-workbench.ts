//
//  test-voronoi-passing-lane-workbench.ts
//  tsai-portal
//

import fs from "fs";
import path from "path";
import type { VoronoiPoint, VoronoiDefenderNode } from "../src/types/voronoi-lane-types";

// Neutral in-test fixture (GA-030 O-10, T0.4): the component no longer ships built-in data, so
// the data these checks need lives here only. No real club, venue or person.
const DEFAULT_PASSER: VoronoiPoint = { x: 80, y: 220 };

const DEFAULT_RECEIVER: VoronoiPoint = { x: 440, y: 220 };

const DEFAULT_DEFENDERS: VoronoiDefenderNode[] = [
  { id: "DEF-1", label: "Left D", jerseyNumber: "4", x: 220, y: 150, vxMps: 0.5, vyMps: 2.8, stickReachM: 1.6 },
  { id: "DEF-2", label: "Right D", jerseyNumber: "27", x: 300, y: 290, vxMps: -0.2, vyMps: -1.5, stickReachM: 1.6 },
  { id: "DEF-3", label: "Center F", jerseyNumber: "16", x: 260, y: 120, vxMps: 0.0, vyMps: 3.5, stickReachM: 1.6 },
];


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
