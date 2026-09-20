/**
//  tournament-war-room-portal-types.ts
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 (TSAI-PAT-P398)
//  Sprint 40: Multi-Camera Cross-Sheet Tournament War Room Centralizer
*/

export type AlertSeverityUI = "critical" | "high" | "medium" | "low";

export type SheetLiveStatusUI = "live" | "stoppage" | "intermission" | "concluded";

export interface SheetMonitoringView {
  sheetId: string;
  sheetName: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  periodClock: string;
  cameraCount: number;
  hasCriticalAlert: boolean;
  status: SheetLiveStatusUI;
}

export interface WarRoomAlertUI {
  id: string;
  sheetId: string;
  sheetName: string;
  timestamp: string;
  type: "concussion" | "penalty" | "emergency" | "review";
  severity: AlertSeverityUI;
  title: string;
  details: string;
  telemetryValue?: string;
  resolved: boolean;
}

export interface TournamentWarRoomProps {
  facilityName?: string;
  initialSheets?: SheetMonitoringView[];
  initialAlerts?: WarRoomAlertUI[];
  onDispatchDirective?: (sheetId: string, action: string) => void;
  onResolveAlert?: (alertId: string) => void;
}
