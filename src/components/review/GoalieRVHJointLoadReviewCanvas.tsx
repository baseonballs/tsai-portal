"use client";

//
//  GoalieRVHJointLoadReviewCanvas.tsx
//  tsai-portal
//
//  Transcend Platform - Patent P394
//  Goaltender Reverse-VH (RVH) Post-Lean Hip Compression Sentry
//
//  Strict Platform Invariant 6: Pure physical joint angles (deg), force (N), impulse (N*s), time (s, ms).
//  Zero player skill ratings or subjective scouting grades.
//

import React, { useState } from "react";
import {
  GoalieRVHReviewData,
  GoalieRVHCanvasProps,
  RVHPostSide,
} from "../../types/goalie-rvh-canvas-types";

export const DEFAULT_RVH_REVIEW_DATA: GoalieRVHReviewData = {
  sampleId: "RVH-P394-001",
  goalieIdentifier: "Goalie 35",
  timestampSec: 842.0,
  postSide: "left_post",
  hipInternalRotationDeg: 39.5,
  hipFlexionDeg: 74.0,
  torsoLeanAngleDeg: 28.5,
  skatePostCompressionForceN: 460.0,
  dwellDurationSec: 3.4,
  cumulativeImpulseNs: 1564.0,
  jointImpingementRiskIndex: 0.86,
  riskLevel: "ACUTE_FAI_HAZARD",
  criticalIRThresholdDeg: 38.0,
  criticalFlexionThresholdDeg: 70.0,
  processingLatencyMs: 4,
};

export function GoalieRVHJointLoadReviewCanvas({
  data = DEFAULT_RVH_REVIEW_DATA,
  onPostSideToggle,
  className = "",
}: GoalieRVHCanvasProps) {
  const [selectedSide, setSelectedSide] = useState<RVHPostSide>(data.postSide);

  const handleSideToggle = (side: RVHPostSide) => {
    setSelectedSide(side);
    onPostSideToggle?.(side);
  };

  const isAcute = data.riskLevel === "ACUTE_FAI_HAZARD";
  const isElevated = data.riskLevel === "ELEVATED_IMPINGEMENT_RISK";

  const badgeStyle = isAcute
    ? "bg-rose-950/80 border-rose-500 text-rose-300"
    : isElevated
    ? "bg-amber-950/80 border-amber-500 text-amber-300"
    : "bg-teal-950/80 border-teal-500 text-teal-300";

  const isLeftPost = selectedSide === "left_post";
  const postX = isLeftPost ? 60 : 320;
  const hipX = isLeftPost ? 180 : 200;
  const hipY = 80;
  const kneeX = isLeftPost ? 110 : 270;
  const kneeY = 150;
  const skateX = postX + (isLeftPost ? 8 : -8);
  const skateY = 175;

  const metrics = [
    { label: "Hip Int. Rotation", value: `${data.hipInternalRotationDeg.toFixed(1)} deg` },
    { label: "Hip Flexion", value: `${data.hipFlexionDeg.toFixed(1)} deg` },
    { label: "Torso Post-Lean", value: `${data.torsoLeanAngleDeg.toFixed(1)} deg` },
    { label: "Compression Force", value: `${data.skatePostCompressionForceN.toFixed(1)} N` },
    { label: "Seal Dwell Duration", value: `${data.dwellDurationSec.toFixed(2)} s` },
    { label: "Cumulative Impulse", value: `${data.cumulativeImpulseNs.toFixed(0)} N·s` },
  ];

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-2xl text-slate-100 ${className}`}
      data-testid="goalie-rvh-joint-load-review-canvas"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold uppercase tracking-wide text-slate-100">
              RVH Joint Load Sentry (P394)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {data.goalieIdentifier} · t={data.timestampSec.toFixed(1)}s ({data.sampleId})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {(["left_post", "right_post"] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => handleSideToggle(side)}
                className={`px-3 py-1 rounded transition-colors ${
                  selectedSide === side ? "bg-cyan-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {side === "left_post" ? "Left Post" : "Right Post"}
              </button>
            ))}
          </div>

          <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${badgeStyle}`}>
            {isAcute ? "ACUTE FAI HAZARD" : isElevated ? "ELEVATED IMPINGEMENT" : "NOMINAL ALIGNMENT"}
          </div>
        </div>
      </div>

      {/* SVG RVH Skeletal Kinematics Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 mb-4 flex flex-col items-center">
        <svg viewBox="0 0 380 190" className="w-full h-44 max-w-lg" role="img" aria-label="RVH Biomechanical Diagram">
          <line x1="20" y1="180" x2="360" y2="180" stroke="#334155" strokeWidth="2" />
          <text x="320" y="175" fill="#64748b" fontSize="9" fontFamily="monospace">ICE PLANE</text>

          {/* Goal post cylinder */}
          <rect x={postX - 6} y="25" width="12" height="155" rx="4" fill="#e11d48" stroke="#be123c" strokeWidth="1.5" />
          <text x={postX - (isLeftPost ? 25 : -10)} y="45" fill="#f43f5e" fontSize="9" fontFamily="monospace">
            POST PIPE
          </text>

          {/* Skate to post contact force vector */}
          <line x1={skateX} y1={skateY} x2={isLeftPost ? skateX + 30 : skateX - 30} y2={skateY} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          <text x={isLeftPost ? skateX + 35 : skateX - 70} y={skateY + 3} fill="#fbbf24" fontSize="8" fontFamily="monospace">
            {data.skatePostCompressionForceN.toFixed(0)} N
          </text>

          {/* Pad seal line on ice */}
          <line x1={skateX} y1="178" x2={isLeftPost ? skateX + 90 : skateX - 90} y2="178" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />

          {/* Skeletal links */}
          <line x1={skateX} y1={skateY} x2={kneeX} y2={kneeY} stroke="#94a3b8" strokeWidth="2.5" />
          <line x1={kneeX} y1={kneeY} x2={hipX} y2={hipY} stroke={isAcute ? "#f43f5e" : isElevated ? "#fbbf24" : "#14b8a6"} strokeWidth="3" />
          <line x1={hipX} y1={hipY} x2={isLeftPost ? hipX - 25 : hipX + 25} y2={hipY - 45} stroke="#cbd5e1" strokeWidth="2.5" />

          {/* Joint nodes */}
          <circle cx={skateX} cy={skateY} r="4" fill="#38bdf8" />
          <circle cx={kneeX} cy={kneeY} r="4" fill="#38bdf8" />
          <circle cx={hipX} cy={hipY} r="6" fill={isAcute ? "#f43f5e" : isElevated ? "#fbbf24" : "#14b8a6"} stroke="#ffffff" strokeWidth="1.5" />

          {/* Hip internal rotation label */}
          <text x={hipX + (isLeftPost ? 12 : -75)} y={hipY - 8} fill={isAcute ? "#fda4af" : isElevated ? "#fde68a" : "#99f6e4"} fontSize="10" fontFamily="monospace" fontWeight="bold">
            θ_IR: {data.hipInternalRotationDeg.toFixed(1)}°
          </text>
        </svg>

        <div className="flex justify-between w-full text-[11px] text-slate-400 mt-2 px-2">
          <span>Critical IR Threshold: {data.criticalIRThresholdDeg.toFixed(1)}°</span>
          <span>Critical Flexion: {data.criticalFlexionThresholdDeg.toFixed(1)}°</span>
        </div>
      </div>

      {/* SI Biomechanical Telemetry Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-slate-800/50 border border-slate-700/60 p-3 rounded-lg">
            <p className="text-[10px] uppercase font-mono text-slate-400">{m.label}</p>
            <p className="text-base font-semibold text-slate-100 mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Footer Status Bar */}
      <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
        <div>
          <span>Joint Impingement Index (JIRI): </span>
          <span className="font-semibold text-slate-200">{data.jointImpingementRiskIndex.toFixed(3)}</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Inference: {data.processingLatencyMs}ms (Limit: 10ms)
        </div>
      </div>
    </div>
  );
}
