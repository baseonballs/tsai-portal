"use client";

//
//  CrossbarElevationTriangulationCanvas.tsx
//  tsai-portal
//
//  Transcend Platform - Patent P390
//  Live Multi-Sheet Epipolar Puck Elevation & Net Crossbar Triangulation Arbiter
//

import React, { useState } from "react";
import {
  CrossbarArbitrationDecision,
  PuckElevationReviewData,
  CrossbarElevationCanvasProps,
} from "../../types/crossbar-elevation-canvas-types";

export const DEFAULT_REVIEW_DATA: PuckElevationReviewData = {
  reviewId: "REV-P390-001",
  timestampSec: 1420.5,
  puckX: 0.15,
  puckY: 0.05,
  puckZ: 1.2542, // +35mm above crossbar
  crossbarElevationM: 1.2192,
  elevationDeltaMm: 35.0,
  uncertaintyMarginMm: 7.5,
  decision: "ABOVE_CROSSBAR",
  confidencePercent: 99.8,
  cameraCount: 3,
  processingLatencyMs: 12,
};

export function CrossbarElevationTriangulationCanvas({
  data = DEFAULT_REVIEW_DATA,
  onDecisionChange,
  className = "",
}: CrossbarElevationCanvasProps) {
  const [activeDecision, setActiveDecision] = useState<CrossbarArbitrationDecision>(
    data.decision
  );

  const handleDecisionToggle = (d: CrossbarArbitrationDecision) => {
    setActiveDecision(d);
    onDecisionChange?.(d);
  };

  const isAbove = activeDecision === "ABOVE_CROSSBAR";
  const isBelow = activeDecision === "BELOW_CROSSBAR";
  const isInconclusive = activeDecision === "INCONCLUSIVE_UNCERTAINTY_BAND";

  const badgeStyle = isAbove
    ? "bg-rose-950/80 border-rose-500 text-rose-300"
    : isBelow
    ? "bg-teal-950/80 border-teal-500 text-teal-300"
    : "bg-amber-950/80 border-amber-500 text-amber-300";

  // SVG Geometry: Crossbar at Z=1.2192m.
  // Viewbox: 0 0 400 220
  // Left post: x=80, Right post: x=320, Crossbar: y=80, Ice surface: y=190
  const crossbarY = 80;
  const iceY = 190;
  const leftPostX = 80;
  const rightPostX = 320;

  // Map puck delta to SVG Y: 1mm = 0.8px in SVG
  const puckSvgX = 200 + data.puckX * 100;
  const puckSvgY = crossbarY - data.elevationDeltaMm * 0.8;
  const bandHalfHeightPx = data.uncertaintyMarginMm * 0.8;

  return (
    <div
      data-testid="crossbar-elevation-canvas"
      className={`bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md text-slate-100 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold tracking-tight text-white">
              EPIPOLAR PUCK ELEVATION & CROSSBAR TRIANGULATION ARBITER
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            TSAI-PAT-P390 · MULTI-CAMERA 3D RAY INTERSECTION · 1.2192m NET HORIZON
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${badgeStyle}`}>
            {activeDecision.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Main Review Visualization */}
      <div className="relative bg-slate-950/90 rounded-lg p-3 border border-slate-800 mb-4 flex flex-col items-center">
        <svg viewBox="0 0 400 220" className="w-full max-w-lg h-52 overflow-visible">
          {/* Ice surface line */}
          <line x1="30" y1={iceY} x2="370" y2={iceY} stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <text x="35" y={iceY + 14} fill="#64748b" fontSize="9" fontFamily="monospace">ICE LEVEL (Z = 0.00m)</text>

          {/* Goal Net Posts & Crossbar */}
          <line x1={leftPostX} y1={iceY} x2={leftPostX} y2={crossbarY} stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />
          <line x1={rightPostX} y1={iceY} x2={rightPostX} y2={crossbarY} stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />
          <line x1={leftPostX} y1={crossbarY} x2={rightPostX} y2={crossbarY} stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />

          {/* 3-Sigma Uncertainty Band around crossbar */}
          <rect
            x={leftPostX - 10}
            y={crossbarY - bandHalfHeightPx}
            width={rightPostX - leftPostX + 20}
            height={bandHalfHeightPx * 2}
            fill="#f59e0b"
            fillOpacity="0.12"
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text x={rightPostX + 15} y={crossbarY + 3} fill="#f59e0b" fontSize="8" fontFamily="monospace">
            ±{data.uncertaintyMarginMm}mm (3σ BAND)
          </text>

          {/* Crossbar Reference Label */}
          <text x={leftPostX - 15} y={crossbarY - 8} fill="#ef4444" fontSize="9" fontFamily="monospace" textAnchor="end">
            CROSSBAR (1.2192m)
          </text>

          {/* Simulated Epipolar Rays */}
          <line x1="40" y1="20" x2={puckSvgX} y2={puckSvgY} stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <line x1="360" y1="20" x2={puckSvgX} y2={puckSvgY} stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <line x1="200" y1="10" x2={puckSvgX} y2={puckSvgY} stroke="#14b8a6" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />

          {/* Triangulated Puck */}
          <circle cx={puckSvgX} cy={puckSvgY} r="7" fill="#0f172a" stroke="#22d3ee" strokeWidth="2.5" />
          <circle cx={puckSvgX} cy={puckSvgY} r="2" fill="#ffffff" />

          {/* Elevation Delta Callout */}
          <line x1={puckSvgX} y1={puckSvgY} x2={puckSvgX} y2={crossbarY} stroke="#38bdf8" strokeWidth="1.5" />
          <rect x={puckSvgX + 12} y={puckSvgY - 10} width="72" height="18" rx="3" fill="#0284c7" fillOpacity="0.85" />
          <text x={puckSvgX + 16} y={puckSvgY + 3} fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
            {data.elevationDeltaMm > 0 ? `+${data.elevationDeltaMm}mm` : `${data.elevationDeltaMm}mm`}
          </text>
        </svg>

        {/* Verdict Manual Override Selectors (for simulation) */}
        <div className="flex space-x-2 mt-2 text-xs">
          <button
            onClick={() => handleDecisionToggle("ABOVE_CROSSBAR")}
            className={`px-3 py-1 rounded font-mono border transition-all ${
              isAbove ? "bg-rose-500/20 border-rose-500 text-rose-300" : "border-slate-800 text-slate-400"
            }`}
          >
            ABOVE CROSSBAR
          </button>
          <button
            onClick={() => handleDecisionToggle("BELOW_CROSSBAR")}
            className={`px-3 py-1 rounded font-mono border transition-all ${
              isBelow ? "bg-teal-500/20 border-teal-500 text-teal-300" : "border-slate-800 text-slate-400"
            }`}
          >
            BELOW CROSSBAR
          </button>
          <button
            onClick={() => handleDecisionToggle("INCONCLUSIVE_UNCERTAINTY_BAND")}
            className={`px-3 py-1 rounded font-mono border transition-all ${
              isInconclusive ? "bg-amber-500/20 border-amber-500 text-amber-300" : "border-slate-800 text-slate-400"
            }`}
          >
            INCONCLUSIVE
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block">TRIANGULATED Z</span>
          <span className="font-mono font-bold text-cyan-400">{data.puckZ.toFixed(4)} m</span>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block">ELEVATION DELTA (Δz)</span>
          <span className={`font-mono font-bold ${data.elevationDeltaMm > 0 ? "text-rose-400" : "text-teal-400"}`}>
            {data.elevationDeltaMm > 0 ? `+${data.elevationDeltaMm}` : data.elevationDeltaMm} mm
          </span>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block">3σ UNCERTAINTY BAND</span>
          <span className="font-mono font-bold text-white">±{data.uncertaintyMarginMm} mm</span>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block">OPTICAL CONFIDENCE</span>
          <span className="font-mono font-bold text-teal-400">{data.confidencePercent}% ({data.cameraCount} CAMS)</span>
        </div>
      </div>
    </div>
  );
}
