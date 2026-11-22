export type ByodDeviceModel =
  | "iphone-16-pro"
  | "iphone-15-pro"
  | "ipad-pro-m4"
  | "custom-rtmps-encoder";

export type ByodGlassType = "tempered" | "acrylic" | "none";

export type ByodPairingStatus =
  | "pending"
  | "operator_registered"
  | "paired"
  | "revoked";

export type ByodEffectiveStatus =
  | "pending"
  | "operator_registered"
  | "paired"
  | "offline"
  | "revoked";

export type ByodCalibrationSource = "device_telemetry" | "manual_check";

export type ByodPeltierState = "off" | "cooling" | "throttled" | "fault";

export interface ByodTeamSummary {
  teamId: string;
  teamName: string;
  season: string | null;
  levelOfPlay: string | null;
  tier: string | null;
  staffRole: string;
}

export interface ByodCalibration {
  id: string;
  deviceId: string;
  teamId: string;
  recordedBySubject: string;
  calibrationSource: ByodCalibrationSource;
  opticalTiltDeg: number | null;
  opticalHorizonLocked: boolean | null;
  mountVacuumKpa: number | null;
  dieTempC: number | null;
  powerDeliveryWatts: number | null;
  peltierState: ByodPeltierState | null;
  acousticSnrDb: number | null;
  whistleFilterHzLow: number | null;
  whistleFilterHzHigh: number | null;
  notes: string | null;
  measuredAt: string;
}

export interface ByodDevice {
  id: string;
  teamId: string;
  registeredByUserId: string;
  deviceLabel: string;
  deviceModel: ByodDeviceModel;
  glassType: ByodGlassType;
  pairingStatus: ByodPairingStatus;
  effectiveStatus: ByodEffectiveStatus;
  pairingAttempts: number;
  pairingCodeExpiresAt: string | null;
  rtmpsEgressConfigured: boolean;
  rtmpsKeyHintLast4: string | null;
  meshServiceName: string | null;
  pairedAt: string | null;
  lastSeenAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
  latestCalibration: ByodCalibration | null;
}

export interface ByodDevicePage {
  items: ByodDevice[];
  total: number;
  limit: number;
  offset: number;
}

export interface ByodDeviceCreateResult {
  device: ByodDevice;
  pairingCode: string | null;
  pairingCodeExpiresAt: string | null;
}

export interface ByodDeviceRevokeResult {
  id: string;
  pairingStatus: "revoked";
  revokedAt: string;
}

export interface ByodCalibrationPage {
  items: ByodCalibration[];
  total: number;
  limit: number;
  offset: number;
}

export interface ByodHardwareProfileSpec {
  id: ByodDeviceModel;
  badge: string;
  title: string;
  subtitle: string;
  capabilityNote: string;
  recommendedGlass: ByodGlassType;
}

export const BYOD_HARDWARE_PROFILES: readonly ByodHardwareProfileSpec[] = [
  {
    id: "iphone-16-pro",
    badge: "RECOMMENDED",
    title: "iPhone 16 Pro / Max",
    subtitle: "A18 Pro · 4K60 ProRes ISP · 940nm dToF LiDAR",
    capabilityNote: "35 TOPS NPU · Optical LiDAR Rig",
    recommendedGlass: "tempered",
  },
  {
    id: "iphone-15-pro",
    badge: "COMPATIBLE",
    title: "iPhone 15 Pro / Max",
    subtitle: "A17 Pro · 4K60 HDR · dToF LiDAR",
    capabilityNote: "35 TOPS NPU · Optical LiDAR Rig",
    recommendedGlass: "tempered",
  },
  {
    id: "ipad-pro-m4",
    badge: "BENCH HUB",
    title: "iPad Pro (M4)",
    subtitle: "M4 Silicon · Dual Studio Display Capture",
    capabilityNote: "38 TOPS NPU · Bench Monitor Rig",
    recommendedGlass: "tempered",
  },
  {
    id: "custom-rtmps-encoder",
    badge: "EXTERNAL RIG",
    title: "Custom RTMPS Hardware Encoder",
    subtitle: "Dedicated H.264/HEVC Encoder · Local RTMPS Push",
    capabilityNote: "Rafter / Tripod / Rink-Beam Rig",
    recommendedGlass: "none",
  },
];

export interface ByodGlassOptionSpec {
  id: ByodGlassType;
  label: string;
  guidance: string;
}

export const BYOD_GLASS_OPTIONS: readonly ByodGlassOptionSpec[] = [
  {
    id: "tempered",
    label: "12.7mm Tempered Glass",
    guidance: "Optimal high-transparency tempered glass. Use an anti-glare polarizing filter.",
  },
  {
    id: "acrylic",
    label: "15.8mm Acrylic Polycarb",
    guidance: "Flexible acrylic boards need vibration damping and periodic suction re-checks.",
  },
  {
    id: "none",
    label: "No Glass (Rafter / Custom Rig)",
    guidance: "Overhead truss, tripod, or custom encoder mount with no dasher glass barrier.",
  },
];

export const BYOD_PELTIER_STATES: readonly ByodPeltierState[] = [
  "off",
  "cooling",
  "throttled",
  "fault",
];
