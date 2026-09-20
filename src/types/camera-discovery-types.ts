//
//  camera-discovery-types.ts
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 (TSAI-PATENT-VISION-01)
//  Option 5 / Horizon C: Turnkey Camera Discovery & Stream Health Validator
//

export type CameraStreamStatus =
  | "READY"
  | "HIGH_LATENCY"
  | "FRAME_DROP"
  | "UNSUPPORTED";

export interface DiscoveredCameraFeed {
  ipAddress: string;
  macAddress: string;
  manufacturer: string;
  modelName: string;
  rtspUrl: string;
  width: number;
  height: number;
  fps: number;
  latencyMs: number;
  clockDriftMs: number;
  isCompliant4k60: boolean;
  status: CameraStreamStatus;
}

export interface ArenaCameraDiscoveryWorkbenchProps {
  cameras: DiscoveredCameraFeed[];
  onTriggerRescan?: () => void;
  onPairCameraToRig?: (ipAddress: string) => void;
}
