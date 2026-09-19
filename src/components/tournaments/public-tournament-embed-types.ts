/**
 * Public Tournament Embed & Multi-Sheet Ticker Types
 * Assignee: Transcendental Sports AI LLC
 * Patent Track 16: Claims 9 & 10 (Multi-Sheet Tournament Operations)
 * Platform Invariant 6: Pure physical kinematics and optical tracking data.
 */

export type BracketRound = "QUARTERFINALS" | "SEMIFINALS" | "CHAMPIONSHIP";
export type MatchStatus = "UPCOMING" | "LIVE" | "FINAL";
export type EmbedViewMode = "ticker" | "compact" | "tree";

export interface TournamentTeam {
  name: string;
  seed: number;
  score: number;
  xG?: number;
}

export interface TournamentTickerMatch {
  matchId: string;
  round: BracketRound;
  matchLabel: string;
  sheetId: string;
  rinkName: string;
  homeTeam: TournamentTeam;
  awayTeam: TournamentTeam;
  status: MatchStatus;
  winnerTeamName?: string;
  period?: number;
  timeRemaining?: string;
  nextMatchId?: string;
}

export interface PublicTournamentEmbedConfig {
  tournamentId: string;
  tournamentName: string;
  activeSheetFilter?: string;
  viewMode?: EmbedViewMode;
  showIframeEmbedSnippet?: boolean;
}

export interface PublicTournamentEmbedWidgetProps {
  config?: PublicTournamentEmbedConfig;
  initialMatches?: TournamentTickerMatch[];
  championTeamName?: string;
  onSelectMatchSheet?: (sheetId: string) => void;
}
