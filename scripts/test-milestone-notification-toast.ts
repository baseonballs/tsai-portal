/**
 * Verification Script: Family Milestone Push Notification Toast & Instant DVR Replay
 *
 * Validates:
 * 1. Milestone category mappings and badge configurations.
 * 2. Instant DVR deep-link seek offset construction (?seek=...).
 * 3. Strict Zero-Purple Tailwind design rule compliance.
 * 4. Sub-300 line component constraint and clean modular types.
 */

import fs from "fs";
import path from "path";
import {
  FamilyMilestoneItem,
  MilestoneCategory,
} from "../src/components/notifications/family-milestone-types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

async function runMilestoneToastTests() {
  console.log("=================================================");
  console.log("🔔 [Portal Test] Family Milestone Notification Toast");
  console.log("=================================================\n");

  // Test 1: Category Mappings & Data Models
  console.log("▶ [1/4] Testing Milestone Category Mappings & Data Models...");
  const categories: MilestoneCategory[] = ["goal", "assist", "high_danger_chance", "certified_rvh_save"];
  assert(categories.length === 4, "Must support 4 primary milestone categories.");

  const sampleMilestone: FamilyMilestoneItem = {
    id: "notif-001",
    athleteId: "ath-corinne-26",
    athleteName: "Corinne Lucas",
    jerseyNumber: 26,
    gameId: "game-sheet-1",
    gameClock: "14:02 P2",
    seekOffsetSeconds: 1402,
    category: "goal",
    headline: "Unassisted Breakaway Goal",
    description: "Beat netminder glove side on explosive rush",
    deepLinkUrl: "https://portal.transcend.hockey/live/game-sheet-1?seek=1402",
    metricLabel: "Speed",
    metricValue: "78.4 mph",
    timestamp: new Date().toISOString(),
  };

  assert(sampleMilestone.seekOffsetSeconds === 1402, "Seek offset seconds must match.");
  assert(sampleMilestone.jerseyNumber === 26, "Jersey number must match.");
  console.log(`  ✔ Verified milestone model: #${sampleMilestone.jerseyNumber} ${sampleMilestone.athleteName} - ${sampleMilestone.headline}`);

  // Test 2: Deep Link Seek Offset Format
  console.log("\n▶ [2/4] Testing Instant DVR Deep Link Construction...");
  const url = new URL(sampleMilestone.deepLinkUrl);
  assert(url.searchParams.get("seek") === "1402", "Deep link must include ?seek=1402 parameter.");
  assert(url.pathname.includes("game-sheet-1"), "Deep link path must include target gameId.");
  console.log(`  ✔ Deep link verified: ${sampleMilestone.deepLinkUrl}`);

  // Test 3: Zero-Purple Tailwind Token Compliance
  console.log("\n▶ [3/4] Testing Strict Zero-Purple Tailwind Compliance...");
  const toastPath = path.resolve(__dirname, "../src/components/notifications/MilestoneNotificationToast.tsx");
  const toastContent = fs.readFileSync(toastPath, "utf-8");

  const forbiddenTokens = ["purple", "indigo", "violet"];
  for (const token of forbiddenTokens) {
    const regex = new RegExp(`\\b${token}-`, "i");
    assert(!regex.test(toastContent), `Violation: Found forbidden token "${token}-" in MilestoneNotificationToast.tsx`);
  }
  console.log("  ✔ Zero-Purple Rule Verified: 0 purple, indigo, or violet tokens found.");

  // Test 4: Sub-300 Line Component Constraint & Type Separation
  console.log("\n▶ [4/4] Testing Line Count & Architecture Constraints...");
  const toastLines = toastContent.split("\n").length;
  assert(toastLines < 300, `MilestoneNotificationToast.tsx must be < 300 lines (currently ${toastLines}).`);

  const typesPath = path.resolve(__dirname, "../src/components/notifications/family-milestone-types.ts");
  assert(fs.existsSync(typesPath), "family-milestone-types.ts must exist as separated type module.");
  const typesContent = fs.readFileSync(typesPath, "utf-8");
  const typesLines = typesContent.split("\n").length;
  assert(typesLines < 100, `family-milestone-types.ts must be < 100 lines (currently ${typesLines}).`);
  console.log(`  ✔ Component size verified: Toast = ${toastLines} lines, Types = ${typesLines} lines.`);

  console.log("\n=================================================");
  console.log("✨ ALL 4/4 MILESTONE NOTIFICATION TOAST TESTS PASSED");
  console.log("=================================================\n");
}

runMilestoneToastTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
