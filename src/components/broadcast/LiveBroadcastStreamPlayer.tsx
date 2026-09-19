"use client";

import React, { useState, useMemo } from "react";
import {
  Video,
  Camera,
  Flame,
  Volume2,
  VolumeX,
  Bookmark,
  Maximize2,
  Radio,
  Clock,
  Shield,
  Layers,
} from "lucide-react";
import {
  type CameraAngle,
  type StreamSource,
  type ScorebugState,
  type XGTelemetryState,
  type LiveBroadcastStreamPlayerProps,
  DEFAULT_STREAM_SOURCES,
  DEFAULT_SCOREBUG,
  DEFAULT_XG,
} from "./broadcast-player-types";

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function LiveBroadcastStreamPlayer({
  initialAngle = "CENTER_ICE",
  sources = DEFAULT_STREAM_SOURCES,
  initialScorebug = DEFAULT_SCOREBUG,
  initialXG = DEFAULT_XG,
  onAngleChange,
  onClipMarked,
}: LiveBroadcastStreamPlayerProps) {
  const [activeAngle, setActiveAngle] = useState<CameraAngle>(initialAngle);
  const [scorebug] = useState<ScorebugState>(initialScorebug);
  const [xgState] = useState<XGTelemetryState>(initialXG);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [bookmarkedNotice, setBookmarkedNotice] = useState<string | null>(null);

  const activeSource: StreamSource = useMemo(() => {
    return sources.find((s) => s.angle === activeAngle) ?? sources[0];
  }, [activeAngle, sources]);

  const totalXG = xgState.homeXG + xgState.awayXG || 1.0;
  const homeXGPercent = Math.round((xgState.homeXG / totalXG) * 100);
  const awayXGPercent = 100 - homeXGPercent;

  const handleAngleSwitch = (angle: CameraAngle) => {
    setActiveAngle(angle);
    onAngleChange?.(angle);
  };

  const handleMarkClip = () => {
    onClipMarked?.(scorebug.clockSeconds, activeAngle);
    setBookmarkedNotice(`Clip marked at ${formatClock(scorebug.clockSeconds)} (${activeSource.label})`);
    setTimeout(() => setBookmarkedNotice(null), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl overflow-hidden font-sans">
      {/* Top Bar: Rink Identity & Stream Status */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold tracking-wider uppercase text-red-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> LIVE
          </span>
          <span className="text-sm font-semibold text-zinc-200">{scorebug.rinkName}</span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-zinc-400">
          <span className="px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 font-mono text-zinc-300">
            {activeSource.resolution}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-mono">
            {activeSource.latencyMs}ms Latency
          </span>
          {scorebug.whistleDucked && (
            <span className="px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-800 text-amber-300 font-mono">
              -24dB Whistle Ducked
            </span>
          )}
        </div>
      </div>

      {/* Main Video Viewport & Scorebug HUD */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {/* Mock Stream Frame Canvas / Player */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/60 pointer-events-none z-10" />

        {/* Video simulation preview */}
        <div className="text-center p-8 z-0">
          <div className="inline-flex p-4 rounded-full bg-zinc-900/90 border border-zinc-700 text-cyan-400 mb-3 shadow-lg">
            <Video className="w-8 h-8 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-zinc-300">{activeSource.label}</p>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Source: {activeSource.streamId} • Ultra-Low Latency Transport
          </p>
        </div>

        {/* Floating Broadcast Scorebug HUD (Top Left) */}
        <div className="absolute top-4 left-4 z-20 flex items-center bg-zinc-900/95 backdrop-blur-md rounded-xl border border-zinc-700/80 shadow-2xl p-1 font-mono text-sm">
          {/* Home Team */}
          <div className="px-3 py-1.5 flex items-center gap-2 border-r border-zinc-800">
            <span className="font-bold text-zinc-100">{scorebug.homeTeam.code}</span>
            <span className="text-lg font-extrabold text-cyan-400">{scorebug.homeTeam.score}</span>
          </div>

          {/* Away Team */}
          <div className="px-3 py-1.5 flex items-center gap-2 border-r border-zinc-800">
            <span className="font-bold text-zinc-100">{scorebug.awayTeam.code}</span>
            <span className="text-lg font-extrabold text-amber-400">{scorebug.awayTeam.score}</span>
          </div>

          {/* Period & Clock */}
          <div className="px-3 py-1.5 flex items-center gap-2 text-zinc-300">
            <span className="text-xs font-bold text-zinc-400">P{scorebug.period}</span>
            <span className="font-bold flex items-center gap-1 text-zinc-100">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              {formatClock(scorebug.clockSeconds)}
            </span>
          </div>
        </div>

        {/* Floating Real-Time xG Threat Badge (Top Right) */}
        <div className="absolute top-4 right-4 z-20 bg-zinc-900/95 backdrop-blur-md rounded-xl border border-zinc-700/80 p-2.5 shadow-2xl flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>xG BATTLE</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-cyan-400 font-bold">{xgState.homeXG.toFixed(2)}</span>
            <span className="text-zinc-500">vs</span>
            <span className="text-amber-400 font-bold">{xgState.awayXG.toFixed(2)}</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
              xgState.lastShotDanger === "HIGH_DANGER"
                ? "bg-red-950/80 text-red-400 border border-red-800"
                : xgState.lastShotDanger === "MEDIUM_DANGER"
                ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                : "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
            }`}
          >
            {xgState.lastShotDanger === "HIGH_DANGER" ? "High Threat" : "Norm Threat"}
          </span>
        </div>

        {/* Feedback Alert Toast */}
        {bookmarkedNotice && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-emerald-900/95 border border-emerald-600 rounded-xl text-xs font-medium text-emerald-100 shadow-2xl flex items-center gap-2 animate-bounce">
            <Shield className="w-4 h-4 text-emerald-400" />
            {bookmarkedNotice}
          </div>
        )}
      </div>

      {/* Control Cockpit: Angle Switcher & xG Differential Bar */}
      <div className="p-4 bg-zinc-900/95 border-t border-zinc-800 space-y-4">
        {/* Multi-Camera Angle Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-zinc-300" /> Camera Angle:
            </span>
            <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
              {sources.map((src) => {
                const isActive = src.angle === activeAngle;
                return (
                  <button
                    key={src.streamId}
                    onClick={() => handleAngleSwitch(src.angle)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-cyan-900/80 text-cyan-200 border border-cyan-700 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                    }`}
                  >
                    {src.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons: Bookmark Clip, Mute, Fullscreen */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkClip}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-cyan-400" /> Mark Clip
            </button>
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition-colors"
              title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live xG Pressure Differential Bar */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1.5">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <Layers className="w-3 h-3" /> {scorebug.homeTeam.code}: {xgState.homeXG.toFixed(2)} xG ({xgState.homeHighDangerChances} HDC)
            </span>
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Kinematic Shot Threat Share
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              {scorebug.awayTeam.code}: {xgState.awayXG.toFixed(2)} xG ({xgState.awayHighDangerChances} HDC)
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${homeXGPercent}%` }}
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
            />
            <div
              style={{ width: `${awayXGPercent}%` }}
              className="h-full bg-gradient-to-l from-amber-600 to-amber-400 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
