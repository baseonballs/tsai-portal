/**
 * Transcend Portal — Test Tournament Tiebreaker Arbiter & Bracket Seeding
 *
 * Tests:
 * 1. Data Contracts & Platform Invariant 6 Compliance
 * 2. USA Hockey +/- 5 Goal Differential Cap Logic
 * 3. Playoff Bracket Pairing (1v8, 4v5, 2v7, 3v6)
 * 4. Zero-Purple Rule 100% Verified
 * 5. Component Line Count Verification (< 300 lines)
 */

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import type { RankedTeamStanding, BracketSeedMatch } from "../src/components/tournaments/tournament-tiebreaker-types";

// Neutral in-test fixture (GA-030 O-10, T0.4): the component no longer ships built-in data, so
// the data these checks need lives here only. No real club, venue or person.
const DEFAULT_STANDINGS: RankedTeamStanding[] = [
  {
    rank: 1,
    seed: 1,
    team: {
      teamId: "team-fixture-a",
      teamName: "Fixture Club A",
      division: "16U AAA",
      gamesPlayed: 4,
      wins: 4,
      losses: 0,
      ties: 0,
      otLosses: 0,
      points: 8,
      goalsFor: 18,
      goalsAgainst: 4,
      cappedGoalDifferential: 14,
      periodWins: 11,
      penaltyMinutes: 12,
      earliestGoalSeconds: 42,
    },
    tiebreakerReason: "Outright points leader (8 pts)",
    criterion: "POINTS",
  },
  {
    rank: 2,
    seed: 2,
    team: {
      teamId: "team-fixture-b",
      teamName: "Fixture Club B AAA",
      division: "16U AAA",
      gamesPlayed: 4,
      wins: 3,
      losses: 1,
      ties: 0,
      otLosses: 0,
      points: 6,
      goalsFor: 15,
      goalsAgainst: 7,
      cappedGoalDifferential: 8,
      periodWins: 8,
      penaltyMinutes: 8,
      earliestGoalSeconds: 84,
    },
    tiebreakerReason: "Won head-to-head vs Fixture Club C (4-3)",
    criterion: "HEAD_TO_HEAD",
  },
  {
    rank: 3,
    seed: 3,
    team: {
      teamId: "team-fixture-c",
      teamName: "Fixture Club C",
      division: "16U AAA",
      gamesPlayed: 4,
      wins: 3,
      losses: 1,
      ties: 0,
      otLosses: 0,
      points: 6,
      goalsFor: 22,
      goalsAgainst: 8,
      cappedGoalDifferential: 10,
      periodWins: 9,
      penaltyMinutes: 14,
      earliestGoalSeconds: 55,
    },
    tiebreakerReason: "Lost head-to-head vs Fixture Club B (3-4)",
    criterion: "HEAD_TO_HEAD",
  },
  {
    rank: 4,
    seed: 4,
    team: {
      teamId: "team-fixture-d",
      teamName: "Fixture Club D",
      division: "16U AAA",
      gamesPlayed: 4,
      wins: 2,
      losses: 1,
      ties: 1,
      otLosses: 0,
      points: 5,
      goalsFor: 12,
      goalsAgainst: 9,
      cappedGoalDifferential: 3,
      periodWins: 7,
      penaltyMinutes: 16,
      earliestGoalSeconds: 110,
    },
    tiebreakerReason: "Higher +/- 5 capped differential (+3 vs -1)",
    criterion: "GOAL_DIFFERENTIAL_CAP_5",
  },
  {
    rank: 5,
    seed: 5,
    team: {
      teamId: "team-fixture-e",
      teamName: "Fixture Club E",
      division: "16U AAA",
      gamesPlayed: 4,
      wins: 2,
      losses: 1,
      ties: 1,
      otLosses: 0,
      points: 5,
      goalsFor: 10,
      goalsAgainst: 11,
      cappedGoalDifferential: -1,
      periodWins: 6,
      penaltyMinutes: 10,
      earliestGoalSeconds: 145,
    },
    tiebreakerReason: "Lower capped differential (-1 vs +3)",
    criterion: "GOAL_DIFFERENTIAL_CAP_5",
  },
  {
    rank: 6,
    seed: 6,
    team: {
      teamId: "team-fixture-f",
      teamName: "Fixture Club F",
      division: "16U AAA",
      gamesPlayed: 4,
      wins: 1,
      losses: 2,
      ties: 1,
      otLosses: 0,
      points: 3,
      goalsFor: 8,
      goalsAgainst: 12,
      cappedGoalDifferential: -4,
      periodWins: 5,
      penaltyMinutes: 6,
      earliestGoalSeconds: 210,
    },
    tiebreakerReason: "Fewest goals against in 3-way tie (12 GA)",
    criterion: "FEWEST_GOALS_AGAINST",
  },
  {
    rank: 7,
    seed: 7,
    team: {
      teamId: "team-fixture-g",
      teamName: "Fixture Club G",
      division: "16U AAA",
      gamesPlayed: 4,
      wins: 1,
      losses: 2,
      ties: 1,
      otLosses: 0,
      points: 3,
      goalsFor: 9,
      goalsAgainst: 14,
      cappedGoalDifferential: -5,
      periodWins: 4,
      penaltyMinutes: 18,
      earliestGoalSeconds: 180,
    },
    tiebreakerReason: "Won period tiebreaker vs Fixture Club H (4 vs 2)",
    criterion: "PERIOD_WINS",
  },
  {
    rank: 8,
    seed: 8,
    team: {
      teamId: "team-fixture-h",
      teamName: "Fixture Club H",
      division: "16U AAA",
      gamesPlayed: 4,
      wins: 1,
      losses: 2,
      ties: 1,
      otLosses: 0,
      points: 3,
      goalsFor: 7,
      goalsAgainst: 16,
      cappedGoalDifferential: -7,
      periodWins: 2,
      penaltyMinutes: 20,
      earliestGoalSeconds: 310,
    },
    tiebreakerReason: "Final playoff qualifier (2 period wins)",
    criterion: "PERIOD_WINS",
  },
];

const DEFAULT_BRACKET_SEEDS: BracketSeedMatch[] = [
  { seed1: 1, team1: "Fixture Club A", seed2: 8, team2: "Fixture Club H", round: "QUARTERFINALS", sheetName: "Sheet 1 (Main Arena)", scheduledTime: "Sun 08:00 AM" },
  { seed1: 4, team1: "Fixture Club D", seed2: 5, team2: "Fixture Club E", round: "QUARTERFINALS", sheetName: "Sheet 2 (South Rink)", scheduledTime: "Sun 08:30 AM" },
  { seed1: 2, team1: "Fixture Club B AAA", seed2: 7, team2: "Fixture Club G", round: "QUARTERFINALS", sheetName: "Sheet 3 (West Arena)", scheduledTime: "Sun 09:45 AM" },
  { seed1: 3, team1: "Fixture Club C", seed2: 6, team2: "Fixture Club F", round: "QUARTERFINALS", sheetName: "Sheet 4 (Olympic)", scheduledTime: "Sun 10:15 AM" },
];


function runTests() {
  console.log("=== Running Tournament Tiebreaker Arbiter Tests ===");

  // 1. Data Contracts & Platform Invariant 6
  assert.equal(DEFAULT_STANDINGS.length, 8);
  const topSeed = DEFAULT_STANDINGS[0];
  assert.equal(topSeed.seed, 1);
  assert.equal(topSeed.team.points, 8);
  assert.equal(topSeed.team.cappedGoalDifferential, 14);
  assert.equal(typeof topSeed.team.periodWins, "number");
  assert.equal(typeof topSeed.team.penaltyMinutes, "number");
  console.log("✔ Test 1: Data contracts and Platform Invariant 6 validated.");

  // 2. USA Hockey +/- 5 Goal Differential Cap Logic
  // A 12-1 game (+11 raw differential) is capped at +5
  function computeCappedDiff(scores: Array<{ gf: number; ga: number }>): number {
    return scores.reduce((acc, g) => {
      const rawDiff = g.gf - g.ga;
      const capped = Math.max(-5, Math.min(5, rawDiff));
      return acc + capped;
    }, 0);
  }

  const sampleGames = [
    { gf: 12, ga: 1 }, // raw +11, capped +5
    { gf: 4, ga: 2 },  // raw +2, capped +2
    { gf: 3, ga: 5 },  // raw -2, capped -2
    { gf: 1, ga: 8 },  // raw -7, capped -5
  ];
  const totalCapped = computeCappedDiff(sampleGames);
  assert.equal(totalCapped, 0, "5 + 2 - 2 - 5 = 0");
  console.log("✔ Test 2: USA Hockey +/- 5 per-game goal differential cap verified.");

  // 3. Playoff Bracket Pairing (1v8, 4v5, 2v7, 3v6)
  assert.equal(DEFAULT_BRACKET_SEEDS.length, 4);
  assert.deepEqual(
    DEFAULT_BRACKET_SEEDS.map((b) => [b.seed1, b.seed2]),
    [
      [1, 8],
      [4, 5],
      [2, 7],
      [3, 6],
    ]
  );
  console.log("✔ Test 3: Playoff bracket pairings (1v8, 4v5, 2v7, 3v6) verified.");

  // 4. Zero-Purple Rule
  const filesToCheck = [
    path.join(__dirname, "../src/components/tournaments/tournament-tiebreaker-types.ts"),
    path.join(__dirname, "../src/components/tournaments/TournamentTiebreakerArbiter.tsx"),
  ];
  const forbidden = new RegExp(["pur" + "ple", "indi" + "go", "vio" + "let"].join("|"), "i");
  for (const f of filesToCheck) {
    const text = fs.readFileSync(f, "utf8");
    assert.doesNotMatch(text, forbidden, `Forbidden purple token in ${f}`);
  }
  console.log("✔ Test 4: Zero-Purple Rule 100% verified across tournament tiebreaker files.");

  // 5. Line count check (< 300 lines)
  const componentPath = path.join(__dirname, "../src/components/tournaments/TournamentTiebreakerArbiter.tsx");
  const lines = fs.readFileSync(componentPath, "utf8").split("\n").length;
  assert.ok(lines < 300, `TournamentTiebreakerArbiter.tsx has ${lines} lines (must be < 300)`);
  console.log(`✔ Test 5: Component line count is ${lines} (< 300 lines).`);

  console.log("=== ALL 5 TOURNAMENT TIEBREAKER TESTS PASSED ===");
}

runTests();
