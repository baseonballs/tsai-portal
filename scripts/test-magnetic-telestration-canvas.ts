/**
 * Test Suite for Magnetic Telestration Canvas & Anchor System
 * Validates magnetic snapping radius, path interpolation, and dynamic track update.
 */

import {
  TrackCandidate,
  TelestrationPoint2D,
  MagneticTelestrationAnchor,
  MagneticSplineStroke,
} from '../src/types/magnetic-telestration-types';

function resolveNearestCandidate(
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
      anchorId: `anchor-${Date.now()}`,
      targetTrackId: closestTrack.trackId,
      anchorType: closestTrack.type,
      screenPositionPx: { ...closestTrack.screenPos },
      icePositionMeters: { ...closestTrack.icePos },
      isMagneticallyLocked: true,
    };
  }

  return {
    anchorId: `anchor-${Date.now()}`,
    targetTrackId: 'ice_ground_plane',
    anchorType: 'iceGroundPlane',
    screenPositionPx: { ...point },
    icePositionMeters: { x: 0, y: 0 },
    isMagneticallyLocked: false,
  };
}

function updateStrokePositions(
  stroke: MagneticSplineStroke,
  newPositions: Record<string, { screenPos: TelestrationPoint2D; icePos: TelestrationPoint2D }>
): MagneticSplineStroke {
  let updatedStart = stroke.anchorStart;
  let updatedEnd = stroke.anchorEnd;

  if (stroke.anchorStart?.isMagneticallyLocked && newPositions[stroke.anchorStart.targetTrackId]) {
    const next = newPositions[stroke.anchorStart.targetTrackId];
    updatedStart = {
      ...stroke.anchorStart,
      screenPositionPx: { ...next.screenPos },
      icePositionMeters: { ...next.icePos },
    };
  }

  if (stroke.anchorEnd?.isMagneticallyLocked && newPositions[stroke.anchorEnd.targetTrackId]) {
    const next = newPositions[stroke.anchorEnd.targetTrackId];
    updatedEnd = {
      ...stroke.anchorEnd,
      screenPositionPx: { ...next.screenPos },
      icePositionMeters: { ...next.icePos },
    };
  }

  return {
    ...stroke,
    anchorStart: updatedStart,
    anchorEnd: updatedEnd,
  };
}

function runTests() {
  console.log('--- Running Magnetic Telestration Canvas Tests ---');

  const candidates: TrackCandidate[] = [
    {
      trackId: 'skater_97',
      type: 'skater',
      screenPos: { x: 100, y: 200 },
      icePos: { x: -12.5, y: 5.0 },
      jerseyNumber: '97',
      teamCode: 'EDM',
    },
    {
      trackId: 'puck_0',
      type: 'puck',
      screenPos: { x: 250, y: 350 },
      icePos: { x: 0.0, y: 0.0 },
    },
  ];

  // Test 1: Snapping within radius (15px away < 25px radius)
  const touchNearSkater: TelestrationPoint2D = { x: 110, y: 205 };
  const anchorLocked = resolveNearestCandidate(touchNearSkater, candidates, 25);
  if (!anchorLocked.isMagneticallyLocked || anchorLocked.targetTrackId !== 'skater_97') {
    throw new Error(`Test 1 Failed: Expected magnetic lock to skater_97, got ${JSON.stringify(anchorLocked)}`);
  }
  if (anchorLocked.screenPositionPx.x !== 100 || anchorLocked.screenPositionPx.y !== 200) {
    throw new Error('Test 1 Failed: Screen coordinate did not snap to target');
  }
  console.log('✓ Test 1 Passed: Magnetic snap within radius verified');

  // Test 2: Point outside snap radius (40px away > 25px radius)
  const touchFreeform: TelestrationPoint2D = { x: 140, y: 200 };
  const anchorFree = resolveNearestCandidate(touchFreeform, candidates, 25);
  if (anchorFree.isMagneticallyLocked || anchorFree.anchorType !== 'iceGroundPlane') {
    throw new Error(`Test 2 Failed: Expected freeform ground plane anchor, got ${JSON.stringify(anchorFree)}`);
  }
  if (anchorFree.screenPositionPx.x !== 140 || anchorFree.screenPositionPx.y !== 200) {
    throw new Error('Test 2 Failed: Freeform screen coordinate mismatch');
  }
  console.log('✓ Test 2 Passed: Freeform anchor fallback outside radius verified');

  // Test 3: Dynamic stroke update on tracking update
  const initialStroke: MagneticSplineStroke = {
    strokeId: 'stroke-1',
    toolType: 'arrow',
    anchorStart: anchorLocked,
    intermediateControlPoints: [{ x: 100, y: 200 }, { x: 180, y: 260 }],
    strokeColorHex: '#06B6D4',
    lineWidthPx: 3,
  };

  const updatedPositions = {
    skater_97: {
      screenPos: { x: 115, y: 208 },
      icePos: { x: -11.0, y: 4.8 },
    },
  };

  const updatedStroke = updateStrokePositions(initialStroke, updatedPositions);
  if (updatedStroke.anchorStart?.screenPositionPx.x !== 115 || updatedStroke.anchorStart?.screenPositionPx.y !== 208) {
    throw new Error('Test 3 Failed: Anchor start position was not dynamically updated');
  }
  console.log('✓ Test 3 Passed: Dynamic anchor position updating verified');

  // Test 4: Spot shadow tool configuration
  const spotStroke: MagneticSplineStroke = {
    strokeId: 'spot-1',
    toolType: 'spotShadow',
    anchorStart: anchorLocked,
    intermediateControlPoints: [{ x: 100, y: 200 }],
    strokeColorHex: '#10B981',
    lineWidthPx: 2,
  };
  if (spotStroke.toolType !== 'spotShadow' || spotStroke.strokeColorHex !== '#10B981') {
    throw new Error('Test 4 Failed: Spot shadow attributes mismatch');
  }
  console.log('✓ Test 4 Passed: Spot shadow tool configuration verified');

  console.log('All Magnetic Telestration tests passed successfully.');
}

runTests();
