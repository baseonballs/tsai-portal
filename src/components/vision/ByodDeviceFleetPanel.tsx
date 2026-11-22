"use client";

import React, { useState } from "react";
import { Check, Edit3, History, KeyRound, RefreshCw, Trash2, X } from "lucide-react";

import {
  BYOD_GLASS_OPTIONS,
  type ByodCalibration,
  type ByodDevice,
  type ByodEffectiveStatus,
  type ByodGlassType,
} from "@/types/byod-types";
import type { UpdateByodDeviceInput } from "@/lib/byod/byod-api-client";
import {
  ByodCalibrationReadout,
  formatCalibrationSourceLabel,
  NotYetMeasured,
} from "@/components/vision/ByodCalibrationReadout";

export function formatByodStatusBadge(status: ByodEffectiveStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "paired":
      return {
        label: "Paired (Hardware Handshake Verified)",
        className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
      };
    case "operator_registered":
      return {
        label: "Operator Check Logged — Hardware Handshake Pending",
        className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
      };
    case "offline":
      return {
        label: "Offline (Last seen > 5m ago)",
        className: "border-orange-500/40 bg-orange-500/10 text-orange-300",
      };
    case "revoked":
      return {
        label: "Revoked",
        className: "border-rose-500/40 bg-rose-500/10 text-rose-300",
      };
    default:
      return {
        label: "Pending Hardware Handshake",
        className: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
      };
  }
}

interface ByodDeviceFleetPanelProps {
  devices: ByodDevice[];
  total: number;
  selectedDeviceId: string;
  calibrations: ByodCalibration[];
  calibrationsTotal: number;
  loadingDevices?: boolean;
  loadingCalibrations?: boolean;
  busy?: boolean;
  onSelectDevice: (deviceId: string) => void;
  onRefreshDevices?: () => void;
  onUpdateDevice?: (deviceId: string, input: UpdateByodDeviceInput) => Promise<boolean>;
  onRotateCode?: (deviceId: string) => Promise<void>;
  onRevokeDevice?: (deviceId: string) => Promise<void>;
}

export function ByodDeviceFleetPanel({
  devices,
  total,
  selectedDeviceId,
  calibrations,
  calibrationsTotal,
  loadingDevices = false,
  loadingCalibrations = false,
  busy = false,
  onSelectDevice,
  onRefreshDevices,
  onUpdateDevice,
  onRotateCode,
  onRevokeDevice,
}: ByodDeviceFleetPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editGlass, setEditGlass] = useState<ByodGlassType>("tempered");
  const [editMesh, setEditMesh] = useState("");
  const [editRtmpsConfigured, setEditRtmpsConfigured] = useState(false);
  const [editRtmpsHint, setEditRtmpsHint] = useState("");
  const [showHistory, setShowHistory] = useState(true);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) ?? null;

  const startEdit = (device: ByodDevice) => {
    setEditingId(device.id);
    setEditLabel(device.deviceLabel);
    setEditGlass(device.glassType);
    setEditMesh(device.meshServiceName ?? "");
    setEditRtmpsConfigured(device.rtmpsEgressConfigured);
    setEditRtmpsHint(device.rtmpsKeyHintLast4 ?? "");
  };

  const saveEdit = async (deviceId: string) => {
    if (!onUpdateDevice) return;
    const ok = await onUpdateDevice(deviceId, {
      deviceLabel: editLabel.trim(),
      glassType: editGlass,
      meshServiceName: editMesh.trim() || null,
      rtmpsEgressConfigured: editRtmpsConfigured,
      rtmpsKeyHintLast4: editRtmpsHint.trim() || null,
    });
    if (ok) {
      setEditingId(null);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-medium text-white">Team BYOD Device Fleet ({total})</h3>
          <p className="text-xs text-zinc-400">
            Persisted hardware registrations and latest verified telemetry from hockey-api.
          </p>
        </div>
        {onRefreshDevices && (
          <button
            type="button"
            disabled={busy || loadingDevices}
            onClick={onRefreshDevices}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:border-cyan-500/40 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDevices ? "animate-spin" : ""}`} />
            Refresh
          </button>
        )}
      </div>

      {loadingDevices ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-xs text-zinc-400">
          Loading persisted team devices...
        </div>
      ) : devices.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center space-y-1">
          <p className="text-sm font-medium text-white">No BYOD devices registered for this team yet</p>
          <p className="text-xs text-zinc-400">
            Use Step 1 below to register a hardware device and mint a one-time pairing code.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => {
            const badge = formatByodStatusBadge(device.effectiveStatus);
            const isSelected = device.id === selectedDeviceId;
            const isRevoked = device.pairingStatus === "revoked";
            const isEditing = editingId === device.id;

            return (
              <div
                key={device.id}
                className={`rounded-2xl border p-4 transition-all space-y-3 ${
                  isSelected
                    ? "border-cyan-500/60 bg-cyan-950/15"
                    : "border-white/10 bg-zinc-950/40 hover:border-white/20"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectDevice(device.id)}
                    className="text-left space-y-1 cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white text-sm">{device.deviceLabel}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono border ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-400">
                      <span>Model: {device.deviceModel}</span>
                      <span>Glass: {device.glassType}</span>
                      <span>
                        Mesh: {device.meshServiceName ?? "Not configured"}
                      </span>
                      <span>
                        RTMPS:{" "}
                        {device.rtmpsEgressConfigured
                          ? `Ready${device.rtmpsKeyHintLast4 ? ` (hint ••••${device.rtmpsKeyHintLast4})` : ""}`
                          : "Not configured"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-zinc-500">
                      <span>Paired at: {device.pairedAt ?? "Never"}</span>
                      <span>Last seen: {device.lastSeenAt ?? "Never"}</span>
                      <span>Attempts: {device.pairingAttempts}/5</span>
                    </div>
                  </button>

                  {!isRevoked && (
                    <div className="flex flex-wrap items-center gap-2">
                      {onUpdateDevice && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => (isEditing ? setEditingId(null) : startEdit(device))}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-cyan-500/40 hover:text-white disabled:opacity-50 cursor-pointer"
                        >
                          {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                          {isEditing ? "Cancel" : "Edit"}
                        </button>
                      )}
                      {onRotateCode && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void onRotateCode(device.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Rotate Code
                        </button>
                      )}
                      {onRevokeDevice && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void onRevokeDevice(device.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-900/40 disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Revoke
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-mono text-zinc-400 block">Device Label (non-PII)</label>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-zinc-400 block">Arena Glass Substrate</label>
                      <select
                        value={editGlass}
                        onChange={(e) => setEditGlass(e.target.value as ByodGlassType)}
                        className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white font-mono"
                      >
                        {BYOD_GLASS_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-zinc-400 block">Mesh Service Name</label>
                      <input
                        type="text"
                        value={editMesh}
                        onChange={(e) => setEditMesh(e.target.value)}
                        placeholder="rink-north._tsai-mesh._tcp.local"
                        className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-zinc-400 block">Local RTMPS Key Hint (last 4)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editRtmpsConfigured}
                          onChange={(e) => setEditRtmpsConfigured(e.target.checked)}
                          aria-label="Edit local RTMPS readiness"
                          className="h-4 w-4 accent-cyan-500"
                        />
                        <input
                          type="text"
                          maxLength={4}
                          value={editRtmpsHint}
                          onChange={(e) => setEditRtmpsHint(e.target.value)}
                          placeholder="A1B2"
                          className="flex-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        disabled={busy || !editLabel.trim()}
                        onClick={() => void saveEdit(device.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 font-bold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {isSelected && (
                  <ByodCalibrationReadout calibration={device.latestCalibration} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedDevice && (
        <div className="border-t border-white/10 pt-4 space-y-3">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className="inline-flex items-center gap-2 text-xs font-mono text-cyan-300 hover:text-cyan-200 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            {showHistory ? "Hide" : "Show"} Calibration History ({calibrationsTotal})
          </button>

          {showHistory && (
            loadingCalibrations ? (
              <div className="text-xs text-zinc-400 font-mono">Loading calibration history...</div>
            ) : calibrations.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4 text-xs text-zinc-400 flex items-center justify-between">
                <span>No calibration observations recorded for {selectedDevice.deviceLabel} yet.</span>
                <NotYetMeasured />
              </div>
            ) : (
              <div className="space-y-2">
                {calibrations.map((cal) => (
                  <div
                    key={cal.id}
                    className="rounded-xl border border-white/10 bg-zinc-950/40 p-3 text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-white">
                        {formatCalibrationSourceLabel(cal.calibrationSource)}
                      </span>
                      <span className="font-mono text-zinc-400">
                        {cal.measuredAt} · {cal.recordedBySubject}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-zinc-300">
                      <span>
                        Tilt: {cal.opticalTiltDeg !== null ? `${cal.opticalTiltDeg.toFixed(2)}°` : "unmeasured"}
                      </span>
                      <span>
                        Vacuum: {cal.mountVacuumKpa !== null ? `${cal.mountVacuumKpa.toFixed(1)} kPa` : "unmeasured"}
                      </span>
                      <span>
                        Die: {cal.dieTempC !== null ? `${cal.dieTempC.toFixed(1)}°C` : "unmeasured"}
                      </span>
                      <span>
                        SNR: {cal.acousticSnrDb !== null ? `${cal.acousticSnrDb.toFixed(1)} dB` : "unmeasured"}
                      </span>
                      {cal.whistleFilterHzLow !== null && cal.whistleFilterHzHigh !== null && (
                        <span>
                          Passband: {cal.whistleFilterHzLow}–{cal.whistleFilterHzHigh} Hz
                        </span>
                      )}
                    </div>
                    {cal.notes && <div className="text-zinc-400">{cal.notes}</div>}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}
