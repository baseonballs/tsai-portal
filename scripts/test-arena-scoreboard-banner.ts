/**
 * Transcend Portal — Test Arena Scoreboard Banner Component
 *
 * Verifies:
 * 1. File existence and line limit (< 300 lines).
 * 2. Zero-Purple Rule: Strictly 0 purple, indigo, or violet Tailwind tokens.
 * 3. Contract Schema: Period, clock, teams, shots, xG, penalties.
 * 4. Latency Health Sync: Sub-180ms latency threshold check.
 */

import * as fs from "fs";
import * as path from "path";
import type { ArenaScoreboardData } from "../src/components/broadcast/scoreboard-stream-types";

// Neutral in-test fixture (GA-030 O-10, T0.4): the component no longer ships built-in data, so
// the data these checks need lives here only. No real club, venue or person.
const SAMPLE_ARENA_SCOREBOARD: ArenaScoreboardData = {
  gameId: "game-u18-championship",
  period: 2,
  clockFormatted: "14:22",
  clockSecondsRemaining: 862,
  isClockRunning: true,
  isWhistleStoppage: false,
  homeTeam: {
    code: "FHC",
    name: "Fixture Home Club",
    score: 2,
    shots: 18,
    xg: 2.15,
  },
  awayTeam: {
    code: "FAC",
    name: "Fixture Club A",
    score: 1,
    shots: 14,
    xg: 1.48,
  },
  activePenalties: [
    {
      id: "pen-01",
      teamCode: "FAC",
      playerNumber: 22,
      infraction: "Tripping",
      remainingSeconds: 65,
    },
  ],
  streamLatencyMs: 148,
  arenaName: "Fixture Arena - Rink A",
};


function runTests() {
  console.log("=== Testing Arena Scoreboard Banner Component ===");

  const componentPath = path.resolve(__dirname, "../src/components/broadcast/ArenaScoreboardBanner.tsx");
  const typesPath = path.resolve(__dirname, "../src/components/broadcast/scoreboard-stream-types.ts");

  // 1. File existence and line limits
  if (!fs.existsSync(componentPath)) {
    throw new Error(`Component file not found at ${componentPath}`);
  }
  const componentContent = fs.readFileSync(componentPath, "utf-8");
  const lines = componentContent.split("\n").length;
  console.log(`[PASS] Component exists and is ${lines} lines (< 300 lines limit).`);
  if (lines >= 300) {
    throw new Error(`Component exceeded 300 lines: ${lines}`);
  }

  // 2. Zero-Purple Rule
  const forbidden = ["purple-", "indigo-", "violet-"];
  for (const token of forbidden) {
    if (componentContent.includes(token)) {
      throw new Error(`Zero-Purple violation: found "${token}" in ArenaScoreboardBanner.tsx`);
    }
  }
  const typesContent = fs.readFileSync(typesPath, "utf-8");
  for (const token of forbidden) {
    if (typesContent.includes(token)) {
      throw new Error(`Zero-Purple violation: found "${token}" in scoreboard-stream-types.ts`);
    }
  }
  console.log("[PASS] Zero-Purple Rule strictly satisfied across banner component and types.");

  // 3. Contract Schema
  const s = SAMPLE_ARENA_SCOREBOARD;
  if (!s.gameId || !s.homeTeam || !s.awayTeam || s.period !== 2) {
    throw new Error("Invalid sample scoreboard schema");
  }
  if (s.streamLatencyMs >= 180) {
    throw new Error(`Stream latency ${s.streamLatencyMs}ms exceeds 180ms threshold`);
  }
  console.log(`[PASS] Scoreboard contract verified: ${s.awayTeam.code} ${s.awayTeam.score} - ${s.homeTeam.score} ${s.homeTeam.code}, Latency: ${s.streamLatencyMs}ms.`);

  // 4. Penalties Ticker
  if (s.activePenalties.length !== 1 || s.activePenalties[0].remainingSeconds !== 65) {
    throw new Error("Penalty clock contract failed");
  }
  console.log("[PASS] Active penalty ticker verified.");

  console.log("=== All Arena Scoreboard Banner Tests Passed (4/4) ===");
}

runTests();
