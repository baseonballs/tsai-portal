export type PowerplayPositionRole =
  | "highPoint"
  | "leftFlank"
  | "rightFlank"
  | "bumperSlot"
  | "netFront";

export interface PowerplaySkaterNode {
  role: PowerplayPositionRole;
  label: string;
  x: number;
  y: number;
  jerseyNumber: string;
}

export type PowerplayShotTier =
  | "highDangerSnapShot"
  | "quickReleasePointShot"
  | "standardCycleShot"
  | "defendedShot";

export interface PowerplaySequenceMetrics {
  passDistanceM: number;
  releaseSpeedMps: number;
  catchToReleaseLatencyS: number;
  isRoyalRoadCrossed: boolean;
  shotTier: PowerplayShotTier;
}

export interface PowerplayUmbrellaCanvasProps {
  activeSequence?: PowerplaySequenceMetrics;
  onRoleSelect?: (role: PowerplayPositionRole) => void;
  className?: string;
}
