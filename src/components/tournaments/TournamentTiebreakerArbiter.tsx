"use client";

import React, { useState } from "react";
import { Trophy, Scale, ArrowRight } from "lucide-react";
import {
  RankedTeamStanding,
  BracketSeedMatch,
} from "./tournament-tiebreaker-types";
import {
  DEFAULT_STANDINGS,
  DEFAULT_BRACKET_SEEDS,
} from "./tournament-tiebreaker-constants";

interface TournamentTiebreakerArbiterProps {
  divisionName?: string;
  standings?: RankedTeamStanding[];
  bracketSeeds?: BracketSeedMatch[];
}

export function TournamentTiebreakerArbiter({
  divisionName = "16U Tier 1 AAA National Invitational",
  standings = DEFAULT_STANDINGS,
  bracketSeeds = DEFAULT_BRACKET_SEEDS,
}: TournamentTiebreakerArbiterProps) {
  const [activeTab, setActiveTab] = useState<"standings" | "bracket" | "bylaws">("standings");

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-2xl">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">{divisionName}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            USA Hockey / Hockey Canada Official Bylaw Arbiter & Playoff Seed Generator
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab("standings")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "standings" ? "bg-cyan-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Standings & Ties
          </button>
          <button
            onClick={() => setActiveTab("bracket")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "bracket" ? "bg-cyan-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Bracket Seeds
          </button>
          <button
            onClick={() => setActiveTab("bylaws")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "bylaws" ? "bg-cyan-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Bylaw Rules
          </button>
        </div>
      </div>

      {activeTab === "standings" && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2.5 text-center">Seed</th>
                <th className="px-4 py-2.5">Team</th>
                <th className="px-2 py-2.5 text-center">GP</th>
                <th className="px-2 py-2.5 text-center">Record (W-L-T)</th>
                <th className="px-3 py-2.5 text-center font-bold text-cyan-400">PTS</th>
                <th className="px-2 py-2.5 text-center">GF</th>
                <th className="px-2 py-2.5 text-center">GA</th>
                <th className="px-2 py-2.5 text-center" title="USA Hockey +/- 5 Cap per game">Diff (±5)</th>
                <th className="px-2 py-2.5 text-center">PW</th>
                <th className="px-2 py-2.5 text-center">PIM</th>
                <th className="px-4 py-2.5">Tiebreaker Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {standings.map((s) => {
                const isPlayoff = s.seed <= 8;
                return (
                  <tr key={s.team.teamId} className={`hover:bg-slate-900/40 transition ${isPlayoff ? "bg-slate-950" : "opacity-75"}`}>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        s.seed <= 4 ? "bg-emerald-950 border border-emerald-500/50 text-emerald-300" :
                        s.seed <= 8 ? "bg-sky-950 border border-sky-500/50 text-sky-300" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        #{s.seed}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{s.team.teamName}</td>
                    <td className="px-2 py-3 text-center text-slate-300">{s.team.gamesPlayed}</td>
                    <td className="px-2 py-3 text-center text-slate-300">{s.team.wins}-{s.team.losses}-{s.team.ties}</td>
                    <td className="px-3 py-3 text-center font-bold text-cyan-400 text-sm">{s.team.points}</td>
                    <td className="px-2 py-3 text-center text-slate-300">{s.team.goalsFor}</td>
                    <td className="px-2 py-3 text-center text-slate-300">{s.team.goalsAgainst}</td>
                    <td className="px-2 py-3 text-center">
                      <span className={s.team.cappedGoalDifferential >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {s.team.cappedGoalDifferential > 0 ? `+${s.team.cappedGoalDifferential}` : s.team.cappedGoalDifferential}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center text-slate-300">{s.team.periodWins}</td>
                    <td className="px-2 py-3 text-center text-slate-300">{s.team.penaltyMinutes}m</td>
                    <td className="px-4 py-3 text-slate-300 text-[11px] font-mono">
                      <span className="rounded bg-slate-900 px-2 py-1 border border-slate-800">
                        {s.tiebreakerReason}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "bracket" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bracketSeeds.map((b, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-2">
                <span className="font-semibold text-cyan-400">{b.round} • MATCH {idx + 1}</span>
                <span>{b.sheetName}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">#{b.seed1}</span>
                    <span className="text-xs font-semibold text-white">{b.team1}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">HOME</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sky-400">#{b.seed2}</span>
                    <span className="text-xs font-semibold text-white">{b.team2}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">AWAY</span>
                </div>
              </div>
              <div className="mt-3 flex justify-between items-center text-[11px] text-slate-400">
                <span>Start: <strong className="text-slate-200">{b.scheduledTime}</strong></span>
                <span className="flex items-center gap-1 text-cyan-400 font-medium">
                  Live Feed <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "bylaws" && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Scale className="h-4 w-4" />
            <span>Official USA Hockey Tournament Tiebreaker Protocol</span>
          </div>
          <ol className="list-decimal pl-5 space-y-2 leading-relaxed text-slate-300">
            <li><strong>Total Points:</strong> 2 points per win, 1 point per tie or OT/SO loss.</li>
            <li><strong>Head-to-Head:</strong> If all tied teams played each other, result of head-to-head competition decides.</li>
            <li><strong>Goal Differential (±5 Max Cap):</strong> Total goals for minus goals against with per-game differential capped at ±5 goals to prevent running up the score.</li>
            <li><strong>Fewest Goals Allowed:</strong> Aggregate goals surrendered across all preliminary round games.</li>
            <li><strong>Period Wins:</strong> Highest total period points (1 pt per period won, 0.5 per period tied).</li>
            <li><strong>Fewest Penalty Minutes:</strong> Total penalty minutes assessed across all games.</li>
            <li><strong>Earliest Goal Scored:</strong> Time of first goal scored in preliminary round play.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
