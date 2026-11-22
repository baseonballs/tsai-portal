"use client";

import React, { useState } from "react";
import {
  type MultiSheetCommandCenterProps,
  type SheetMatchInfo,
  type TournamentSheet,
} from "./multi-sheet-types";
import { ICalProvisioningModal } from "./ICalProvisioningModal";
import { SheetGridCard } from "./SheetGridCard";

export * from "./multi-sheet-types";

function resolveSheetMatch(
  sheet: TournamentSheet,
  matches: MultiSheetCommandCenterProps["matches"],
): SheetMatchInfo | null {
  if (matches && matches.length > 0) {
    const linked = matches.filter((m) => m.sheetId === sheet.sheetId);
    const chosen =
      linked.find((m) => m.status === "LIVE") ??
      linked.find((m) => m.status === "UPCOMING") ??
      linked[0];
    if (chosen) {
      return {
        matchId: chosen.matchId,
        homeTeam: chosen.homeTeamName,
        awayTeam: chosen.awayTeamName,
        period: chosen.period,
        gameClockSeconds: chosen.clockSeconds,
        scoreHome: chosen.homeScore,
        scoreAway: chosen.awayScore,
        isOvertime: chosen.isOvertime,
      };
    }
  }
  return sheet.matchInfo ?? null;
}

export function MultiSheetCommandCenter({
  sheets,
  matches = [],
  teamId = null,
  tournamentId = null,
  tournamentName = "Tournament Director",
  venueName = null,
  emergencyGlobalAudioMute = false,
  busy = false,
  selectedSheetId: controlledSheetId,
  onSelectSheet,
  onToggleGlobalMute,
  onChangeSheetAngle,
  onToggleSheetMute,
  onDeleteSheet,
  onOpenCreateSheet,
  onSheetsApplied,
}: MultiSheetCommandCenterProps) {
  const [internalSheetId, setInternalSheetId] = useState<string>(sheets[0]?.sheetId || "");
  const [isIcalModalOpen, setIsIcalModalOpen] = useState(false);

  const activeSheetId = controlledSheetId ?? internalSheetId;
  const handleSelectSheet = (sheetId: string) => {
    setInternalSheetId(sheetId);
    onSelectSheet?.(sheetId);
  };

  const activeSheet = sheets.find((s) => s.sheetId === activeSheetId) || sheets[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B0F17] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`flex h-2.5 w-2.5 rounded-full ${
                sheets.some((s) => s.streamState === "LIVE") ? "bg-red-500 animate-ping" : "bg-slate-600"
              }`}
            />
            <h2 className="text-xl font-black tracking-tight text-white uppercase">{tournamentName}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {venueName || "No venue specified"} •{" "}
            <span className="text-cyan-400 font-mono">{sheets.length} Sheet(s) Configured</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenCreateSheet && (
            <button
              type="button"
              disabled={busy || !tournamentId}
              onClick={onOpenCreateSheet}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 disabled:opacity-50"
            >
              + Add Sheet
            </button>
          )}
          <button
            type="button"
            disabled={busy || !tournamentId}
            onClick={() => setIsIcalModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 border border-cyan-500 shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50"
          >
            <span>📅</span> Import iCal Schedule
          </button>
          <button
            type="button"
            disabled={busy || !onToggleGlobalMute || !tournamentId}
            onClick={() => onToggleGlobalMute?.()}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all disabled:opacity-50 ${
              emergencyGlobalAudioMute
                ? "bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            {emergencyGlobalAudioMute ? "⚠️ EMERGENCY AUDIO MUTE ACTIVE" : "🔇 Emergency Global Audio Mute"}
          </button>
        </div>
      </div>

      {sheets.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#0d121d] p-8 text-center text-sm text-slate-400">
          <p className="font-semibold text-white">No rink sheets configured</p>
          <p className="mt-1 text-xs">
            Add a rink sheet or import an iCal schedule to assign feeds and bracket matchups.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {sheets.map((sheet) => (
            <SheetGridCard
              key={sheet.sheetId}
              sheet={sheet}
              matchInfo={resolveSheetMatch(sheet, matches)}
              isSelected={sheet.sheetId === activeSheetId}
              busy={busy}
              onSelect={handleSelectSheet}
              onChangeAngle={onChangeSheetAngle}
              onToggleMute={onToggleSheetMute}
            />
          ))}
        </div>
      )}

      {activeSheet && (
        <div className="bg-[#0B0F17] p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              #{activeSheet.sheetNumber}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{activeSheet.rinkName} Selected</h3>
              <p className="text-xs text-slate-400 font-mono">
                YouTube Broadcast: {activeSheet.youtubeBroadcastId || "Not linked"} •{" "}
                {activeSheet.hardwareHealth?.temperatureCelsius != null
                  ? `Temp: ${activeSheet.hardwareHealth.temperatureCelsius}°C`
                  : "Hardware telemetry not connected"}
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
            {onDeleteSheet && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void onDeleteSheet(activeSheet.sheetId)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-rose-500/40 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 disabled:opacity-50"
              >
                Remove Sheet
              </button>
            )}
          </div>
        </div>
      )}

      <ICalProvisioningModal
        isOpen={isIcalModalOpen}
        onClose={() => setIsIcalModalOpen(false)}
        teamId={teamId}
        tournamentId={tournamentId}
        existingSheetNumbers={sheets.map((s) => s.sheetNumber)}
        emergencyGlobalAudioMute={emergencyGlobalAudioMute}
        onSheetsApplied={onSheetsApplied}
      />
    </div>
  );
}
