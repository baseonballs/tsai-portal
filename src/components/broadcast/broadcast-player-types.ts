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

