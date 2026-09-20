"use client";

//
//  MultiVenueDisputeIntercomWorkbench.tsx
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Candidate P390 (TSAI-PAT-P390)
//  Palette: slate/zinc/cyan/emerald/amber/rose only
//  Rule: Component < 300 lines
//

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Radio,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
} from "lucide-react";
import {
  DisputeIntercomState,
  DisputeParticipantUI,
  MultiVenueDisputeIntercomWorkbenchProps,
} from "../../types/dispute-intercom-portal-types";

export const DEFAULT_DISPUTE_STATE: DisputeIntercomState = {
  channelId: "disp-bell-rink1-409",
  venueName: "Bell Centre Complex",
  rinkNumber: 1,
  gameTitle: "St. Cloud Huskies vs Boston Jr. Eagles",
  disputeType: "GOAL_LINE_CROSSING",
  currentScrubTimestampSec: 542.45,
  freezeFrameTimestampSec: 542.45,
  playbackSpeed: 0.0,
  verdictStatus: "PENDING_DELIBERATION",
  activeRulingNotes: "Evaluating puck optical smear deconvolution at trailing goal edge.",
  participants: [
    {
      id: "ref-1",
      role: "REFEREE_TABLET",
      name: "Referee tablet (Ice Level)",
      isMuted: false,
      isSpeaking: true,
      latencyMs: 12,
    },
    {
      id: "bench-h",
      role: "HOME_BENCH",
      name: "Huskies BenchHub",
      isMuted: false,
      isSpeaking: false,
      latencyMs: 18,
    },
    {
      id: "bench-a",
      role: "AWAY_BENCH",
      name: "Jr. Eagles BenchHub",
      isMuted: false,
      isSpeaking: false,
      latencyMs: 19,
    },
    {
      id: "arb-hq",
      role: "TOURNAMENT_ARBITER",
      name: "Central Video Arbiter",
      isMuted: false,
      isSpeaking: false,
      latencyMs: 8,
    },
  ],
};

export const MultiVenueDisputeIntercomWorkbench: React.FC<MultiVenueDisputeIntercomWorkbenchProps> = ({
  initialState = DEFAULT_DISPUTE_STATE,
  onScrub,
  onRulingSubmit,
  className = "",
}) => {
  const [state, setState] = useState<DisputeIntercomState>({
    ...DEFAULT_DISPUTE_STATE,
    ...initialState,
  });

  const handleSpeedChange = (speed: number) => {
    setState((prev) => ({ ...prev, playbackSpeed: speed }));
  };

  const handleStepFrame = (deltaSec: number) => {
    const nextTime = Math.max(0, state.currentScrubTimestampSec + deltaSec);
    setState((prev) => ({ ...prev, currentScrubTimestampSec: nextTime }));
    onScrub?.(nextTime);
  };

  const handleRulingSelect = (verdict: DisputeIntercomState["verdictStatus"]) => {
    setState((prev) => ({ ...prev, verdictStatus: verdict }));
  };

  const handleSubmit = () => {
    onRulingSubmit?.(state.verdictStatus, state.activeRulingNotes);
  };

  return (
    <div
      data-testid="dispute-intercom-workbench"
      className={`rounded-2xl border border-slate-800 bg-slate-900/95 p-6 text-slate-100 shadow-2xl backdrop-blur-lg ${className}`}
    >
      {/* Venue & Dispute Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 animate-pulse text-cyan-400" />
            <span className="font-mono text-xs font-semibold text-cyan-400">
              LIVE DISPUTE INTERCOM
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-300">
              Rink {state.rinkNumber}
            </span>
          </div>
          <h2 className="mt-1 text-lg font-bold text-white">{state.venueName}</h2>
          <p className="text-xs text-slate-400">{state.gameTitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-amber-500/40 bg-amber-950/60 px-3 py-1 font-mono text-xs font-semibold text-amber-400">
            REVIEW: {state.disputeType.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Audio Mesh Intercom Participants */}
      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Connected Intercom Endpoints ({state.participants.length})
        </h4>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {state.participants.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-xl border p-2.5 transition-colors ${
                p.isSpeaking
                  ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-300"
                  : "border-slate-800 bg-slate-950/50 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {p.isMuted ? (
                  <MicOff className="h-3.5 w-3.5 text-slate-500" />
                ) : (
                  <Mic className={`h-3.5 w-3.5 ${p.isSpeaking ? "text-emerald-400 animate-pulse" : "text-slate-400"}`} />
                )}
                <span className="truncate text-xs font-medium">{p.name}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                {p.latencyMs}ms
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrubbing & Timecode Controls */}
      <div className="mt-5 rounded-xl border border-slate-800/80 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Synchronized Timecode</span>
          <span className="font-mono text-base font-bold text-cyan-400">
            {state.currentScrubTimestampSec.toFixed(2)}s
          </span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            onClick={() => handleStepFrame(-0.0167)} // Step back 1 frame (60 FPS)
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            -1 Frame
          </button>
          <button
            onClick={() => handleSpeedChange(-0.5)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              state.playbackSpeed === -0.5
                ? "border-cyan-500 bg-cyan-950 text-cyan-300"
                : "border-slate-700 bg-slate-800 text-slate-200"
            }`}
          >
            -0.5x
          </button>
          <button
            onClick={() => handleSpeedChange(0.0)}
            className={`rounded-lg border px-4 py-1.5 text-xs font-semibold ${
              state.playbackSpeed === 0.0
                ? "border-amber-500 bg-amber-950 text-amber-300"
                : "border-slate-700 bg-slate-800 text-slate-200"
            }`}
          >
            <Pause className="mr-1 inline h-3 w-3" /> FREEZE
          </button>
          <button
            onClick={() => handleSpeedChange(0.5)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              state.playbackSpeed === 0.5
                ? "border-cyan-500 bg-cyan-950 text-cyan-300"
                : "border-slate-700 bg-slate-800 text-slate-200"
            }`}
          >
            +0.5x
          </button>
          <button
            onClick={() => handleStepFrame(0.0167)} // Step forward 1 frame
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            +1 Frame
          </button>
        </div>
      </div>

      {/* Official Verdict Arbiter Actions */}
      <div className="mt-5 flex flex-col justify-between gap-4 border-t border-slate-800 pt-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={() => handleRulingSelect("CONFIRMED")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              state.verdictStatus === "CONFIRMED"
                ? "border-emerald-500 bg-emerald-950 text-emerald-300 ring-2 ring-emerald-500/40"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> CONFIRM CALL
          </button>
          <button
            onClick={() => handleRulingSelect("OVERTURNED")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              state.verdictStatus === "OVERTURNED"
                ? "border-rose-500 bg-rose-950 text-rose-300 ring-2 ring-rose-500/40"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
            }`}
          >
            <XCircle className="h-4 w-4 text-rose-400" /> OVERTURN
          </button>
          <button
            onClick={() => handleRulingSelect("INCONCLUSIVE")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              state.verdictStatus === "INCONCLUSIVE"
                ? "border-amber-500 bg-amber-950 text-amber-300 ring-2 ring-amber-500/40"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-amber-400" /> CALL STANDS
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-cyan-500 active:scale-95 shadow-lg shadow-cyan-900/30"
        >
          <Send className="h-3.5 w-3.5" /> CERTIFY RULING
        </button>
      </div>
    </div>
  );
};
