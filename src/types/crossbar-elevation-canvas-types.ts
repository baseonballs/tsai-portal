//
//  crossbar-elevation-canvas-types.ts
//  tsai-portal
//
//  Transcend Platform - Patent P390
//  Live Multi-Sheet Epipolar Puck Elevation & Net Crossbar Triangulation Arbiter
//
//  Strict Platform Invariant 6: Pure physical spatial coordinates (m, mm),
//  angles (rad, deg), timestamps (ms), and statistical confidence (%).
//  Zero referee scoring grades or subjective human evaluations.
//

export type CrossbarArbitrationDecision =
  | "ABOVE_CROSSBAR"
  | "BELOW_CROSSBAR"
  | "INCONCLUSIVE_UNCERTAINTY_BAND";

export interface PuckElevationReviewData {
  reviewId: string;
  timestampSec: number;
  puckX: number; // meters from goal center (-0.9144 to +0.9144)
  puckY: number; // meters from goal line (depth)
  puckZ: number; // meters elevation
  crossbarElevationM: number; // 1.2192m standard
  elevationDeltaMm: number;    // (puckZ - crossbar) * 1000
  uncertaintyMarginMm: number; // ± 3-sigma in mm
  decision: CrossbarArbitrationDecision;
  confidencePercent: number;
  cameraCount: number;
  processingLatencyMs: number;
}

export interface CrossbarElevationCanvasProps {
  data?: PuckElevationReviewData;
  onDecisionChange?: (decision: CrossbarArbitrationDecision) => void;
  className?: string;
}
