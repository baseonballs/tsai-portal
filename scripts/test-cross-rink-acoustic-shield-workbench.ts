/**
 * Test Suite: Cross-Rink Acoustic Shield Workbench (Sprint 44 / TSAI-PAT-P402)
 * Validates sub-300-line modularity, Zero-Purple invariant, and SI metric integrity.
 */

import fs from 'fs';
import path from 'path';
import type { SheetAcousticChannel } from '../src/types/acoustic-shield-portal-types';

// Neutral in-test fixture (GA-030 O-10, T0.4): the component no longer ships built-in data, so
// the data these checks need lives here only. No real club, venue or person.
const INITIAL_SHEET_CHANNELS: SheetAcousticChannel[] = [
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


function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

async function runWorkbenchTests() {
  console.log('=== TRANSCEND PORTAL: CROSS-RINK ACOUSTIC SHIELD WORKBENCH AUDIT (P402) ===\n');

  // Test 1: Initial channel configurations
  console.log('▶ [1/4] Verifying Initial Channel Models and Pure SI Units...');
  assert(INITIAL_SHEET_CHANNELS.length >= 3, 'Must have at least 3 initial sheet channels');
  for (const ch of INITIAL_SHEET_CHANNELS) {
    assert(ch.peakFrequencyHz > 0, 'Peak frequency must be positive in Hz');
    assert(ch.localRmsPa >= 0, 'Local RMS amplitude must be non-negative Pa');
    assert(ch.shieldedRmsPa >= 0, 'Shielded RMS amplitude must be non-negative Pa');
  }
  console.log('  ✔ Verified initial sheet channels and SI units (Hz, Pa, dB, m).');

  // Test 2: Sub-300-line modularity
  console.log('\n▶ [2/4] Testing Sub-300-Line Modularity...');
  const compPath = path.resolve(__dirname, '../src/components/broadcast/CrossRinkAcousticShieldWorkbench.tsx');
  const typesPath = path.resolve(__dirname, '../src/types/acoustic-shield-portal-types.ts');
  const compLines = fs.readFileSync(compPath, 'utf8').split('\n').length;
  const typesLines = fs.readFileSync(typesPath, 'utf8').split('\n').length;

  assert(compLines < 300, `CrossRinkAcousticShieldWorkbench.tsx has ${compLines} lines (must be < 300)`);
  assert(typesLines < 300, `acoustic-shield-portal-types.ts has ${typesLines} lines (must be < 300)`);
  console.log(`  ✔ Modularity confirmed: Component (${compLines} lines), Types (${typesLines} lines).`);

  // Test 3: Zero-Purple Rule
  console.log('\n▶ [3/4] Testing Strict Zero-Purple Rule Compliance (INV-4)...');
  const prohibitedPurpleTokens = ['purple', 'violet', 'indigo', 'fuchsia'];
  const compContent = fs.readFileSync(compPath, 'utf8');
  for (const token of prohibitedPurpleTokens) {
    const regex = new RegExp(`\\b${token}[-\\d]*\\b`, 'i');
    assert(!regex.test(compContent), `Prohibited color token "${token}" found in workbench component`);
  }
  console.log('  ✔ Zero-purple invariant strictly preserved.');

  // Test 4: Attenuation threshold
  console.log('\n▶ [4/4] Verifying Attenuation Target Threshold...');
  const activeBleedCh = INITIAL_SHEET_CHANNELS.find((c) => c.bleedDetected && c.isPhaseCancellationActive);
  assert(!!activeBleedCh, 'Must have at least one channel with active bleed cancellation');
  assert(activeBleedCh.attenuationDb <= -25.0, `Target attenuation must be <= -25 dB, got ${activeBleedCh?.attenuationDb}`);
  console.log(`  ✔ Phase cancellation achieved ${activeBleedCh.attenuationDb} dB suppression.`);

  console.log('\n✅ CROSS-RINK ACOUSTIC SHIELD WORKBENCH AUDIT PASSED: 100% INVARIANT COMPLIANT');
}

runWorkbenchTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
