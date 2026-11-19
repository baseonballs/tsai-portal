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

