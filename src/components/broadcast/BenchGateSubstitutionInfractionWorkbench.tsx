import React from "react";

export interface PlayerGateContactTelemetry {
  timestamp_s: number;
  retiring_player_id: string;
  retiring_skate_x_m: number;
  retiring_skate_y_m: number;
  retiring_on_ice_flag: boolean;
  entering_player_id: string;
  entering_skate_x_m: number;
  entering_skate_y_m: number;
  entering_on_ice_flag: boolean;
  bench_gate_x_m: number;
  bench_gate_y_m: number;
  puck_x_m: number;
  puck_y_m: number;
  puck_speed_mps: number;
}

export interface SubstitutionArbitrationState {
  timestamp_s: number;
  retiring_distance_to_gate_m: number;
  entering_distance_to_gate_m: number;
  concurrent_on_ice_flag: boolean;
  envelope_violation_flag: boolean;
  puck_involvement_flag: boolean;
  infraction_detected_flag: boolean;
  infraction_code: string;
  distance_margin_m: number;
}

interface BenchGateSubstitutionInfractionWorkbenchProps {
  state: SubstitutionArbitrationState;
  telemetry: PlayerGateContactTelemetry;
}

export const BenchGateSubstitutionInfractionWorkbench: React.FC<
  BenchGateSubstitutionInfractionWorkbenchProps
> = ({ state, telemetry }) => {
  const getInfractionBadge = () => {
    if (state.infraction_detected_flag) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-800">
          RULE 74 INFRACTION: {state.infraction_code} ({Math.abs(state.distance_margin_m).toFixed(2)}m excess)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
        LEGAL SUBSTITUTION (+{state.distance_margin_m.toFixed(2)}m margin)
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Patent P429 • Sprint 71
          </div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100">
            Bench Gate Optical Skate-Ice Contact & Line Change Arbiter
          </h2>
        </div>
        <div>{getInfractionBadge()}</div>
      </div>

      {/* Primary Spatial Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Retiring Player Gate Dist</span>
          <p
            className={`mt-1 text-2xl font-mono font-bold ${
              state.retiring_distance_to_gate_m > 1.524 ? "text-red-400" : "text-zinc-100"
            }`}
          >
            {state.retiring_distance_to_gate_m.toFixed(2)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">m</span>
          </p>
          <span className="text-[10px] text-zinc-500">Max envelope: 1.524 m (5 ft)</span>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Entering Player Gate Dist</span>
          <p className="mt-1 text-2xl font-mono font-bold text-sky-400">
            {state.entering_distance_to_gate_m.toFixed(2)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">m</span>
          </p>
          <span className="text-[10px] text-zinc-500">Optical threshold</span>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Puck Speed & Range</span>
          <p className="mt-1 text-2xl font-mono font-bold text-emerald-400">
            {telemetry.puck_speed_mps.toFixed(1)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">m/s</span>
          </p>
          <span className="text-[10px] text-zinc-500">
            Active play radius: 1.20 m
          </span>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Boundary Margin</span>
          <p
            className={`mt-1 text-2xl font-mono font-bold ${
              state.distance_margin_m < 0 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {state.distance_margin_m.toFixed(2)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">m</span>
          </p>
          <span className="text-[10px] text-zinc-500">Safe envelope allowance</span>
        </div>
      </div>

      {/* Optical Geometry Strip */}
      <div className="rounded-lg bg-zinc-900/50 border border-zinc-800/70 p-4">
        <div className="text-xs font-semibold text-zinc-300 mb-3 flex items-center justify-between">
          <span>
            Optical Tracking Geometry (Retiring: {telemetry.retiring_player_id} • Entering: {telemetry.entering_player_id})
          </span>
          <span className="font-mono text-zinc-500">
            Concurrent on Ice: {state.concurrent_on_ice_flag ? "YES" : "NO"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div>
            <span className="text-zinc-500">Retiring Skate (X, Y):</span>
            <p className="font-mono text-zinc-300 font-medium">
              ({telemetry.retiring_skate_x_m.toFixed(2)}, {telemetry.retiring_skate_y_m.toFixed(2)}) m
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Entering Skate (X, Y):</span>
            <p className="font-mono text-zinc-300 font-medium">
              ({telemetry.entering_skate_x_m.toFixed(2)}, {telemetry.entering_skate_y_m.toFixed(2)}) m
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Puck Position (X, Y):</span>
            <p className="font-mono text-zinc-300 font-medium">
              ({telemetry.puck_x_m.toFixed(2)}, {telemetry.puck_y_m.toFixed(2)}) m
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Puck Involvement:</span>
            <p className={`font-mono font-medium ${state.puck_involvement_flag ? "text-red-400" : "text-emerald-400"}`}>
              {state.puck_involvement_flag ? "INTERACTION DETECTED" : "CLEAR OF PLAY"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
