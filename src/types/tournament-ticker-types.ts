/**
 * Tournament Live Ticker Types
 * Invariant 1 (SI Units), Invariant 4 (Zero Unanchored Purple), Invariant 5 (Sub-300 lines)
 */

export type GamePeriod = 1 | 2 | 3 | 'OT' | 'SO';

export type PowerplayState =
  | 'even_strength'
  | 'home_powerplay'
  | 'away_powerplay'
  | '5v3_home'
  | '5v3_away'
  | '4v4'
  | '3v3';

export interface ActivePenalty {
  penaltyId: string;
  team: 'home' | 'away';
  playerNumber: number;
  infraction: string;
  durationSecRemaining: number;
}

export interface TournamentSheetScore {
  sheetId: string;
  sheetName: string;
  tournamentId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  period: GamePeriod;
  periodClockSec: number;
  isClockRunning: boolean;
  activePenalties: ActivePenalty[];
  powerplayState: PowerplayState;
  lastUpdatedMs: number;
}
