/**
 * Types for Live Tournament Bracket Ingestion & Match Highlight Slicer (Portal UI)
 * Patent Track 16 (Claims 7, 9 & 10)
 * Strictly adheres to Platform Invariant 6 & Zero-Purple design rules.
 */

export type PortalMatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

export interface PortalTeam {
  id: string;
  name: string;
  seed: number;
  score: number;
}

export interface PortalHighlightClip {
  clipId: string;
  title: string;
  eventType: 'GOAL' | 'OVERTIME_WINNER' | 'KEY_SAVE' | 'SHOOTOUT_WINNER';
  period: number;
  gameClockSeconds: number;
  durationSeconds: number;
  thumbnailUrl: string;
  clipUrl: string;
}

export interface PortalTournamentMatch {
  matchId: string;
  tournamentId: string;
  roundName: string;
  sheetName: string;
  homeTeam: PortalTeam;
  awayTeam: PortalTeam;
  status: PortalMatchStatus;
  winnerTeamId?: string;
  nextMatchId?: string;
  period: number;
  gameClockSeconds: number;
  highlightReelUrl?: string;
  highlightClips: PortalHighlightClip[];
}

export function formatMatchClock(period: number, secondsRemaining: number): string {
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const pStr = period > 3 ? `OT${period - 3}` : `P${period}`;
  return `${pStr} ${mins}:${secs.toString().padStart(2, '0')}`;
}

