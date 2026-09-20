'use client';

/**
 * BenchDoorSubstitutionWorkbench.tsx
 * TsaiPortal / Bench Door Rapid Latch Sensor & Player Substitution Velocity Arbiter (Patent P417).
 * Emerald-amber palette compliant: strictly emerald, amber, sky, slate, zinc, red.
 * Component size: < 250 lines. Strict physical units only (m, m/s, s).
 */

import React, { useState } from 'react';

export interface SubstitutionFeedItem {
  teamId: string;
  departingPlayerId: string;
  enteringPlayerId: string;
  eventTimestampSec: number;
  departingDistanceToBenchM: number;
  departingApproachVelocityMps: number;
  doorLatchStatus: 'GATE_UNLATCHED' | 'LEAP_OVER_BOARDS';
  isPuckInSubstitutionZone: boolean;
  arbitrationVerdict: 'RULE_74_LEGAL_LINE_CHANGE' | 'TOO_MANY_MEN_PREMATURE_ENTRY' | 'TOO_MANY_MEN_PUCK_INTERFERENCE' | 'STOPPAGE_SUBSTITUTION_LEGAL';
  rule74ComplianceMarginM: number;
}

export interface BenchSubstitutionState {
  sheetId: string;
  activeGameClockSec: number;
  isGameRunning: boolean;
  hallSensorDebounceMs: number;
  substitutions: SubstitutionFeedItem[];
}

interface BenchDoorSubstitutionWorkbenchProps {
  initialState?: BenchSubstitutionState;
  onAuditTrigger?: () => void;
}

export const BenchDoorSubstitutionWorkbench: React.FC<BenchDoorSubstitutionWorkbenchProps> = ({
  initialState,
  onAuditTrigger,
}) => {
  const [state] = useState<BenchSubstitutionState>(
    initialState || {
      sheetId: 'sheet-east-02',
      activeGameClockSec: 614.25,
      isGameRunning: true,
      hallSensorDebounceMs: 12.0,
      substitutions: [
        {
          teamId: 'BOS',
          departingPlayerId: 'PLY-63',
          enteringPlayerId: 'PLY-18',
          eventTimestampSec: 614.25,
          departingDistanceToBenchM: 0.85,
          departingApproachVelocityMps: 3.2,
          doorLatchStatus: 'GATE_UNLATCHED',
          isPuckInSubstitutionZone: false,
          arbitrationVerdict: 'RULE_74_LEGAL_LINE_CHANGE',
          rule74ComplianceMarginM: 0.674,
        },
        {
          teamId: 'TOR',
          departingPlayerId: 'PLY-34',
          enteringPlayerId: 'PLY-16',
          eventTimestampSec: 612.8,
          departingDistanceToBenchM: 3.85,
          departingApproachVelocityMps: 4.1,
          doorLatchStatus: 'LEAP_OVER_BOARDS',
          isPuckInSubstitutionZone: false,
          arbitrationVerdict: 'TOO_MANY_MEN_PREMATURE_ENTRY',
          rule74ComplianceMarginM: -2.326,
        },
      ],
    }
  );

  const hasInfraction = state.substitutions.some(
    (s) => s.arbitrationVerdict.startsWith('TOO_MANY_MEN')
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100 max-w-3xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Patent P417 · Bench Substitution Velocity Arbiter
          </span>
          <h2 className="text-xl font-bold text-zinc-50 flex items-center gap-2 mt-0.5">
            <span>Bench Door Substitution Workbench</span>
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
          {hasInfraction ? '⚠ INFRACTION DETECTED' : '✓ LINE CHANGES COMPLIANT'}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">Rule 74.1 Zone Limit</div>
          <div className="text-lg font-bold font-mono text-zinc-100 mt-1">
            1.524 m <span className="text-xs font-normal text-zinc-400">(5.0 ft)</span>
          </div>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">Hall Sensor Debounce</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {state.hallSensorDebounceMs.toFixed(1)} ms
          </div>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <div className="text-xs text-zinc-400 font-medium">Active Line Changes</div>
          <div className="text-lg font-bold font-mono text-zinc-100 mt-1">
            {state.substitutions.length} Events Tracked
          </div>
        </div>
      </div>

      {/* Substitutions Table */}
      <div className="space-y-2 mb-6">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Player Substitution Telemetry & Optical Proximity
        </div>
        {state.substitutions.map((sub) => {
          const isLegal = sub.arbitrationVerdict === 'RULE_74_LEGAL_LINE_CHANGE';
          return (
            <div
              key={`${sub.teamId}-${sub.departingPlayerId}-${sub.eventTimestampSec}`}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2 py-1 rounded bg-zinc-800 text-zinc-200 font-semibold">
                  {sub.teamId}
                </span>
                <div>
                  <div className="text-sm font-semibold text-zinc-100">
                    OUT: {sub.departingPlayerId} → IN: {sub.enteringPlayerId}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">
                    Distance: {sub.departingDistanceToBenchM.toFixed(2)}m · Vel: {sub.departingApproachVelocityMps.toFixed(1)}m/s · Margin: {sub.rule74ComplianceMarginM.toFixed(2)}m
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {sub.doorLatchStatus.replace(/_/g, ' ')}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                    isLegal
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                      : 'bg-red-950/60 text-red-300 border-red-700/60'
                  }`}
                >
                  {sub.arbitrationVerdict.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {onAuditTrigger && (
        <button
          onClick={onAuditTrigger}
          className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold tracking-wide transition border border-emerald-500 shadow-lg cursor-pointer"
        >
          CORROBORATE SUBSTITUTION TELEMETRY
        </button>
      )}
    </div>
  );
};
