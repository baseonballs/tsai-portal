"use client";

import React from "react";
import type { ByodCalibration } from "@/types/byod-types";

export function NotYetMeasured() {
  return (
    <span data-testid="byod-not-measured" className="text-zinc-500 font-mono text-xs">
      Not yet measured by device
    </span>
  );
}

export function formatCalibrationSourceLabel(
  source: ByodCalibration["calibrationSource"],
): string {
  return source === "device_telemetry"
    ? "Device Telemetry"
    : "Operator Check — Handshake Pending";
}

interface ByodCalibrationReadoutProps {
  calibration: ByodCalibration | null;
  title?: string;
}

export function ByodCalibrationReadout({
  calibration,
  title = "Latest Calibration & Telemetry Snapshot",
}: ByodCalibrationReadoutProps) {
  const whistleBand =
    calibration &&
    calibration.whistleFilterHzLow !== null &&
    calibration.whistleFilterHzHigh !== null
      ? `${calibration.whistleFilterHzLow}–${calibration.whistleFilterHzHigh} Hz`
      : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        {calibration ? (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono font-semibold border ${
                calibration.calibrationSource === "device_telemetry"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }`}
            >
              {formatCalibrationSourceLabel(calibration.calibrationSource)}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              {calibration.measuredAt}
            </span>
          </div>
        ) : (
          <NotYetMeasured />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-3 space-y-1">
          <div className="text-zinc-400 font-mono text-[11px]">Optical Tilt</div>
          {calibration && calibration.opticalTiltDeg !== null ? (
            <div className="font-mono font-semibold text-white">
              {calibration.opticalTiltDeg.toFixed(2)}°
            </div>
          ) : (
            <NotYetMeasured />
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-3 space-y-1">
          <div className="text-zinc-400 font-mono text-[11px]">Optical Horizon</div>
          {calibration && calibration.opticalHorizonLocked !== null ? (
            <div
              className={`font-mono font-semibold ${
                calibration.opticalHorizonLocked ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {calibration.opticalHorizonLocked ? "Horizon Locked" : "Horizon Unlocked"}
            </div>
          ) : (
            <NotYetMeasured />
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-3 space-y-1">
          <div className="text-zinc-400 font-mono text-[11px]">Vacuum Pressure</div>
          {calibration && calibration.mountVacuumKpa !== null ? (
            <div className="font-mono font-semibold text-white">
              {calibration.mountVacuumKpa.toFixed(1)} kPa
            </div>
          ) : (
            <NotYetMeasured />
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-3 space-y-1">
          <div className="text-zinc-400 font-mono text-[11px]">Die Temperature</div>
          {calibration && calibration.dieTempC !== null ? (
            <div className="font-mono font-semibold text-white">
              {calibration.dieTempC.toFixed(1)}°C
            </div>
          ) : (
            <NotYetMeasured />
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-3 space-y-1">
          <div className="text-zinc-400 font-mono text-[11px]">Peltier State</div>
          {calibration && calibration.peltierState !== null ? (
            <div className="font-mono font-semibold text-cyan-300 uppercase">
              {calibration.peltierState}
            </div>
          ) : (
            <NotYetMeasured />
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-3 space-y-1">
          <div className="text-zinc-400 font-mono text-[11px]">Qi2 Power Delivery</div>
          {calibration && calibration.powerDeliveryWatts !== null ? (
            <div className="font-mono font-semibold text-white">
              {calibration.powerDeliveryWatts.toFixed(1)} W
            </div>
          ) : (
            <NotYetMeasured />
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-3 space-y-1">
          <div className="text-zinc-400 font-mono text-[11px]">Acoustic SNR</div>
          {calibration && calibration.acousticSnrDb !== null ? (
            <div className="font-mono font-semibold text-white">
              {calibration.acousticSnrDb.toFixed(1)} dB
            </div>
          ) : (
            <NotYetMeasured />
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-3 space-y-1">
          <div className="text-zinc-400 font-mono text-[11px]">Whistle Passband</div>
          {whistleBand ? (
            <div className="font-mono font-semibold text-white">{whistleBand}</div>
          ) : (
            <NotYetMeasured />
          )}
        </div>
      </div>

      {calibration?.notes && (
        <div className="text-xs text-zinc-300 border-t border-white/5 pt-2">
          <span className="font-mono text-zinc-500">Notes: </span>
          {calibration.notes}
        </div>
      )}
    </div>
  );
}
