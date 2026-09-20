import React from "react";

export interface LatchSensorSample {
  timestamp_s: number;
  latch_id: string;
  pin_state_high: boolean;
  contact_resistance_ohms: number;
  door_id: string;
}

export interface LatchInterlockEvent {
  timestamp_s: number;
  door_id: string;
  is_unlatched: boolean;
  ptp_frame_index: number;
  penalty_remaining_time_s: number;
  release_delta_s: number;
  is_premature_release: boolean;
  debounce_latency_ms: number;
}

interface PenaltyBoxLatchInterlockWorkbenchProps {
  event: LatchInterlockEvent;
  samples: LatchSensorSample[];
}

export const PenaltyBoxLatchInterlockWorkbench: React.FC<PenaltyBoxLatchInterlockWorkbenchProps> = ({
  event,
  samples,
}) => {
  const getStatusBadge = () => {
    if (event.is_premature_release) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-800">
          PREMATURE UNLATCH DETECTED ({event.release_delta_s.toFixed(3)} s)
        </span>
      );
    }
    if (event.is_unlatched) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
          LEGAL PENALTY EXPIRATION RELEASE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
        DOOR LATCHED & LOCKED
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Patent P421 • Sprint 63
          </div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100">
            Penalty Box Door Latch Micro-Switch Video Interlock
          </h2>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Primary Interlock Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Door Identifier</span>
          <p className="mt-1 text-xl font-mono font-bold text-zinc-100 truncate">
            {event.door_id}
          </p>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Penalty Clock Remaining</span>
          <p className="mt-1 text-2xl font-mono font-bold text-amber-400">
            {event.penalty_remaining_time_s.toFixed(3)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">s</span>
          </p>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Debounce Latency</span>
          <p className="mt-1 text-2xl font-mono font-bold text-sky-400">
            {event.debounce_latency_ms.toFixed(1)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">ms</span>
          </p>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">PTP Video Frame</span>
          <p className="mt-1 text-2xl font-mono font-bold text-emerald-400">
            #{event.ptp_frame_index}
          </p>
        </div>
      </div>

      {/* Hardware Micro-Switch Signal Transition Samples */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">
          Hardware Latch Pin Transitions (1000 Hz Contact Sampling)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="pb-2">Timestamp (s)</th>
                <th className="pb-2">Pin State</th>
                <th className="pb-2">Contact Resistance</th>
                <th className="pb-2">Gate Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {samples.map((s, idx) => (
                <tr key={idx} className="text-zinc-300">
                  <td className="py-2 text-zinc-400">{s.timestamp_s.toFixed(4)}</td>
                  <td className="py-2">
                    {s.pin_state_high ? (
                      <span className="text-zinc-300">HIGH (Closed)</span>
                    ) : (
                      <span className="text-amber-400">LOW (Open)</span>
                    )}
                  </td>
                  <td className="py-2 text-sky-400">
                    {s.contact_resistance_ohms > 1000 ? "> 10 kΩ" : `${s.contact_resistance_ohms.toFixed(1)} Ω`}
                  </td>
                  <td className="py-2">
                    {s.pin_state_high ? (
                      <span className="text-emerald-400">Engaged</span>
                    ) : (
                      <span className="text-red-400 font-semibold">Unlatched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>Sub-15ms Hardware Debouncing Active</span>
        <span>PTP Sync Clock: IEEE 1588 Microsecond Master</span>
      </div>
    </div>
  );
};
