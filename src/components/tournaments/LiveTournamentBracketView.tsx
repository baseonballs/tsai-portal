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

const DEFAULT_MATCHES: BracketMatch[] = [
  // Quarterfinals
  {
    matchId: "m-qf1",
    round: "QUARTERFINALS",
    matchLabel: "QF 1",
    sheetId: "sheet-nhl-center",
    sheetName: "Main Center Arena",
    homeTeam: { name: "Jr. Sharks AAA", score: 4, seed: 1 },
    awayTeam: { name: "Chicago Mission", score: 2, seed: 8 },
    status: "FINAL",
  },
  {
    matchId: "m-qf2",
    round: "QUARTERFINALS",
    matchLabel: "QF 2",
    sheetId: "sheet-olympic-south",
    sheetName: "Olympic South",
    homeTeam: { name: "Toronto Marlboros", score: 3, seed: 4 },
    awayTeam: { name: "Detroit HoneyBaked", score: 3, seed: 5 },
    status: "LIVE",
    period: 3,
    timeRemaining: "0:15 (OT)",
    youtubeUrl: "https://youtube.com/watch?v=live_qf2",
  },
  {
    matchId: "m-qf3",
    round: "QUARTERFINALS",
    matchLabel: "QF 3",
    sheetId: "sheet-north-3",
    sheetName: "North Rink 3",
    homeTeam: { name: "Shattuck St. Mary's", score: 5, seed: 2 },
    awayTeam: { name: "Boston Jr. Eagles", score: 1, seed: 7 },
    status: "FINAL",
  },
  {
    matchId: "m-qf4",
    round: "QUARTERFINALS",
    matchLabel: "QF 4",
    sheetId: "sheet-north-4",
    sheetName: "North Rink 4",
    homeTeam: { name: "Little Caesars", score: 2, seed: 3 },
    awayTeam: { name: "MN Blades", score: 1, seed: 6 },
    status: "LIVE",
    period: 2,
    timeRemaining: "11:42",
    youtubeUrl: "https://youtube.com/watch?v=live_qf4",
  },
  // Semifinals
  {
    matchId: "m-sf1",
    round: "SEMIFINALS",
    matchLabel: "Semi 1",
    sheetId: "sheet-nhl-center",
    sheetName: "Main Center Arena",
    homeTeam: { name: "Jr. Sharks AAA", score: 0, seed: 1 },
    awayTeam: { name: "TBD", score: 0, seed: 4 },
    status: "UPCOMING",
  },
  {
    matchId: "m-sf2",
    round: "SEMIFINALS",
    matchLabel: "Semi 2",
    sheetId: "sheet-olympic-south",
    sheetName: "Olympic South",
    homeTeam: { name: "Shattuck St. Mary's", score: 0, seed: 2 },
    awayTeam: { name: "TBD", score: 0, seed: 3 },
    status: "UPCOMING",
  },
  // Championship
  {
    matchId: "m-final",
    round: "CHAMPIONSHIP",
    matchLabel: "Championship Final",
    sheetId: "sheet-nhl-center",
    sheetName: "Main Center Arena (Showcase)",
    homeTeam: { name: "TBD", score: 0, seed: 1 },
    awayTeam: { name: "TBD", score: 0, seed: 2 },
    status: "UPCOMING",
  },
];

export function LiveTournamentBracketView({
  matches = DEFAULT_MATCHES,
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Round 1: Quarterfinals */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <span>Quarterfinals</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-slate-500">4 Matches</span>
          </div>
          <div className="flex flex-col gap-3">{qfMatches.map(renderMatchCard)}</div>
        </div>

        {/* Round 2: Semifinals */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <span>Semifinals</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-slate-500">2 Matches</span>
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
    </div>
  );
}
