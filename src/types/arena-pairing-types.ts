/**
 * Turnkey Arena Hardware Edge Appliance & Rig Pairing Types
 * Patent Docket: Track 16 (TSAI-PATENT-VISION-01, Docket P229) & Track 15
 * Strict SI dimensional units: meters (m), seconds (s), bytes (B), Celsius (°C), dBm.
 */

export type PairingStep =
  | 'DISCOVERY'
  | 'SHEET_ASSIGNMENT'
  | 'CALIBRATION_CHECK'
  | 'STORAGE_VERIFICATION'
  | 'CONFIRMATION';

export interface DiscoveredPodDevice {
  podId: string;
  label: string;
  ipAddress: string;
  rssiDbM: number;
  firmwareVersion: string;
  lensTemperatureCelsius: number;
  isCalibrated: boolean;
  calibrationReprojectionErrorPx: number;
  nvmeTotalBytes: number;
  nvmeFreeBytes: number;
}

export interface ArenaPairingState {
  venueId: string;
  venueName: string;
  selectedSheetId: string;
  selectedPodIds: string[];
  currentStep: PairingStep;
  pairingCompleted: boolean;
}

export const INITIAL_DISCOVERED_PODS: DiscoveredPodDevice[] = [
  {
    podId: 'POD-A-CENTER',
    label: 'Center-Ice Stereo Pod A (Primary)',
    ipAddress: '192.168.10.101',
    rssiDbM: -42.0,
    firmwareVersion: 'v2.4.12',
    lensTemperatureCelsius: 38.5,
    isCalibrated: true,
    calibrationReprojectionErrorPx: 0.34,
    nvmeTotalBytes: 1000 * 1000 * 1000 * 1000, // 1 TB
    nvmeFreeBytes: 740 * 1000 * 1000 * 1000,
  },
  {
    podId: 'POD-B-ENDZONE',
    label: 'North Endzone High-Angle Pod B',
    ipAddress: '192.168.10.102',
    rssiDbM: -55.0,
    firmwareVersion: 'v2.4.12',
    lensTemperatureCelsius: 36.2,
    isCalibrated: true,
    calibrationReprojectionErrorPx: 0.41,
    nvmeTotalBytes: 1000 * 1000 * 1000 * 1000,
    nvmeFreeBytes: 810 * 1000 * 1000 * 1000,
  },
  {
    podId: 'POD-C-BENCH',
    label: 'Bench & Penalty Box Tactical Pod C',
    ipAddress: '192.168.10.103',
    rssiDbM: -68.0,
    firmwareVersion: 'v2.4.11',
    lensTemperatureCelsius: 41.0,
    isCalibrated: false,
    calibrationReprojectionErrorPx: 1.85,
    nvmeTotalBytes: 500 * 1000 * 1000 * 1000,
    nvmeFreeBytes: 390 * 1000 * 1000 * 1000,
  },
];
