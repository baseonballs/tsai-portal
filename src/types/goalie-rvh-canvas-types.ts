//
//  goalie-rvh-canvas-types.ts
//  tsai-portal
//
//  Transcend Platform - Patent P394
//  Goaltender Reverse-VH (RVH) Post-Lean Hip Compression Sentry
//
//  Strict Platform Invariant 6: Pure physical joint angles (deg), force (N), impulse (N*s), time (s, ms).
//  Zero player skill ratings or subjective scouting grades.
//

export type RVHRiskLevel =
  | "NOMINAL_ALIGNMENT"
  | "ELEVATED_IMPINGEMENT_RISK"
  | "ACUTE_FAI_HAZARD";

export type RVHPostSide = "left_post" | "right_post";

export interface GoalieRVHReviewData {
  sampleId: string;
  goalieIdentifier: string;        // e.g. "G-31" or "Goalie 31"
  timestampSec: number;
  postSide: RVHPostSide;
  hipInternalRotationDeg: number;  // [0.0, 50.0] deg
  hipFlexionDeg: number;           // [0.0, 110.0] deg
  torsoLeanAngleDeg: number;       // [0.0, 45.0] deg
  skatePostCompressionForceN: number; // Reactive contact force (N)
  dwellDurationSec: number;        // Dwell duration in post seal (s)
  cumulativeImpulseNs: number;     // Accumulated F * dt (N*s)
  jointImpingementRiskIndex: number; // [0.0, 1.0]
  riskLevel: RVHRiskLevel;
  criticalIRThresholdDeg: number;  // 38.0 deg
  criticalFlexionThresholdDeg: number; // 70.0 deg
  processingLatencyMs: number;
}

export interface GoalieRVHCanvasProps {
  data?: GoalieRVHReviewData;
  onPostSideToggle?: (side: RVHPostSide) => void;
  className?: string;
}
