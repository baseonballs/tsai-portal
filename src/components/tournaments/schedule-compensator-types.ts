/**
 * Dynamic Tournament Schedule Compensator Types (Patent Track 16).
 * Conforms to Platform Invariant 6: pure chronological timestamps, minute durations, and objective sheet identifiers.
 */

export interface SheetStatus {
  sheetId: string;
  sheetName: string;
  currentDelayMinutes: number;
  activeGameId?: string;
  inOvertime: boolean;
  floodBufferMinutes: number;
}

export interface ScheduledTournamentGame {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  sheetId: string;
  scheduledStartTime: string;
  projectedStartTime: string;
  delayMinutes: number;
  status: 'scheduled' | 'in_progress' | 'overtime' | 'completed';
  warmupCompressionMinutes: number; // 10 = standard, 5 = compressed
  reassignedSheetId?: string;
}

export interface RebalanceRecommendation {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  fromSheetId: string;
  toSheetId: string;
  delaySavedMinutes: number;
  rationale: string;
}

export interface CompensatorTelemetryState {
  tournamentId: string;
  sheets: SheetStatus[];
  games: ScheduledTournamentGame[];
  recommendations: RebalanceRecommendation[];
  lastAuditedTimestamp: string;
}
