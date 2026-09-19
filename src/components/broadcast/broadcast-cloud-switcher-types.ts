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

export const INITIAL_CHANNELS: PortalSheetChannel[] = [
  {
    sheetId: 'sheet-1',
    sheetName: 'Rink A (NHL)',
    programAngle: 'BROADCAST_HIGH',
    previewAngle: 'LOW_CREASE',
    isLive: true,
    bitrateKbps: 4500,
    fps: 60.0,
    streamUptimeSeconds: 1420,
  },
  {
    sheetId: 'sheet-2',
    sheetName: 'Rink B (Olympic)',
    programAngle: 'OVERHEAD_TACTICAL',
    previewAngle: 'SLOT_DEFENSE_CAM',
    isLive: true,
    bitrateKbps: 4400,
    fps: 60.0,
    streamUptimeSeconds: 980,
  },
  {
    sheetId: 'sheet-3',
    sheetName: 'Rink C (Training)',
    programAngle: 'BROADCAST_HIGH',
    previewAngle: 'OVERHEAD_TACTICAL',
    isLive: true,
    bitrateKbps: 4600,
    fps: 60.0,
    streamUptimeSeconds: 2100,
  },
  {
    sheetId: 'sheet-4',
    sheetName: 'Rink D (South)',
    programAngle: 'LOW_CREASE',
    previewAngle: 'BROADCAST_HIGH',
    isLive: true,
    bitrateKbps: 4550,
    fps: 60.0,
    streamUptimeSeconds: 450,
  },
];

export function formatStreamTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
