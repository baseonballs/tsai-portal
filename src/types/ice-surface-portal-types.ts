//
//  ice-surface-portal-types.ts
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 (TSAI-PAT-P406)
//  Sprint 48: Multi-Sheet Ice Surface Temperature & Zamboni Resurfacing Quality Forecaster
//

export type SheetThermalStatus =
  | "OPTIMAL_FAST"
  | "ACCEPTABLE_STANDARD"
  | "DEGRADED_SLOW"
  | "SLUSH_WARNING";

export interface SheetThermalData {
  sheetId: string;
  sheetName: string;
  iceSurfaceTemperatureCelsius: number;
  subFloorBrineTemperatureCelsius: number;
  ambientAirTemperatureCelsius: number;
  ambientRelativeHumidityPct: number;
  estimatedKineticFriction: number;
  condensationRisk: boolean;
  status: SheetThermalStatus;
  minutesRemainingUntilDegraded: number;
  recommendedCutDepthMm: number;
  recommendedWaterTempC: number;
}

export interface IceSurfaceTemperatureWorkbenchProps {
  sheets: SheetThermalData[];
  onDispatchZamboni?: (sheetId: string, cutDepthMm: number) => void;
  onAdjustChillerSetPoint?: (sheetId: string, setPointCelsius: number) => void;
}
