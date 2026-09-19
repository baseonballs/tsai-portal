/**
 * Transcend Portal — Live Broadcast Player & Scorebug Type Definitions
 *
 * Strict Invariants:
 * - Zero-Purple Rule: Strictly zero purple, indigo, or violet Tailwind tokens.
 * - Platform Invariant 6: Pure physical kinematics and optical tracking data.
 * - Patent Track 16: Multi-camera perspective switching, acoustic whistle ducking,
 *   and SEI timed metadata synchronization.
 */

export type CameraAngle = "CENTER_ICE" | "HIGH_CORNER" | "GOALIE_CREASE_POV";

export interface StreamSource {
  streamId: string;
  angle: CameraAngle;
  label: string;
  resolution: string;
  videoUrl: string;
  isLive: boolean;
  latencyMs: number;
}

export interface ScorebugState {
  gameId: string;
  rinkName: string;
  homeTeam: {
    name: string;
    code: string;
    score: number;
  };
  awayTeam: {
    name: string;
    code: string;
    score: number;
  };
  period: number;
  clockSeconds: number;
  isClockRunning: boolean;
  isIntermission: boolean;
  whistleDucked: boolean;
}

export interface XGTelemetryState {
  homeXG: number;
  awayXG: number;
  lastShotXG: number;
  lastShotDanger: "HIGH_DANGER" | "MEDIUM_DANGER" | "LOW_DANGER";
  lastShotTimestamp: string;
  homeHighDangerChances: number;
  awayHighDangerChances: number;
}

export interface LiveBroadcastStreamPlayerProps {
  gameId?: string;
  rinkName?: string;
  initialAngle?: CameraAngle;
  sources?: StreamSource[];
  initialScorebug?: ScorebugState;
  initialXG?: XGTelemetryState;
  onAngleChange?: (angle: CameraAngle) => void;
  onClipMarked?: (timestampSeconds: number, angle: CameraAngle) => void;
}

export const DEFAULT_STREAM_SOURCES: StreamSource[] = [
  {
    streamId: "stream-cam-center-01",
    angle: "CENTER_ICE",
    label: "Center Ice Broadcast",
    resolution: "1080p60 HDR",
    videoUrl: "https://www.youtube.com/embed/live_stream?channel=tsai_sample_center",
    isLive: true,
    latencyMs: 140,
  },
  {
    streamId: "stream-cam-corner-02",
    angle: "HIGH_CORNER",
    label: "Tactical High Endzone",
    resolution: "4K30 PTZ",
    videoUrl: "https://www.youtube.com/embed/live_stream?channel=tsai_sample_corner",
    isLive: true,
    latencyMs: 165,
  },
  {
    streamId: "stream-cam-crease-03",
    angle: "GOALIE_CREASE_POV",
    label: "Goaltender Crease POV",
    resolution: "1080p60 Ultra-Wide",
    videoUrl: "https://www.youtube.com/embed/live_stream?channel=tsai_sample_crease",
    isLive: true,
    latencyMs: 120,
  },
];

export const DEFAULT_SCOREBUG: ScorebugState = {
  gameId: "game_norcal_u16_final",
  rinkName: "Sharks Ice Center — Sheet 1",
  homeTeam: {
    name: "San Jose Jr. Sharks",
    code: "SJS",
    score: 3,
  },
  awayTeam: {
    name: "Los Angeles Jr. Kings",
    code: "LAK",
    score: 2,
  },
  period: 2,
  clockSeconds: 842, // 14:02 remaining
  isClockRunning: true,
  isIntermission: false,
  whistleDucked: false,
};

export const DEFAULT_XG: XGTelemetryState = {
  homeXG: 2.45,
  awayXG: 1.88,
  lastShotXG: 0.359,
  lastShotDanger: "HIGH_DANGER",
  lastShotTimestamp: "14:15 P2",
  homeHighDangerChances: 5,
  awayHighDangerChances: 3,
};
