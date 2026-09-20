"use client";

import React, { useState } from "react";
import {
  PowerplayPositionRole,
  PowerplaySkaterNode,
  PowerplaySequenceMetrics,
  PowerplayUmbrellaCanvasProps,
} from "../../types/powerplay-umbrella-types";

export const DEFAULT_131_NODES: PowerplaySkaterNode[] = [
  { role: "highPoint", label: "High Point", x: 260, y: 70, jerseyNumber: "8" },
  { role: "leftFlank", label: "Left Flank", x: 90, y: 200, jerseyNumber: "19" },
  { role: "rightFlank", label: "Right Flank", x: 430, y: 200, jerseyNumber: "88" },
  { role: "bumperSlot", label: "Bumper", x: 260, y: 220, jerseyNumber: "97" },
  { role: "netFront", label: "Net Front", x: 260, y: 350, jerseyNumber: "11" },
];

export function PowerplayUmbrellaCanvas({
  activeSequence = {
    passDistanceM: 10.5,
    releaseSpeedMps: 22.4,
    catchToReleaseLatencyS: 0.22,
    isRoyalRoadCrossed: true,
    shotTier: "highDangerSnapShot",
  },
  onRoleSelect,
  className = "",
}: PowerplayUmbrellaCanvasProps) {
  const [selectedRole, setSelectedRole] = useState<PowerplayPositionRole>("rightFlank");

  const handleSelect = (role: PowerplayPositionRole) => {
    setSelectedRole(role);
    onRoleSelect?.(role);
  };

  return (
    <div className={`relative flex flex-col rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-4 text-slate-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>POWERPLAY 1-3-1 DIAMOND UMBRELLA TACTICAL HUD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-300">
            {activeSequence.shotTier === "highDangerSnapShot" ? "HIGH DANGER SNAP" : "STANDARD CYCLE"}
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-[400px] bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 520 400">
          <defs>
            <marker id="cyan-arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#06B6D4" />
            </marker>
          </defs>

          {/* Goal Crease Arc & Frame */}
          <path
            d="M 220 370 A 40 40 0 0 1 300 370 Z"
            fill="#06B6D4"
            fillOpacity={0.12}
            stroke="#06B6D4"
            strokeWidth={1.5}
          />
          <rect x={235} y={370} width={50} height={12} fill="#EF4444" fillOpacity={0.8} />

          {/* Royal Road Centerline */}
          <line
            x1={260}
            y1={50}
            x2={260}
            y2={370}
            stroke="#334155"
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          {/* Diamond Umbrella Passing Lanes */}
          <line x1={260} y1={70} x2={90} y2={200} stroke="#06B6D4" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />
          <line x1={260} y1={70} x2={430} y2={200} stroke="#06B6D4" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />
          <line x1={260} y1={70} x2={260} y2={220} stroke="#06B6D4" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />
          <line x1={90} y1={200} x2={260} y2={220} stroke="#06B6D4" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />
          <line x1={430} y1={200} x2={260} y2={220} stroke="#06B6D4" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />
          <line x1={260} y1={220} x2={260} y2={350} stroke="#06B6D4" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />

          {/* Active Seam Pass & Shot Vector */}
          <line
            x1={90}
            y1={200}
            x2={420}
            y2={200}
            stroke="#06B6D4"
            strokeWidth={2.5}
            markerEnd="url(#cyan-arrow)"
          />
          <line
            x1={430}
            y1={200}
            x2={270}
            y2={370}
            stroke="#10B981"
            strokeWidth={2}
            strokeDasharray="4 2"
          />

          {/* Skater Nodes */}
          {DEFAULT_131_NODES.map((node) => {
            const isSelected = selectedRole === node.role;
            return (
              <g
                key={node.role}
                onClick={() => handleSelect(node.role)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 18 : 14}
                  fill={isSelected ? "#06B6D4" : "#1E293B"}
                  stroke={isSelected ? "#E2E8F0" : "#475569"}
                  strokeWidth={2}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill={isSelected ? "#0F172A" : "#F8FAFC"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {node.jerseyNumber}
                </text>
                <text
                  x={node.x}
                  y={node.y + 26}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tactical Metrics Footnote */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300 pointer-events-none bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1">
            <span className="text-slate-500">Seam Pass:</span>
            <strong className="text-cyan-400">{activeSequence.passDistanceM.toFixed(1)}m</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-500">Release:</span>
            <strong className="text-emerald-400">{activeSequence.releaseSpeedMps.toFixed(1)} m/s</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-500">Quickness:</span>
            <strong className="text-amber-400">{(activeSequence.catchToReleaseLatencyS * 1000).toFixed(0)}ms</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-500">Royal Road:</span>
            <strong className={activeSequence.isRoyalRoadCrossed ? "text-emerald-400" : "text-rose-400"}>
              {activeSequence.isRoyalRoadCrossed ? "YES" : "NO"}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
