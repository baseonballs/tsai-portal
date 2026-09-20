import {
  TelestrationPoint2D,
  MagneticTelestrationAnchor,
  MagneticSplineStroke,
  TrackCandidate,
} from "../../types/magnetic-telestration-types";

export function resolveNearestCandidate(
  point: TelestrationPoint2D,
  candidates: TrackCandidate[],
  radius: number
): MagneticTelestrationAnchor {
  let closestDist = Infinity;
  let closestTrack: TrackCandidate | null = null;

  for (const track of candidates) {
    const dx = point.x - track.screenPos.x;
    const dy = point.y - track.screenPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < closestDist) {
      closestDist = dist;
      closestTrack = track;
    }
  }

  if (closestDist <= radius && closestTrack) {
    return {
      anchorId: `anchor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetTrackId: closestTrack.trackId,
      anchorType: closestTrack.type,
      screenPositionPx: { ...closestTrack.screenPos },
      icePositionMeters: { ...closestTrack.icePos },
      isMagneticallyLocked: true,
    };
  }

  return {
    anchorId: `anchor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    targetTrackId: "ice_ground_plane",
    anchorType: "iceGroundPlane",
    screenPositionPx: { ...point },
    icePositionMeters: { x: 0, y: 0 },
    isMagneticallyLocked: false,
  };
}

export function recalculateLockedStrokes(
  strokes: MagneticSplineStroke[],
  candidates: TrackCandidate[]
): { nextStrokes: MagneticSplineStroke[]; changed: boolean } {
  if (!candidates || candidates.length === 0 || strokes.length === 0) {
    return { nextStrokes: strokes, changed: false };
  }
  const candidateMap = new Map(candidates.map((c) => [c.trackId, c]));

  let anyChanged = false;
  const nextStrokes = strokes.map((s) => {
    let updatedStart = s.anchorStart;
    let updatedEnd = s.anchorEnd;
    let deltaStartX = 0;
    let deltaStartY = 0;
    let deltaEndX = 0;
    let deltaEndY = 0;

    if (s.anchorStart?.isMagneticallyLocked) {
      const c = candidateMap.get(s.anchorStart.targetTrackId);
      if (
        c &&
        (c.screenPos.x !== s.anchorStart.screenPositionPx.x ||
          c.screenPos.y !== s.anchorStart.screenPositionPx.y)
      ) {
        deltaStartX = c.screenPos.x - s.anchorStart.screenPositionPx.x;
        deltaStartY = c.screenPos.y - s.anchorStart.screenPositionPx.y;
        updatedStart = {
          ...s.anchorStart,
          screenPositionPx: { ...c.screenPos },
          icePositionMeters: { ...c.icePos },
        };
        anyChanged = true;
      }
    }

    if (s.anchorEnd?.isMagneticallyLocked) {
      const c = candidateMap.get(s.anchorEnd.targetTrackId);
      if (
        c &&
        (c.screenPos.x !== s.anchorEnd.screenPositionPx.x ||
          c.screenPos.y !== s.anchorEnd.screenPositionPx.y)
      ) {
        deltaEndX = c.screenPos.x - s.anchorEnd.screenPositionPx.x;
        deltaEndY = c.screenPos.y - s.anchorEnd.screenPositionPx.y;
        updatedEnd = {
          ...s.anchorEnd,
          screenPositionPx: { ...c.screenPos },
          icePositionMeters: { ...c.icePos },
        };
        anyChanged = true;
      }
    }

    if (deltaStartX !== 0 || deltaStartY !== 0 || deltaEndX !== 0 || deltaEndY !== 0) {
      const n = s.intermediateControlPoints.length;
      const updatedPts = s.intermediateControlPoints.map((pt, idx) => {
        const t = (idx + 1) / (n + 1);
        return {
          x: pt.x + (1 - t) * deltaStartX + t * deltaEndX,
          y: pt.y + (1 - t) * deltaStartY + t * deltaEndY,
        };
      });
      return {
        ...s,
        anchorStart: updatedStart,
        anchorEnd: updatedEnd,
        intermediateControlPoints: updatedPts,
      };
    }

    return s;
  });

  return { nextStrokes, changed: anyChanged };
}
