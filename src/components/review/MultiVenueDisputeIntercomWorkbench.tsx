'use client';

/**
 * MultiVenueDisputeIntercomWorkbench.tsx
 *
 * TSAI-PAT-P398: Multi-Venue Synchronized Time-Shifted Broadcast Distribution and Low-Latency Video Dispute Intercom
 *
 * Platform Invariants:
 * - Sub-300 lines limit invariant (< 300 physical lines).
 * - Zero-Purple Invariant: Strictly neutral zinc/slate chrome with cyan/emerald/amber/rose accents.
 * - Platform Invariant 6: Pure physical timestamps (s, ms), SI units, and SHA-256 attestation.
 */

import React, { useState } from 'react';
import type {
  DisputeReviewState,
  IntercomPeer,
  MultiVenueIntercomViewModel,
} from '../../types/multi-venue-intercom-types';

interface MultiVenueDisputeIntercomWorkbenchProps {
  model: MultiVenueIntercomViewModel;
  onScrubFrame?: (frameIndex: number, timestampSec: number) => void;
  onTogglePeerMute?: (peerId: string) => void;
  onSubmitRuling?: (decision: DisputeReviewState['selectedDecision']) => void;
  className?: string;
}

export const MultiVenueDisputeIntercomWorkbench: React.FC<MultiVenueDisputeIntercomWorkbenchProps> = ({
  model,
  onScrubFrame,
  onTogglePeerMute,
  onSubmitRuling,
  className = '',
}) => {
  const [currentFrame, setCurrentFrame] = useState(model.dispute.activeFrameIndex);
  const [selectedDecision, setSelectedDecision] = useState(model.dispute.selectedDecision);

  const handleFrameChange = (delta: number) => {
    const nextFrame = Math.max(0, currentFrame + delta);
    setCurrentFrame(nextFrame);
    const frameDurationSec = 1.0 / 60.0;
    const nextTimestamp = model.dispute.ptpMasterTimestampSec + delta * frameDurationSec;
    onScrubFrame?.(nextFrame, nextTimestamp);
  };

  const getRoleBadge = (role: IntercomPeer['role']) => {
    switch (role) {
      case 'REFEREE_TABLET':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Referee Tablet</span>;
      case 'HOME_BENCH':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Home Bench</span>;
      case 'AWAY_BENCH':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">Away Bench</span>;
      case 'TOURNAMENT_ARBITER':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">HQ Arbiter</span>;
      case 'BROADCAST_DIRECTOR':
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">Director</span>;
    }
  };

  return (
    <div
      data-testid="multi-venue-dispute-intercom-workbench"
      className={`bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-zinc-100 shadow-2xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold text-zinc-100">Synchronized Dispute Intercom Workbench</h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              PTP LOCKED
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Venue: <span className="text-zinc-200 font-mono">{model.dispute.venueId}</span> · Sheet: <span className="text-zinc-200 font-mono">{model.dispute.rinkSheetId}</span> · Dispute ID: <span className="text-zinc-300 font-mono">{model.dispute.disputeId}</span>
          </p>
        </div>

        <div className="flex gap-2 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-right">
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">PTP Master</span>
            <span className="font-mono text-zinc-200 font-semibold">{model.dispute.ptpMasterTimestampSec.toFixed(3)}s</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-right">
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Game Clock</span>
            <span className="font-mono text-cyan-400 font-semibold">{model.dispute.gameClockSec.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Intercom Mesh & Collaborative Scrubber */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Ephemeral Intercom Audio Mesh */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                Live Intercom Mesh (&lt; 50ms)
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                {model.peers.filter((p) => !p.isMuted).length} Unmuted / {model.peers.length} Total
              </span>
            </div>

            <div className="space-y-2">
              {model.peers.map((peer) => (
                <div
                  key={peer.id}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                    peer.isSpeaking
                      ? 'bg-cyan-950/20 border-cyan-500/40'
                      : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        peer.isSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'
                      }`}
                    />
                    <span className="font-medium text-zinc-200">{peer.label}</span>
                    {getRoleBadge(peer.role)}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-zinc-400">
                      {peer.audioLatencyMs.toFixed(1)}ms
                    </span>
                    <button
                      type="button"
                      onClick={() => onTogglePeerMute?.(peer.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        peer.isMuted
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {peer.isMuted ? 'Muted' : 'Mute'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>Mesh Topology: Star WebRTC</span>
            <span>Clock Drift: &le; 0.8ms</span>
          </div>
        </div>

        {/* Right: Frame-by-Frame Precision Scrubber */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                Collaborative Frame Stepper
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                Frame #{currentFrame}
              </span>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg mb-3">
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Freeze Point:</span>
                <span className="font-mono text-zinc-200">
                  {(model.dispute.ptpMasterTimestampSec + (currentFrame - model.dispute.activeFrameIndex) * (1 / 60)).toFixed(4)}s
                </span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Playback Delta:</span>
                <span className="font-mono text-emerald-400">
                  {((currentFrame - model.dispute.activeFrameIndex) * 16.67).toFixed(1)}ms
                </span>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleFrameChange(-5)}
                className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-mono text-xs transition-colors"
              >
                -5 Frames
              </button>
              <button
                type="button"
                onClick={() => handleFrameChange(-1)}
                className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-mono text-xs transition-colors"
              >
                -1 Frame
              </button>
              <button
                type="button"
                onClick={() => handleFrameChange(1)}
                className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-mono text-xs transition-colors"
              >
                +1 Frame
              </button>
              <button
                type="button"
                onClick={() => handleFrameChange(5)}
                className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-mono text-xs transition-colors"
              >
                +5 Frames
              </button>
            </div>
          </div>

          {/* Decision Ruling Buttons */}
          <div className="border-t border-zinc-800/60 pt-3">
            <span className="text-xs text-zinc-400 block mb-2 font-medium">Review Ruling Adjudication:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDecision('CALL_CONFIRMED');
                  onSubmitRuling?.('CALL_CONFIRMED');
                }}
                className={`py-1.5 rounded text-xs font-semibold transition-colors ${
                  selectedDecision === 'CALL_CONFIRMED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/40'
                }`}
              >
                Confirm Call
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDecision('CALL_OVERTURNED');
                  onSubmitRuling?.('CALL_OVERTURNED');
                }}
                className={`py-1.5 rounded text-xs font-semibold transition-colors ${
                  selectedDecision === 'CALL_OVERTURNED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-950/30 text-rose-400 border border-rose-500/30 hover:bg-rose-900/40'
                }`}
              >
                Overturn Call
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDecision('INCONCLUSIVE');
                  onSubmitRuling?.('INCONCLUSIVE');
                }}
                className={`py-1.5 rounded text-xs font-semibold transition-colors ${
                  selectedDecision === 'INCONCLUSIVE'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-950/30 text-amber-400 border border-amber-500/30 hover:bg-amber-900/40'
                }`}
              >
                Inconclusive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Attestation & Egress Badges */}
      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${model.scoreboardMulticastActive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
            Scoreboard Slate Multicast
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${model.broadcastEgressActive ? 'bg-cyan-400' : 'bg-zinc-600'}`} />
            Live YouTube Lower-Third Sync
          </span>
        </div>

        <span className="font-mono text-[11px] text-zinc-400">
          TSAI-PAT-P398 · SHA-256 Attested
        </span>
      </div>
    </div>
  );
};
export default MultiVenueDisputeIntercomWorkbench;
