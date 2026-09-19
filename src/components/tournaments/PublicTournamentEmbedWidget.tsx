"use client";

import React, { useState } from "react";
import {
  PublicTournamentEmbedWidgetProps,
  TournamentTickerMatch,
  BracketRound,
} from "./public-tournament-embed-types";

const DEFAULT_MATCHES: TournamentTickerMatch[] = [
  {
    matchId: "m-qf1",
    round: "QUARTERFINALS",
    matchLabel: "Quarterfinal 1",
    sheetId: "sheet-1",
    rinkName: "Rink 1 (Main)",
    homeTeam: { name: "Jr. Sharks AAA", seed: 1, score: 4 },
    awayTeam: { name: "Chicago Mission", seed: 8, score: 2 },
    status: "FINAL",
    winnerTeamName: "Jr. Sharks AAA",
    nextMatchId: "m-sf1",
  },
  {
    matchId: "m-qf2",
    round: "QUARTERFINALS",
    matchLabel: "Quarterfinal 2",
    sheetId: "sheet-2",
    rinkName: "Rink 2 (South)",
    homeTeam: { name: "Toronto Marlboros", seed: 4, score: 3 },
    awayTeam: { name: "Detroit HoneyBaked", seed: 5, score: 2 },
    status: "LIVE",
    period: 3,
    timeRemaining: "02:14",
    nextMatchId: "m-sf1",
  },
  {
    matchId: "m-qf3",
    round: "QUARTERFINALS",
    matchLabel: "Quarterfinal 3",
    sheetId: "sheet-3",
    rinkName: "Rink 3 (East)",
    homeTeam: { name: "Shattuck St. Mary's", seed: 2, score: 5 },
    awayTeam: { name: "Boston Jr. Eagles", seed: 7, score: 1 },
    status: "FINAL",
    winnerTeamName: "Shattuck St. Mary's",
    nextMatchId: "m-sf2",
  },
  {
    matchId: "m-qf4",
    round: "QUARTERFINALS",
    matchLabel: "Quarterfinal 4",
    sheetId: "sheet-4",
    rinkName: "Rink 4 (West)",
    homeTeam: { name: "Minnesota Blades", seed: 3, score: 1 },
    awayTeam: { name: "Mid Fairfield Blues", seed: 6, score: 0 },
    status: "LIVE",
    period: 2,
    timeRemaining: "07:30",
    nextMatchId: "m-sf2",
  },
  {
    matchId: "m-sf1",
    round: "SEMIFINALS",
    matchLabel: "Semifinal 1",
    sheetId: "sheet-1",
    rinkName: "Rink 1 (Main)",
    homeTeam: { name: "Jr. Sharks AAA", seed: 1, score: 0 },
    awayTeam: { name: "TBD", seed: 4, score: 0 },
    status: "UPCOMING",
  },
  {
    matchId: "m-sf2",
    round: "SEMIFINALS",
    matchLabel: "Semifinal 2",
    sheetId: "sheet-2",
    rinkName: "Rink 2 (South)",
    homeTeam: { name: "Shattuck St. Mary's", seed: 2, score: 0 },
    awayTeam: { name: "TBD", seed: 3, score: 0 },
    status: "UPCOMING",
  },
  {
    matchId: "m-final",
    round: "CHAMPIONSHIP",
    matchLabel: "Championship Final",
    sheetId: "sheet-1",
    rinkName: "Main Center Arena",
    homeTeam: { name: "TBD", seed: 1, score: 0 },
    awayTeam: { name: "TBD", seed: 2, score: 0 },
    status: "UPCOMING",
  },
];

export const PublicTournamentEmbedWidget: React.FC<PublicTournamentEmbedWidgetProps> = ({
  config,
  initialMatches = DEFAULT_MATCHES,
  championTeamName,
  onSelectMatchSheet,
}) => {
  const [selectedSheet, setSelectedSheet] = useState<string>("ALL");
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const tournamentId = config?.tournamentId || "tourn-silver-stick-01";
  const tournamentName = config?.tournamentName || "Silver Stick AAA Championship";

  const sheets = Array.from(new Set(initialMatches.map((m) => m.sheetId)));
  const filteredMatches = selectedSheet === "ALL"
    ? initialMatches
    : initialMatches.filter((m) => m.sheetId === selectedSheet);

  const liveOrFinalMatches = filteredMatches.filter((m) => m.status === "LIVE" || m.status === "FINAL");

  const embedSnippet = `<iframe src="https://transcend.hockey/embed/tournament/${tournamentId}" width="100%" height="520" frameborder="0" allow="autoplay; fullscreen" style="border-radius: 12px; border: 1px solid #1e293b;"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl rounded-xl border border-slate-800 bg-slate-950 p-5 text-slate-100 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-semibold tracking-wider text-emerald-400 uppercase">
              Live Multi-Sheet Stream Sync
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white mt-1">{tournamentName}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Sheet Filter Chips */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900/90 p-1 text-xs">
            <button
              onClick={() => setSelectedSheet("ALL")}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${selectedSheet === "ALL" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              All Sheets
            </button>
            {sheets.map((sheetId) => (
              <button
                key={sheetId}
                onClick={() => setSelectedSheet(sheetId)}
                className={`rounded px-2.5 py-1 font-medium uppercase transition-colors ${selectedSheet === sheetId ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                {sheetId.replace("sheet-", "S")}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowEmbedCode(!showEmbedCode)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Embed Widget
          </button>
        </div>
      </div>

      {/* Embed Code Snippet Drawer */}
      {showEmbedCode && (
        <div className="mt-3 rounded-lg border border-cyan-500/30 bg-slate-900/90 p-3 text-xs">
          <div className="flex items-center justify-between text-cyan-300 font-semibold mb-1">
            <span>Public Iframe Embed Code</span>
            <button onClick={handleCopy} className="text-cyan-400 hover:underline">
              {copied ? "✓ Copied!" : "Copy Snippet"}
            </button>
          </div>
          <code className="block rounded bg-slate-950 p-2 font-mono text-[11px] text-slate-300 overflow-x-auto select-all">
            {embedSnippet}
          </code>
        </div>
      )}

      {/* Multi-Sheet Live Score Ticker */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Active Arena Sheets</span>
          <span>{liveOrFinalMatches.length} Tracked Matches</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {liveOrFinalMatches.map((m) => (
            <div
              key={m.matchId}
              onClick={() => onSelectMatchSheet?.(m.sheetId)}
              className="cursor-pointer rounded-lg border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span className="font-semibold text-slate-300 truncate">{m.rinkName}</span>
                {m.status === "LIVE" ? (
                  <span className="flex items-center gap-1 font-mono font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    P{m.period} {m.timeRemaining}
                  </span>
                ) : (
                  <span className="font-mono text-slate-500 font-semibold">FINAL</span>
                )}
              </div>

              {/* Home Team */}
              <div className="flex items-center justify-between text-sm py-0.5">
                <span className={`truncate ${m.winnerTeamName === m.homeTeam.name ? "font-bold text-white" : "text-slate-300"}`}>
                  {m.homeTeam.name}
                </span>
                <span className="font-mono font-bold text-white ml-2">{m.homeTeam.score}</span>
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between text-sm py-0.5">
                <span className={`truncate ${m.winnerTeamName === m.awayTeam.name ? "font-bold text-white" : "text-slate-300"}`}>
                  {m.awayTeam.name}
                </span>
                <span className="font-mono font-bold text-white ml-2">{m.awayTeam.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Bracket Tree View */}
      <div className="mt-6 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Single-Elimination Progression</span>
          {championTeamName && (
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              🏆 Champion: {championTeamName}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["QUARTERFINALS", "SEMIFINALS", "CHAMPIONSHIP"] as BracketRound[]).map((round) => {
            const roundMatches = initialMatches.filter((m) => m.round === round);
            return (
              <div key={round} className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-800">
                  {round}
                </h4>
                <div className="space-y-2">
                  {roundMatches.map((m) => (
                    <div key={m.matchId} className="rounded border border-slate-800/90 bg-slate-950/80 p-2 text-xs">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>{m.matchLabel}</span>
                        <span className="uppercase">{m.status}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className={`truncate ${m.winnerTeamName === m.homeTeam.name ? "font-bold text-emerald-400" : "text-slate-300"}`}>
                          {m.homeTeam.name}
                        </span>
                        <span className="font-mono font-bold text-white">{m.homeTeam.score}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className={`truncate ${m.winnerTeamName === m.awayTeam.name ? "font-bold text-emerald-400" : "text-slate-300"}`}>
                          {m.awayTeam.name}
                        </span>
                        <span className="font-mono font-bold text-white">{m.awayTeam.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
