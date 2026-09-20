/**
 * Multi-Sheet Cross-Rink Acoustic Shield Workbench Types
 * Docket: TSAI-PAT-P402
 * Strict SI dimensional units: m, s, Hz, dB, Pa
 */

export interface SheetAcousticChannel {
  sheetId: string;
  sheetName: string;
  localRmsPa: number;
  shieldedRmsPa: number;
  peakFrequencyHz: number;
  attenuationDb: number;
  isPhaseCancellationActive: boolean;
  bleedDetected: boolean;
  bleedSourceSheetName?: string;
  sourceDistanceMeters?: number;
}

export interface ShieldTelemetrySummary {
  venueId: string;
  activeSheetsCount: number;
  averageAttenuationDb: number;
  totalBleedEventsSuppressed: number;
  isSystemShieldEngaged: boolean;
}

export const INITIAL_SHEET_CHANNELS: SheetAcousticChannel[] = [
  {
    sheetId: 'sheet_rink_1',
    sheetName: 'Rink 1 (Main Arena)',
    localRmsPa: 1.45,
    shieldedRmsPa: 0.046,
    peakFrequencyHz: 2850,
    attenuationDb: -30.0,
    isPhaseCancellationActive: true,
    bleedDetected: true,
    bleedSourceSheetName: 'Rink 2 (Olympic)',
    sourceDistanceMeters: 45.2,
  },
  {
    sheetId: 'sheet_rink_2',
    sheetName: 'Rink 2 (Olympic)',
    localRmsPa: 0.85,
    shieldedRmsPa: 0.85,
    peakFrequencyHz: 1200,
    attenuationDb: 0.0,
    isPhaseCancellationActive: false,
    bleedDetected: false,
  },
  {
    sheetId: 'sheet_rink_3',
    sheetName: 'Rink 3 (Training)',
    localRmsPa: 0.92,
    shieldedRmsPa: 0.031,
    peakFrequencyHz: 820,
    attenuationDb: -29.4,
    isPhaseCancellationActive: true,
    bleedDetected: true,
    bleedSourceSheetName: 'Rink 1 (Main Arena)',
    sourceDistanceMeters: 62.0,
  },
];
