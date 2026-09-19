/**
 * Transcend Portal — Tournament Tiebreaker & Bylaw Arbiter Types
 *
 * Patent Track 16 Claims 9 & 10:
 * - Multi-sheet tournament power rankings, USA Hockey / Hockey Canada official
 *   tiebreaker bylaws (+/-5 goal differential cap), and playoff seeding engine.
 */

export interface TeamTournamentRecord {
  teamId: string;
  teamName: string;
  division: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  otLosses: number;
  points: number; // 2 * W + 1 * T + 1 * OTL
  goalsFor: number;
  goalsAgainst: number;
  cappedGoalDifferential: number; // USA Hockey +/- 5 cap per game
  periodWins: number;
  penaltyMinutes: number;
  earliestGoalSeconds: number; // Seconds into preliminary round when first goal scored
}

export interface HeadToHeadGame {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
}

export type TiebreakerCriterion =
  | "POINTS"
  | "HEAD_TO_HEAD"
  | "GOAL_DIFFERENTIAL_CAP_5"
  | "FEWEST_GOALS_AGAINST"
  | "PERIOD_WINS"
  | "FEWEST_PENALTY_MINUTES"
  | "EARLIEST_GOAL"
  | "COIN_TOSS";

export interface RankedTeamStanding {
  rank: number;
  seed: number;
  team: TeamTournamentRecord;
  tiebreakerReason: string;
  criterion: TiebreakerCriterion;
}

export interface BracketSeedMatch {
  seed1: number;
  team1: string;
  seed2: number;
  team2: string;
  round: "QUARTERFINALS" | "SEMIFINALS" | "CHAMPIONSHIP";
  sheetName: string;
  scheduledTime: string;
}
