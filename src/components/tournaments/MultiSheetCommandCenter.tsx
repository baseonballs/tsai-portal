"use client";

import React, { useState } from "react";

export type BroadcastAngle =
  | "TACTICAL_PRIMARY"
  | "HIGH_ENDZONE_HOME"
  | "HIGH_ENDZONE_AWAY"
  | "OVERHEAD_TACTICAL";

export type SheetStreamState =
  | "UNINITIALIZED"
  | "TESTING"
  | "LIVE"
  | "PAUSED_INTERMISSION"
  | "COMPLETED"
  | "ERROR";

export interface SheetMatchInfo {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  period: number;
  gameClockSeconds: number;
  scoreHome: number;
  scoreAway: number;
  isOvertime: boolean;
}

export interface SheetHardwareHealth {
  temperatureCelsius: number;
  droppedFramesCount: number;
  ispLoadPercentage: number;
  thermalThrottled: boolean;
}

export interface TournamentSheet {
  sheetId: string;
  sheetNumber: number;
  rinkName: string;
  streamState: SheetStreamState;
  youtubeBroadcastId: string;
  youtubeStreamKey: string;
  rtmpsIngestUrl: string;
  playbackUrl: string;
  bitrateKbps: number;
  fps: number;
  activeAngle: BroadcastAngle;
  isPublicShowcase: boolean;
  matchInfo: SheetMatchInfo;
  hardwareHealth: SheetHardwareHealth;
  acousticShieldMuted: boolean;
}

interface MultiSheetCommandCenterProps {
  initialSheets?: TournamentSheet[];
  tournamentName?: string;
  venueName?: string;
}

export function MultiSheetCommandCenter({
  initialSheets = [],
  tournamentName = "International Silver Stick AAA Finals",
  venueName = "Transcend Sports Complex (8-Sheet Facility)",
}: MultiSheetCommandCenterProps) {
  const [sheets, setSheets] = useState<TournamentSheet[]>(initialSheets);
  const [globalMute, setGlobalMute] = useState<boolean>(false);
  const [selectedSheetId, setSelectedSheetId] = useState<string>(
    initialSheets[0]?.sheetId || ""
  );

  const toggleGlobalAcousticShieldMute = () => {
    const nextState = !globalMute;
    setGlobalMute(nextState);
    setSheets((prev) =>
      prev.map((s) => ({
        ...s,
        acousticShieldMuted: nextState,
      }))
    );
  };

  const changeSheetAngle = (sheetId: string, angle: BroadcastAngle) => {
    setSheets((prev) =>
      prev.map((s) => (s.sheetId === sheetId ? { ...s, activeAngle: angle } : s))
    );
  };

  const toggleSheetState = (sheetId: string) => {
    setSheets((prev) =>
      prev.map((s) => {
        if (s.sheetId !== sheetId) return s;
        const next: SheetStreamState =
          s.streamState === "LIVE"
            ? "PAUSED_INTERMISSION"
            : s.streamState === "PAUSED_INTERMISSION"
            ? "LIVE"
            : "LIVE";
        return { ...s, streamState: next };
      })
    );
  };

  const selectedSheet = sheets.find((s) => s.sheetId === selectedSheetId) || sheets[0];

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl font-sans">
      {/* Top Header & Global Director Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Multi-Sheet Tournament Director
            </h1>
            <span className="text-xs px-2.5 py-1 bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono rounded-md">
              {sheets.length} SHEETS ACTIVE
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {tournamentName} • {venueName}
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleGlobalAcousticShieldMute}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 border ${
              globalMute
                ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/50"
                : "bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-200"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
            {globalMute ? "ACOUSTIC SHIELD CUT ACTIVE" : "EMERGENCY AUDIO MUTE"}
          </button>
        </div>
      </div>

      {/* 8-Sheet Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sheets.map((sheet) => {
          const isSelected = sheet.sheetId === selectedSheetId;
          const isLive = sheet.streamState === "LIVE";

          return (
            <div
              key={sheet.sheetId}
              onClick={() => setSelectedSheetId(sheet.sheetId)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? "bg-slate-900/90 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-950/40"
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    S{sheet.sheetNumber}
                  </span>
                  <span className="text-sm font-semibold text-white truncate max-w-[140px]">
                    {sheet.rinkName}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    isLive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : sheet.streamState === "PAUSED_INTERMISSION"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {sheet.streamState}
                </span>
              </div>

              {/* Match Scorebug */}
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-300">
                    {sheet.matchInfo.homeTeam}
                  </span>
                  <span className="text-xs font-medium text-slate-300">
                    {sheet.matchInfo.awayTeam}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono font-bold text-white">
                    {sheet.matchInfo.scoreHome}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {sheet.matchInfo.scoreAway}
                  </span>
                </div>
                <div className="border-l border-slate-800 pl-3 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    P{sheet.matchInfo.period}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {Math.floor(sheet.matchInfo.gameClockSeconds / 60)}:
                    {String(sheet.matchInfo.gameClockSeconds % 60).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Telemetry Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="text-cyan-400">{sheet.fps}fps</span>
                  <span>•</span>
                  <span>{sheet.bitrateKbps}k</span>
                </span>
                <span
                  className={
                    sheet.isPublicShowcase
                      ? "text-purple-400 font-bold"
                      : "text-slate-500"
                  }
                >
                  {sheet.isPublicShowcase ? "SHOWCASE" : "UNLISTED"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Sheet Director Controls */}
      {selectedSheet && (
        <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">
                Sheet {selectedSheet.sheetNumber}: {selectedSheet.rinkName}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {selectedSheet.youtubeBroadcastId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active Angle: <span className="text-cyan-400 font-mono font-semibold">{selectedSheet.activeAngle}</span> • Hardware: {selectedSheet.hardwareHealth.temperatureCelsius}°C (ISP {selectedSheet.hardwareHealth.ispLoadPercentage}%)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Camera Switcher Buttons */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(
                [
                  ["TACTICAL_PRIMARY", "Tactical 1"],
                  ["HIGH_ENDZONE_HOME", "Endzone H"],
                  ["HIGH_ENDZONE_AWAY", "Endzone A"],
                  ["OVERHEAD_TACTICAL", "Overhead"],
                ] as const
              ).map(([angle, label]) => (
                <button
                  key={angle}
                  onClick={() => changeSheetAngle(selectedSheet.sheetId, angle)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    selectedSheet.activeAngle === angle
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Stream Lifecycle Toggle */}
            <button
              onClick={() => toggleSheetState(selectedSheet.sheetId)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
            >
              {selectedSheet.streamState === "LIVE"
                ? "PAUSE (INTERMISSION)"
                : "RESUME BROADCAST"}
            </button>

            {/* Watch Live YouTube Link */}
            <a
              href={selectedSheet.playbackUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 transition-all shadow-md shadow-red-950"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              WATCH YOUTUBE
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
