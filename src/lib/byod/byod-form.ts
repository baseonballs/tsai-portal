import type { RecordByodManualCalibrationInput } from "@/lib/byod/byod-api-client";
import type { ByodDevice, ByodGlassType, ByodPeltierState } from "@/types/byod-types";

export interface ByodDeviceEditState {
  deviceLabel: string;
  glassType: ByodGlassType;
  meshServiceName: string;
  rtmpsEgressConfigured: boolean;
  rtmpsKeyHintLast4: string;
}

export function createDeviceEditState(device: ByodDevice | null): ByodDeviceEditState {
  if (!device) {
    return {
      deviceLabel: "",
      glassType: "tempered",
      meshServiceName: "",
      rtmpsEgressConfigured: false,
      rtmpsKeyHintLast4: "",
    };
  }
  return {
    deviceLabel: device.deviceLabel,
    glassType: device.glassType,
    meshServiceName: device.meshServiceName ?? "",
    rtmpsEgressConfigured: device.rtmpsEgressConfigured,
    rtmpsKeyHintLast4: device.rtmpsKeyHintLast4 ?? "",
  };
}

export function resolveSelectedDeviceAfterLoad(
  items: ByodDevice[],
  prevSelectedId: string,
  preferredId?: string,
): { nextSelectedId: string; nextSelectedDevice: ByodDevice | null } {
  if (preferredId) {
    const preferred = items.find((d) => d.id === preferredId);
    if (preferred) {
      return { nextSelectedId: preferred.id, nextSelectedDevice: preferred };
    }
  }
  if (prevSelectedId) {
    const existing = items.find((d) => d.id === prevSelectedId);
    if (existing) {
      return { nextSelectedId: existing.id, nextSelectedDevice: existing };
    }
  }
  const first = items[0] ?? null;
  return { nextSelectedId: first?.id ?? "", nextSelectedDevice: first };
}

export type ParsedOptionalNumberResult =
  | { ok: true; value: number | null }
  | { ok: false; error: string };

export function parseStrictOptionalFloat(raw: string, label: string): ParsedOptionalNumberResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(trimmed)) {
    return { ok: false, error: `${label} must be a valid decimal number.` };
  }
  const num = Number(trimmed);
  if (!Number.isFinite(num)) {
    return { ok: false, error: `${label} must be a finite number.` };
  }
  return { ok: true, value: num };
}

export function parseStrictOptionalInt(raw: string, label: string): ParsedOptionalNumberResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  if (!/^-?\d+$/.test(trimmed)) {
    return { ok: false, error: `${label} must be a whole integer.` };
  }
  const num = Number(trimmed);
  if (!Number.isSafeInteger(num)) {
    return { ok: false, error: `${label} must be a valid integer.` };
  }
  return { ok: true, value: num };
}

export interface ManualCalibrationFormValues {
  tiltInput: string;
  horizonLocked: boolean | null;
  vacuumKpaInput: string;
  dieTempInput: string;
  powerWattsInput: string;
  peltierState: ByodPeltierState | "";
  whistleLowInput: string;
  whistleHighInput: string;
  notesInput: string;
}

export type ParsedManualCalibrationResult =
  | { ok: true; payload: RecordByodManualCalibrationInput }
  | { ok: false; error: string };

export function parseManualCalibrationInputs(
  values: ManualCalibrationFormValues,
  overrideNotes?: string,
): ParsedManualCalibrationResult {
  const tilt = parseStrictOptionalFloat(values.tiltInput, "Optical tilt");
  if (!tilt.ok) return tilt;

  const vacuum = parseStrictOptionalFloat(values.vacuumKpaInput, "Mount vacuum (kPa)");
  if (!vacuum.ok) return vacuum;

  const dieTemp = parseStrictOptionalFloat(values.dieTempInput, "Die temperature (°C)");
  if (!dieTemp.ok) return dieTemp;

  const powerWatts = parseStrictOptionalFloat(values.powerWattsInput, "Qi2 power delivery (W)");
  if (!powerWatts.ok) return powerWatts;

  const whistleLow = parseStrictOptionalInt(values.whistleLowInput, "Whistle filter low (Hz)");
  if (!whistleLow.ok) return whistleLow;

  const whistleHigh = parseStrictOptionalInt(values.whistleHighInput, "Whistle filter high (Hz)");
  if (!whistleHigh.ok) return whistleHigh;

  const notes = (overrideNotes ?? values.notesInput).trim() || null;

  return {
    ok: true,
    payload: {
      opticalTiltDeg: tilt.value,
      opticalHorizonLocked: values.horizonLocked,
      mountVacuumKpa: vacuum.value,
      dieTempC: dieTemp.value,
      powerDeliveryWatts: powerWatts.value,
      peltierState: values.peltierState || null,
      acousticSnrDb: null, // Unmeasured unless supplied by device hardware telemetry
      whistleFilterHzLow: whistleLow.value,
      whistleFilterHzHigh: whistleHigh.value,
      notes,
    },
  };
}

export function formatWhistlePassband(
  low: number | null,
  high: number | null,
): string | null {
  if (low !== null && high !== null) return `${low}–${high} Hz`;
  if (low !== null) return `>= ${low} Hz`;
  if (high !== null) return `<= ${high} Hz`;
  return null;
}
