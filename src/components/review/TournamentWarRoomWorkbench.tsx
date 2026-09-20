"use client";

//
//  TournamentWarRoomWorkbench.tsx
//  tsai-portal
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Palette: slate/zinc/cyan/emerald/amber/rose only
//  Rule: Component < 300 lines
//

import React, { useState } from "react";
import { AlertTriangle, Radio, Tv, ShieldAlert, CheckCircle2, Clock, Layers, Flame, Activity, Send } from "lucide-react";
import { SheetMonitoringView, TournamentWarRoomProps, WarRoomAlertUI } from "../../types/tournament-war-room-portal-types";

export const DEFAULT_SHEETS: SheetMonitoringView[] = [
  { sheetId: "sheet-1", sheetName: "Rink 1 - North Arena", homeTeam: "Edina Green", awayTeam: "Wayzata Blue", score: "3 - 2", periodClock: "P3 14:00", cameraCount: 4, hasCriticalAlert: true, status: "live" },
  { sheetId: "sheet-2", sheetName: "Rink 2 - South Arena", homeTeam: "Minnetonka White", awayTeam: "Eden Prairie Red", score: "1 - 1", periodClock: "P2 07:00", cameraCount: 4, hasCriticalAlert: false, status: "live" },
  { sheetId: "sheet-3", sheetName: "Rink 3 - East Studio", homeTeam: "Duluth East", awayTeam: "Hermantown Hawks", score: "4 - 0", periodClock: "INT 2", cameraCount: 3, hasCriticalAlert: false, status: "intermission" },
];

export const DEFAULT_ALERTS: WarRoomAlertUI[] = [
  { id: "alt-1", sheetId: "sheet-1", sheetName: "Rink 1 - North", timestamp: "10s ago", type: "concussion", severity: "critical", title: "Concussion Risk Alert (52.4g, 610 N·s)", details: "High-G collision at center-ice red line. SCAT6 sideline triage recommended.", telemetryValue: "52.4g / 610 N·s", resolved: false },
  { id: "alt-2", sheetId: "sheet-2", sheetName: "Rink 2 - South", timestamp: "3m ago", type: "review", severity: "medium", title: "Goal Line Review Requested", details: "Crossbar rebound deflection; referee tablet scrubbing initiated.", resolved: true },
];

export function TournamentWarRoomWorkbench({
  facilityName = "National Sports Center Super Rink",
  initialSheets = DEFAULT_SHEETS,
  initialAlerts = DEFAULT_ALERTS,
  onDispatchDirective,
  onResolveAlert,
}: TournamentWarRoomProps) {
  const [sheets] = useState<SheetMonitoringView[]>(initialSheets);
  const [alerts, setAlerts] = useState<WarRoomAlertUI[]>(initialAlerts);
  const [selectedSheetId, setSelectedSheetId] = useState<string>(initialSheets[0]?.sheetId || "");
  const [selectedAngle, setSelectedAngle] = useState<string>("overhead");
  const [directiveNote, setDirectiveNote] = useState<string>("");

  const activeSheet = sheets.find((s) => s.sheetId === selectedSheetId) || sheets[0];

  const handleResolve = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)));
    onResolveAlert?.(alertId);
  };

  const handleSendDirective = (action: string) => {
    onDispatchDirective?.(selectedSheetId, `${action}: ${directiveNote || "Standard Protocol"}`);
    setDirectiveNote("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 rounded-xl border border-slate-800 p-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Tournament War Room Centralizer</h1>
            <p className="text-xs text-slate-400">{facilityName} • Multi-Camera Cross-Sheet Control (TSAI-PAT-P398)</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 mr-1" />
            PTP Clock Synced (&lt; 15ms)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6 flex-1 min-h-0">
        <div className="col-span-8 flex flex-col space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {sheets.map((sheet) => {
              const isSelected = sheet.sheetId === selectedSheetId;
              return (
                <button
                  key={sheet.sheetId}
                  onClick={() => setSelectedSheetId(sheet.sheetId)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected ? "bg-slate-900 border-cyan-500 text-slate-100 shadow-md shadow-cyan-500/10" : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{sheet.sheetName}</span>
                    {sheet.hasCriticalAlert && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-200">{sheet.homeTeam} vs {sheet.awayTeam}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-cyan-400 font-bold">{sheet.score}</span>
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{sheet.periodClock}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex-1 bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-slate-200">{activeSheet?.sheetName} — Multi-Angle Synchronized Video</span>
              </div>
              <div className="flex items-center space-x-1">
                {(["overhead", "broadcast", "endzone_north", "endzone_south"] as const).map((ang) => (
                  <button
                    key={ang}
                    onClick={() => setSelectedAngle(ang)}
                    className={`px-2.5 py-1 text-xs rounded capitalize transition ${
                      selectedAngle === ang ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {ang.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-4 aspect-video bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="text-center">
                <Layers className="w-10 h-10 text-cyan-500/40 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-300">Angle: <span className="text-cyan-400 font-mono uppercase">{selectedAngle}</span></div>
                <div className="text-xs text-slate-500 mt-1">1080p60 WebRTC Low-Latency Mesh Stream • 0ms SEI Frame Smear</div>
              </div>
              <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700/60 px-3 py-1.5 rounded text-xs font-mono">
                <span className="text-emerald-400">● LIVE</span> {activeSheet?.periodClock} | {activeSheet?.score}
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Dispatch war room directive to sheet officials..."
                value={directiveNote}
                onChange={(e) => setDirectiveNote(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleSendDirective("FREEZE_CLOCK")}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded flex items-center"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                Freeze Clock
              </button>
              <button
                onClick={() => handleSendDirective("SUMMON_MEDIC")}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded flex items-center"
              >
                <Flame className="w-3.5 h-3.5 mr-1" />
                Summon Medic
              </button>
              <button
                onClick={() => handleSendDirective("CUSTOM")}
                className="px-3 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded flex items-center"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-4 bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-slate-200">Incident Feed</h2>
            </div>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
              {alerts.filter((a) => !a.resolved).length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
            {alerts.map((alert) => {
              const isCrit = alert.severity === "critical";
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs transition ${
                    alert.resolved ? "bg-slate-950/40 border-slate-800/60 opacity-60" : isCrit ? "bg-rose-950/20 border-rose-500/40" : "bg-amber-950/20 border-amber-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">{alert.sheetName}</span>
                    <span className="text-slate-500 font-mono">{alert.timestamp}</span>
                  </div>
                  <div className="mt-1 font-semibold text-slate-100">{alert.title}</div>
                  <p className="mt-1 text-slate-400 text-[11px] leading-relaxed">{alert.details}</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded font-mono uppercase text-[10px] ${
                        isCrit ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    {!alert.resolved ? (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center text-[11px]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Resolve Incident
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Resolved</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
