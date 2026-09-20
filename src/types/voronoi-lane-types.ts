//
//  voronoi-lane-types.ts
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 (TSAI-PAT-P384)
//

export interface VoronoiPoint {
  x: number; // Ice coordinates in meters (or viewBox units)
  y: number;
}

export interface VoronoiDefenderNode {
  id: string;
  label: string;
  jerseyNumber: string;
  x: number;
  y: number;
  vxMps: number;
  vyMps: number;
  stickReachM: number;
}

export interface VoronoiPassingLaneMetrics {
  laneLengthM: number;
  puckTransitTimeS: number;
  timeToCollapseS: number;
  shadowWidthM: number;
  opennessScore: number; // 0.0 to 1.0
  isAnticipatedToCollapse: boolean;
  criticalDefenderId?: string;
}

export interface VoronoiPassingLaneWorkbenchProps {
  passer?: VoronoiPoint;
  receiver?: VoronoiPoint;
  defenders?: VoronoiDefenderNode[];
  puckSpeedMps?: number;
  onLaneSelect?: (metrics: VoronoiPassingLaneMetrics) => void;
  className?: string;
}
