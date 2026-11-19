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

