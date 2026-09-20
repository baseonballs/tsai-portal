//
//  ice-friction-chatter-types.ts
//  tsai-portal
//
//  Transcend Platform - Patent P389
//  Continuous Surface Ice Friction Micro-Variability & Blade Chatter Acoustics Model
//
//  Strict Platform Invariant 6: Pure physical parameters (deg C, min, m/m^2, dB, Hz, mu_k).
//  Zero player skill ratings or subjective scouting grades.
//

export interface IceCellData {
  id: string;
  col: number;
  row: number;
  centerX: number; // meters [0, 61]
  centerY: number; // meters [-13, 13]
  elapsedFloodMin: number;
  surfaceTempC: number;
  trenchDensityMPerSqM: number;
  acousticChatterDb: number;
  dynamicFrictionMuk: number; // [0.003, 0.045]
  rutAlert: boolean;
}

export interface IceFrictionChatterWorkbenchProps {
  initialFloodMin?: number;
  initialTempC?: number;
  initialCells?: IceCellData[];
  onCellSelect?: (cell: IceCellData) => void;
  className?: string;
}
