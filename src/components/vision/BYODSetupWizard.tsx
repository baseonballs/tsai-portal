"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  KeyRound,
  Mic,
  Radio,
  Shield,
  Sparkles,
  Thermometer,
  Volume2,
} from "lucide-react";

import {
  BYOD_GLASS_OPTIONS,
  BYOD_HARDWARE_PROFILES,
  BYOD_PELTIER_STATES,
  type ByodCalibration,
  type ByodDevice,
  type ByodDeviceModel,
  type ByodGlassType,
  type ByodPeltierState,
  type ByodTeamSummary,
} from "@/types/byod-types";
import {
  ByodApiError,
  fetchByodCalibrations,
  fetchByodTeams,
  fetchTeamByodDevices,
  recordByodManualCalibration,
  registerByodDevice,
  revokeByodDevice,
  updateByodDevice,
  type UpdateByodDeviceInput,
} from "@/lib/byod/byod-api-client";
import { playByodReferenceTone, type WebAudioToneHandle } from "@/lib/byod/webaudio-tone";
import { ByodCalibrationReadout, NotYetMeasured } from "@/components/vision/ByodCalibrationReadout";
import { ByodDeviceFleetPanel, formatByodStatusBadge } from "@/components/vision/ByodDeviceFleetPanel";

interface StepConfig {
  id: number;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
}

const STEPS: StepConfig[] = [
  { id: 1, title: "Hardware Device & Sensor Audit", shortTitle: "Device", icon: Camera },
  { id: 2, title: "Glass Mount & Vibration Diagnostic", shortTitle: "Mounting", icon: Shield },
  { id: 3, title: "Active Thermal & Qi2 Rigging", shortTitle: "Thermal", icon: Thermometer },
  { id: 4, title: "Acoustic Shield & Whistle Filter", shortTitle: "Acoustics", icon: Mic },
  { id: 5, title: "RTMPS Readiness & Arena Mesh Pairing", shortTitle: "Broadcast", icon: Radio },
];

type ByodAuthState = "loading" | "signed-out" | "not-entitled" | "ready";

function parseOptionalFloat(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

function parseOptionalInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^-?\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

export function BYODSetupWizard() {
  const [authState, setAuthState] = useState<ByodAuthState>("loading");
  const [teams, setTeams] = useState<ByodTeamSummary[]>([]);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const [devices, setDevices] = useState<ByodDevice[]>([]);
  const [devicesTotal, setDevicesTotal] = useState(0);
  const [loadedDevicesTeamId, setLoadedDevicesTeamId] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const [calibrations, setCalibrations] = useState<ByodCalibration[]>([]);
  const [calibrationsTotal, setCalibrationsTotal] = useState(0);
  const [loadedCalKey, setLoadedCalKey] = useState<string | null>(null);
  const [reloadSeq, setReloadSeq] = useState({ teams: 0, devices: 0, calibrations: 0 });

  const [mintedCode, setMintedCode] = useState<{
    deviceId: string;
    deviceLabel: string;
    code: string;
    expiresAt: string | null;
  } | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  // Device registration / configuration form state (strictly non-PII hardware fields)
  const [deviceModel, setDeviceModel] = useState<ByodDeviceModel>("iphone-16-pro");
  const [deviceLabel, setDeviceLabel] = useState("");
  const [glassType, setGlassType] = useState<ByodGlassType>("tempered");
  const [meshServiceName, setMeshServiceName] = useState("");
  const [rtmpsEgressConfigured, setRtmpsEgressConfigured] = useState(false);
  const [rtmpsKeyHintLast4, setRtmpsKeyHintLast4] = useState("");

  // Optional operator manual rigging check fields (blank stays SQL NULL / unmeasured)
  const [manualTiltInput, setManualTiltInput] = useState("");
  const [manualHorizonLocked, setManualHorizonLocked] = useState<boolean | null>(null);
  const [manualVacuumKpaInput, setManualVacuumKpaInput] = useState("");
  const [manualDieTempInput, setManualDieTempInput] = useState("");
  const [manualPowerWattsInput, setManualPowerWattsInput] = useState("");
  const [manualPeltierState, setManualPeltierState] = useState<ByodPeltierState | "">("");
  const [manualWhistleLowInput, setManualWhistleLowInput] = useState("");
  const [manualWhistleHighInput, setManualWhistleHighInput] = useState("");
  const [manualNotes, setManualNotes] = useState("");

  // Step 4 WebAudio 3.2 kHz local reference tone state
  const [tonePlaying, setTonePlaying] = useState(false);
  const [toneError, setToneError] = useState<string | null>(null);
  const toneHandleRef = useRef<WebAudioToneHandle | null>(null);

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      toneHandleRef.current?.stop();
      toneHandleRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchByodTeams()
      .then((list) => {
        if (cancelled) return;
        setTeamsError(null);
        setTeams(list);
        setSelectedTeamId((prev) =>
          prev && list.some((t) => t.teamId === prev) ? prev : list[0]?.teamId ?? "",
        );
        setAuthState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ByodApiError && err.status === 401) {
          setTeams([]);
          setSelectedTeamId("");
          setAuthState("signed-out");
        } else if (err instanceof ByodApiError && err.status === 403) {
          setTeams([]);
          setSelectedTeamId("");
          setAuthState("not-entitled");
        } else {
          setTeamsError(err instanceof Error ? err.message : "Unable to load BYOD teams.");
          setAuthState("ready");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadSeq.teams]);

  const refreshDevices = useCallback(async (teamId: string) => {
    if (!teamId) {
      setDevices([]);
      setDevicesTotal(0);
      setSelectedDeviceId("");
      setLoadedDevicesTeamId(null);
      return;
    }
    setLoadedDevicesTeamId(null);
    setActionError(null);
    try {
      const page = await fetchTeamByodDevices(teamId, 25, 0);
      setDevices(page.items);
      setDevicesTotal(page.total);
      setSelectedDeviceId((prev) =>
        prev && page.items.some((d) => d.id === prev) ? prev : page.items[0]?.id ?? "",
      );
    } catch (err) {
      if (err instanceof ByodApiError && err.status === 401) {
        setAuthState("signed-out");
      } else if (err instanceof ByodApiError && err.status === 403) {
        setAuthState("not-entitled");
      } else {
        setActionError(err instanceof Error ? err.message : "Unable to load BYOD devices.");
      }
    } finally {
      setLoadedDevicesTeamId(teamId);
    }
  }, []);

  useEffect(() => {
    if (authState !== "ready" || !selectedTeamId) return;
    let cancelled = false;
    fetchTeamByodDevices(selectedTeamId, 25, 0)
      .then((page) => {
        if (cancelled) return;
        setActionError(null);
        setDevices(page.items);
        setDevicesTotal(page.total);
        setSelectedDeviceId((prev) =>
          prev && page.items.some((d) => d.id === prev) ? prev : page.items[0]?.id ?? "",
        );
        setLoadedDevicesTeamId(selectedTeamId);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadedDevicesTeamId(selectedTeamId);
        if (err instanceof ByodApiError && err.status === 401) {
          setAuthState("signed-out");
        } else if (err instanceof ByodApiError && err.status === 403) {
          setAuthState("not-entitled");
        } else {
          setActionError(err instanceof Error ? err.message : "Unable to load BYOD devices.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [authState, selectedTeamId, reloadSeq.devices]);

  const refreshCalibrations = useCallback(async (teamId: string, deviceId: string) => {
    if (!teamId || !deviceId) {
      setCalibrations([]);
      setCalibrationsTotal(0);
      setLoadedCalKey(null);
      return;
    }
    const key = `${teamId}:${deviceId}`;
    setLoadedCalKey(null);
    try {
      const page = await fetchByodCalibrations(teamId, deviceId, 25, 0);
      setCalibrations(page.items);
      setCalibrationsTotal(page.total);
    } catch (err) {
      if (err instanceof ByodApiError && err.status === 401) {
        setAuthState("signed-out");
      } else {
        setActionError(err instanceof Error ? err.message : "Unable to load calibration history.");
      }
    } finally {
      setLoadedCalKey(key);
    }
  }, []);

  useEffect(() => {
    if (authState !== "ready" || !selectedTeamId || !selectedDeviceId) return;
    let cancelled = false;
    const key = `${selectedTeamId}:${selectedDeviceId}`;
    fetchByodCalibrations(selectedTeamId, selectedDeviceId, 25, 0)
      .then((page) => {
        if (cancelled) return;
        setCalibrations(page.items);
        setCalibrationsTotal(page.total);
        setLoadedCalKey(key);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadedCalKey(key);
        if (err instanceof ByodApiError && err.status === 401) {
          setAuthState("signed-out");
        } else {
          setActionError(err instanceof Error ? err.message : "Unable to load calibration history.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [authState, selectedTeamId, selectedDeviceId, reloadSeq.calibrations]);

  const activeCalKey = selectedTeamId && selectedDeviceId ? `${selectedTeamId}:${selectedDeviceId}` : null;
  const visibleDevices = loadedDevicesTeamId === selectedTeamId ? devices : [];
  const visibleDevicesTotal = loadedDevicesTeamId === selectedTeamId ? devicesTotal : 0;
  const visibleCalibrations = activeCalKey && loadedCalKey === activeCalKey ? calibrations : [];
  const visibleCalibrationsTotal = activeCalKey && loadedCalKey === activeCalKey ? calibrationsTotal : 0;
  const loadingDevices =
    authState === "ready" && Boolean(selectedTeamId) && loadedDevicesTeamId !== selectedTeamId;
  const loadingCalibrations =
    authState === "ready" && Boolean(activeCalKey) && loadedCalKey !== activeCalKey;
  const selectedDevice = visibleDevices.find((d) => d.id === selectedDeviceId) ?? null;
  const activeCal = selectedDevice?.latestCalibration ?? null;

  const syncFormFromDevice = (device: ByodDevice) => {
    setDeviceModel(device.deviceModel);
    setDeviceLabel(device.deviceLabel);
    setGlassType(device.glassType);
    setMeshServiceName(device.meshServiceName ?? "");
    setRtmpsEgressConfigured(device.rtmpsEgressConfigured);
    setRtmpsKeyHintLast4(device.rtmpsKeyHintLast4 ?? "");
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    const hit = visibleDevices.find((d) => d.id === deviceId);
    if (hit) syncFormFromDevice(hit);
  };

  const handleRegisterDevice = async () => {
    if (!selectedTeamId) return;
    setBusy(true);
    setActionError(null);
    setActionSuccess(null);
    setCodeCopied(false);
    try {
      const result = await registerByodDevice(selectedTeamId, {
        deviceLabel: deviceLabel.trim(),
        deviceModel,
        glassType,
        meshServiceName: meshServiceName.trim() || null,
        rtmpsEgressConfigured,
        rtmpsKeyHintLast4: rtmpsKeyHintLast4.trim() || null,
        initiatePairing: true,
      });
      if (result.pairingCode) {
        setMintedCode({
          deviceId: result.device.id,
          deviceLabel: result.device.deviceLabel,
          code: result.pairingCode,
          expiresAt: result.pairingCodeExpiresAt,
        });
      }
      setActionSuccess(`Registered "${result.device.deviceLabel}". Hardware handshake is pending.`);
      await refreshDevices(selectedTeamId);
      setSelectedDeviceId(result.device.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Device registration failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateDevice = async (
    deviceId: string,
    input: UpdateByodDeviceInput,
  ): Promise<boolean> => {
    if (!selectedTeamId) return false;
    setBusy(true);
    setActionError(null);
    setActionSuccess(null);
    setCodeCopied(false);
    try {
      const res = await updateByodDevice(selectedTeamId, deviceId, input);
      if (res.pairingCode) {
        setMintedCode({
          deviceId: res.device.id,
          deviceLabel: res.device.deviceLabel,
          code: res.pairingCode,
          expiresAt: res.pairingCodeExpiresAt,
        });
      }
      setActionSuccess(
        input.rotatePairingCode
          ? `Rotated pairing code for "${res.device.deviceLabel}". Prior device tokens were revoked.`
          : `Updated configuration for "${res.device.deviceLabel}".`,
      );
      await refreshDevices(selectedTeamId);
      return true;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update BYOD device.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    if (!selectedTeamId) return;
    setBusy(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await revokeByodDevice(selectedTeamId, deviceId);
      if (mintedCode?.deviceId === deviceId) {
        setMintedCode(null);
      }
      setActionSuccess("Device soft-revoked and credentials invalidated.");
      await refreshDevices(selectedTeamId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to revoke BYOD device.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogManualCheck = async (overrideNotes?: string) => {
    if (!selectedTeamId || !selectedDeviceId) return;
    setBusy(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const notes = (overrideNotes ?? manualNotes).trim() || null;
      await recordByodManualCalibration(selectedTeamId, selectedDeviceId, {
        opticalTiltDeg: parseOptionalFloat(manualTiltInput),
        opticalHorizonLocked: manualHorizonLocked,
        mountVacuumKpa: parseOptionalFloat(manualVacuumKpaInput),
        dieTempC: parseOptionalFloat(manualDieTempInput),
        powerDeliveryWatts: parseOptionalFloat(manualPowerWattsInput),
        peltierState: manualPeltierState || null,
        acousticSnrDb: null, // Unmeasured unless supplied by device hardware telemetry
        whistleFilterHzLow: parseOptionalInt(manualWhistleLowInput),
        whistleFilterHzHigh: parseOptionalInt(manualWhistleHighInput),
        notes,
      });
      setActionSuccess(
        "Operator manual rigging check logged (calibration_source: manual_check). Hardware handshake remains pending until device connects.",
      );
      await Promise.all([
        refreshDevices(selectedTeamId),
        refreshCalibrations(selectedTeamId, selectedDeviceId),
      ]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to record manual rigging check.");
    } finally {
      setBusy(false);
    }
  };

  const handlePlayTone = async () => {
    setToneError(null);
    toneHandleRef.current?.stop();
    toneHandleRef.current = null;
    setTonePlaying(true);
    const result = await playByodReferenceTone({
      onEnded: () => {
        toneHandleRef.current = null;
        setTonePlaying(false);
      },
    });
    if (!result.ok) {
      setTonePlaying(false);
      setToneError(result.error);
      return;
    }
    toneHandleRef.current = result.handle;
  };

  const handleCopyCode = async () => {
    if (!mintedCode) return;
    try {
      await navigator.clipboard.writeText(mintedCode.code);
      setCodeCopied(true);
    } catch {
      setActionError("Clipboard copy failed; copy the pairing code manually.");
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
    }
  };

  const prevStep = () => {
    if (isComplete) {
      setIsComplete(false);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectedBadge = selectedDevice ? formatByodStatusBadge(selectedDevice.effectiveStatus) : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* AUTH / TEAM CONTEXT BANNER */}
      {authState === "signed-out" && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">
              Rinkside BYOD Setup Guide (Read-Only Visitor View)
            </h2>
            <p className="text-xs text-zinc-300">
              Sign in with an entitled coaching or team-manager account to register pods, mint one-time pairing codes, and view live device telemetry.
            </p>
          </div>
          <Link
            href="/login?next=/byod-setup"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-xs font-bold text-zinc-950 transition-colors shrink-0"
          >
            Sign In to Pair Devices
          </Link>
        </div>
      )}

      {authState === "not-entitled" && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">Active Portal Licence Required</h2>
            <p className="text-xs text-amber-200">
              Your account is signed in, but BYOD team hardware registration requires an active Transcend Portal licence.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/20 hover:bg-amber-500/30 px-4 py-2.5 text-xs font-semibold text-amber-200 transition-colors shrink-0"
          >
            View Plans
          </Link>
        </div>
      )}

      {teamsError && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-rose-200">{teamsError}</div>
          <button
            type="button"
            onClick={() => {
              setAuthState("loading");
              setTeamsError(null);
              setReloadSeq((s) => ({ ...s, teams: s.teams + 1 }));
            }}
            className="rounded-xl border border-rose-400/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/30 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {authState === "ready" && !teamsError && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {teams.length === 0 ? (
            <div className="text-xs text-zinc-300">
              <strong className="text-white">No eligible BYOD teams found.</strong>{" "}
              Head Coach, Assistant Coach, Video Analyst, Lead Team Manager, or Team Manager role on a team is required to pair hardware.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="byod-team-select" className="text-xs font-mono uppercase text-zinc-400">
                  Team Context
                </label>
                <select
                  id="byod-team-select"
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    setSelectedDeviceId("");
                    setLoadedDevicesTeamId(null);
                    setLoadedCalKey(null);
                    setMintedCode(null);
                  }}
                  disabled={busy}
                  className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-mono text-white"
                >
                  {teams.map((t) => (
                    <option key={t.teamId} value={t.teamId}>
                      {t.teamName}
                      {t.season ? ` (${t.season})` : ""} · {t.staffRole}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[11px] font-mono text-zinc-400">
                Operator role: {teams.find((t) => t.teamId === selectedTeamId)?.staffRole ?? "staff"}
              </div>
            </>
          )}
        </div>
      )}

      {/* ONE-TIME PAIRING CODE BANNER */}
      {mintedCode && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono font-semibold uppercase">
              <KeyRound className="w-4 h-4" /> One-Time Pairing Code for {mintedCode.deviceLabel}
            </div>
            <button
              type="button"
              onClick={() => setMintedCode(null)}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <code className="rounded-xl border border-emerald-500/30 bg-zinc-950 px-4 py-2 text-lg font-mono font-bold tracking-widest text-white">
              {mintedCode.code}
            </code>
            <button
              type="button"
              onClick={() => void handleCopyCode()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              {codeCopied ? "Copied" : "Copy Code"}
            </button>
            {mintedCode.expiresAt && (
              <span className="text-xs font-mono text-zinc-300">
                Expires: {mintedCode.expiresAt}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-300">
            Shown once only. Enter this Crockford Base32 code in BenchHub or your capture daemon to complete the hardware handshake. Refreshing hides this code; use Rotate Code to issue a replacement.
          </p>
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-xs text-rose-200 flex items-center justify-between gap-3">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} className="font-bold text-rose-300 hover:text-white cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/25 px-4 py-3 text-xs text-emerald-200 flex items-center justify-between gap-3">
          <span>{actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess(null)} className="font-bold text-emerald-300 hover:text-white cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* PERSISTED FLEET PANEL (ONLY FOR AUTHENTICATED ENTITLED TEAMS) */}
      {authState === "ready" && selectedTeamId && (
        <ByodDeviceFleetPanel
          devices={visibleDevices}
          total={visibleDevicesTotal}
          selectedDeviceId={selectedDeviceId}
          calibrations={visibleCalibrations}
          calibrationsTotal={visibleCalibrationsTotal}
          loadingDevices={loadingDevices}
          loadingCalibrations={loadingCalibrations}
          busy={busy}
          onSelectDevice={handleSelectDevice}
          onRefreshDevices={() => {
            setLoadedDevicesTeamId(null);
            setLoadedCalKey(null);
            setReloadSeq((s) => ({
              ...s,
              devices: s.devices + 1,
              calibrations: s.calibrations + 1,
            }));
          }}
          onUpdateDevice={handleUpdateDevice}
          onRotateCode={async (id) => {
            await handleUpdateDevice(id, { rotatePairingCode: true });
          }}
          onRevokeDevice={handleRevokeDevice}
        />
      )}

      {/* MAIN 5-STEP WIZARD */}
      <div className="w-full rounded-3xl border border-white/10 bg-zinc-900/60 p-6 md:p-10 backdrop-blur-xl shadow-2xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> BYOD Zero-Capex Rinkside Rig
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-white font-medium">
              Transcend Vision Pod Setup Wizard
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Pair and calibrate your iPhone, iPad, or custom hardware encoder for autonomous arena capture.
            </p>
          </div>

          {/* STEP PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isPassed = s.id < currentStep;
              const isCurrent = s.id === currentStep && !isComplete;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setIsComplete(false);
                    setCurrentStep(s.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20"
                      : isPassed
                      ? "bg-white/10 text-cyan-300 hover:bg-white/15"
                      : "bg-white/5 text-zinc-500 hover:bg-white/10"
                  }`}
                >
                  {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : <Icon className="w-3 h-3" />}
                  <span>{s.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT */}
        <div className="min-h-[380px] flex flex-col justify-between">
          {/* STEP 1: DEVICE & REGISTRATION */}
          {!isComplete && currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium text-white">
                    Step 1: Hardware Profile &amp; Non-PII Registration
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Select capture hardware, assign a non-PII hardware label, and mint a one-time pairing code.
                  </p>
                </div>
                {selectedBadge ? (
                  <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${selectedBadge.className}`}>
                    {selectedBadge.label}
                  </span>
                ) : (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-800/60 text-zinc-400 border border-white/10">
                    No device selected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {BYOD_HARDWARE_PROFILES.map((profile) => {
                  const selected = deviceModel === profile.id;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => {
                        setDeviceModel(profile.id);
                        setGlassType(profile.recommendedGlass);
                      }}
                      className={`text-left cursor-pointer rounded-2xl p-5 border transition-all ${
                        selected
                          ? "border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-950/40"
                          : "border-white/10 bg-zinc-950/40 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-mono font-bold ${selected ? "text-cyan-400" : "text-zinc-400"}`}>
                          {profile.badge}
                        </span>
                        {selected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <h3 className="font-semibold text-white text-sm">{profile.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1">{profile.subtitle}</p>
                      <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-400">
                        {profile.capabilityNote}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
                <div className="space-y-1.5">
                  <label htmlFor="byod-device-label" className="text-xs font-mono font-semibold uppercase text-zinc-400 block">
                    Device Label (Non-PII Hardware Name)
                  </label>
                  <input
                    id="byod-device-label"
                    type="text"
                    value={deviceLabel}
                    onChange={(e) => setDeviceLabel(e.target.value)}
                    placeholder="rink-north-pod-01"
                    maxLength={64}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[11px] text-zinc-500">
                    3–64 characters (A-Z, 0-9, space, _().-). No email addresses or person names.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="byod-mesh-service" className="text-xs font-mono font-semibold uppercase text-zinc-400 block">
                    Bonjour / mDNS Mesh Service Name (Optional)
                  </label>
                  <input
                    id="byod-mesh-service"
                    type="text"
                    value={meshServiceName}
                    onChange={(e) => setMeshServiceName(e.target.value)}
                    placeholder="rink-north._tsai-mesh._tcp.local"
                    maxLength={160}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Format: &lt;node&gt;._tsai-mesh._tcp or &lt;node&gt;._tsai-mesh._tcp.local
                  </p>
                </div>

                {authState === "ready" && selectedTeamId && (
                  <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <span className="text-xs text-zinc-400">
                      Registers a <code className="text-cyan-300">pending</code> device and mints an 8-char Crockford Base32 pairing code (15m TTL).
                    </span>
                    <button
                      type="button"
                      disabled={busy || deviceLabel.trim().length < 3}
                      onClick={() => void handleRegisterDevice()}
                      className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-zinc-950 disabled:opacity-50 cursor-pointer"
                    >
                      Register Device &amp; Mint Code
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <AlertTriangle className="w-5 h-5 text-zinc-500 shrink-0" />
                  <span>
                    <strong className="text-white">Optical sensor check:</strong>{" "}
                    {activeCal && activeCal.opticalTiltDeg !== null ? (
                      <span className="font-mono text-emerald-300">
                        {activeCal.opticalTiltDeg.toFixed(2)}° ({activeCal.calibrationSource === "device_telemetry" ? "Device Telemetry" : "Operator Check"})
                      </span>
                    ) : (
                      <NotYetMeasured />
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MOUNTING & VACUUM */}
          {!isComplete && currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">
                  Step 2: Arena Glass Mounting &amp; Vibration Diagnostic
                </h2>
                <p className="text-sm text-zinc-400">
                  Select barrier substrate, inspect vacuum seal pressure, and align perpendicular optical axes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 space-y-3">
                  <label className="text-xs font-mono font-semibold uppercase text-zinc-400 block">
                    Arena Glass Substrate
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {BYOD_GLASS_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setGlassType(opt.id)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          glassType === opt.id
                            ? "bg-cyan-500 text-zinc-950 border-cyan-400 font-bold"
                            : "border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    {BYOD_GLASS_OPTIONS.find((g) => g.id === glassType)?.guidance}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 space-y-2">
                  <div className="text-xs font-mono font-semibold uppercase text-zinc-400">
                    Optical Perpendicularity
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Measured Tilt:</span>
                    {activeCal && activeCal.opticalTiltDeg !== null ? (
                      <span className="font-mono text-white font-semibold">
                        {activeCal.opticalTiltDeg.toFixed(2)}°
                      </span>
                    ) : (
                      <NotYetMeasured />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Horizon Stabilization:</span>
                    {activeCal && activeCal.opticalHorizonLocked !== null ? (
                      <span className="font-mono text-white font-semibold">
                        {activeCal.opticalHorizonLocked ? "Horizon Locked" : "Horizon Unlocked"}
                      </span>
                    ) : (
                      <NotYetMeasured />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500">Target perpendicularity: ≤ 0.50°</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4 space-y-2">
                <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase">
                  Suction Force &amp; Vacuum Transducer Diagnostic
                </h3>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300">
                  <span>{"Dual-Vacuum Pump Engagement (target >= 65.0 kPa vacuum / 65 lbf suction-arm spec)"}</span>
                  <span className="font-mono">
                    {activeCal && activeCal.mountVacuumKpa !== null ? (
                      <span className="text-white font-semibold">{activeCal.mountVacuumKpa.toFixed(1)} kPa</span>
                    ) : (
                      <NotYetMeasured />
                    )}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label htmlFor="manual-tilt-input" className="font-mono text-zinc-400 block">
                    Manual Tilt (° , -90..90)
                  </label>
                  <input
                    id="manual-tilt-input"
                    type="number"
                    step="0.1"
                    min={-90}
                    max={90}
                    value={manualTiltInput}
                    onChange={(e) => setManualTiltInput(e.target.value)}
                    placeholder="leave blank if unmeasured"
                    className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="manual-vacuum-input" className="font-mono text-zinc-400 block">
                    Manual Vacuum (kPa, 0..101.3)
                  </label>
                  <input
                    id="manual-vacuum-input"
                    type="number"
                    step="0.1"
                    min={0}
                    max={101.3}
                    value={manualVacuumKpaInput}
                    onChange={(e) => setManualVacuumKpaInput(e.target.value)}
                    placeholder="leave blank if unmeasured"
                    className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="manual-horizon-select" className="font-mono text-zinc-400 block">
                    Manual Horizon Check
                  </label>
                  <select
                    id="manual-horizon-select"
                    value={manualHorizonLocked === null ? "" : manualHorizonLocked ? "true" : "false"}
                    onChange={(e) =>
                      setManualHorizonLocked(
                        e.target.value === "" ? null : e.target.value === "true",
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-white"
                  >
                    <option value="">Unmeasured</option>
                    <option value="true">Horizon Locked</option>
                    <option value="false">Horizon Unlocked</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: THERMAL & POWER */}
          {!isComplete && currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">
                  Step 3: Active Peltier Cooling &amp; Qi2 Rigging
                </h2>
                <p className="text-sm text-zinc-400">
                  Monitoring SoC thermal headroom and MagSafe Qi2 power delivery across multi-game tournament schedules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 space-y-2">
                  <div className="text-xs font-mono uppercase text-zinc-400">Internal Die Temp</div>
                  <div className="flex items-baseline justify-between gap-2">
                    {activeCal && activeCal.dieTempC !== null ? (
                      <span className="text-xl font-mono font-bold text-white">
                        {activeCal.dieTempC.toFixed(1)}°C
                      </span>
                    ) : (
                      <NotYetMeasured />
                    )}
                    <span className="text-xs text-zinc-400">Alert threshold: 32.0°C</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 space-y-2 text-xs">
                  <div className="text-xs font-mono uppercase text-zinc-400">MagSafe Qi2 15W Cold Plate</div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Peltier State:</span>
                    {activeCal && activeCal.peltierState !== null ? (
                      <span className="font-mono font-semibold text-cyan-300 uppercase">
                        {activeCal.peltierState}
                      </span>
                    ) : (
                      <NotYetMeasured />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Power Delivery:</span>
                    {activeCal && activeCal.powerDeliveryWatts !== null ? (
                      <span className="font-mono font-semibold text-white">
                        {activeCal.powerDeliveryWatts.toFixed(1)} W
                      </span>
                    ) : (
                      <NotYetMeasured />
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label htmlFor="manual-temp-input" className="font-mono text-zinc-400 block">
                    Manual Die Temp (°C, -20..110)
                  </label>
                  <input
                    id="manual-temp-input"
                    type="number"
                    step="0.1"
                    min={-20}
                    max={110}
                    value={manualDieTempInput}
                    onChange={(e) => setManualDieTempInput(e.target.value)}
                    placeholder="leave blank if unmeasured"
                    className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="manual-watts-input" className="font-mono text-zinc-400 block">
                    Manual Qi2 Power (W, 0..100)
                  </label>
                  <input
                    id="manual-watts-input"
                    type="number"
                    step="0.1"
                    min={0}
                    max={100}
                    value={manualPowerWattsInput}
                    onChange={(e) => setManualPowerWattsInput(e.target.value)}
                    placeholder="leave blank if unmeasured"
                    className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="manual-peltier-select" className="font-mono text-zinc-400 block">
                    Manual Peltier State
                  </label>
                  <select
                    id="manual-peltier-select"
                    value={manualPeltierState}
                    onChange={(e) => setManualPeltierState(e.target.value as ByodPeltierState | "")}
                    className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-white"
                  >
                    <option value="">Unmeasured</option>
                    {BYOD_PELTIER_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ACOUSTICS & WHISTLE */}
          {!isComplete && currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">
                  Step 4: Content-ID Acoustic Shield &amp; Whistle Sync
                </h2>
                <p className="text-sm text-zinc-400">
                  Play the local 3.2 kHz WebAudio reference pulse to verify speaker/mic coupling without fabricating SNR metrics.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Acoustic Signal-to-Noise Ratio (SNR):</span>
                  {activeCal && activeCal.acousticSnrDb !== null ? (
                    <span className="font-mono font-semibold text-white">
                      {activeCal.acousticSnrDb.toFixed(1)} dB
                    </span>
                  ) : (
                    <NotYetMeasured />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Whistle Recognition Passband (target 2800–3800 Hz):</span>
                  {activeCal &&
                  activeCal.whistleFilterHzLow !== null &&
                  activeCal.whistleFilterHzHigh !== null ? (
                    <span className="font-mono font-semibold text-white">
                      {activeCal.whistleFilterHzLow}–{activeCal.whistleFilterHzHigh} Hz
                    </span>
                  ) : (
                    <NotYetMeasured />
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Local Acoustic Reference Test</h3>
                    <p className="text-xs text-zinc-400">
                      Generates a real 3200 Hz sine burst (0.4s, gain 0.15) via browser WebAudio OscillatorNode.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handlePlayTone()}
                      disabled={tonePlaying}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-zinc-950 disabled:opacity-60 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      {tonePlaying
                        ? "Playing 3.2 kHz Tone..."
                        : "Play 3.2 kHz Local Reference Tone (Browser Speaker)"}
                    </button>

                    {authState === "ready" && selectedDeviceId && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void handleLogManualCheck(
                            manualNotes.trim() ||
                              "Operator verified 3.2 kHz local reference tone audibility (SNR unmeasured).",
                          )
                        }
                        className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-3.5 py-2 text-xs font-semibold text-emerald-200 disabled:opacity-50 cursor-pointer"
                      >
                        Operator Verified Audible Tone
                      </button>
                    )}
                  </div>
                </div>

                {toneError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-3.5 py-2.5 text-xs text-rose-200"
                  >
                    {toneError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label htmlFor="manual-whistle-low" className="font-mono text-zinc-400 block">
                      Whistle Filter Low (500..8000 Hz)
                    </label>
                    <input
                      id="manual-whistle-low"
                      type="number"
                      min={500}
                      max={8000}
                      value={manualWhistleLowInput}
                      onChange={(e) => setManualWhistleLowInput(e.target.value)}
                      placeholder="2800"
                      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="manual-whistle-high" className="font-mono text-zinc-400 block">
                      Whistle Filter High (1000..12000 Hz)
                    </label>
                    <input
                      id="manual-whistle-high"
                      type="number"
                      min={1000}
                      max={12000}
                      value={manualWhistleHighInput}
                      onChange={(e) => setManualWhistleHighInput(e.target.value)}
                      placeholder="3800"
                      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="manual-notes" className="font-mono text-zinc-400 block">
                      Rigging Notes (max 500 chars)
                    </label>
                    <input
                      id="manual-notes"
                      type="text"
                      maxLength={500}
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                      placeholder="Optional glass/audio observation"
                      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: LOCAL RTMPS READINESS & MESH */}
          {!isComplete && currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">
                  Step 5: Local RTMPS Readiness &amp; Arena Mesh Pairing
                </h2>
                <p className="text-sm text-zinc-400">
                  Track local encoder readiness and 4-char preset identifier without sending stream keys to TSAI servers.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/15 p-4 text-xs text-zinc-200">
                <strong className="text-cyan-300">Zero-Server-Secret Policy:</strong> Raw YouTube RTMPS stream keys and ingest URLs stay strictly on your local capture hardware and are rejected (<code className="text-cyan-300">422</code>) by Portal BFF and <code className="text-cyan-300">hockey-api</code>.
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label htmlFor="rtmps-readiness-toggle" className="text-sm font-semibold text-white block">
                      Local RTMPS Encoder Configured on Capture Hardware
                    </label>
                    <p className="text-xs text-zinc-400">
                      Operator confirmation that the capture device holds its own local RTMPS broadcast destination.
                    </p>
                  </div>
                  <input
                    id="rtmps-readiness-toggle"
                    type="checkbox"
                    checked={rtmpsEgressConfigured}
                    onChange={(e) => setRtmpsEgressConfigured(e.target.checked)}
                    className="h-5 w-5 accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div className="space-y-1.5">
                    <label htmlFor="rtmps-hint-last4" className="text-xs font-mono uppercase text-zinc-400 block">
                      Optional Local Key Visual Hint (Last 4 Alphanumeric)
                    </label>
                    <input
                      id="rtmps-hint-last4"
                      type="text"
                      maxLength={4}
                      value={rtmpsKeyHintLast4}
                      onChange={(e) => setRtmpsKeyHintLast4(e.target.value)}
                      placeholder="A1B2"
                      className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[11px] text-zinc-500">
                      Visual reminder only (4 alphanumeric characters). Never enter a full stream key.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-mono uppercase text-zinc-400">Arena Local WebRTC Mesh</div>
                    <div className="rounded-xl border border-white/10 bg-zinc-900/70 px-3.5 py-2.5 text-xs font-mono text-zinc-200 flex items-center justify-between">
                      <span>{meshServiceName.trim() || selectedDevice?.meshServiceName || "_tsai-mesh._tcp"}</span>
                      {selectedBadge ? (
                        <span className="text-cyan-300">{selectedBadge.label}</span>
                      ) : (
                        <NotYetMeasured />
                      )}
                    </div>
                  </div>
                </div>

                {authState === "ready" && selectedDeviceId && (
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-white/5">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void handleUpdateDevice(selectedDeviceId, {
                          deviceLabel: deviceLabel.trim() || undefined,
                          glassType,
                          meshServiceName: meshServiceName.trim() || null,
                          rtmpsEgressConfigured,
                          rtmpsKeyHintLast4: rtmpsKeyHintLast4.trim() || null,
                        })
                      }
                      className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer"
                    >
                      Save Device Configuration
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleLogManualCheck()}
                      className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-zinc-950 disabled:opacity-50 cursor-pointer"
                    >
                      Log Operator Manual Rigging Check
                    </button>
                  </div>
                )}
              </div>

              {selectedDevice && (
                <ByodCalibrationReadout
                  calibration={selectedDevice.latestCalibration}
                  title={`Selected Device Telemetry (${selectedDevice.deviceLabel})`}
                />
              )}
            </div>
          )}

          {/* STEP COMPLETION SUMMARY */}
          {isComplete && (
            <div className="py-6 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-zinc-800/70 border border-white/10 text-cyan-300 flex items-center justify-center mx-auto">
                  {selectedDevice?.pairingStatus === "paired" ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-amber-300" />
                  )}
                </div>

                {selectedDevice ? (
                  <>
                    <h2 className="text-2xl font-serif text-white">
                      {selectedDevice.deviceLabel}
                    </h2>
                    {selectedBadge && (
                      <div className="inline-flex">
                        <span className={`rounded-full px-3 py-1 text-xs font-mono border ${selectedBadge.className}`}>
                          {selectedBadge.label}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-zinc-400 max-w-lg mx-auto">
                      {selectedDevice.pairingStatus === "paired"
                        ? "Hardware handshake verified and live device telemetry is active."
                        : "Only an authenticated hardware handshake from BenchHub or your capture daemon transitions this pod to paired."}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-serif text-white">Setup Guide Reviewed</h2>
                    <p className="text-sm text-zinc-400 max-w-lg mx-auto">
                      No device is currently selected or paired. Sign in and register a team device in Step 1 to generate a one-time pairing code.
                    </p>
                  </>
                )}
              </div>

              {selectedDevice && (
                <ByodCalibrationReadout calibration={selectedDevice.latestCalibration} />
              )}

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsComplete(false);
                    setCurrentStep(1);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  Back to Team Devices
                </button>
                <Link
                  href="/tournament/director"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-all"
                >
                  Open Director Console
                </Link>
              </div>
            </div>
          )}

          {/* BOTTOM NAVIGATION */}
          {!isComplete && (
            <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentStep === 1
                    ? "opacity-30 cursor-not-allowed text-zinc-500"
                    : "text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 hover:opacity-95 transition-all cursor-pointer"
              >
                {currentStep === STEPS.length ? "Review Status Summary" : "Next Step"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
