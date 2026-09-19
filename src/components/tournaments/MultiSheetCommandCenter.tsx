"use client";

import React, { useState } from "react";
import {
  type TournamentSheet,
  type BroadcastAngle,
  type MultiSheetCommandCenterProps,
} from "./multi-sheet-types";
import { ICalProvisioningModal } from "./ICalProvisioningModal";

export * from "./multi-sheet-types";

export function MultiSheetCommandCenter({
  initialSheets = [],
  tournamentName = "International Silver Stick AAA Finals",
  venueName = "Transcend Sports Complex (8-Sheet Facility)",
  selectedSheetId: controlledSheetId,
  onSelectSheet,
}: MultiSheetCommandCenterProps) {
  const [sheets, setSheets] = useState<TournamentSheet[]>(initialSheets);
  const [globalMute, setGlobalMute] = useState<boolean>(false);
  const [internalSheetId, setInternalSheetId] = useState<string>(
    initialSheets[0]?.sheetId || ""
  );
  const [isIcalModalOpen, setIsIcalModalOpen] = useState(false);

  const activeSheetId = controlledSheetId ?? internalSheetId;
  const handleSelectSheet = (sheetId: string) => {
    setInternalSheetId(sheetId);
    onSelectSheet?.(sheetId);
  };

  const toggleGlobalAcousticShieldMute = () => {
    const nextState = !globalMute;
    setGlobalMute(nextState);
    setSheets((prev) =>
      prev.map((s) => ({ ...s, acousticShieldMuted: nextState }))
    );
  };

  const setSheetAngle = (sheetId: string, angle: BroadcastAngle) => {
    setSheets((prev) =>
      prev.map((s) => (s.sheetId === sheetId ? { ...s, activeAngle: angle } : s))
    );
  };

  const activeSheet = sheets.find((s) => s.sheetId === activeSheetId) || sheets[0];

  return (
    <div className="space-y-6">
      {/* ── Director Header HUD ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B0F17] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-xl font-black tracking-tight text-white uppercase">{tournamentName}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {venueName} • <span className="text-cyan-400 font-mono">8-Sheet Synchronized Director Engine</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsIcalModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 border border-cyan-500 shadow-lg shadow-cyan-950/40 transition-all"
          >
            <span>📅</span> Import iCal Schedule
          </button>
          <button
            onClick={toggleGlobalAcousticShieldMute}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all ${
              globalMute
                ? "bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            {globalMute ? "⚠️ EMERGENCY AUDIO MUTE ACTIVE" : "🔇 Cascading Acoustic Shield Mute"}
          </button>
        </div>
      </div>

      {/* ── 8-Sheet Mosaic Video Matrix ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {sheets.map((sheet) => {
          const isSelected = sheet.sheetId === activeSheetId;
          const isLive = sheet.streamState === "LIVE";
          const whistleActive = sheet.matchInfo?.whistleDuckingActive ?? false;
          const homeXg = sheet.matchInfo?.homeXg ?? 1.5;
          const awayXg = sheet.matchInfo?.awayXg ?? 1.5;
          const totalXg = Math.max(homeXg + awayXg, 0.1);
          const homeXgPct = Math.round((homeXg / totalXg) * 100);

          return (
            <div
              key={sheet.sheetId}
              onClick={() => handleSelectSheet(sheet.sheetId)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-[#0d121d] p-3 transition-all cursor-pointer ${
                isSelected
                  ? "border-cyan-500 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-500"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-white truncate">{sheet.rinkName}</span>
                  {sheet.isPublicShowcase && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      SHOWCASE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {whistleActive && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500 text-slate-950 animate-pulse">
                      -24dB WHISTLE
                    </span>
                  )}
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      isLive
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {sheet.streamState}
                  </span>
                </div>
              </div>

              {/* Scorebug HUD & xG Threat Bar */}
              <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800/60 my-1">
                <div className="flex justify-between items-center text-xs font-mono font-bold">
                  <span className="text-slate-200 truncate max-w-[90px]">{sheet.matchInfo.homeTeam}</span>
                  <span className="text-white text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {sheet.matchInfo.scoreHome} - {sheet.matchInfo.scoreAway}
                  </span>
                  <span className="text-slate-200 truncate max-w-[90px] text-right">{sheet.matchInfo.awayTeam}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
                  <span>P{sheet.matchInfo.period} • {Math.floor(sheet.matchInfo.gameClockSeconds / 60)}:{(sheet.matchInfo.gameClockSeconds % 60).toString().padStart(2, "0")}</span>
                  <span className="text-cyan-400">xG {homeXg.toFixed(2)} - {awayXg.toFixed(2)}</span>
                </div>
                {/* Dynamic xG pressure bar */}
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden flex">
                  <div className="bg-cyan-500 h-full" style={{ width: `${homeXgPct}%` }} />
                  <div className="bg-slate-600 h-full" style={{ width: `${100 - homeXgPct}%` }} />
                </div>
              </div>

              {/* Bottom Angle Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                <span className="text-slate-400 font-mono">
                  {sheet.fps} FPS • {Math.round(sheet.bitrateKbps / 1000)} Mbps
                </span>
                <select
                  value={sheet.activeAngle}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setSheetAngle(sheet.sheetId, e.target.value as BroadcastAngle)}
                  className="bg-slate-900 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                >
                  <option value="TACTICAL_PRIMARY">Tactical Center</option>
                  <option value="HIGH_ENDZONE_HOME">Endzone Home</option>
                  <option value="HIGH_ENDZONE_AWAY">Endzone Away</option>
                  <option value="OVERHEAD_TACTICAL">Overhead</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Active Sheet Director Control Bar ── */}
      {activeSheet && (
        <div className="bg-[#0B0F17] p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              #{activeSheet.sheetNumber}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{activeSheet.rinkName} Selected</h3>
              <p className="text-xs text-slate-400 font-mono">
                RTMPS: {activeSheet.rtmpsIngestUrl.slice(0, 32)}... • Temp: {activeSheet.hardwareHealth.temperatureCelsius}°C
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeSheet.playbackUrl && (
              <a
                href={activeSheet.playbackUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 transition-all shadow-md shadow-red-950"
              >
                ▶ WATCH YOUTUBE STREAM
              </a>
            )}
          </div>
        </div>
      )}

      {/* iCal Modal */}
      <ICalProvisioningModal
        isOpen={isIcalModalOpen}
        onClose={() => setIsIcalModalOpen(false)}
        onApplyProvisioning={(newSheets) => {
          setSheets(newSheets);
          if (newSheets.length > 0) setInternalSheetId(newSheets[0].sheetId);
        }}
      />
    </div>
  );
}
