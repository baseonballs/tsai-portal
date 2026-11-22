/**
 * Multi-Sheet Tournament Command Center Types (B8 / T6.1)
 * Assignee: Transcendental Sports AI LLC
 * Patent Track 16: TSAI-PATENT-VISION-01 (Docket P229, Claims 9 & 10)
 * Platform Invariant 6: Pure physical kinematics and optical tracking data.
 * Zero-Purple Rule: Strictly 0 purple/indigo/violet styling.
 */

export type TournamentFormat =
  | "single_elimination"
  | "pool_play"
  | "round_robin"
  | "showcase";

export type TournamentStatus = "scheduled" | "live" | "completed" | "cancelled";

export type BroadcastAngle =
  | "TACTICAL_PRIMARY"
  | "HIGH_ENDZONE_HOME"
  | "HIGH_ENDZONE_AWAY"
  | "OVERHEAD_TACTICAL";

export type SheetStreamState =
  | "UNINITIALIZED"
  | "TESTING"
  | "LIVE"
  | "PAUSED_INTERMISSION"
  | "COMPLETED"
  | "ERROR";

export type BracketRound =
  | "POOL"
  | "ROUND_OF_16"
  | "QUARTERFINALS"
  | "SEMIFINALS"
  | "THIRD_PLACE"
  | "CHAMPIONSHIP";

export type BracketMatchStatus = "UPCOMING" | "LIVE" | "FINAL" | "CANCELLED";

export type BracketSide = "home" | "away";

export interface TeamOption {
  id: string;
  name: string;
  season: string;
  levelOfPlay: string | null;
  tier: string | null;
  gender: string | null;
  organizationName: string | null;
}

export interface SheetMatchInfo {
  matchId: string;
  homeTeam: string | null;
  awayTeam: string | null;
  period: number | null;
  gameClockSeconds: number | null;
  scoreHome: number | null;
  scoreAway: number | null;
  isOvertime: boolean;
  homeXg?: number | null;
  awayXg?: number | null;
  whistleDuckingActive?: boolean;
  recentWhistleTimestamp?: number;
}

export interface SheetHardwareHealth {
  temperatureCelsius: number | null;
  droppedFramesCount: number | null;
  ispLoadPercentage: number | null;
  thermalThrottled: boolean | null;
}

export interface TournamentSheet {
  sheetId: string;
  tournamentId?: string;
  sheetNumber: number;
  rinkName: string;
  streamState: SheetStreamState;
  youtubeBroadcastId: string | null;
  playbackUrl: string | null;
  bitrateKbps: number | null;
  fps: number | null;
  activeAngle: BroadcastAngle;
  isPublicShowcase: boolean;
  hardwareHealth: SheetHardwareHealth | null;
  acousticShieldMuted: boolean;
  matchInfo?: SheetMatchInfo | null;
}

export interface BracketMatch {
  matchId: string;
  tournamentId?: string;
  round: BracketRound;
  matchLabel: string;
  sortOrder: number;
  sheetId: string | null;
  gameId?: string | null;
  homeTeamName: string | null;
  awayTeamName: string | null;
  homeSeed: number | null;
  awaySeed: number | null;
  homeScore: number | null;
  awayScore: number | null;
  status: BracketMatchStatus;
  period: number | null;
  clockSeconds: number | null;
  isOvertime: boolean;
  winnerSide: BracketSide | null;
  nextMatchId: string | null;
  nextMatchSlot: BracketSide | null;
  startsAt: string | null;
}

export interface TournamentSummary {
  id: string;
  teamId: string;
  seasonId: string | null;
  name: string;
  venueName: string | null;
  startsOn: string | null;
  endsOn: string | null;
  format: TournamentFormat;
  status: TournamentStatus;
  emergencyGlobalAudioMute: boolean;
  sheetCount: number;
  matchCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface TournamentDetail {
  id: string;
  teamId: string;
  seasonId: string | null;
  name: string;
  venueName: string | null;
  startsOn: string | null;
  endsOn: string | null;
  format: TournamentFormat;
  status: TournamentStatus;
  emergencyGlobalAudioMute: boolean;
  sheets: TournamentSheet[];
  matches: BracketMatch[];
  createdAt: string;
  updatedAt: string | null;
}

export interface MultiSheetCommandCenterProps {
  sheets: TournamentSheet[];
  matches?: BracketMatch[];
  teamId?: string | null;
  tournamentId?: string | null;
  tournamentName?: string;
  venueName?: string | null;
  emergencyGlobalAudioMute?: boolean;
  busy?: boolean;
  selectedSheetId?: string;
  onSelectSheet?: (sheetId: string) => void;
  onToggleGlobalMute?: () => void | Promise<void>;
  onChangeSheetAngle?: (sheetId: string, angle: BroadcastAngle) => void | Promise<void>;
  onToggleSheetMute?: (sheetId: string, muted: boolean) => void | Promise<void>;
  onDeleteSheet?: (sheetId: string) => void | Promise<void>;
  onOpenCreateSheet?: () => void;
  onSheetsApplied?: () => void | Promise<void>;
}
