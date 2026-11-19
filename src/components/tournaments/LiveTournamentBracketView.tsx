"use client";

import React from "react";

export interface BracketMatch {
  matchId: string;
  round: "QUARTERFINALS" | "SEMIFINALS" | "CHAMPIONSHIP";
  matchLabel: string;
  sheetId: string;
  sheetName: string;
  homeTeam: { name: string; score: number; seed: number };
  awayTeam: { name: string; score: number; seed: number };
  status: "UPCOMING" | "LIVE" | "FINAL";
  period?: number;
  timeRemaining?: string;
  youtubeUrl?: string;
}

interface LiveTournamentBracketViewProps {
  matches?: BracketMatch[];
  onSelectMatchSheet?: (sheetId: string) => void;
}

// GA-030 O-01 (T0.4): the built-in bracket (real club names, scores, live clocks) was deleted.
// With no matches the view shows "not yet available"; real brackets arrive with T6.1.
const NO_MATCHES: BracketMatch[] = [];

export function LiveTournamentBracketView({
  matches = NO_MATCHES,
  onSelectMatchSheet,
}: LiveTournamentBracketViewProps) {
  const qfMatches = matches.filter((m) => m.round === "QUARTERFINALS");
  const sfMatches = matches.filter((m) => m.round === "SEMIFINALS");
  const finalMatches = matches.filter((m) => m.round === "CHAMPIONSHIP");

  const renderMatchCard = (match: BracketMatch) => {
    const isLive = match.status === "LIVE";

    return (
      <div
        key={match.matchId}
        onClick={() => onSelectMatchSheet?.(match.sheetId)}
        className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 cursor-pointer ${
          isLive
            ? "bg-slate-900 border-cyan-500/70 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30"
            : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
        }`}
      >
        {/* Card Top Metadata */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-mono font-bold text-slate-400">
            {match.matchLabel} • {match.sheetName}
          </span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded-full ${
              isLive
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse"
                : match.status === "FINAL"
                ? "bg-slate-800 text-slate-400"
                : "bg-cyan-950 text-cyan-400 border border-cyan-800/40"
            }`}
          >
            {isLive ? `LIVE P${match.period} ${match.timeRemaining}` : match.status}
          </span>
        </div>

        {/* Teams and Scores */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-200 font-medium truncate max-w-[140px]">
              <span className="text-slate-500 font-mono text-[10px] mr-1.5">
                #{match.homeTeam.seed}
              </span>
              {match.homeTeam.name}
            </span>
            <span className="font-mono font-bold text-white">
              {match.status !== "UPCOMING" ? match.homeTeam.score : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-200 font-medium truncate max-w-[140px]">
              <span className="text-slate-500 font-mono text-[10px] mr-1.5">
                #{match.awayTeam.seed}
              </span>
              {match.awayTeam.name}
            </span>
            <span className="font-mono font-bold text-white">
              {match.status !== "UPCOMING" ? match.awayTeam.score : "-"}
            </span>
          </div>
        </div>

        {/* Watch Live Button for Active Games */}
        {isLive && match.youtubeUrl && (
          <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-400">Multi-Angle Feed Active</span>
            <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
              WATCH LIVE
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Live Tournament Bracket & Rink Locator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any live match node to switch director console to that sheet
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 font-mono text-slate-400 rounded-md">
          SINGLE-ELIMINATION CHAMPIONSHIP
        </span>
      </div>

      {matches.length === 0 ? (
        <div
          data-testid="tournament-bracket-unavailable"
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-xs text-slate-400"
        >
          <p className="font-semibold text-white text-sm">Bracket: not yet available</p>
          <p className="mt-1">No tournament bracket is connected.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Round 1: Quarterfinals */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <span>Quarterfinals</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-slate-500">{qfMatches.length} Matches</span>
          </div>
          <div className="flex flex-col gap-3">{qfMatches.map(renderMatchCard)}</div>
        </div>

        {/* Round 2: Semifinals */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <span>Semifinals</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-slate-500">{sfMatches.length} Matches</span>
          </div>
          <div className="flex flex-col gap-3 my-auto">{sfMatches.map(renderMatchCard)}</div>
        </div>

        {/* Round 3: Championship */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase flex items-center gap-2">
            <span>Championship Final</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-950 text-amber-300 rounded border border-amber-500/30">
              Gold Medal
            </span>
          </div>
          <div className="flex flex-col gap-3 my-auto">{finalMatches.map(renderMatchCard)}</div>
        </div>
      </div>
      )}
    </div>
  );
}
