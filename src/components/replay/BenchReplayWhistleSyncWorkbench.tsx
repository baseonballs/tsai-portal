'use client';

/**
 * BenchReplayWhistleSyncWorkbench.tsx
 * TsaiPortal / Bench Video Replay Sync with Official Whistle TDM (Patent P409).
 * Emerald-amber palette compliant: strictly emerald, amber, sky, slate, zinc, red.
 * Component size: < 200 lines. Strict physical units only (ms, sec, fps, SMPTE).
 */

import React, { useState } from 'react';

export interface CameraAngleFeed {
  angleId: string;
  label: string;
  fps: number;
  resolution: string;
  ptsSec: number;
  syncOffsetMs: number;
  isLocked: boolean;
}

export interface WhistleSyncState {
  whistleEventId: string;
  smpteTimecode: string;
  syncDriftMs: number;
  officialBeaconSec: number;
  acousticBlastSec: number;
  isAllLocked: boolean;
  angles: CameraAngleFeed[];
}

interface BenchReplayWhistleSyncWorkbenchProps {
  initialState?: WhistleSyncState;
  onFreezeTrigger?: () => void;
}

export const BenchReplayWhistleSyncWorkbench: React.FC<BenchReplayWhistleSyncWorkbenchProps> = ({
  initialState,
  onFreezeTrigger,
}) => {
  const [state] = useState<WhistleSyncState>(
    initialState || {
      whistleEventId: 'W-4821',
      smpteTimecode: '01:24:18:14',
      syncDriftMs: 0.85,
      officialBeaconSec: 1726880024.12,
      acousticBlastSec: 1726880024.1165,
      isAllLocked: true,
      angles: [
        { angleId: 'cam-high-slot', label: 'High Slot 4K', fps: 60, resolution: '3840x2160', ptsSec: 24.1165, syncOffsetMs: 0.2, isLocked: true },
        { angleId: 'cam-bench-side', label: 'Bench Side 1080p', fps: 60, resolution: '1920x1080', ptsSec: 24.1165, syncOffsetMs: 0.4, isLocked: true },
        { angleId: 'cam-endzone-north', label: 'North Endzone 4K', fps: 60, resolution: '3840x2160', ptsSec: 24.1165, syncOffsetMs: 0.6, isLocked: true },
        { angleId: 'cam-ref-crease', label: 'Crease Action 1080p', fps: 60, resolution: '1920x1080', ptsSec: 24.1165, syncOffsetMs: 0.85, isLocked: true },
      ],
    }
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100 max-w-2xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Patent P409 · Bench Replay Whistle TDM
          </span>
          <h2 className="text-xl font-bold text-zinc-50 flex items-center gap-2 mt-0.5">
            <span>Whistle Sync Workbench</span>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
              {state.whistleEventId}
            </span>
          </h2>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            state.isAllLocked
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
              : 'bg-amber-950/60 text-amber-300 border-amber-700/50'
          }`}
        >
          {state.isAllLocked ? '✓ PHASE LOCKED' : '⚠ DRIFT WARNING'}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">SMPTE Freeze Timecode</div>
          <div className="text-lg font-bold font-mono text-zinc-100 mt-1">
            {state.smpteTimecode}
          </div>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">Sync Drift</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {state.syncDriftMs.toFixed(2)} ms
          </div>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">Locked Angles</div>
          <div className="text-lg font-bold font-mono text-zinc-100 mt-1">
            {state.angles.filter((a) => a.isLocked).length} / {state.angles.length}
          </div>
        </div>
      </div>

      {/* Angles List */}
      <div className="space-y-2 mb-6">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Synchronized Multi-Angle Streams
        </div>
        {state.angles.map((angle) => (
          <div
            key={angle.angleId}
            className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2 py-1 rounded bg-zinc-800 text-zinc-300">
                {angle.fps} FPS
              </span>
              <div>
                <div className="text-sm font-semibold text-zinc-100">{angle.label}</div>
                <div className="text-xs text-zinc-400 font-mono">
                  PTS: {angle.ptsSec.toFixed(4)}s · {angle.resolution}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-emerald-400">+{angle.syncOffsetMs.toFixed(2)}ms</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border bg-emerald-950/40 text-emerald-300 border-emerald-800/40">
                LOCKED
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      {onFreezeTrigger && (
        <button
          onClick={onFreezeTrigger}
          className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold tracking-wide transition border border-emerald-500 shadow-lg cursor-pointer"
        >
          FREEZE MULTI-ANGLE BENCH REPLAY AT WHISTLE
        </button>
      )}
    </div>
  );
};
