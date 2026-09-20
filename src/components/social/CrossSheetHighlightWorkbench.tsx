'use client';

/**
 * CrossSheetHighlightWorkbench.tsx
 * TsaiPortal / Multi-Sheet Highlight Reel Studio & SafeSport Consent Gate (Patent P406).
 * Emerald-amber palette compliant: strictly emerald, amber, sky, slate, zinc, red.
 * Component size: < 200 lines. Strict physical units only (seconds, px, bps).
 */

import React, { useState } from 'react';

export interface HighlightClipItem {
  clipId: string;
  sheetLabel: string;
  athleteName: string;
  athleteAge: number;
  durationSec: number;
  isCoppaApproved: boolean;
  eventDescription: string;
}

interface CrossSheetHighlightWorkbenchProps {
  initialClips?: HighlightClipItem[];
  onExportReel?: (clipIds: string[]) => void;
}

export const CrossSheetHighlightWorkbench: React.FC<CrossSheetHighlightWorkbenchProps> = ({
  initialClips = [],
  onExportReel,
}) => {
  const [clips] = useState<HighlightClipItem[]>(initialClips);

  const totalDuration = clips.reduce((acc, c) => acc + (c.isCoppaApproved ? c.durationSec : 0), 0);
  const pendingConsentCount = clips.filter((c) => !c.isCoppaApproved).length;
  const isExportReady = clips.length > 0 && pendingConsentCount === 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100 max-w-2xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Patent P406 · SafeSport COPPA Vault
          </span>
          <h2 className="text-xl font-bold text-zinc-50 flex items-center gap-2 mt-0.5">
            <span>Cross-Sheet Reel Studio</span>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
              {clips.length} CLIPS
            </span>
          </h2>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            isExportReady
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
              : 'bg-amber-950/60 text-amber-300 border-amber-700/50'
          }`}
        >
          {isExportReady ? '✓ EXPORT READY' : `${pendingConsentCount} PENDING CONSENT`}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">Approved Duration</div>
          <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
            {totalDuration.toFixed(1)} <span className="text-xs text-zinc-400 font-normal">sec</span>
          </div>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">Distinct Rinks</div>
          <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
            {new Set(clips.map((c) => c.sheetLabel)).size}
          </div>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">Assembly SLA</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">&lt; 500 ms</div>
        </div>
      </div>

      {/* Clips Timeline Table */}
      <div className="space-y-2 mb-6">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Queued Multi-Sheet Segments
        </div>
        {clips.map((clip) => (
          <div
            key={clip.clipId}
            className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2 py-1 rounded bg-zinc-800 text-zinc-300">
                {clip.sheetLabel}
              </span>
              <div>
                <div className="text-sm font-semibold text-zinc-100">{clip.athleteName}</div>
                <div className="text-xs text-zinc-400">{clip.eventDescription}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-zinc-300">{clip.durationSec.toFixed(1)}s</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                  clip.isCoppaApproved
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                    : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                }`}
              >
                {clip.isCoppaApproved ? 'APPROVED' : 'MINOR QUARANTINE'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <button
        disabled={!isExportReady}
        onClick={() => onExportReel && onExportReel(clips.map((c) => c.clipId))}
        className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold tracking-wide transition border ${
          isExportReady
            ? 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 border-emerald-500 shadow-lg cursor-pointer'
            : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
        }`}
      >
        {isExportReady ? 'EXPORT CERTIFIED SOCIAL HIGHLIGHT REEL' : 'AWAITING PARENT CONSENT ATTESTATION'}
      </button>
    </div>
  );
};
