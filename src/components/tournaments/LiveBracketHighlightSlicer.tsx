'use client';

/**
 * Live Tournament Bracket Ingestion & Match Highlight Slicer Component
 * Patent Track 16 (Claims 7, 9 & 10)
 * Adheres strictly to Zero-Purple design rules and Platform Invariant 6.
 */

import React, { useState } from 'react';
import {
  PortalTournamentMatch,
  PortalHighlightClip,
  INITIAL_PORTAL_MATCHES,
  formatMatchClock,
} from './bracket-highlight-slicer-types';

export function LiveBracketHighlightSlicer() {
  const [matches, setMatches] = useState<PortalTournamentMatch[]>(INITIAL_PORTAL_MATCHES);
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.matchId || '');
  const [activeClip, setActiveClip] = useState<PortalHighlightClip | null>(null);

  const selectedMatch = matches.find((m) => m.matchId === selectedMatchId) || matches[0];

  const handleSimulateGoal = (matchId: string, scoringTeam: 'home' | 'away') => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.matchId !== matchId) return m;
        const isHome = scoringTeam === 'home';
        const newHomeScore = isHome ? m.homeTeam.score + 1 : m.homeTeam.score;
        const newAwayScore = !isHome ? m.awayTeam.score + 1 : m.awayTeam.score;

        const newClip: PortalHighlightClip = {
          clipId: `clip-${Date.now()}`,
          title: `${isHome ? m.homeTeam.name : m.awayTeam.name} Goal`,
          eventType: 'GOAL',
          period: m.period,
          gameClockSeconds: m.gameClockSeconds,
          durationSeconds: 14.0,
          thumbnailUrl: '/thumbnails/live_goal.jpg',
          clipUrl: `https://cdn.transcend.tv/clips/live-${Date.now()}.m3u8`,
        };

        return {
          ...m,
          homeTeam: { ...m.homeTeam, score: newHomeScore },
          awayTeam: { ...m.awayTeam, score: newAwayScore },
          highlightClips: [newClip, ...m.highlightClips],
        };
      })
    );
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Live Tournament Bracket & Highlight Slicer
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time bracket progression, automated end-of-game highlight clipping, and sub-frame PTS alignment.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 border border-slate-800 text-xs">
          <span className="text-slate-400">Sync Status:</span>
          <span className="font-semibold text-emerald-400">CONNECTED (60 FPS)</span>
        </div>
      </div>

      {/* Bracket Overview & Match Selector */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {matches.map((match) => {
          const isSelected = match.matchId === selectedMatchId;
          const isFinal = match.status === 'COMPLETED';

          return (
            <button
              key={match.matchId}
              type="button"
              onClick={() => setSelectedMatchId(match.matchId)}
              className={`flex flex-col rounded-lg border p-4 text-left transition-all ${
                isSelected
                  ? 'border-cyan-500 bg-slate-900 shadow-lg shadow-cyan-950/30'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium text-slate-300">{match.roundName} · {match.sheetName}</span>
                <span
                  className={`rounded px-2 py-0.5 font-bold ${
                    isFinal ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                  }`}
                >
                  {isFinal ? 'FINAL' : formatMatchClock(match.period, match.gameClockSeconds)}
                </span>
              </div>

              {/* Teams & Scores */}
              <div className="space-y-1.5 text-sm font-semibold">
                <div className="flex items-center justify-between">
                  <span className={match.winnerTeamId === match.homeTeam.id ? 'text-emerald-300 font-bold' : 'text-slate-200'}>
                    ({match.homeTeam.seed}) {match.homeTeam.name}
                  </span>
                  <span className="font-mono text-base">{match.homeTeam.score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={match.winnerTeamId === match.awayTeam.id ? 'text-emerald-300 font-bold' : 'text-slate-200'}>
                    ({match.awayTeam.seed}) {match.awayTeam.name}
                  </span>
                  <span className="font-mono text-base">{match.awayTeam.score}</span>
                </div>
              </div>

              {match.highlightClips.length > 0 && (
                <div className="mt-3 flex items-center gap-1 text-[11px] text-cyan-400">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span>{match.highlightClips.length} highlight clips sliced</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Match Live Dashboard & Highlight Slicer Reel */}
      {selectedMatch && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedMatch.roundName} · {selectedMatch.sheetName}
              </p>
            </div>

            {selectedMatch.status === 'IN_PROGRESS' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateGoal(selectedMatch.matchId, 'home')}
                  className="rounded bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
                >
                  + {selectedMatch.homeTeam.name} Goal
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateGoal(selectedMatch.matchId, 'away')}
                  className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  + {selectedMatch.awayTeam.name} Goal
                </button>
              </div>
            )}
          </div>

          {/* Sliced Clips Tray */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Synchronized Match Highlight Reel ({selectedMatch.highlightClips.length} Clips)
            </h4>

            {selectedMatch.highlightClips.length === 0 ? (
              <div className="rounded border border-dashed border-slate-800 py-6 text-center text-xs text-slate-500">
                No highlight clips sliced yet. Key plays and goals will automatically appear in real time.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedMatch.highlightClips.map((clip) => (
                  <div
                    key={clip.clipId}
                    className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950 p-3 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-cyan-400 border border-slate-800">
                          P{clip.period}
                        </span>
                        <span className="font-mono text-slate-300">{clip.durationSeconds.toFixed(1)}s</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">{clip.title}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveClip(clip)}
                      className="mt-3 flex items-center justify-center gap-1.5 rounded bg-slate-900 py-1.5 text-xs font-medium text-emerald-400 hover:bg-slate-800 border border-emerald-950/60 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Preview Clip
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {activeClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h4 className="text-sm font-bold text-white">{activeClip.title}</h4>
              <button
                type="button"
                onClick={() => setActiveClip(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video w-full rounded bg-slate-900 flex flex-col items-center justify-center text-xs text-slate-400 border border-slate-800">
              <span className="text-emerald-400 font-semibold mb-1">Instant Replay Player</span>
              <span className="font-mono text-[11px] text-slate-500">{activeClip.clipUrl}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveClip(null)}
              className="mt-4 w-full rounded bg-slate-900 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
