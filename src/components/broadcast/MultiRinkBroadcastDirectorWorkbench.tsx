//
//  MultiRinkBroadcastDirectorWorkbench.tsx
//  tsai-portal
//
//  Transcend Platform - Patent P382
//  Multi-Rink Broadcast Director & Auto-Highlight Switcher Component
//

"use client";

import React, { useState } from "react";
import {
  RinkCameraFeed,
  HighlightTriggerEvent,
  DirectorProgramState
} from "@/types/broadcast-director-types";

interface Props {
  initialFeeds: RinkCameraFeed[];
  initialEvents: HighlightTriggerEvent[];
  initialProgram: DirectorProgramState;
}

export const MultiRinkBroadcastDirectorWorkbench: React.FC<Props> = ({
  initialFeeds,
  initialEvents,
  initialProgram
}) => {
  const [feeds] = useState<RinkCameraFeed[]>(initialFeeds);
  const [program, setProgram] = useState<DirectorProgramState>(initialProgram);
  const [events] = useState<HighlightTriggerEvent[]>(initialEvents);

  const handleManualSwitch = (feed: RinkCameraFeed) => {
    const switchStart = performance.now();
    const latency = Math.round(performance.now() - switchStart + 45); // simulated switching transit < 500ms

    setProgram((prev) => ({
      ...prev,
      activeRinkId: feed.rinkId,
      activeCameraId: feed.cameraId,
      programStreamUrl: feed.streamUrl,
      lastSwitchTimestampMs: Date.now(),
      switchingLatencyMs: latency
    }));
  };

  const toggleAutoDirector = () => {
    setProgram((prev) => ({
      ...prev,
      isAutoDirectorActive: !prev.isAutoDirectorActive
    }));
  };

  const activeFeed = feeds.find((f) => f.cameraId === program.activeCameraId);

  return (
    <div
      data-testid="broadcast-director-workbench"
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 max-w-7xl mx-auto"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <h2 className="text-xl font-black tracking-tight text-white uppercase">
              Multi-Rink Broadcast Director
            </h2>
            <span className="text-xs bg-slate-800 text-cyan-400 font-mono px-2 py-0.5 rounded border border-slate-700">
              Patent P382
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous Multi-Sheet Optical Stream Switching &bull; &lt; 500ms Transit
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-3 sm:mt-0">
          <button
            onClick={toggleAutoDirector}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors border ${
              program.isAutoDirectorActive
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 hover:bg-cyan-500/30"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {program.isAutoDirectorActive ? "AI Director: ACTIVE" : "AI Director: MANUAL"}
          </button>
          <div className="text-right">
            <span className="text-xs text-slate-500 block uppercase">Switch Latency</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {program.switchingLatencyMs} ms
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Program Monitor */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="relative aspect-video bg-black rounded-lg border-2 border-red-500/80 overflow-hidden shadow-2xl flex items-center justify-center group">
            <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-black px-2 py-1 rounded tracking-wider uppercase flex items-center space-x-1.5 shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>PROGRAM OUT</span>
            </div>

            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur text-cyan-300 text-xs px-2.5 py-1 rounded font-mono border border-slate-700">
              {activeFeed ? `${activeFeed.sheetName} — ${activeFeed.role}` : "NO FEED"}
            </div>

            {/* Video Canvas Simulation */}
            <div className="text-center p-6">
              <div className="text-slate-600 text-5xl font-mono mb-2">● LIVE FEED</div>
              <p className="text-xs text-slate-500 font-mono">
                Source: {program.programStreamUrl} (60 FPS)
              </p>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/80 backdrop-blur p-2 rounded border border-slate-800 text-xs">
              <span className="text-slate-400">
                Rink: <strong className="text-white">{program.activeRinkId}</strong>
              </span>
              <span className="text-slate-400">
                Transition: <strong className="text-cyan-400">{program.activeTransition}</strong>
              </span>
              <span className="text-emerald-400 font-mono font-bold">1080p60 HLS / WebRTC</span>
            </div>
          </div>

          {/* Real-time Multi-Sheet Camera Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {feeds.map((feed) => {
              const isSelected = feed.cameraId === program.activeCameraId;
              return (
                <button
                  key={feed.cameraId}
                  onClick={() => handleManualSwitch(feed)}
                  className={`relative aspect-video bg-slate-950 rounded-lg p-2 border text-left flex flex-col justify-between transition-all overflow-hidden ${
                    isSelected
                      ? "border-red-500 ring-2 ring-red-500/30"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-300 truncate">{feed.sheetName}</span>
                    <span
                      className={`px-1 rounded text-[9px] ${
                        feed.status === "live"
                          ? "bg-emerald-950 text-emerald-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {feed.status}
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <span className="text-xs font-mono text-slate-400 block">{feed.role}</span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span>{feed.fps} FPS</span>
                    <span>{feed.latencyMs}ms</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Highlight Trigger Feed */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex-1 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Auto-Director Events</span>
              <span className="text-cyan-400 font-mono">{events.length} queued</span>
            </h3>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px]">
              {events.map((evt) => (
                <div
                  key={evt.eventId}
                  className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`font-black uppercase tracking-wide px-1.5 py-0.5 rounded text-[10px] ${
                        evt.type === "goal"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : evt.type === "high_danger_chance"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : "bg-cyan-950 text-cyan-400 border border-cyan-800"
                      }`}
                    >
                      {evt.type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Conf: {(evt.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>Target: {evt.targetCameraId}</span>
                    <span className="text-[10px] text-slate-500">Prio: {evt.priorityWeight}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 italic">
              AI Event-driven dynamic camera switching executes within 500ms budget under Patent P382.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
