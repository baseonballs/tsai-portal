"use client";

import React from "react";
import {
  ArenaScoreboardBannerProps,
  SAMPLE_ARENA_SCOREBOARD,
} from "./scoreboard-stream-types";

export function ArenaScoreboardBanner({
  data = SAMPLE_ARENA_SCOREBOARD,
  onRefresh,
  className = "",
}: ArenaScoreboardBannerProps) {
  const { homeTeam, awayTeam, activePenalties } = data;

  return (
    <div
      className={`w-full max-w-5xl mx-auto rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-2xl text-neutral-100 ${className}`}
    >
      {/* Top Bar: Arena Venue & Multicast Stream Health */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-neutral-400">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-semibold text-neutral-200">{data.arenaName}</span>
          <span className="text-neutral-600">•</span>
          <span>{data.gameId}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800">
            <span
              className={`h-2 w-2 rounded-full ${
                data.streamLatencyMs < 180 ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="text-neutral-300 font-bold">{data.streamLatencyMs}ms</span>
            <span className="text-neutral-500">SYNC</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 transition-colors"
              title="Refresh Scoreboard"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Scoreboard Deck */}
      <div className="grid grid-cols-3 items-center gap-4">
        {/* Away Team */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
          <div>
            <span className="text-xs font-bold text-neutral-400 font-mono tracking-wider">AWAY</span>
            <h3 className="text-xl font-black text-white">{awayTeam.code}</h3>
            <p className="text-xs text-neutral-400 truncate max-w-[140px]">{awayTeam.name}</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-white">{awayTeam.score}</span>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
              <span>SOG: {awayTeam.shots}</span> • <span>xG: {awayTeam.xg.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Center Clock & Period */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/60 text-center">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-800 text-amber-400 border border-neutral-700/60">
            Period {data.period}
          </span>
          <span className="text-3xl font-black font-mono tracking-tight text-white my-1">
            {data.clockFormatted}
          </span>
          {data.isWhistleStoppage ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 uppercase tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              STOPPAGE: {data.lastWhistleReason || "WHISTLE"}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-400 font-mono">
              ● CLOCK RUNNING
            </span>
          )}
        </div>

        {/* Home Team */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
          <div className="text-left">
            <span className="text-4xl font-black text-white">{homeTeam.score}</span>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
              <span>SOG: {homeTeam.shots}</span> • <span>xG: {homeTeam.xg.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-neutral-400 font-mono tracking-wider">HOME</span>
            <h3 className="text-xl font-black text-white">{homeTeam.code}</h3>
            <p className="text-xs text-neutral-400 truncate max-w-[140px]">{homeTeam.name}</p>
          </div>
        </div>
      </div>

      {/* Penalty Clocks & Power Play Ticker */}
      {activePenalties && activePenalties.length > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Active Penalties:
          </span>
          {activePenalties.map((pen) => (
            <div
              key={pen.id}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono"
            >
              <span className="font-bold text-rose-400">{pen.teamCode} #{pen.playerNumber}</span>
              <span className="text-neutral-400">{pen.infraction}</span>
              <span className="font-black text-white bg-neutral-800 px-1.5 py-0.5 rounded">
                {Math.floor(pen.remainingSeconds / 60)}:{String(pen.remainingSeconds % 60).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
