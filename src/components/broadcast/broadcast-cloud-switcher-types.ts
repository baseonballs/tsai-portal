/**
 * Type definitions for Multi-Sheet Broadcast Cloud Switcher UI (Patent Track 16).
 * Conforms to Platform Invariant 6: purely physical parameters.
 * Strictly Zero-Purple compliant (0 purple, indigo, or violet tokens).
 */

export type BroadcastCameraAngle =
  | 'BROADCAST_HIGH'
  | 'LOW_CREASE'
  | 'OVERHEAD_TACTICAL'
  | 'SLOT_DEFENSE_CAM';

export interface PortalSheetChannel {
  sheetId: string;
  sheetName: string;
  programAngle: BroadcastCameraAngle;
  previewAngle: BroadcastCameraAngle;
  isLive: boolean;
  bitrateKbps: number;
  fps: number;
  streamUptimeSeconds: number;
}

export type ReplayTriggerType =
  | 'GOAL'
  | 'PENALTY'
  | 'HIGH_DANGER_SAVE'
  | 'MANUAL_DISPUTE';

export interface PortalReplayItem {
  id: string;
  sheetId: string;
  eventType: ReplayTriggerType;
  durationSec: number;
  timestamp: string;
}

export function formatStreamTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
