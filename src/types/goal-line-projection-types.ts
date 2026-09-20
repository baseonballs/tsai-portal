//
//  goal-line-projection-types.ts
//  tsai-portal
//
//  Transcend Platform - Patent P377
//  Dynamic Goal-Line Orthogonal Plane Projector & Sub-Pixel Review
//

export type GoalReviewVerdict = "GOAL_CONFIRMED" | "NO_GOAL" | "INCONCLUSIVE";

export interface GoalLineProjectionData {
  puckX: number; // meters from center ice (goal line center is 27.1272m)
  puckY: number; // meters laterally (posts at +/- 0.9144m)
  puckZ: number; // meters above ice (crossbar at 1.2192m)
  clearanceMarginMm: number; // mm past back of red line (> 0 for goal)
  crossingPercentage: number; // 0.0 to 100.0%
  isWithinGoalFrame: boolean;
  opticalConfidence: number; // 0.0 to 1.0
  verdict: GoalReviewVerdict;
  timestamp: number;
}

export interface GoalLineReviewCanvasProps {
  projectionData?: GoalLineProjectionData;
  onVerdictChange?: (verdict: GoalReviewVerdict) => void;
  className?: string;
}
