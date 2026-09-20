"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  TelestrationPoint2D,
  TelestrationToolType,
  MagneticTelestrationAnchor,
  MagneticSplineStroke,
  TrackCandidate,
  MagneticTelestrationCanvasProps,
} from "../../types/magnetic-telestration-types";

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

export function MagneticTelestrationCanvas({
  candidates = [],
  activeTool = "pen",
  selectedColor = "#06B6D4",
  strokeWidth = 3,
  snapRadiusPx = 25,
  initialStrokes = [],
  onStrokesChange,
  className = "",
}: MagneticTelestrationCanvasProps) {
  const [tool, setTool] = useState<TelestrationToolType>(activeTool);
  const [strokes, setStrokes] = useState<MagneticSplineStroke[]>(initialStrokes);
  const [currentStroke, setCurrentStroke] = useState<MagneticSplineStroke | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>): TelestrationPoint2D => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const pt = getCoordinates(e);
    const startAnchor = resolveNearestCandidate(pt, candidates, snapRadiusPx);
    const newStroke: MagneticSplineStroke = {
      strokeId: `stroke-${Date.now()}`,
      toolType: tool,
      anchorStart: startAnchor,
      intermediateControlPoints: [startAnchor.screenPositionPx],
      strokeColorHex: selectedColor,
      lineWidthPx: strokeWidth,
    };
    setCurrentStroke(newStroke);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!currentStroke) return;
    const pt = getCoordinates(e);
    setCurrentStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        intermediateControlPoints: [...prev.intermediateControlPoints, pt],
      };
    });
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!currentStroke) return;
    const pt = getCoordinates(e);
    const endAnchor = resolveNearestCandidate(pt, candidates, snapRadiusPx);
    const finalizedStroke: MagneticSplineStroke = {
      ...currentStroke,
      anchorEnd: endAnchor,
      intermediateControlPoints: [...currentStroke.intermediateControlPoints, endAnchor.screenPositionPx],
    };
    const nextStrokes = [...strokes, finalizedStroke];
    setStrokes(nextStrokes);
    setCurrentStroke(null);
    onStrokesChange?.(nextStrokes);
  };

  const handleClear = useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
    onStrokesChange?.([]);
  }, [onStrokesChange]);

  const renderStrokeSvg = (s: MagneticSplineStroke, isDraft = false) => {
    const pts = s.intermediateControlPoints;
    if (pts.length === 0) return null;

    if (s.toolType === "spotShadow") {
      const center = s.anchorStart?.screenPositionPx || pts[0];
      return (
        <g key={s.strokeId}>
          <ellipse
            cx={center.x}
            cy={center.y}
            rx={28}
            ry={14}
            fill={s.strokeColorHex}
            fillOpacity={0.25}
            stroke={s.strokeColorHex}
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
          <circle cx={center.x} cy={center.y} r={3} fill={s.strokeColorHex} />
        </g>
      );
    }

    const d = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, "");
    const markerEnd = s.toolType === "arrow" ? "url(#arrowhead)" : undefined;

    return (
      <g key={s.strokeId} opacity={isDraft ? 0.75 : 1.0}>
        <path
          d={d}
          fill="none"
          stroke={s.strokeColorHex}
          strokeWidth={s.lineWidthPx}
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd={markerEnd}
        />
        {s.anchorStart?.isMagneticallyLocked && (
          <circle
            cx={s.anchorStart.screenPositionPx.x}
            cy={s.anchorStart.screenPositionPx.y}
            r={5}
            fill="#10B981"
            stroke="#022C22"
            strokeWidth={1.5}
          />
        )}
        {s.anchorEnd?.isMagneticallyLocked && (
          <circle
            cx={s.anchorEnd.screenPositionPx.x}
            cy={s.anchorEnd.screenPositionPx.y}
            r={5}
            fill="#F59E0B"
            stroke="#451A03"
            strokeWidth={1.5}
          />
        )}
      </g>
    );
  };

  return (
    <div className={`relative flex flex-col rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-4 text-slate-100 ${className}`}>
      {/* Control Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>TACTICAL TELESTRATION & MAGNETIC ANCHORS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            {(["pen", "arrow", "spotShadow"] as TelestrationToolType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTool(t)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  tool === t ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t === "spotShadow" ? "Spot" : t.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={handleClear}
            className="px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="relative w-full h-[480px] bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-hidden cursor-crosshair">
        <svg
          ref={svgRef}
          className="w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="6"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={selectedColor} />
            </marker>
          </defs>

          {/* Player Snap Anchors Halos */}
          {candidates.map((c) => (
            <g key={c.trackId}>
              <circle
                cx={c.screenPos.x}
                cy={c.screenPos.y}
                r={snapRadiusPx}
                fill="none"
                stroke="#06B6D4"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.4}
              />
              <circle
                cx={c.screenPos.x}
                cy={c.screenPos.y}
                r={4}
                fill={c.type === "skater" ? "#06B6D4" : "#F59E0B"}
              />
              {c.jerseyNumber && (
                <text
                  x={c.screenPos.x + 8}
                  y={c.screenPos.y + 4}
                  fill="#E2E8F0"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  #{c.jerseyNumber}
                </text>
              )}
            </g>
          ))}

          {/* Render Committed Strokes */}
          {strokes.map((s) => renderStrokeSvg(s))}

          {/* Render Active In-Progress Stroke */}
          {currentStroke && renderStrokeSvg(currentStroke, true)}
        </svg>

        {/* Canvas Overlay Footnote */}
        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-mono text-slate-400 pointer-events-none">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Start Lock
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> End Lock
          </span>
          <span>Snap Radius: {snapRadiusPx}px</span>
          <span>Strokes: {strokes.length}</span>
        </div>
      </div>
    </div>
  );
}
