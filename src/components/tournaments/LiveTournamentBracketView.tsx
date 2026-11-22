"use client";

import React from "react";
import type { BracketMatch, BracketRound, TournamentSheet } from "./multi-sheet-types";

export type { BracketMatch };

interface LiveTournamentBracketViewProps {
  matches?: BracketMatch[];
  sheets?: TournamentSheet[];
  tournamentId?: string | null;
  busy?: boolean;
  onSelectMatchSheet?: (sheetId: string) => void;
  onAddMatch?: () => void;
  onEditMatch?: (match: BracketMatch) => void;
}

const ROUND_ORDER: Array<{ key: BracketRound; label: string; accent?: boolean }> = [
  { key: "POOL", label: "Pool Play" },
  { key: "ROUND_OF_16", label: "Round of 16" },
  { key: "QUARTERFINALS", label: "Quarterfinals" },
  { key: "SEMIFINALS", label: "Semifinals" },
  { key: "THIRD_PLACE", label: "Third Place" },
  { key: "CHAMPIONSHIP", label: "Championship Final", accent: true },
];

function formatClock(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds)) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function LiveTournamentBracketView({
  matches = [],
  sheets = [],
  tournamentId = null,
  busy = false,
  onSelectMatchSheet,
  onAddMatch,
  onEditMatch,
}: LiveTournamentBracketViewProps) {
  const sheetById = new Map(sheets.map((s) => [s.sheetId, s]));
  const activeRounds = ROUND_ORDER.filter((r) => matches.some((m) => m.round === r.key));

  const renderStatusBadge = (match: BracketMatch) => {
    if (match.status === "LIVE") {
      const clock = formatClock(match.clockSeconds);
      const periodLabel = match.period != null ? `P${match.period}` : "";
      const suffix = [periodLabel, clock].filter(Boolean).join(" ");
      return (
        <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
          {suffix ? `LIVE ${suffix}` : "LIVE"}
        </span>
      );
    }
    if (match.status === "CANCELLED") {
      return (
        <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/30">
          CANCELLED
        </span>
      );
    }
    if (match.status === "FINAL") {
      return (
        <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          {match.isOvertime ? "FINAL OT" : "FINAL"}
        </span>
      );
    }
    return (
      <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40">
        UPCOMING
      </span>
    );
  };

  const renderMatchCard = (match: BracketMatch) => {
    const sheet = match.sheetId ? sheetById.get(match.sheetId) : undefined;
    const sheetLabel = sheet ? `#${sheet.sheetNumber} ${sheet.rinkName}` : "Sheet TBD";
    const showScores = match.status !== "UPCOMING" || match.homeScore != null || match.awayScore != null;

    return (
      <div
        key={match.matchId}
        onClick={() => {
          if (match.sheetId) onSelectMatchSheet?.(match.sheetId);
        }}
        className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
          match.sheetId ? "cursor-pointer" : ""
        } ${
          match.status === "LIVE"
            ? "bg-slate-900 border-cyan-500/70 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30"
            : match.status === "CANCELLED"
            ? "bg-slate-900/40 border-rose-900/50 opacity-75"
            : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
        }`}
      >
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-mono font-bold text-slate-400 truncate">
            {match.matchLabel} • {sheetLabel}
          </span>
          {renderStatusBadge(match)}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span
              className={`truncate max-w-[160px] ${
                match.winnerSide === "home" ? "text-cyan-300 font-bold" : "text-slate-200 font-medium"
              }`}
            >
              {match.homeSeed != null && (
                <span className="text-slate-500 font-mono text-[10px] mr-1.5">#{match.homeSeed}</span>
              )}
              {match.homeTeamName ?? "TBD"}
            </span>
            <span className="font-mono font-bold text-white">
              {showScores && match.homeScore != null ? match.homeScore : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span
              className={`truncate max-w-[160px] ${
                match.winnerSide === "away" ? "text-cyan-300 font-bold" : "text-slate-200 font-medium"
              }`}
            >
              {match.awaySeed != null && (
                <span className="text-slate-500 font-mono text-[10px] mr-1.5">#{match.awaySeed}</span>
              )}
              {match.awayTeamName ?? "TBD"}
            </span>
            <span className="font-mono font-bold text-white">
              {showScores && match.awayScore != null ? match.awayScore : "-"}
            </span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
          {sheet?.playbackUrl && match.status === "LIVE" ? (
            <span className="font-bold text-red-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
              FEED ACTIVE
            </span>
          ) : (
            <span className="text-slate-500 font-mono">
              {match.nextMatchSlot ? `Advances → ${match.nextMatchSlot}` : "Match node"}
            </span>
          )}
          {onEditMatch && (
            <button
              type="button"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                onEditMatch(match);
              }}
              className="px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-cyan-500/50"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Live Tournament Bracket & Rink Locator</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click a match with an assigned sheet to focus it above, or edit scores to advance winners
          </p>
        </div>
        {onAddMatch && (
          <button
            type="button"
            disabled={busy || !tournamentId}
            onClick={onAddMatch}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500 disabled:opacity-50"
          >
            + Add Match
          </button>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-xs text-slate-400">
          <p className="font-semibold text-white text-sm">No bracket matches scheduled yet</p>
          <p className="mt-1">Add a match to start populating pool play or elimination rounds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeRounds.map((roundDef) => {
            const roundMatches = matches
              .filter((m) => m.round === roundDef.key)
              .sort((a, b) => a.sortOrder - b.sortOrder);
            return (
              <div key={roundDef.key} className="flex flex-col gap-3">
                <div
                  className={`text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 ${
                    roundDef.accent ? "text-amber-400" : "text-slate-400"
                  }`}
                >
                  <span>{roundDef.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-slate-400">
                    {roundMatches.length} {roundMatches.length === 1 ? "Match" : "Matches"}
                  </span>
                </div>
                <div className="flex flex-col gap-3">{roundMatches.map(renderMatchCard)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
