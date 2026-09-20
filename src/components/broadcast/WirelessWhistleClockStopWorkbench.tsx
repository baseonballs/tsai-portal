import React from "react";

export interface WirelessWhistleTelemetry {
  timestamp_us: number;
  referee_id: string;
  cavity_pressure_kpa: number;
  carrier_frequency_hz: number;
  acoustic_spl_db: number;
  referee_pos_x_m: number;
  referee_pos_y_m: number;
  timekeeper_bench_x_m: number;
  timekeeper_bench_y_m: number;
  ambient_air_temp_c: number;
}

export interface WhistleClockStopState {
  timestamp_us: number;
  referee_id: string;
  cavity_pressure_kpa: number;
  rf_latency_ms: number;
  acoustic_transit_delay_ms: number;
  clock_time_saved_ms: number;
  is_valid_whistle_blow: boolean;
  authoritative_clock_stop_flag: boolean;
  distance_to_timekeeper_m: number;
}

interface WirelessWhistleClockStopWorkbenchProps {
  state: WhistleClockStopState;
  telemetry: WirelessWhistleTelemetry;
}

export const WirelessWhistleClockStopWorkbench: React.FC<
  WirelessWhistleClockStopWorkbenchProps
> = ({ state, telemetry }) => {
  const getClockStatusBadge = () => {
    if (state.authoritative_clock_stop_flag) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
          CLOCK STOP TRIGGERED (-{state.clock_time_saved_ms.toFixed(1)}ms acoustic lag saved)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-400 border border-zinc-700">
        STANDBY / LOW PRESSURE ({state.cavity_pressure_kpa.toFixed(1)} kPa &lt; 4.5 kPa)
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Patent P433 • Sprint 75
          </div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100">
            Wireless Whistle Pressure Transducer & Clock Stop Arbiter
          </h2>
        </div>
        <div>{getClockStatusBadge()}</div>
      </div>

      {/* Primary Timing & Pneumatic Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Cavity Air Pressure</span>
          <p
            className={`mt-1 text-2xl font-mono font-bold ${
              state.cavity_pressure_kpa >= 4.5 ? "text-emerald-400" : "text-zinc-100"
            }`}
          >
            {state.cavity_pressure_kpa.toFixed(1)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">kPa</span>
          </p>
          <span className="text-[10px] text-zinc-500">
            Mouth trigger: &ge; 4.5 kPa
          </span>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Time Lag Saved</span>
          <p className="mt-1 text-2xl font-mono font-bold text-sky-400">
            {state.clock_time_saved_ms.toFixed(1)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">ms</span>
          </p>
          <span className="text-[10px] text-zinc-500">
            Speed-of-sound recovery
          </span>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Wireless RF Latency</span>
          <p className="mt-1 text-2xl font-mono font-bold text-emerald-400">
            {state.rf_latency_ms.toFixed(2)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">ms</span>
          </p>
          <span className="text-[10px] text-zinc-500">Deterministic TDMA payload</span>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Transit Distance</span>
          <p className="mt-1 text-2xl font-mono font-bold text-zinc-100">
            {state.distance_to_timekeeper_m.toFixed(1)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">m</span>
          </p>
          <span className="text-[10px] text-zinc-500">Referee to scorekeeper</span>
        </div>
      </div>

      {/* Telemetry Strip */}
      <div className="rounded-lg bg-zinc-900/50 border border-zinc-800/70 p-4">
        <div className="text-xs font-semibold text-zinc-300 mb-3 flex items-center justify-between">
          <span>Official Whistle Telemetry ({telemetry.referee_id})</span>
          <span className="font-mono text-zinc-500">
            Acoustic Delay: {state.acoustic_transit_delay_ms.toFixed(1)} ms
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div>
            <span className="text-zinc-500">Carrier Pitch:</span>
            <p className="font-mono text-zinc-300 font-medium">
              {telemetry.carrier_frequency_hz.toFixed(0)} Hz
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Sound Pressure:</span>
            <p className="font-mono text-zinc-300 font-medium">
              {telemetry.acoustic_spl_db.toFixed(1)} dB SPL
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Arena Air Temp:</span>
            <p className="font-mono text-zinc-300 font-medium">
              {telemetry.ambient_air_temp_c.toFixed(1)} °C
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Clock Signal:</span>
            <p
              className={`font-mono font-medium ${
                state.authoritative_clock_stop_flag ? "text-emerald-400" : "text-zinc-400"
              }`}
            >
              {state.authoritative_clock_stop_flag ? "INTERLOCK ASSERTED" : "RUNNING"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
