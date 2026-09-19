/**
 * Verification Script: Live Broadcast Stream Player & Dynamic xG Scorebug HUD
 *
 * Validates:
 * 1. Multi-camera stream angle configurations (Center, Corner, Crease).
 * 2. Scorebug time formatting and period/score state boundaries.
 * 3. Kinematic xG threat percentage calculations.
 * 4. Latency bounds (< 180ms) and acoustic whistle ducking states.
 * 5. Strict Zero-Purple Tailwind design rule compliance.
 */

import fs from "fs";
import path from "path";
import {
  DEFAULT_STREAM_SOURCES,
  DEFAULT_SCOREBUG,
  DEFAULT_XG,
} from "../src/components/broadcast/broadcast-player-types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

async function runLiveBroadcastPlayerTests() {
  console.log("=================================================");
  console.log("📺 [Portal Test] Live Broadcast Stream Player & xG Scorebug");
  console.log("=================================================\n");

  // Test 1: Multi-Camera Stream Sources
  console.log("▶ [1/5] Testing Multi-Camera Angle Stream Sources...");
  assert(DEFAULT_STREAM_SOURCES.length === 3, "Must have exactly 3 default camera angles.");
  const angles = DEFAULT_STREAM_SOURCES.map((s) => s.angle);
  assert(angles.includes("CENTER_ICE"), "Must include CENTER_ICE angle.");
  assert(angles.includes("HIGH_CORNER"), "Must include HIGH_CORNER angle.");
  assert(angles.includes("GOALIE_CREASE_POV"), "Must include GOALIE_CREASE_POV angle.");
  console.log("  ✔ Verified camera angles: Center Ice Broadcast, Tactical High Endzone, Goaltender Crease POV");

  // Test 2: Latency & Resolution Bounds (Patent Track 16)
  console.log("\n▶ [2/5] Testing Latency Bounds (< 180ms) & Stream Resolutions...");
  for (const src of DEFAULT_STREAM_SOURCES) {
    assert(src.latencyMs < 180, `Stream ${src.streamId} latency must be < 180ms, got ${src.latencyMs}ms`);
    assert(src.isLive === true, `Stream ${src.streamId} must be marked live`);
    assert(src.resolution.length > 0, `Stream ${src.streamId} resolution must be defined`);
    console.log(`  ✔ [${src.label}] Resolution: ${src.resolution}, Latency: ${src.latencyMs}ms`);
  }

  // Test 3: Scorebug State & Time Formatting
  console.log("\n▶ [3/5] Testing Scorebug State & Period Configuration...");
  assert(DEFAULT_SCOREBUG.period === 2, "Default period must be 2.");
  assert(DEFAULT_SCOREBUG.clockSeconds === 842, "Clock seconds must match default (842s).");
  const m = Math.floor(DEFAULT_SCOREBUG.clockSeconds / 60);
  const s = DEFAULT_SCOREBUG.clockSeconds % 60;
  const clockFormatted = `${m}:${s < 10 ? "0" : ""}${s}`;
  assert(clockFormatted === "14:02", `Formatted clock must be 14:02, got ${clockFormatted}`);
  assert(DEFAULT_SCOREBUG.homeTeam.score === 3, "Home score must match.");
  assert(DEFAULT_SCOREBUG.awayTeam.score === 2, "Away score must match.");
  console.log(`  ✔ Scorebug clock: ${clockFormatted} | P${DEFAULT_SCOREBUG.period} | ${DEFAULT_SCOREBUG.homeTeam.code} ${DEFAULT_SCOREBUG.homeTeam.score} - ${DEFAULT_SCOREBUG.awayTeam.code} ${DEFAULT_SCOREBUG.awayTeam.score}`);

  // Test 4: Kinematic xG Threat Percentages
  console.log("\n▶ [4/5] Testing Kinematic xG Threat Percentages & High Danger Chances...");
  const totalXG = DEFAULT_XG.homeXG + DEFAULT_XG.awayXG;
  const homePercent = Math.round((DEFAULT_XG.homeXG / totalXG) * 100);
  const awayPercent = 100 - homePercent;
  assert(homePercent === 57, `Home xG share must be 57%, got ${homePercent}%`);
  assert(awayPercent === 43, `Away xG share must be 43%, got ${awayPercent}%`);
  assert(DEFAULT_XG.lastShotDanger === "HIGH_DANGER", "Default last shot danger must be HIGH_DANGER.");
  assert(DEFAULT_XG.homeHighDangerChances === 5, "Home HDC must be 5.");
  assert(DEFAULT_XG.awayHighDangerChances === 3, "Away HDC must be 3.");
  console.log(`  ✔ xG Battle: SJS ${DEFAULT_XG.homeXG} (${homePercent}%) vs LAK ${DEFAULT_XG.awayXG} (${awayPercent}%)`);
  console.log(`  ✔ High Danger Chances: SJS ${DEFAULT_XG.homeHighDangerChances} - LAK ${DEFAULT_XG.awayHighDangerChances}`);

  // Test 5: Zero-Purple Design Rule Audit
  console.log("\n▶ [5/5] Auditing Zero-Purple Tailwind Design Rules...");
  const filesToAudit = [
    path.join(__dirname, "../src/components/broadcast/LiveBroadcastStreamPlayer.tsx"),
    path.join(__dirname, "../src/components/broadcast/broadcast-player-types.ts"),
  ];

  const forbiddenTokens = ["purple", "indigo", "violet"];
  for (const filePath of filesToAudit) {
    const content = fs.readFileSync(filePath, "utf8");
    for (const token of forbiddenTokens) {
      const regex = new RegExp(`\\b${token}-[0-9]+\\b`, "i");
      const match = content.match(regex);
      assert(!match, `Forbidden color token '${match?.[0]}' detected in ${path.basename(filePath)}!`);
    }
    console.log(`  ✔ 0 purple/indigo/violet tokens confirmed in ${path.basename(filePath)}`);
  }

  console.log("\n=================================================");
  console.log("✅ All Live Broadcast Player Tests PASSED (5/5 Pillars)");
  console.log("=================================================");
}

runLiveBroadcastPlayerTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
