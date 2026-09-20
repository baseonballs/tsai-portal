"use client";

import React, { useState } from "react";
import {
  GoalReviewVerdict,
  GoalLineProjectionData,
  GoalLineReviewCanvasProps,
} from "../../types/goal-line-projection-types";

export const DEFAULT_PROJECTION_DATA: GoalLineProjectionData = {
  puckX: 27.195,
  puckY: 0.12,
  puckZ: 0.04,
  clearanceMarginMm: 4.3,
  crossingPercentage: 100.0,
  isWithinGoalFrame: true,
  opticalConfidence: 0.96,
  verdict: "GOAL_CONFIRMED",
  timestamp: 1204.5,
};

export function GoalLineOrthogonalReviewCanvas({
  projectionData = DEFAULT_PROJECTION_DATA,
  onVerdictChange,
  className = "",
}: GoalLineReviewCanvasProps) {
  const [activeVerdict, setActiveVerdict] = useState<GoalReviewVerdict>(
    projectionData.verdict
  );

  const handleVerdictToggle = (v: GoalReviewVerdict) => {
    setActiveVerdict(v);
    onVerdictChange?.(v);
  };

  const getVerdictBadge = (verdict: GoalReviewVerdict) => {
    switch (verdict) {
      case "GOAL_CONFIRMED":
        return {
          text: "GOAL CONFIRMED",
          bg: "bg-emerald-950/80",
          border: "border-emerald-800",
          textColor: "text-emerald-400",
        };
      case "NO_GOAL":
        return {
          text: "NO GOAL",
          bg: "bg-amber-950/80",
          border: "border-amber-800",
          textColor: "text-amber-400",
        };
      default:
        return {
          text: "INCONCLUSIVE",
          bg: "bg-slate-900/80",
          border: "border-slate-700",
          textColor: "text-slate-400",
        };
    }
  };

  const badge = getVerdictBadge(activeVerdict);

  // SVG coordinate transformation:
  // Center of canvas: x=260 represents goal line centerline (27.1272m).
  // Goal line width (50.8mm) mapped to 60px (x=230 to x=290).
  // Front edge (ice) = 230, Back edge (net) = 290.
  // Clearance > 0 means puck trailing edge > 290.
  const puckRadiusPx = 25; // 38.1mm mapped to ~25px
  const puckCenterPx = 260 + projectionData.clearanceMarginMm * 2.5;

  return (
    <div className={`relative flex flex-col rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-4 text-slate-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>GOAL-LINE ORTHOGONAL PROJECTION ARBITER (PATENT P377)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${badge.bg} border ${badge.border} ${badge.textColor}`}>
            {badge.text}
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-[320px] bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 520 320">
          <defs>
            {/* Ice Sheet Background Texture */}
            <linearGradient id="ice-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0B132B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1C2541" stopOpacity="0.4" />
            </linearGradient>
            {/* Red Goal Line Strip */}
            <linearGradient id="red-line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Ice surface */}
          <rect x="20" y="20" width="480" height="280" fill="url(#ice-grad)" rx="10" stroke="#334155" strokeWidth="1" />

          {/* Goal posts (ice level / overhead projection) */}
          <circle cx="260" cy="50" r="8" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="260" cy="270" r="8" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
          <text x="245" y="40" fill="#94A3B8" fontSize="9" fontFamily="monospace">LEFT POST</text>
          <text x="240" y="295" fill="#94A3B8" fontSize="9" fontFamily="monospace">RIGHT POST</text>

          {/* 2-inch Red Goal Line */}
          <rect x="230" y="50" width="60" height="220" fill="url(#red-line-grad)" stroke="#B91C1C" strokeWidth="1" />

          {/* Leading & Trailing Edge Guide Lines */}
          <line x1="230" y1="30" x2="230" y2="290" stroke="#F87171" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="290" y1="30" x2="290" y2="290" stroke="#F87171" strokeWidth="1.5" />
          <text x="205" y="25" fill="#EF4444" fontSize="9" fontFamily="monospace">LEADING</text>
          <text x="280" y="25" fill="#F87171" fontSize="9" fontFamily="monospace">TRAILING EDGE</text>

          {/* Sub-Millimeter Scale Marks */}
          <line x1="290" y1="160" x2="330" y2="160" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="330" y1="155" x2="330" y2="165" stroke="#38BDF8" strokeWidth="1.5" />
          <text x="335" y="163" fill="#38BDF8" fontSize="9" fontFamily="monospace">
            +{projectionData.clearanceMarginMm.toFixed(1)}mm
          </text>

          {/* Puck 3D Projected Disc */}
          <circle
            cx={puckCenterPx}
            cy="160"
            r={puckRadiusPx}
            fill="#0F172A"
            stroke={projectionData.clearanceMarginMm > 0 ? "#10B981" : "#F59E0B"}
            strokeWidth="3"
            filter="drop-shadow(0px 0px 6px rgba(0,0,0,0.8))"
          />

          {/* Puck Center Dot */}
          <circle cx={puckCenterPx} cy="160" r="3" fill="#38BDF8" />
          <text x={puckCenterPx - 15} y="195" fill="#E2E8F0" fontSize="10" fontFamily="monospace" fontWeight="bold">
            PUCK
          </text>

          {/* Goal Net Mesh Wireframe (Back of Line) */}
          <path d="M 290 50 L 370 70 L 370 250 L 290 270" fill="none" stroke="#64748B" strokeWidth="1" strokeDasharray="4,4" />
        </svg>
      </div>

      {/* Telemetry and Controls Panel */}
      <div className="mt-4 grid grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px]">CLEARANCE MARGIN</div>
          <div className={`text-base font-bold ${projectionData.clearanceMarginMm > 0 ? "text-emerald-400" : "text-amber-400"}`}>
            {projectionData.clearanceMarginMm > 0 ? `+${projectionData.clearanceMarginMm.toFixed(1)} mm` : `${projectionData.clearanceMarginMm.toFixed(1)} mm`}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px]">CROSSING STATUS</div>
          <div className="text-base font-bold text-cyan-400">
            {projectionData.crossingPercentage.toFixed(1)}%
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px]">FRAME CONTAINMENT</div>
          <div className="text-base font-bold text-slate-200">
            {projectionData.isWithinGoalFrame ? "INSIDE POSTS" : "OUTSIDE POSTS"}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px]">OPTICAL CONFIDENCE</div>
          <div className="text-base font-bold text-slate-200">
            {(projectionData.opticalConfidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Official Verdict Buttons */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">OFFICIAL REVIEW OVERRIDE:</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleVerdictToggle("GOAL_CONFIRMED")}
            className={`px-3 py-1 rounded font-semibold border transition ${
              activeVerdict === "GOAL_CONFIRMED"
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-600"
            }`}
          >
            CONFIRM GOAL
          </button>
          <button
            onClick={() => handleVerdictToggle("NO_GOAL")}
            className={`px-3 py-1 rounded font-semibold border transition ${
              activeVerdict === "NO_GOAL"
                ? "bg-amber-600 text-white border-amber-500"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-600"
            }`}
          >
            NO GOAL
          </button>
          <button
            onClick={() => handleVerdictToggle("INCONCLUSIVE")}
            className={`px-3 py-1 rounded font-semibold border transition ${
              activeVerdict === "INCONCLUSIVE"
                ? "bg-slate-700 text-white border-slate-600"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500"
            }`}
          >
            INCONCLUSIVE
          </button>
        </div>
      </div>
    </div>
  );
}
