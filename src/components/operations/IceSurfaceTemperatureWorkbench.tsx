"use client";

import React, { useState } from "react";
import {
  IceSurfaceTemperatureWorkbenchProps,
  SheetThermalData,
  SheetThermalStatus,
} from "../../types/ice-surface-portal-types";

export const IceSurfaceTemperatureWorkbench: React.FC<IceSurfaceTemperatureWorkbenchProps> = ({
  sheets,
  onDispatchZamboni,
  onAdjustChillerSetPoint,
}) => {
  const [selectedSheetId, setSelectedSheetId] = useState<string>(sheets[0]?.sheetId || "");
  const [dispatchedSheets, setDispatchedSheets] = useState<Record<string, boolean>>({});

  const activeSheet = sheets.find((s) => s.sheetId === selectedSheetId) || sheets[0];

  const getStatusBadge = (status: SheetThermalStatus) => {
    switch (status) {
      case "OPTIMAL_FAST":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          text: "text-emerald-400",
          label: "OPTIMAL FAST",
        };
      case "ACCEPTABLE_STANDARD":
        return {
          bg: "bg-sky-500/10",
          border: "border-sky-500/30",
          text: "text-sky-400",
          label: "STANDARD",
        };
      case "DEGRADED_SLOW":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          label: "DEGRADED SLOW",
        };
      case "SLUSH_WARNING":
      default:
        return {
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          text: "text-rose-400",
          label: "SLUSH ALERT",
        };
    }
  };

  const handleDispatch = (sheet: SheetThermalData) => {
    setDispatchedSheets((prev) => ({ ...prev, [sheet.sheetId]: true }));
    onDispatchZamboni?.(sheet.sheetId, sheet.recommendedCutDepthMm);
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400">PAT-P406</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Operations Arena Rig
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Multi-Sheet Ice Surface Thermal & Zamboni Forecaster
          </h1>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-400">Monitored Surfaces</div>
          <div className="text-sm font-mono text-white font-bold">{sheets.length} Sheets Active</div>
        </div>
      </div>

      {/* Sheets Navigation Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {sheets.map((sheet) => {
          const badge = getStatusBadge(sheet.status);
          const isSelected = sheet.sheetId === selectedSheetId;
          return (
            <button
              key={sheet.sheetId}
              onClick={() => setSelectedSheetId(sheet.sheetId)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? "border-cyan-500/60 bg-zinc-900 shadow-md"
                  : "border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{sheet.sheetName}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${badge.bg} ${badge.border} ${badge.text}`}>
                  {badge.label}
                </span>
              </div>
              <div className="text-lg font-mono font-black text-white">
                {sheet.iceSurfaceTemperatureCelsius.toFixed(1)}°C
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Friction: <span className="font-mono text-zinc-200">{sheet.estimatedKineticFriction.toFixed(3)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Sheet Detail Panel */}
      {activeSheet && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">{activeSheet.sheetName} Thermal Matrix</h2>
              <p className="text-xs text-zinc-400">Real-time thermodynamic heat flux & subfloor brine status</p>
            </div>
            {activeSheet.condensationRisk && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                CONDENSATION / FOG RISK DETECTED
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
              <div className="text-xs text-zinc-400">Subfloor Brine</div>
              <div className="text-lg font-mono font-bold text-white mt-1">
                {activeSheet.subFloorBrineTemperatureCelsius.toFixed(1)}°C
              </div>
            </div>
            <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
              <div className="text-xs text-zinc-400">Ambient Air</div>
              <div className="text-lg font-mono font-bold text-white mt-1">
                {activeSheet.ambientAirTemperatureCelsius.toFixed(1)}°C / {activeSheet.ambientRelativeHumidityPct}% RH
              </div>
            </div>
            <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
              <div className="text-xs text-zinc-400">Degradation Window</div>
              <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                {activeSheet.minutesRemainingUntilDegraded} min
              </div>
            </div>
            <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
              <div className="text-xs text-zinc-400">Prescribed Cut</div>
              <div className="text-lg font-mono font-bold text-cyan-400 mt-1">
                {activeSheet.recommendedCutDepthMm.toFixed(1)} mm @ {activeSheet.recommendedWaterTempC}°C
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => onAdjustChillerSetPoint?.(activeSheet.sheetId, -7.5)}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
            >
              Chiller Step-Down (-7.5°C)
            </button>
            <button
              onClick={() => handleDispatch(activeSheet)}
              disabled={dispatchedSheets[activeSheet.sheetId]}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                dispatchedSheets[activeSheet.sheetId]
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40"
              }`}
            >
              {dispatchedSheets[activeSheet.sheetId] ? "Zamboni Dispatched" : "Dispatch Resurfacing Cut"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
