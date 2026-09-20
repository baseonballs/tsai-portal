//
//  arena-kiosk-fleet-types.ts
//  tsai-portal
//
//  Turnkey Arena Rig Edge Kiosk Fleet Dashboard
//  Patent Track 15 & Track 16 (P229)
//
//  Strict Platform Invariant 6: Pure physical telemetry (FPS, deg C, seconds, resolutions, state).
//  Zero player skill ratings or subjective scouting grades.
//

export type ThermalPressureTier = "NOMINAL" | "FAIR" | "SERIOUS" | "CRITICAL";

export type KioskFeedSource =
  | "COMPOSITE_BROADCAST"
  | "POD_A"
  | "POD_B"
  | "GOALIE_POV"
  | "TACTICAL_TWIN";

export interface OpticalPodTelemetry {
  podId: string;
  isConnected: boolean;
  fps: number;
  resolution: string;
  lensTemperatureCelsius: number;
  lastHeartbeatAgeSec: number;
}

export interface ArenaEdgeKioskNode {
  kioskId: string;
  venueName: string;
  rinkSheetId: string;
  isWakeLockActive: boolean;
  thermalPressureTier: ThermalPressureTier;
  activeFeedSource: KioskFeedSource;
  pods: OpticalPodTelemetry[];
  systemUptimeSeconds: number;
  activePeriod: number;
  periodTimeRemainingSeconds: number;
}

export interface ArenaEdgeKioskFleetDashboardProps {
  initialKiosks?: ArenaEdgeKioskNode[];
  onSelectFeed?: (kioskId: string, feed: KioskFeedSource) => void;
  onToggleWakeLock?: (kioskId: string) => void;
  className?: string;
}
