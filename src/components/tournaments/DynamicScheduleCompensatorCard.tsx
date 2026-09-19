'use client';

import React, { useState } from 'react';
import { Clock, AlertTriangle, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import type {
  CompensatorTelemetryState,
  RebalanceRecommendation,
  ScheduledTournamentGame,
} from './schedule-compensator-types';

interface DynamicScheduleCompensatorCardProps {
  initialState: CompensatorTelemetryState;
  onApplyRecommendation?: (recommendation: RebalanceRecommendation) => void;
}

export function DynamicScheduleCompensatorCard({
  initialState,
  onApplyRecommendation,
}: DynamicScheduleCompensatorCardProps) {
  const [state, setState] = useState<CompensatorTelemetryState>(initialState);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const handleApply = (rec: RebalanceRecommendation) => {
    setAppliedIds((prev) => new Set(prev).add(rec.gameId));
    setState((prev) => ({
      ...prev,
      games: prev.games.map((g) =>
        g.gameId === rec.gameId
          ? {
              ...g,
              reassignedSheetId: rec.toSheetId,
              delayMinutes: Math.max(0, g.delayMinutes - rec.delaySavedMinutes),
            }
          : g
      ),
      recommendations: prev.recommendations.filter((r) => r.gameId !== rec.gameId),
    }));
    onApplyRecommendation?.(rec);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-bold tracking-wide text-zinc-100">
              Dynamic Schedule Auto-Compensator
            </h2>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">
              Patent Track 16
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Real-time multi-sheet overtime cascade balancing and ice-flood buffer mitigation
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Clock className="h-4 w-4 text-zinc-400" />
          <span>Audited: {state.lastAuditedTimestamp}</span>
        </div>
      </div>

      {/* Sheets Status Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {state.sheets.map((sheet) => (
          <div
            key={sheet.sheetId}
            className={`rounded-lg border p-3 ${
              sheet.currentDelayMinutes > 15
                ? 'border-amber-700/50 bg-amber-950/20'
                : 'border-zinc-800 bg-zinc-900/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">{sheet.sheetName}</span>
              {sheet.inOvertime && (
                <span className="rounded bg-rose-950/80 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800/60">
                  OT DELAY
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-zinc-100">
                +{sheet.currentDelayMinutes}m
              </span>
              <span className="text-[11px] text-zinc-500">
                Flood: {sheet.floodBufferMinutes}m
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Rebalance Recommendations */}
      {state.recommendations.length > 0 && (
        <div className="mt-5 rounded-lg border border-sky-800/60 bg-sky-950/20 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <AlertTriangle className="h-4 w-4 text-sky-400" />
            <span>Active Inter-Sheet Optimization Opportunities</span>
          </div>
          <div className="mt-2 space-y-2">
            {state.recommendations.map((rec) => (
              <div
                key={rec.gameId}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-200">
                    {rec.homeTeam} vs {rec.awayTeam}
                  </span>
                  <span className="text-zinc-400">Rebalance:</span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-zinc-300">
                    {rec.fromSheetId}
                  </span>
                  <ArrowRight className="h-3 w-3 text-zinc-400" />
                  <span className="rounded bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 font-mono text-emerald-400">
                    {rec.toSheetId}
                  </span>
                  <span className="text-emerald-400 font-medium">
                    (Saves {rec.delaySavedMinutes}m)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleApply(rec)}
                  className="inline-flex items-center gap-1 rounded bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-500 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reassign Sheet
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Downstream Games Schedule */}
      <div className="mt-5 overflow-hidden rounded-lg border border-zinc-800">
        <div className="bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 border-b border-zinc-800">
          Cascade Impact on Downstream Games
        </div>
        <div className="divide-y divide-zinc-800/60">
          {state.games.map((game) => (
            <div
              key={game.gameId}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs hover:bg-zinc-900/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-zinc-300">
                  {game.reassignedSheetId ?? game.sheetId}
                </span>
                <span className="font-semibold text-zinc-100">
                  {game.homeTeam} vs {game.awayTeam}
                </span>
                {game.reassignedSheetId && (
                  <span className="rounded bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 text-[10px] text-emerald-400">
                    Shifted from {game.sheetId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-zinc-400">
                    Sched: <span className="text-zinc-200">{game.scheduledStartTime}</span>
                  </div>
                  <div className="font-medium text-zinc-100">
                    Proj:{' '}
                    <span
                      className={
                        game.delayMinutes > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'
                      }
                    >
                      {game.projectedStartTime}
                    </span>
                  </div>
                </div>

                {game.delayMinutes > 0 ? (
                  <span className="rounded bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                    +{game.delayMinutes}m delay
                  </span>
                ) : (
                  <span className="rounded bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                    On Time
                  </span>
                )}

                {game.warmupCompressionMinutes < 10 && (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                    Warmup: {game.warmupCompressionMinutes}m
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
