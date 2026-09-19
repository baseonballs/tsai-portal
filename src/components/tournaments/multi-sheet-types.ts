/**
 * Multi-Sheet Tournament Command Center Types
 * Assignee: Transcendental Sports AI LLC
 * Patent Track 16: TSAI-PATENT-VISION-01 (Docket P229, Claims 9 & 10)
 * Platform Invariant 6: Pure physical kinematics and optical tracking data.
 * Zero-Purple Rule: Strictly 0 purple/indigo/violet styling.
 */

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

export interface SheetMatchInfo {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  period: number;
  gameClockSeconds: number;
  scoreHome: number;
  scoreAway: number;
  isOvertime: boolean;
  homeXg?: number;
  awayXg?: number;
  whistleDuckingActive?: boolean;
  recentWhistleTimestamp?: number;
}

export interface SheetHardwareHealth {
  temperatureCelsius: number;
  droppedFramesCount: number;
  ispLoadPercentage: number;
  thermalThrottled: boolean;
}

export interface TournamentSheet {
  sheetId: string;
  sheetNumber: number;
  rinkName: string;
  streamState: SheetStreamState;
  youtubeBroadcastId: string;
  youtubeStreamKey: string;
  rtmpsIngestUrl: string;
  playbackUrl: string;
  bitrateKbps: number;
  fps: number;
  activeAngle: BroadcastAngle;
  isPublicShowcase: boolean;
  matchInfo: SheetMatchInfo;
  hardwareHealth: SheetHardwareHealth;
  acousticShieldMuted: boolean;
}

export interface MultiSheetCommandCenterProps {
  initialSheets?: TournamentSheet[];
  tournamentName?: string;
  venueName?: string;
  selectedSheetId?: string;
  onSelectSheet?: (sheetId: string) => void;
}
