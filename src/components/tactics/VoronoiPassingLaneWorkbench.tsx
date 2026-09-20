"use client";

//
//  VoronoiPassingLaneWorkbench.tsx
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 (TSAI-PAT-P384)
//  Sprint 26: Anticipatory Passing Lane Voronoi Shadow & Collapse Field
//

import React, { useState, useMemo } from "react";
import {
  VoronoiPoint,
  VoronoiDefenderNode,
  VoronoiPassingLaneMetrics,
  VoronoiPassingLaneWorkbenchProps,
} from "../../types/voronoi-lane-types";

export const DEFAULT_PASSER: VoronoiPoint = { x: 80, y: 220 };
export const DEFAULT_RECEIVER: VoronoiPoint = { x: 440, y: 220 };

export const DEFAULT_DEFENDERS: VoronoiDefenderNode[] = [
  { id: "DEF-1", label: "Left D", jerseyNumber: "4", x: 220, y: 150, vxMps: 0.5, vyMps: 2.8, stickReachM: 1.6 },
  { id: "DEF-2", label: "Right D", jerseyNumber: "27", x: 300, y: 290, vxMps: -0.2, vyMps: -1.5, stickReachM: 1.6 },
  { id: "DEF-3", label: "Center F", jerseyNumber: "16", x: 260, y: 120, vxMps: 0.0, vyMps: 3.5, stickReachM: 1.6 },
];

export function VoronoiPassingLaneWorkbench({
  passer = DEFAULT_PASSER,
  receiver = DEFAULT_RECEIVER,
  defenders = DEFAULT_DEFENDERS,
  puckSpeedMps = 18.0,
  onLaneSelect,
  className = "",
}: VoronoiPassingLaneWorkbenchProps) {
  const [activeSpeed, setActiveSpeed] = useState<number>(puckSpeedMps);
  const [selectedDefenderId, setSelectedDefenderId] = useState<string | null>(null);

  const metrics: VoronoiPassingLaneMetrics = useMemo(() => {
    const dx = receiver.x - passer.x;
    const dy = receiver.y - passer.y;
    const lengthPx = Math.hypot(dx, dy);
    // 500px in SVG maps to approx 25 meters across attacking zone
    const scale = 25.0 / 500.0;
    const laneLengthM = lengthPx * scale;
    const transitTimeS = laneLengthM / activeSpeed;

    const unitX = dx / lengthPx;
    const unitY = dy / lengthPx;

    let minClearanceM = 999.0;
    let earliestCollapseS = 999.0;
    let criticalDefId: string | undefined = undefined;
    let worstShadowM = 0.0;
    let willCollapse = false;

    defenders.forEach((def) => {
      const px = def.x - passer.x;
      const py = def.y - passer.y;
      const projAlong = px * unitX + py * unitY;
      const clampedProj = Math.max(0, Math.min(lengthPx, projAlong));

      const cpaX = passer.x + clampedProj * unitX;
      const cpaY = passer.y + clampedProj * unitY;
      const perpDistM = Math.hypot(def.x - cpaX, def.y - cpaY) * scale;
      const clearanceM = Math.max(0, perpDistM - def.stickReachM);

      if (clearanceM < minClearanceM) {
        minClearanceM = clearanceM;
        criticalDefId = def.id;
      }

      // Closing velocity toward CPA
      const toCpaX = (cpaX - def.x) * scale;
      const toCpaY = (cpaY - def.y) * scale;
      const dist = Math.hypot(toCpaX, toCpaY);
      let closingV = 0.0;
      if (dist > 0.01) {
        closingV = (def.vxMps * (toCpaX / dist)) + (def.vyMps * (toCpaY / dist));
      }

      const shadowWidth = 2.0 * def.stickReachM + Math.hypot(def.vxMps, def.vyMps) * 0.20;
      if (shadowWidth > worstShadowM) worstShadowM = shadowWidth;

      const puckArrivalAtCpa = (clampedProj * scale) / activeSpeed;
      if (closingV > 0.1 && clearanceM > 0.0) {
        const timeToClose = clearanceM / closingV;
        if (timeToClose < earliestCollapseS) earliestCollapseS = timeToClose;
        if (timeToClose <= puckArrivalAtCpa + 0.12) {
          willCollapse = true;
          criticalDefId = def.id;
        }
      } else if (clearanceM <= 0.0 && projAlong >= 0 && projAlong <= lengthPx) {
        earliestCollapseS = 0.0;
        willCollapse = true;
        criticalDefId = def.id;
      }
    });

    const baseScore = Math.min(1.0, Math.max(0.0, minClearanceM / 3.0));
    const penalty = willCollapse ? 0.70 : earliestCollapseS < transitTimeS * 1.5 ? 0.35 : 0.0;
    const opennessScore = Math.max(0.0, baseScore * (1.0 - penalty));

    return {
      laneLengthM,
      puckTransitTimeS: transitTimeS,
      timeToCollapseS: earliestCollapseS === 999.0 ? 99.0 : earliestCollapseS,
      shadowWidthM: worstShadowM,
      opennessScore,
      isAnticipatedToCollapse: willCollapse,
      criticalDefenderId: criticalDefId,
    };
  }, [passer, receiver, defenders, activeSpeed]);

  return (
    <div className={`relative flex flex-col rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-4 text-slate-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>ANTICIPATORY VORONOI PASSING LANE SHADOW ENGINE</span>
        </div>
        <div className="flex items-center gap-2">
          {metrics.isAnticipatedToCollapse ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 border border-amber-800 text-amber-300">
              COLLAPSE DETECTED ({metrics.criticalDefenderId})
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-300">
              OPEN SEAM PASS
            </span>
          )}
        </div>
      </div>

      {/* SVG Tactical Rink Viewport */}
      <div className="relative w-full h-[360px] bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 520 360">
          <defs>
            <marker id="cyan-arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#06B6D4" />
            </marker>
            <marker id="amber-arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#F59E0B" />
            </marker>
          </defs>

          {/* Neutral Ice Guidelines */}
          <line x1="260" y1="20" x2="260" y2="340" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
          <circle cx="260" cy="180" r="45" fill="none" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />

          {/* Voronoi Shadow Collapse Corridor */}
          {defenders.map((def) => {
            const isCritical = def.id === metrics.criticalDefenderId;
            return (
              <g key={`shadow-${def.id}`}>
                {/* Stick Reach Zone */}
                <circle
                  cx={def.x}
                  cy={def.y}
                  r={def.stickReachM * 20}
                  fill={isCritical && metrics.isAnticipatedToCollapse ? "rgba(245, 158, 11, 0.15)" : "rgba(6, 182, 212, 0.08)"}
                  stroke={isCritical && metrics.isAnticipatedToCollapse ? "#F59E0B" : "#0E7490"}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Velocity Vector Arrow */}
                <line
                  x1={def.x}
                  y1={def.y}
                  x2={def.x + def.vxMps * 15}
                  y2={def.y + def.vyMps * 15}
                  stroke={isCritical && metrics.isAnticipatedToCollapse ? "#F59E0B" : "#06B6D4"}
                  strokeWidth="2"
                  markerEnd={isCritical && metrics.isAnticipatedToCollapse ? "url(#amber-arrow)" : "url(#cyan-arrow)"}
                />
              </g>
            );
          })}

          {/* Passing Lane Vector */}
          <line
            x1={passer.x}
            y1={passer.y}
            x2={receiver.x}
            y2={receiver.y}
            stroke={metrics.isAnticipatedToCollapse ? "#F59E0B" : "#10B981"}
            strokeWidth="3"
            strokeDasharray={metrics.isAnticipatedToCollapse ? "6 3" : undefined}
          />

          {/* Passer Node */}
          <circle cx={passer.x} cy={passer.y} r="14" fill="#0284C7" stroke="#38BDF8" strokeWidth="2" />
          <text x={passer.x} y={passer.y + 4} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
            P
          </text>

          {/* Receiver Node */}
          <circle cx={receiver.x} cy={receiver.y} r="14" fill="#059669" stroke="#34D399" strokeWidth="2" />
          <text x={receiver.x} y={receiver.y + 4} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
            R
          </text>

          {/* Defender Nodes */}
          {defenders.map((def) => {
            const isSelected = selectedDefenderId === def.id;
            return (
              <g
                key={def.id}
                className="cursor-pointer"
                onClick={() => setSelectedDefenderId(isSelected ? null : def.id)}
              >
                <circle
                  cx={def.x}
                  cy={def.y}
                  r="12"
                  fill="#0F172A"
                  stroke={def.id === metrics.criticalDefenderId ? "#F59E0B" : "#64748B"}
                  strokeWidth="2"
                />
                <text x={def.x} y={def.y + 3.5} textAnchor="middle" fill="#E2E8F0" fontSize="9" fontWeight="bold">
                  {def.jerseyNumber}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Control & Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
        <div className="flex flex-col bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px]">LANE LENGTH</span>
          <span className="text-sm font-bold text-cyan-300">{metrics.laneLengthM.toFixed(1)} m</span>
        </div>
        <div className="flex flex-col bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px]">PUCK TRANSIT</span>
          <span className="text-sm font-bold text-slate-200">{(metrics.puckTransitTimeS * 1000).toFixed(0)} ms</span>
        </div>
        <div className="flex flex-col bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px]">TIME TO COLLAPSE</span>
          <span className={`text-sm font-bold ${metrics.timeToCollapseS < 1.0 ? "text-amber-400" : "text-emerald-400"}`}>
            {metrics.timeToCollapseS > 90 ? "STABLE" : `${(metrics.timeToCollapseS * 1000).toFixed(0)} ms`}
          </span>
        </div>
        <div className="flex flex-col bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px]">OPENNESS SCORE</span>
          <span className="text-sm font-bold text-emerald-400">{(metrics.opennessScore * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Puck Speed Slider */}
      <div className="flex items-center justify-between gap-4 mt-3 px-2 text-xs font-mono text-slate-400">
        <span>PUCK RELEASE SPEED: {activeSpeed.toFixed(1)} m/s ({(activeSpeed * 3.6).toFixed(0)} km/h)</span>
        <input
          type="range"
          min="10"
          max="35"
          step="1"
          value={activeSpeed}
          onChange={(e) => setActiveSpeed(parseFloat(e.target.value))}
          className="w-40 accent-cyan-400 cursor-pointer"
        />
      </div>
    </div>
  );
}
