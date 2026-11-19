'use client';

/**
 * PenaltyBoxMagneticGateWorkbench.tsx
 * TsaiPortal / Multi-Sheet Penalty Box Countdown Sync & Magnetic Gate Sensor Arbiter (Patent P413).
 * Emerald-amber palette compliant: strictly emerald, amber, sky, slate, zinc, red.
 * Component size: < 250 lines. Strict physical units only (s, ms, m, Hz).
 */

import React, { useState } from 'react';
import { NotYetAvailable } from "@/components/common/NotYetAvailable";

export interface PenaltyBoxGateFeed {
  penaltyId: string;
  sheetId: string;
  penalizedPlayerId: string;
  teamSide: 'HOME' | 'AWAY';
  penaltyClockRemainingSec: number;
  gateLatchStatus: 'LATCHED' | 'UNLATCHED';
  unlatchTimestampSec: number;
  skaterDistanceToIceM: number;
  arbitrationVerdict: 'CLEARED_EXPIRATION_LEGAL' | 'PREMATURE_GATE_OPEN_WARNING' | 'ILLEGAL_SUBSTITUTION_INFRACTION' | 'STOPPAGE_GATE_RELEASE_LEGAL';
}

export interface PenaltyGateSyncState {
  sheetId: string;
  activeGameClockSec: number;
  isGameRunning: boolean;
  isWhistleActive: boolean;
  hallSensorLatencyMs: number;
  penaltyGates: PenaltyBoxGateFeed[];
}

interface PenaltyBoxMagneticGateWorkbenchProps {
  initialState?: PenaltyGateSyncState;
  onAuditTrigger?: () => void;
}

// GA-030 O-10 (T0.4): the built-in data this component shipped with was deleted. With no data
// passed in it renders an honest "not yet available" state. Rebuilt on live data or retired (OD-17, T8.1).
export const PenaltyBoxMagneticGateWorkbench: React.FC<PenaltyBoxMagneticGateWorkbenchProps> = (props) => {
  if (!props.initialState) {
    return <NotYetAvailable feature="Penalty-box gate review" detail="No live game event is connected." />;
  }
  return <PenaltyBoxMagneticGateWorkbenchView {...props} initialState={props.initialState} />;
};

const PenaltyBoxMagneticGateWorkbenchView: React.FC<PenaltyBoxMagneticGateWorkbenchProps & { initialState: PenaltyGateSyncState }> = ({
  initialState,
  onAuditTrigger,
}) => {
  const [state] = useState<PenaltyGateSyncState>(
    initialState
  );

  const hasInfraction = state.penaltyGates.some(
    (g) => g.arbitrationVerdict === 'ILLEGAL_SUBSTITUTION_INFRACTION'
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100 max-w-3xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Patent P413 · Penalty Box Magnetic Gate Sync
          </span>
          <h2 className="text-xl font-bold text-zinc-50 flex items-center gap-2 mt-0.5">
            <span>Penalty Box Magnetic Gate Workbench</span>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
              {state.sheetId}
            </span>
          </h2>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            hasInfraction
              ? 'bg-red-950/60 text-red-300 border-red-700/50'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
          }`}
        >
          {hasInfraction ? '⚠ INFRACTION DETECTED' : '✓ GATES SYNCHRONIZED'}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">Game Clock Elapsed</div>
          <div className="text-lg font-bold font-mono text-zinc-100 mt-1">
            {state.activeGameClockSec.toFixed(2)} s
          </div>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">Hall Sensor Latency</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {state.hallSensorLatencyMs.toFixed(1)} ms
          </div>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">Active Penalties</div>
          <div className="text-lg font-bold font-mono text-zinc-100 mt-1">
            {state.penaltyGates.length} Doors Tracked
          </div>
        </div>
      </div>

      {/* Gates Table */}
      <div className="space-y-2 mb-6">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Magnetic Door Interlock & Scoreboard Telemetry
        </div>
        {state.penaltyGates.map((gate) => (
          <div
            key={gate.penaltyId}
            className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition"
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-mono px-2 py-1 rounded font-semibold ${
                  gate.teamSide === 'HOME'
                    ? 'bg-sky-950 text-sky-300 border border-sky-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {gate.teamSide}
              </span>
              <div>
                <div className="text-sm font-semibold text-zinc-100">
                  {gate.penaltyId} · {gate.penalizedPlayerId}
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  Clock Left: {gate.penaltyClockRemainingSec.toFixed(2)}s · Optical Sill Proximity: {gate.skaterDistanceToIceM.toFixed(2)}m
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded ${
                  gate.gateLatchStatus === 'LATCHED'
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'bg-emerald-950 text-emerald-300'
                }`}
              >
                {gate.gateLatchStatus}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                  gate.arbitrationVerdict === 'ILLEGAL_SUBSTITUTION_INFRACTION'
                    ? 'bg-red-950/60 text-red-300 border-red-700/60'
                    : gate.arbitrationVerdict === 'PREMATURE_GATE_OPEN_WARNING'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                }`}
              >
                {gate.arbitrationVerdict}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      {onAuditTrigger && (
        <button
          onClick={onAuditTrigger}
          className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold tracking-wide transition border border-emerald-500 shadow-lg cursor-pointer"
        >
          CORROBORATE MAGNETIC GATE SENSORS
        </button>
      )}
    </div>
  );
};
