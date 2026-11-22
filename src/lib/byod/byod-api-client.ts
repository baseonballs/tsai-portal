import type {
  ByodCalibration,
  ByodCalibrationPage,
  ByodDeviceCreateResult,
  ByodDeviceModel,
  ByodDevicePage,
  ByodDeviceRevokeResult,
  ByodGlassType,
  ByodPeltierState,
  ByodTeamSummary,
} from "@/types/byod-types";

export class ByodApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ByodApiError";
    this.status = status;
  }
}

async function requestByodJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store" });
  const parsed = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string"
        ? parsed.error
        : `BYOD request failed (${res.status})`;
    throw new ByodApiError(res.status, message);
  }
  return parsed as T;
}

export async function fetchByodTeams(): Promise<ByodTeamSummary[]> {
  const data = await requestByodJson<{ items: ByodTeamSummary[] }>("/api/byod/teams");
  return Array.isArray(data.items) ? data.items : [];
}

export async function fetchTeamByodDevices(
  teamId: string,
  limit = 25,
  offset = 0,
): Promise<ByodDevicePage> {
  const qs = new URLSearchParams({
    teamId,
    limit: String(limit),
    offset: String(offset),
  });
  return requestByodJson<ByodDevicePage>(`/api/byod/devices?${qs.toString()}`);
}

export interface RegisterByodDeviceInput {
  deviceLabel: string;
  deviceModel: ByodDeviceModel;
  glassType: ByodGlassType;
  meshServiceName?: string | null;
  rtmpsEgressConfigured: boolean;
  rtmpsKeyHintLast4?: string | null;
  initiatePairing?: boolean;
}

export async function registerByodDevice(
  teamId: string,
  input: RegisterByodDeviceInput,
): Promise<ByodDeviceCreateResult> {
  return requestByodJson<ByodDeviceCreateResult>("/api/byod/devices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId, ...input }),
  });
}

export interface UpdateByodDeviceInput {
  deviceLabel?: string;
  glassType?: ByodGlassType;
  meshServiceName?: string | null;
  rtmpsEgressConfigured?: boolean;
  rtmpsKeyHintLast4?: string | null;
  rotatePairingCode?: boolean;
}

export async function updateByodDevice(
  teamId: string,
  deviceId: string,
  input: UpdateByodDeviceInput,
): Promise<ByodDeviceCreateResult> {
  return requestByodJson<ByodDeviceCreateResult>(
    `/api/byod/devices/${encodeURIComponent(deviceId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, ...input }),
    },
  );
}

export async function revokeByodDevice(
  teamId: string,
  deviceId: string,
): Promise<ByodDeviceRevokeResult> {
  const qs = new URLSearchParams({ teamId });
  return requestByodJson<ByodDeviceRevokeResult>(
    `/api/byod/devices/${encodeURIComponent(deviceId)}?${qs.toString()}`,
    { method: "DELETE" },
  );
}

export async function fetchByodCalibrations(
  teamId: string,
  deviceId: string,
  limit = 25,
  offset = 0,
): Promise<ByodCalibrationPage> {
  const qs = new URLSearchParams({
    teamId,
    limit: String(limit),
    offset: String(offset),
  });
  return requestByodJson<ByodCalibrationPage>(
    `/api/byod/devices/${encodeURIComponent(deviceId)}/calibrations?${qs.toString()}`,
  );
}

export interface RecordByodManualCalibrationInput {
  opticalTiltDeg?: number | null;
  opticalHorizonLocked?: boolean | null;
  mountVacuumKpa?: number | null;
  dieTempC?: number | null;
  powerDeliveryWatts?: number | null;
  peltierState?: ByodPeltierState | null;
  acousticSnrDb?: number | null;
  whistleFilterHzLow?: number | null;
  whistleFilterHzHigh?: number | null;
  notes?: string | null;
}

export async function recordByodManualCalibration(
  teamId: string,
  deviceId: string,
  input: RecordByodManualCalibrationInput,
): Promise<ByodCalibration> {
  return requestByodJson<ByodCalibration>(
    `/api/byod/devices/${encodeURIComponent(deviceId)}/calibrations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, calibrationSource: "manual_check", ...input }),
    },
  );
}
