/**
 * Magnetic Telestration Types for Coach's Corner & Web Portal
 * Patent Track: Track 16 (TSAI-PATENT-VISION-01, Claims 1, 4, 7)
 */

export interface TelestrationPoint2D {
  x: number;
  y: number;
}

export type TelestrationAnchorType = 'skater' | 'puck' | 'iceGroundPlane';

export type TelestrationToolType = 'pen' | 'arrow' | 'spotShadow';

export interface MagneticTelestrationAnchor {
  anchorId: string;
  targetTrackId: string;
  anchorType: TelestrationAnchorType;
  screenPositionPx: TelestrationPoint2D;
  icePositionMeters: TelestrationPoint2D;
  isMagneticallyLocked: BoolOrBoolean;
}

type BoolOrBoolean = boolean;

export interface MagneticSplineStroke {
  strokeId: string;
  toolType: TelestrationToolType;
  anchorStart?: MagneticTelestrationAnchor;
  anchorEnd?: MagneticTelestrationAnchor;
  intermediateControlPoints: TelestrationPoint2D[];
  strokeColorHex: string;
  lineWidthPx: number;
}

export interface TrackCandidate {
  trackId: string;
  type: TelestrationAnchorType;
  screenPos: TelestrationPoint2D;
  icePos: TelestrationPoint2D;
  jerseyNumber?: string;
  teamCode?: string;
}

export interface MagneticTelestrationCanvasProps {
  candidates?: TrackCandidate[];
  activeTool?: TelestrationToolType;
  selectedColor?: string;
  strokeWidth?: number;
  snapRadiusPx?: number;
  initialStrokes?: MagneticSplineStroke[];
  onStrokesChange?: (strokes: MagneticSplineStroke[]) => void;
  className?: string;
}
