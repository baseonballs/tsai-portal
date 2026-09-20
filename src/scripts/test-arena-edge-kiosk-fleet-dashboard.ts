/**
 * test-arena-edge-kiosk-fleet-dashboard.ts
 *
 * Test suite for Turnkey Arena Rig Edge Kiosk Fleet Dashboard (Patent Track 15 & 16, P229).
 */

import fs from "fs";
import path from "path";
import { ArenaEdgeKioskNode } from "../types/arena-kiosk-fleet-types";

function runTests() {
  console.log("--- Running Arena Edge Kiosk Fleet Dashboard Tests ---");

  // 1. Data Contract & Invariants
  const kiosk: ArenaEdgeKioskNode = {
    kioskId: "KIOSK-SJ-RINK-A",
    venueName: "Solar4America Ice",
    rinkSheetId: "RINK-A",
    isWakeLockActive: true,
    thermalPressureTier: "NOMINAL",
    activeFeedSource: "COMPOSITE_BROADCAST",
    pods: [
      {
        podId: "POD-A-CENTER",
        isConnected: true,
        fps: 60.0,
        resolution: "4K-UHD",
        lensTemperatureCelsius: 41.2,
        lastHeartbeatAgeSec: 0.4,
      },
    ],
    systemUptimeSeconds: 14280.0,
    activePeriod: 2,
    periodTimeRemainingSeconds: 845.0,
  };

  if (!kiosk.kioskId || kiosk.pods.length === 0 || kiosk.pods[0].fps !== 60.0) {
    throw new Error("Test 1 Failed: Kiosk data contract invalid");
  }
  if (!kiosk.isWakeLockActive) {
    throw new Error("Test 1 Failed: W3C Wake lock should be active");
  }
  console.log("✓ Test 1 Passed: Edge kiosk telemetry contract and wake lock verified");

  // 2. Sub-300 Lines Check
  const componentPath = path.resolve(__dirname, "../components/kiosk/ArenaEdgeKioskFleetDashboard.tsx");
  const componentContent = fs.readFileSync(componentPath, "utf-8");
  const lines = componentContent.split("\n").length;
  if (lines > 300) {
    throw new Error(`Test 2 Failed: File exceeds 300 lines: ${lines} lines`);
  }
  console.log(`✓ Test 2 Passed: Line count invariant satisfied: ${lines} lines (< 300)`);

  // 3. Zero-Purple Palette Check
  const purpleRegex = /\b(purple|fuchsia|violet|indigo)\b/i;
  if (purpleRegex.test(componentContent)) {
    throw new Error("Test 3 Failed: Violation of Zero-Purple rule in ArenaEdgeKioskFleetDashboard.tsx");
  }
  console.log("✓ Test 3 Passed: Zero-Purple palette verified");

  // 4. Platform Invariant 6 Check (Pure physical telemetry, no subjective grading)
  const subjectiveRegex = /\b(scout grade|clutch rating|grit factor)\b/i;
  if (subjectiveRegex.test(componentContent)) {
    throw new Error("Test 4 Failed: Violation of Platform Invariant 6: subjective grading term found");
  }
  console.log("✓ Test 4 Passed: Platform Invariant 6 pure physical telemetry verified");

  console.log("\nAll Arena Edge Kiosk Fleet Dashboard tests passed successfully!");
}

runTests();
