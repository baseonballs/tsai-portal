import type {
  ByodCalibration,
  ByodCalibrationPage,
  ByodCalibrationSource,
  ByodDevice,
  ByodDeviceCreateResult,
  ByodDeviceModel,
  ByodDevicePage,
  ByodDeviceRevokeResult,
  ByodEffectiveStatus,
  ByodGlassType,
  ByodPairingStatus,
  ByodPeltierState,
  ByodTeamSummary,
} from "@/types/byod-types";

type JsonObj = Record<string, unknown>;

const VALID_DEVICE_MODELS = new Set<ByodDeviceModel>([
  "iphone-16-pro",
  "iphone-15-pro",
  "ipad-pro-m4",
  "custom-rtmps-encoder",
]);
const VALID_GLASS_TYPES = new Set<ByodGlassType>(["tempered", "acrylic", "none"]);
const VALID_PAIRING_STATUSES = new Set<ByodPairingStatus>([
  "pending",
  "operator_registered",
  "paired",
  "revoked",
]);
const VALID_EFFECTIVE_STATUSES = new Set<ByodEffectiveStatus>([
  "pending",
  "operator_registered",
  "paired",
  "offline",
  "revoked",
]);
const VALID_CALIBRATION_SOURCES = new Set<ByodCalibrationSource>([
  "device_telemetry",
  "manual_check",
]);
const VALID_PELTIER_STATES = new Set<ByodPeltierState>([
  "off",
  "cooling",
  "throttled",
  "fault",
]);

const FORBIDDEN_SECRET_KEYS = new Set<string>([
  "rtmps_stream_key",
  "rtmpsStreamKey",
  "stream_key",
  "streamKey",
  "rtmp_url",
  "rtmpUrl",
  "rtmps_url",
  "rtmpsUrl",
  "rtmps_ingest_url",
  "rtmpsIngestUrl",
  "youtube_stream_key",
  "youtubeStreamKey",
  "pairing_secret",
  "pairingSecret",
  "pairing_code",
  "pairingCode",
  "pairing_code_hmac",
  "pairingCodeHmac",
  "device_token",
  "deviceToken",
  "device_token_hmac",
  "deviceTokenHmac",
]);

const RTMPS_URL_VALUE_RE = /\brtmps?:\/\//i;
const RTMPS_URL_EXTRACT_RE = /\brtmps?:\/\/[^\s"'`,;)}\]]+/gi;
const SECRET_KV_RE =
  /\b(?:rtmps_stream_key|rtmpsStreamKey|stream_key|streamKey|rtmp_url|rtmpUrl|rtmps_url|rtmpsUrl|rtmps_ingest_url|rtmpsIngestUrl|youtube_stream_key|youtubeStreamKey|pairing_secret|pairingSecret|pairing_code_hmac|pairingCodeHmac|pairing_code|pairingCode|device_token_hmac|deviceTokenHmac|device_token|deviceToken)\s*[:=]\s*(?:"[^"]*"|'[^']*'|\S+)/gi;
const SECRET_KEY_MENTION_RE =
  /\b(?:rtmps_stream_key|rtmpsStreamKey|stream_key|streamKey|rtmp_url|rtmpUrl|rtmps_url|rtmpsUrl|rtmps_ingest_url|rtmpsIngestUrl|youtube_stream_key|youtubeStreamKey|pairing_secret|pairingSecret|pairing_code_hmac|pairingCodeHmac|device_token_hmac|deviceTokenHmac)\b/gi;
const YOUTUBE_LIVE_KEY_RE = /\blive_[A-Za-z0-9_-]{6,}\b/g;
const YOUTUBE_DASH_KEY_RE = /(?<![0-9a-f-])\b[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}\b(?![0-9a-f-])/gi;
const AUTH_HEADER_VALUE_RE = /\b(?:Bearer|Device)\s+[A-Za-z0-9._~+/=-]{6,}/gi;

/**
 * Strip/redact any raw RTMPS URLs, stream keys, pairing secrets, or device bearer tokens
 * before returning error messages or writing logs.
 */
export function redactByodSecrets(input: string): string {
  return input
    .replace(RTMPS_URL_EXTRACT_RE, "[REDACTED_RTMPS_URL]")
    .replace(SECRET_KV_RE, "[REDACTED_SECRET]")
    .replace(SECRET_KEY_MENTION_RE, "[redacted_field]")
    .replace(YOUTUBE_LIVE_KEY_RE, "[REDACTED_STREAM_KEY]")
    .replace(YOUTUBE_DASH_KEY_RE, "[REDACTED_STREAM_KEY]")
    .replace(AUTH_HEADER_VALUE_RE, "[REDACTED_CREDENTIAL]");
}

/**
 * Return the offending key/marker if a request body carries raw RTMPS stream keys,
 * ingest URLs, or pairing secrets that must never cross the Portal BFF boundary.
 */
export function findForbiddenRtmpsSecretField(payload: unknown, depth = 0): string | null {
  if (depth > 8 || payload === null || payload === undefined) return null;
  if (typeof payload === "string") {
    return RTMPS_URL_VALUE_RE.test(payload) ? "rtmps_url_value" : null;
  }
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const hit = findForbiddenRtmpsSecretField(item, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof payload === "object") {
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (FORBIDDEN_SECRET_KEYS.has(key)) return key;
      const hit = findForbiddenRtmpsSecretField(value, depth + 1);
      if (hit) return hit;
    }
  }
  return null;
}

function requireObj(v: unknown, context: string): JsonObj {
  if (!v || typeof v !== "object" || Array.isArray(v)) {
    throw new Error(`Invalid ${context}: expected object.`);
  }
  return v as JsonObj;
}

function requireNonEmptyString(v: unknown, field: string): string {
  if (typeof v !== "string" || !v.trim()) {
    throw new Error(`Missing or invalid required string field "${field}".`);
  }
  return v.trim();
}

function requireNumber(v: unknown, field: string): number {
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new Error(`Missing or invalid required number field "${field}".`);
  }
  return v;
}

function requireBoolean(v: unknown, field: string): boolean {
  if (typeof v !== "boolean") {
    throw new Error(`Missing or invalid required boolean field "${field}".`);
  }
  return v;
}

function requireEnum<T extends string>(v: unknown, allowed: Set<T>, field: string): T {
  if (typeof v !== "string" || !allowed.has(v as T)) {
    throw new Error(`Missing or invalid enum value for "${field}": ${String(v)}.`);
  }
  return v as T;
}

function optionalString(v: unknown, field: string): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") {
    throw new Error(`Invalid optional string field "${field}".`);
  }
  return v.trim() || null;
}

function optionalNumber(v: unknown, field: string): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new Error(`Invalid optional number field "${field}".`);
  }
  return v;
}

function optionalBoolean(v: unknown, field: string): boolean | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "boolean") {
    throw new Error(`Invalid optional boolean field "${field}".`);
  }
  return v;
}

function optionalEnum<T extends string>(v: unknown, allowed: Set<T>, field: string): T | null {
  if (v === null || v === undefined) return null;
  return requireEnum(v, allowed, field);
}

export function mapByodTeamSummary(raw: unknown): ByodTeamSummary {
  const o = requireObj(raw, "byod_team");
  return {
    teamId: requireNonEmptyString(o.team_id ?? o.teamId, "team.team_id"),
    teamName: requireNonEmptyString(o.team_name ?? o.teamName, "team.team_name"),
    season: optionalString(o.season, "team.season"),
    levelOfPlay: optionalString(o.level_of_play ?? o.levelOfPlay, "team.level_of_play"),
    tier: optionalString(o.tier, "team.tier"),
    staffRole: requireNonEmptyString(o.staff_role ?? o.staffRole, "team.staff_role"),
  };
}

export function mapByodTeamList(raw: unknown): ByodTeamSummary[] {
  const o = requireObj(raw, "byod_team_list");
  if (!Array.isArray(o.items)) {
    throw new Error('Missing or invalid array field "items" on /byod/teams.');
  }
  return o.items.map(mapByodTeamSummary);
}

export function mapByodCalibration(raw: unknown): ByodCalibration {
  const o = requireObj(raw, "byod_calibration");
  return {
    id: requireNonEmptyString(o.id, "calibration.id"),
    deviceId: requireNonEmptyString(o.device_id ?? o.deviceId, "calibration.device_id"),
    teamId: requireNonEmptyString(o.team_id ?? o.teamId, "calibration.team_id"),
    recordedBySubject: requireNonEmptyString(
      o.recorded_by_subject ?? o.recordedBySubject,
      "calibration.recorded_by_subject",
    ),
    calibrationSource: requireEnum(
      o.calibration_source ?? o.calibrationSource,
      VALID_CALIBRATION_SOURCES,
      "calibration.calibration_source",
    ),
    opticalTiltDeg: optionalNumber(o.optical_tilt_deg ?? o.opticalTiltDeg, "calibration.optical_tilt_deg"),
    opticalHorizonLocked: optionalBoolean(
      o.optical_horizon_locked ?? o.opticalHorizonLocked,
      "calibration.optical_horizon_locked",
    ),
    mountVacuumKpa: optionalNumber(o.mount_vacuum_kpa ?? o.mountVacuumKpa, "calibration.mount_vacuum_kpa"),
    dieTempC: optionalNumber(o.die_temp_c ?? o.dieTempC, "calibration.die_temp_c"),
    powerDeliveryWatts: optionalNumber(
      o.power_delivery_watts ?? o.powerDeliveryWatts,
      "calibration.power_delivery_watts",
    ),
    peltierState: optionalEnum(o.peltier_state ?? o.peltierState, VALID_PELTIER_STATES, "calibration.peltier_state"),
    acousticSnrDb: optionalNumber(o.acoustic_snr_db ?? o.acousticSnrDb, "calibration.acoustic_snr_db"),
    whistleFilterHzLow: optionalNumber(
      o.whistle_filter_hz_low ?? o.whistleFilterHzLow,
      "calibration.whistle_filter_hz_low",
    ),
    whistleFilterHzHigh: optionalNumber(
      o.whistle_filter_hz_high ?? o.whistleFilterHzHigh,
      "calibration.whistle_filter_hz_high",
    ),
    notes: optionalString(o.notes, "calibration.notes"),
    measuredAt: requireNonEmptyString(o.measured_at ?? o.measuredAt, "calibration.measured_at"),
  };
}

export function mapByodDevice(raw: unknown): ByodDevice {
  const o = requireObj(raw, "byod_device");
  const rawLatest = o.latest_calibration ?? o.latestCalibration;
  return {
    id: requireNonEmptyString(o.id, "device.id"),
    teamId: requireNonEmptyString(o.team_id ?? o.teamId, "device.team_id"),
    registeredByUserId: requireNonEmptyString(
      o.registered_by_user_id ?? o.registeredByUserId,
      "device.registered_by_user_id",
    ),
    deviceLabel: requireNonEmptyString(o.device_label ?? o.deviceLabel, "device.device_label"),
    deviceModel: requireEnum(o.device_model ?? o.deviceModel, VALID_DEVICE_MODELS, "device.device_model"),
    glassType: requireEnum(o.glass_type ?? o.glassType, VALID_GLASS_TYPES, "device.glass_type"),
    pairingStatus: requireEnum(
      o.pairing_status ?? o.pairingStatus,
      VALID_PAIRING_STATUSES,
      "device.pairing_status",
    ),
    effectiveStatus: requireEnum(
      o.effective_status ?? o.effectiveStatus,
      VALID_EFFECTIVE_STATUSES,
      "device.effective_status",
    ),
    pairingAttempts: requireNumber(o.pairing_attempts ?? o.pairingAttempts, "device.pairing_attempts"),
    pairingCodeExpiresAt: optionalString(
      o.pairing_code_expires_at ?? o.pairingCodeExpiresAt,
      "device.pairing_code_expires_at",
    ),
    rtmpsEgressConfigured: requireBoolean(
      o.rtmps_egress_configured ?? o.rtmpsEgressConfigured,
      "device.rtmps_egress_configured",
    ),
    rtmpsKeyHintLast4: optionalString(
      o.rtmps_key_hint_last4 ?? o.rtmpsKeyHintLast4,
      "device.rtmps_key_hint_last4",
    ),
    meshServiceName: optionalString(o.mesh_service_name ?? o.meshServiceName, "device.mesh_service_name"),
    pairedAt: optionalString(o.paired_at ?? o.pairedAt, "device.paired_at"),
    lastSeenAt: optionalString(o.last_seen_at ?? o.lastSeenAt, "device.last_seen_at"),
    revokedAt: optionalString(o.revoked_at ?? o.revokedAt, "device.revoked_at"),
    createdAt: requireNonEmptyString(o.created_at ?? o.createdAt, "device.created_at"),
    updatedAt: requireNonEmptyString(o.updated_at ?? o.updatedAt, "device.updated_at"),
    latestCalibration: rawLatest === undefined || rawLatest === null ? null : mapByodCalibration(rawLatest),
  };
}

export function mapByodDevicePage(raw: unknown): ByodDevicePage {
  const o = requireObj(raw, "byod_device_page");
  if (!Array.isArray(o.items)) {
    throw new Error('Missing or invalid array field "items" on BYOD devices page.');
  }
  return {
    items: o.items.map(mapByodDevice),
    total: requireNumber(o.total, "device_page.total"),
    limit: requireNumber(o.limit, "device_page.limit"),
    offset: requireNumber(o.offset, "device_page.offset"),
  };
}

export function mapByodDeviceCreateResult(raw: unknown): ByodDeviceCreateResult {
  const o = requireObj(raw, "byod_device_create");
  return {
    device: mapByodDevice(o.device),
    pairingCode: optionalString(o.pairing_code ?? o.pairingCode, "create.pairing_code"),
    pairingCodeExpiresAt: optionalString(
      o.pairing_code_expires_at ?? o.pairingCodeExpiresAt,
      "create.pairing_code_expires_at",
    ),
  };
}

export function mapByodDeviceRevokeResult(raw: unknown): ByodDeviceRevokeResult {
  const o = requireObj(raw, "byod_device_revoke");
  return {
    id: requireNonEmptyString(o.id, "revoke.id"),
    pairingStatus: requireEnum(
      o.pairing_status ?? o.pairingStatus,
      new Set<ByodDeviceRevokeResult["pairingStatus"]>(["revoked"]),
      "revoke.pairing_status",
    ),
    revokedAt: requireNonEmptyString(o.revoked_at ?? o.revokedAt, "revoke.revoked_at"),
  };
}

export function mapByodCalibrationPage(raw: unknown): ByodCalibrationPage {
  const o = requireObj(raw, "byod_calibration_page");
  if (!Array.isArray(o.items)) {
    throw new Error('Missing or invalid array field "items" on BYOD calibrations page.');
  }
  return {
    items: o.items.map(mapByodCalibration),
    total: requireNumber(o.total, "calibration_page.total"),
    limit: requireNumber(o.limit, "calibration_page.limit"),
    offset: requireNumber(o.offset, "calibration_page.offset"),
  };
}

const ROUTING_KEYS = new Set(["teamId", "team_id"]);

const BYOD_KEY_TO_SNAKE: Record<string, string> = {
  deviceLabel: "device_label",
  deviceModel: "device_model",
  glassType: "glass_type",
  meshServiceName: "mesh_service_name",
  rtmpsEgressConfigured: "rtmps_egress_configured",
  rtmpsKeyHintLast4: "rtmps_key_hint_last4",
  initiatePairing: "initiate_pairing",
  rotatePairingCode: "rotate_pairing_code",
  calibrationSource: "calibration_source",
  opticalTiltDeg: "optical_tilt_deg",
  opticalHorizonLocked: "optical_horizon_locked",
  mountVacuumKpa: "mount_vacuum_kpa",
  dieTempC: "die_temp_c",
  powerDeliveryWatts: "power_delivery_watts",
  peltierState: "peltier_state",
  acousticSnrDb: "acoustic_snr_db",
  whistleFilterHzLow: "whistle_filter_hz_low",
  whistleFilterHzHigh: "whistle_filter_hz_high",
};

/**
 * Translate known camelCase BYOD request keys into snake_case while preserving unknown keys
 * so hockey-api `extra="forbid"` rejects malformed keys with HTTP 422.
 */
export function toByodUpstreamPayload(rawBody: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawBody)) {
    if (ROUTING_KEYS.has(key)) continue;
    const mappedKey = BYOD_KEY_TO_SNAKE[key] ?? key;
    out[mappedKey] = value;
  }
  return out;
}
