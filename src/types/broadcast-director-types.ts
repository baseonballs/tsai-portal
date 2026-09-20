//
//  broadcast-director-types.ts
//  tsai-portal
//
//  Transcend Platform - Patent P382
//  Multi-Rink Broadcast Director & Auto-Highlight Switcher Types
//

export type CameraRole =
  | "broadcast_primary"
  | "overhead_ice"
  | "crease_left"
  | "crease_right"
  | "reverse_angle";

export type FeedStatus = "live" | "standby" | "degraded" | "offline";

export interface RinkCameraFeed {
  cameraId: string;
  rinkId: string;
  sheetName: string;
  role: CameraRole;
  fps: number;
  latencyMs: number;
  status: FeedStatus;
  streamUrl: string;
}

export type BroadcastEventType =
  | "goal"
  | "shot_on_goal"
  | "high_danger_chance"
  | "save"
  | "penalty";

export interface HighlightTriggerEvent {
  eventId: string;
  rinkId: string;
  timestampMs: number;
  type: BroadcastEventType;
  confidenceScore: number;
  priorityWeight: number;
  targetCameraId: string;
}

export interface DirectorProgramState {
  activeRinkId: string;
  activeCameraId: string;
  programStreamUrl: string;
  lastSwitchTimestampMs: number;
  switchingLatencyMs: number;
  isAutoDirectorActive: boolean;
  activeTransition: "cut" | "crossfade";
}
