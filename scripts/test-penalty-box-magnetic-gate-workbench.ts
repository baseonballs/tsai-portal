/**
 * test-penalty-box-magnetic-gate-workbench.ts
 * Test Suite: Penalty Box Magnetic Gate Workbench (Sprint 55 / TSAI-PAT-P413)
 * Validates sub-300-line modularity, Zero-Purple invariant, and magnetic gate arbitration tokens.
 */

import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

async function runWorkbenchTests() {
  console.log('=== TRANSCEND PORTAL: PENALTY BOX MAGNETIC GATE WORKBENCH AUDIT (P413) ===\n');

  // Test 1: File existence and line limits (< 300)
  console.log('▶ [1/3] Testing Sub-300-Line Modularity...');
  const compPath = path.resolve(__dirname, '../src/components/penalty/PenaltyBoxMagneticGateWorkbench.tsx');
  assert(fs.existsSync(compPath), 'PenaltyBoxMagneticGateWorkbench.tsx must exist');
  const compLines = fs.readFileSync(compPath, 'utf8').split('\n').length;
  assert(compLines < 300, `PenaltyBoxMagneticGateWorkbench.tsx has ${compLines} lines (must be < 300)`);
  console.log(`  ✔ Modularity confirmed: Component (${compLines} lines < 300).`);

  // Test 2: Zero-Purple Rule
  console.log('\n▶ [2/3] Testing Strict Zero-Purple Rule Compliance (INV-4)...');
  const prohibitedPurpleTokens = ['purple', 'violet', 'indigo', 'fuchsia'];
  const compContent = fs.readFileSync(compPath, 'utf8');
  for (const token of prohibitedPurpleTokens) {
    const regex = new RegExp(`\\b${token}[-\\d]*\\b`, 'i');
    assert(!regex.test(compContent), `Prohibited color token "${token}" found in workbench component`);
  }
  console.log('  ✔ Zero-purple invariant strictly preserved.');

  // Test 3: Required UI Tokens and Penalty Arbitration Labels
  console.log('\n▶ [3/3] Verifying Required Tokens and Arbitration Labels...');
  const requiredTokens = [
    'Patent P413',
    'Penalty Box Magnetic Gate Sync',
    'Penalty Box Magnetic Gate Workbench',
    'Game Clock Elapsed',
    'Hall Sensor Latency',
    'Magnetic Door Interlock & Scoreboard Telemetry',
    'CORROBORATE MAGNETIC GATE SENSORS',
  ];
  for (const token of requiredTokens) {
    assert(compContent.includes(token), `Missing required token "${token}" in PenaltyBoxMagneticGateWorkbench.tsx`);
  }
  console.log('  ✔ Verified Magnetic Gate Sync UI and required tokens.');

  console.log('\n✅ PENALTY BOX MAGNETIC GATE WORKBENCH AUDIT PASSED: 100% INVARIANT COMPLIANT');
}

runWorkbenchTests();
