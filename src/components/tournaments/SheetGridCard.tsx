"use client";

import React from "react";
import type { BroadcastAngle, SheetMatchInfo, TournamentSheet } from "./multi-sheet-types";

interface SheetGridCardProps {
  sheet: TournamentSheet;
  matchInfo: SheetMatchInfo | null;
  isSelected: boolean;
  busy: boolean;
  onSelect: (sheetId: string) => void;
  onChangeAngle?: (sheetId: string, angle: BroadcastAngle) => void | Promise<void>;
  onToggleMute?: (sheetId: string, muted: boolean) => void | Promise<void>;
}

function formatClock(seconds: number | null | undefined): string {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function SheetGridCard({
  sheet,
  matchInfo,
  isSelected,
  busy,
  onSelect,
  onChangeAngle,
  onToggleMute,
}: SheetGridCardProps) {
  const isLive = sheet.streamState === "LIVE";
  const homeXg = matchInfo?.homeXg;
  const awayXg = matchInfo?.awayXg;
  const hasXg = typeof homeXg === "number" && typeof awayXg === "number";
  const homeXgPct = hasXg ? Math.round((homeXg / Math.max(homeXg + awayXg, 0.1)) * 100) : 0;

  return (
    <div
      onClick={() => onSelect(sheet.sheetId)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-[#0d121d] p-3 transition-all cursor-pointer ${
        isSelected
          ? "border-cyan-500 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-500"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono text-cyan-400">#{sheet.sheetNumber}</span>
          <span className="text-xs font-bold text-white truncate">{sheet.rinkName}</span>
          {sheet.isPublicShowcase && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SHOWCASE
            </span>
          )}
        </div>
        <span
          className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
            isLive ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-slate-800 text-slate-400"
          }`}
        >
          {sheet.streamState}
        </span>
      </div>

      {matchInfo ? (
        <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800/60 my-1">
          <div className="flex justify-between items-center text-xs font-mono font-bold">
            <span className="text-slate-200 truncate max-w-[90px]">{matchInfo.homeTeam ?? "TBD"}</span>
            <span className="text-white text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {matchInfo.scoreHome ?? "-"} - {matchInfo.scoreAway ?? "-"}
            </span>
            <span className="text-slate-200 truncate max-w-[90px] text-right">{matchInfo.awayTeam ?? "TBD"}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
            <span>
              {matchInfo.period != null ? `P${matchInfo.period}` : "Period --"} •{" "}
              {formatClock(matchInfo.gameClockSeconds)}
            </span>
            <span className="text-cyan-400">
              {hasXg ? `xG ${homeXg.toFixed(2)} - ${awayXg.toFixed(2)}` : "xG not available"}
            </span>
          </div>
          {hasXg && (
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden flex">
              <div className="bg-cyan-500 h-full" style={{ width: `${homeXgPct}%` }} />
              <div className="bg-slate-600 h-full" style={{ width: `${100 - homeXgPct}%` }} />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60 my-1 text-center text-[11px] text-slate-500">
          No match assigned to this sheet
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px]">
        <span className="text-slate-400 font-mono truncate">
          {sheet.fps != null && sheet.bitrateKbps != null
            ? `${sheet.fps} FPS • ${Math.round(sheet.bitrateKbps / 1000)} Mbps`
            : "Telemetry pending"}
        </span>
        <div className="flex items-center gap-1.5">
          {onToggleMute && (
            <button
              type="button"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                void onToggleMute(sheet.sheetId, !sheet.acousticShieldMuted);
              }}
              className={`px-1.5 py-0.5 rounded border text-[10px] ${
                sheet.acousticShieldMuted
                  ? "border-rose-500/40 bg-rose-950/60 text-rose-300"
                  : "border-slate-700 bg-slate-900 text-slate-300"
              }`}
            >
              {sheet.acousticShieldMuted ? "Muted" : "Audio"}
            </button>
          )}
          <select
            value={sheet.activeAngle}
            disabled={busy}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => void onChangeAngle?.(sheet.sheetId, e.target.value as BroadcastAngle)}
            className="bg-slate-900 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
          >
            <option value="TACTICAL_PRIMARY">Tactical Center</option>
            <option value="HIGH_ENDZONE_HOME">Endzone Home</option>
            <option value="HIGH_ENDZONE_AWAY">Endzone Away</option>
            <option value="OVERHEAD_TACTICAL">Overhead</option>
          </select>
        </div>
      </div>
    </div>
  );
}
