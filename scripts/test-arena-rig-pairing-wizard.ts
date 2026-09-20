/**
 * Test Suite: Turnkey Arena Rig Pairing Wizard (Horizon C)
 * Validates sub-300-line modularity, Zero-Purple invariant, and SI metric integrity.
 */

import fs from 'fs';
import path from 'path';
import {
  INITIAL_DISCOVERED_PODS,
} from '../src/types/arena-pairing-types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

async function runWizardTests() {
  console.log('=== TRANSCEND PORTAL: ARENA RIG PAIRING WIZARD AUDIT ===\n');

  // Test 1: Initial Pod Devices & SI Units
  console.log('▶ [1/4] Verifying Discovered Pod Devices and Pure SI Units...');
  assert(INITIAL_DISCOVERED_PODS.length >= 3, 'Must discover at least 3 initial pod devices');
  for (const pod of INITIAL_DISCOVERED_PODS) {
    assert(pod.nvmeTotalBytes > 0, 'NVMe capacity must be positive bytes');
    assert(pod.nvmeFreeBytes <= pod.nvmeTotalBytes, 'Free space cannot exceed total capacity');
    assert(pod.lensTemperatureCelsius > 0 && pod.lensTemperatureCelsius < 80, 'Lens temp within operating bounds');
    assert(pod.calibrationReprojectionErrorPx >= 0, 'Reprojection error must be non-negative');
  }
  console.log('  ✔ Verified discovered pod devices and SI units (bytes, °C, px, dBm).');

  // Test 2: Sub-300-line modularity
  console.log('\n▶ [2/4] Testing Sub-300-Line Modularity...');
  const compPath = path.resolve(__dirname, '../src/components/onboarding/ArenaRigPairingWizard.tsx');
  const typesPath = path.resolve(__dirname, '../src/types/arena-pairing-types.ts');
  const compLines = fs.readFileSync(compPath, 'utf8').split('\n').length;
  const typesLines = fs.readFileSync(typesPath, 'utf8').split('\n').length;

  assert(compLines < 300, `ArenaRigPairingWizard.tsx has ${compLines} lines (must be < 300)`);
  assert(typesLines < 300, `arena-pairing-types.ts has ${typesLines} lines (must be < 300)`);
  console.log(`  ✔ Modularity confirmed: Component (${compLines} lines), Types (${typesLines} lines).`);

  // Test 3: Zero-Purple Rule
  console.log('\n▶ [3/4] Testing Strict Zero-Purple Rule Compliance (INV-4)...');
  const prohibitedPurpleTokens = ['purple', 'violet', 'indigo', 'fuchsia'];
  const compContent = fs.readFileSync(compPath, 'utf8');
  for (const token of prohibitedPurpleTokens) {
    const regex = new RegExp(`\\b${token}[-\\d]*\\b`, 'i');
    assert(!regex.test(compContent), `Prohibited color token "${token}" found in pairing wizard`);
  }
  console.log('  ✔ Zero-purple invariant strictly preserved.');

  // Test 4: Calibration Thresholds
  console.log('\n▶ [4/4] Verifying Pod Calibration Reprojection Error Thresholds...');
  const calibratedPods = INITIAL_DISCOVERED_PODS.filter((p) => p.isCalibrated);
  assert(calibratedPods.length >= 2, 'Must have at least 2 calibrated pods in stereo rig');
  for (const p of calibratedPods) {
    assert(p.calibrationReprojectionErrorPx < 0.50, 'Calibrated pod error must be < 0.50 px');
  }
  console.log('  ✔ Calibration bounds verified.');

  console.log('\n✅ ARENA RIG PAIRING WIZARD AUDIT PASSED: 100% INVARIANT COMPLIANT');
}

runWizardTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
