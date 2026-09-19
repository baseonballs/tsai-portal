'use client';

import React from 'react';
import {
  TournamentSheetScore,
  PowerplayState,
} from '@/types/tournament-ticker-types';

interface TournamentLiveTickerBannerProps {
  sheets: TournamentSheetScore[];
  tournamentName?: string;
  onSelectSheet?: (sheetId: string) => void;
}

export const TournamentLiveTickerBanner: React.FC<TournamentLiveTickerBannerProps> = ({
  sheets,
  tournamentName = 'Transcend Live Tournament',
  onSelectSheet,
}) => {
  const formatClock = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPowerplayBadge = (pp: PowerplayState) => {
    switch (pp) {
      case 'home_powerplay':
        return (
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
            PP HOME
          </span>
        );
      case 'away_powerplay':
        return (
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
            PP AWAY
          </span>
        );
      case '5v3_home':
      case '5v3_away':
        return (
          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
            5v3 ADV
          </span>
        );
      case '4v4':
        return (
          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-400">
            4v4
          </span>
        );
      case '3v3':
        return (
          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
            3v3
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <aside aria-label="Live Tournament Ticker" className="w-full border-b border-slate-800 bg-slate-950 px-4 py-2 text-slate-100 shadow-md">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800">
        <div className="flex shrink-0 items-center gap-2 border-r border-slate-800 pr-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {tournamentName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {sheets.map((sheet) => {
            const isOT = sheet.period === 'OT' || sheet.period === 'SO';
            const clockText = formatClock(sheet.periodClockSec);
            const periodLabel = typeof sheet.period === 'number' ? `P${sheet.period}` : sheet.period;

            return (
              <div
                key={sheet.sheetId}
                onClick={() => onSelectSheet?.(sheet.sheetId)}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-1.5 transition hover:border-cyan-500/50 hover:bg-slate-900"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400">{sheet.sheetName}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{periodLabel}</span>
                    <span className="text-xs font-mono text-slate-300">{clockText}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-800 pl-2">
                  <div className="flex flex-col text-xs font-medium">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-300">{sheet.homeTeam}</span>
                      <span className="font-bold text-white">{sheet.homeScore}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-300">{sheet.awayTeam}</span>
                      <span className="font-bold text-white">{sheet.awayScore}</span>
                    </div>
                  </div>
                </div>

                {getPowerplayBadge(sheet.powerplayState)}

                {isOT && (
                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">
                    SUDDEN DEATH
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
