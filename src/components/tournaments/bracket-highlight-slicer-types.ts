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

export const INITIAL_PORTAL_MATCHES: PortalTournamentMatch[] = [
  {
    matchId: 'match-qf-1',
    tournamentId: 'state-championship-2026',
    roundName: 'Quarterfinal 1',
    sheetName: 'Rink A',
    homeTeam: { id: 'team-north', name: 'North Stars', seed: 1, score: 4 },
    awayTeam: { id: 'team-south', name: 'South Blades', seed: 8, score: 3 },
    status: 'COMPLETED',
    winnerTeamId: 'team-north',
    nextMatchId: 'match-semi-1',
    period: 4,
    gameClockSeconds: 0,
    highlightReelUrl: 'https://cdn.transcend.tv/tournaments/state-championship-2026/highlights/reel-qf-1/master.m3u8',
    highlightClips: [
      {
        clipId: 'clip-1',
        title: 'North Stars Powerplay Goal',
        eventType: 'GOAL',
        period: 1,
        gameClockSeconds: 840,
        durationSeconds: 12.5,
        thumbnailUrl: '/thumbnails/qf1_goal1.jpg',
        clipUrl: 'https://cdn.transcend.tv/clips/clip-1.m3u8',
      },
      {
        clipId: 'clip-2',
        title: 'North Stars Sudden Death OT Winner',
        eventType: 'OVERTIME_WINNER',
        period: 4,
        gameClockSeconds: 180,
        durationSeconds: 18.0,
        thumbnailUrl: '/thumbnails/qf1_ot.jpg',
        clipUrl: 'https://cdn.transcend.tv/clips/clip-2.m3u8',
      },
    ],
  },
  {
    matchId: 'match-semi-1',
    tournamentId: 'state-championship-2026',
    roundName: 'Semifinal A',
    sheetName: 'Rink A',
    homeTeam: { id: 'team-north', name: 'North Stars (Adv)', seed: 1, score: 0 },
    awayTeam: { id: 'team-east', name: 'East Warriors', seed: 4, score: 0 },
    status: 'IN_PROGRESS',
    period: 1,
    gameClockSeconds: 1020,
    highlightClips: [],
  },
];
