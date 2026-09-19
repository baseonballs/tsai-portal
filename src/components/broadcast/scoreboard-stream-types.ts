/**
 * Transcend Portal — Live Arena Scoreboard Stream Types
 *
 * Strict Invariants:
 * - Zero-Purple Rule: Strictly zero purple, indigo, or violet Tailwind tokens.
 * - Platform Invariant 6: Pure physical kinematics and optical tracking data. Zero subjective ratings.
 * - Patent Track 16 Claims 9 & 10: Arena scoreboard multicast integration and sub-second stream sync.
 */

export interface ScoreboardPenalty {
  id: string;
  teamCode: string;
  playerNumber: number;
  infraction: string;
  remainingSeconds: number;
}

export interface ScoreboardTeam {
  code: string;
  name: string;
  score: number;
  shots: number;
  xg: number;
}

export interface ArenaScoreboardData {
  gameId: string;
  period: number;
  clockFormatted: string; // e.g. "18:45"
  clockSecondsRemaining: number;
  isClockRunning: boolean;
  isWhistleStoppage: boolean;
  lastWhistleReason?: string;
  homeTeam: ScoreboardTeam;
  awayTeam: ScoreboardTeam;
  activePenalties: ScoreboardPenalty[];
  streamLatencyMs: number;
  arenaName: string;
}

export interface ArenaScoreboardBannerProps {
  data?: ArenaScoreboardData;
  onRefresh?: () => void;
  className?: string;
}

export const SAMPLE_ARENA_SCOREBOARD: ArenaScoreboardData = {
  gameId: "game-u18-championship",
  period: 2,
  clockFormatted: "14:22",
  clockSecondsRemaining: 862,
  isClockRunning: true,
  isWhistleStoppage: false,
  homeTeam: {
    code: "BOS",
    name: "Boston Jr. Bruins",
    score: 2,
    shots: 18,
    xg: 2.15,
  },
  awayTeam: {
    code: "CHI",
    name: "Chicago Mission",
    score: 1,
    shots: 14,
    xg: 1.48,
  },
  activePenalties: [
    {
      id: "pen-01",
      teamCode: "CHI",
      playerNumber: 22,
      infraction: "Tripping",
      remainingSeconds: 65,
    },
  ],
  streamLatencyMs: 148,
  arenaName: "Warrior Ice Arena - Rink A",
};
