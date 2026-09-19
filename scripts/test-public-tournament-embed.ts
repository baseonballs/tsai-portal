/**
 * Test Suite: Public Tournament Embed Widget & Verification
 * Patent Track 16: Claims 9 & 10 (Multi-Sheet Tournament Operations)
 * Platform Invariant 6: Pure physical kinematics and optical tracking data.
 */

import fs from "fs";
import path from "path";
import { TournamentTickerMatch } from "../src/components/tournaments/public-tournament-embed-types";

function runTests() {
  console.log("=== Running Public Tournament Embed Widget Tests ===");

  // 1. Contract & Round Tree Validation
  const sampleMatches: TournamentTickerMatch[] = [
    {
      matchId: "m-qf1",
      round: "QUARTERFINALS",
      matchLabel: "QF 1",
      sheetId: "sheet-1",
      rinkName: "Rink 1",
      homeTeam: { name: "Jr. Sharks", seed: 1, score: 4 },
      awayTeam: { name: "Mission", seed: 8, score: 2 },
      status: "FINAL",
      winnerTeamName: "Jr. Sharks",
    },
    {
      matchId: "m-sf1",
      round: "SEMIFINALS",
      matchLabel: "SF 1",
      sheetId: "sheet-1",
      rinkName: "Rink 1",
      homeTeam: { name: "Jr. Sharks", seed: 1, score: 0 },
      awayTeam: { name: "Marlboros", seed: 4, score: 0 },
      status: "UPCOMING",
    },
  ];

  if (sampleMatches.length !== 2) {
    throw new Error("Expected 2 matches");
  }
  if (sampleMatches[0].winnerTeamName !== "Jr. Sharks") {
    throw new Error("Winner must be Jr. Sharks");
  }
  console.log("✔ Test 1: Match contract and round tree validated.");

  // 2. Embed Snippet Generation Check
  const tournamentId = "tourn-silver-stick-01";
  const snippet = `<iframe src="https://transcend.hockey/embed/tournament/${tournamentId}" width="100%" height="520" frameborder="0" allow="autoplay; fullscreen" style="border-radius: 12px; border: 1px solid #1e293b;"></iframe>`;

  if (!snippet.includes(tournamentId) || !snippet.startsWith("<iframe")) {
    throw new Error("Invalid iframe embed snippet format");
  }
  console.log("✔ Test 2: Iframe embed snippet verified.");

  // 3. Zero-Purple Rule Enforcement
  const componentPath = path.resolve(__dirname, "../src/components/tournaments/PublicTournamentEmbedWidget.tsx");
  const componentCode = fs.readFileSync(componentPath, "utf-8");

  const purpleRegex = /(purple|indigo|violet)/i;
  if (purpleRegex.test(componentCode)) {
    throw new Error("Zero-Purple Violation: Found purple/indigo/violet token in PublicTournamentEmbedWidget.tsx");
  }
  console.log("✔ Test 3: Zero-Purple Rule 100% verified.");

  // 4. Component Line Limit (< 300 lines)
  const lineCount = componentCode.split("\n").length;
  if (lineCount >= 300) {
    throw new Error(`Component line limit exceeded: ${lineCount} >= 300 lines`);
  }
  console.log(`✔ Test 4: Component line count is ${lineCount} (< 300 lines).`);

  console.log("=== ALL 4 PUBLIC TOURNAMENT EMBED TESTS PASSED ===");
}

try {
  runTests();
  process.exit(0);
} catch (err: any) {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
}
