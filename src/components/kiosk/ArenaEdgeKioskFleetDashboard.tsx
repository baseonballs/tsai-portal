"use client";

//
//  ArenaEdgeKioskFleetDashboard.tsx
//  tsai-portal
//
//  Turnkey Arena Rig Edge Kiosk Fleet Dashboard
//  Patent Track 15 & Track 16 (P229)
//
//  Strict Platform Invariant 6: Pure physical telemetry (FPS, deg C, seconds, resolution).
//  Zero player skill ratings or subjective scouting grades.
//

import React, { useState } from "react";
import {
  ArenaEdgeKioskNode,
  ArenaEdgeKioskFleetDashboardProps,
  KioskFeedSource,
  ThermalPressureTier,
} from "../../types/arena-kiosk-fleet-types";

export const DEFAULT_FLEET_KIOSKS: ArenaEdgeKioskNode[] = [
  {
    kioskId: "KIOSK-SJ-RINK-A",
    venueName: "Solar4America Ice",
    rinkSheetId: "RINK-A",
    isWakeLockActive: true,
    thermalPressureTier: "NOMINAL",
    activeFeedSource: "COMPOSITE_BROADCAST",
    pods: [
      {
        podId: "POD-A-CENTER",
        isConnected: true,
        fps: 60.0,
        resolution: "4K-UHD",
        lensTemperatureCelsius: 41.2,
        lastHeartbeatAgeSec: 0.4,
      },
      {
        podId: "POD-B-ENDZONE",
        isConnected: true,
        fps: 60.0,
        resolution: "4K-UHD",
        lensTemperatureCelsius: 40.5,
        lastHeartbeatAgeSec: 0.5,
      },
    ],
    systemUptimeSeconds: 14280.0,
    activePeriod: 2,
    periodTimeRemainingSeconds: 845.0,
  },
  {
    kioskId: "KIOSK-SJ-RINK-C",
    venueName: "Solar4America Ice",
    rinkSheetId: "RINK-C",
    isWakeLockActive: true,
    thermalPressureTier: "NOMINAL",
    activeFeedSource: "POD_A",
    pods: [
      {
        podId: "POD-A-CENTER",
        isConnected: true,
        fps: 59.8,
        resolution: "4K-UHD",
        lensTemperatureCelsius: 43.1,
        lastHeartbeatAgeSec: 0.2,
      },
      {
        podId: "POD-B-ENDZONE",
        isConnected: true,
        fps: 60.0,
        resolution: "4K-UHD",
        lensTemperatureCelsius: 42.0,
        lastHeartbeatAgeSec: 0.3,
      },
    ],
    systemUptimeSeconds: 28400.0,
    activePeriod: 1,
    periodTimeRemainingSeconds: 1120.0,
  },
];

const FEED_OPTIONS: { id: KioskFeedSource; label: string }[] = [
  { id: "COMPOSITE_BROADCAST", label: "Composite" },
  { id: "POD_A", label: "Pod A" },
  { id: "POD_B", label: "Pod B" },
  { id: "GOALIE_POV", label: "Goalie POV" },
  { id: "TACTICAL_TWIN", label: "Tactical Twin" },
];

export function ArenaEdgeKioskFleetDashboard({
  initialKiosks = DEFAULT_FLEET_KIOSKS,
  onSelectFeed,
  onToggleWakeLock,
  className = "",
}: ArenaEdgeKioskFleetDashboardProps) {
  const [kiosks, setKiosks] = useState<ArenaEdgeKioskNode[]>(initialKiosks);

  const handleFeedChange = (kioskId: string, feed: KioskFeedSource) => {
    setKiosks((prev) =>
      prev.map((k) => (k.kioskId === kioskId ? { ...k, activeFeedSource: feed } : k))
    );
    onSelectFeed?.(kioskId, feed);
  };

  const handleWakeLockToggle = (kioskId: string) => {
    setKiosks((prev) =>
      prev.map((k) =>
        k.kioskId === kioskId ? { ...k, isWakeLockActive: !k.isWakeLockActive } : k
      )
    );
    onToggleWakeLock?.(kioskId);
  };

  const getThermalBadge = (tier: ThermalPressureTier) => {
    switch (tier) {
      case "CRITICAL":
        return "bg-rose-950/80 border-rose-500 text-rose-300";
      case "SERIOUS":
        return "bg-amber-950/80 border-amber-500 text-amber-300";
      case "FAIR":
        return "bg-cyan-950/80 border-cyan-500 text-cyan-300";
      default:
        return "bg-teal-950/80 border-teal-500 text-teal-300";
    }
  };

  const totalPods = kiosks.reduce((sum, k) => sum + k.pods.length, 0);
  const connectedPods = kiosks.reduce(
    (sum, k) => sum + k.pods.filter((p) => p.isConnected).length,
    0
  );

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-4xl text-slate-100 ${className}`}
      data-testid="arena-edge-kiosk-fleet-dashboard"
    >
      {/* Fleet Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold uppercase tracking-wide text-slate-100">
              Turnkey Arena Rig Edge Kiosk Fleet
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Daemon Controller (P229 Track 16) · Real-Time Edge IPC and Telemetry
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            Kiosks Online: <span className="text-cyan-400 font-semibold">{kiosks.length}</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            Pods Active:{" "}
            <span className="text-teal-400 font-semibold">
              {connectedPods}/{totalPods}
            </span>
          </div>
        </div>
      </div>

      {/* Kiosk Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kiosks.map((kiosk) => {
          const minutes = Math.floor(kiosk.periodTimeRemainingSeconds / 60);
          const seconds = Math.floor(kiosk.periodTimeRemainingSeconds % 60);
          const timeStr = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
          const uptimeHours = (kiosk.systemUptimeSeconds / 3600).toFixed(1);

          return (
            <div
              key={kiosk.kioskId}
              className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                {/* Kiosk Title Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <span>{kiosk.rinkSheetId}</span>
                      <span className="text-xs font-normal text-slate-400">· {kiosk.venueName}</span>
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">{kiosk.kioskId}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${getThermalBadge(
                        kiosk.thermalPressureTier
                      )}`}
                    >
                      {kiosk.thermalPressureTier}
                    </span>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">
                      P{kiosk.activePeriod} · {timeStr}
                    </p>
                  </div>
                </div>

                {/* Wake Lock & Feed Selector */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs text-slate-400">Active Feed:</span>
                  <div className="flex bg-slate-900 border border-slate-800 rounded-md p-0.5 text-[11px]">
                    {FEED_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleFeedChange(kiosk.kioskId, opt.id)}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          kiosk.activeFeedSource === opt.id
                            ? "bg-cyan-600 text-white font-medium"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optical Pod Telemetry Rows */}
                <div className="space-y-2 mb-3">
                  {kiosk.pods.map((pod) => (
                    <div
                      key={pod.podId}
                      className="bg-slate-900/60 border border-slate-800/70 rounded p-2 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            pod.isConnected ? "bg-teal-400" : "bg-rose-500"
                          }`}
                        />
                        <span className="font-mono text-slate-200">{pod.podId}</span>
                        <span className="text-[10px] text-slate-500">({pod.resolution})</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
                        <span>{pod.fps.toFixed(1)} FPS</span>
                        <span className="text-slate-500">|</span>
                        <span>{pod.lensTemperatureCelsius.toFixed(1)}°C</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => handleWakeLockToggle(kiosk.kioskId)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                    kiosk.isWakeLockActive
                      ? "bg-teal-950/60 border-teal-600 text-teal-300"
                      : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      kiosk.isWakeLockActive ? "bg-teal-400 animate-ping" : "bg-slate-500"
                    }`}
                  />
                  <span>W3C Wake Lock: {kiosk.isWakeLockActive ? "LOCKED" : "OFF"}</span>
                </button>

                <div className="font-mono text-[10px] text-slate-500">
                  Uptime: {uptimeHours} hrs
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
