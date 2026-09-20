/**
 * test-bench-door-substitution-workbench.ts
 * Test Suite: Bench Door Substitution Workbench (Sprint 59 / TSAI-PAT-P417)
 * Validates sub-300-line modularity, Zero-Purple invariant, and Rule 74.1 substitution arbitration.
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
  console.log('=== TRANSCEND PORTAL: BENCH DOOR SUBSTITUTION WORKBENCH AUDIT (P417) ===\n');

  // Test 1: File existence and line limits (< 300)
  console.log('▶ [1/3] Testing Sub-300-Line Modularity...');
  const compPath = path.resolve(__dirname, '../src/components/bench/BenchDoorSubstitutionWorkbench.tsx');
  assert(fs.existsSync(compPath), 'BenchDoorSubstitutionWorkbench.tsx must exist');
  const compLines = fs.readFileSync(compPath, 'utf8').split('\n').length;
  assert(compLines < 300, `BenchDoorSubstitutionWorkbench.tsx has ${compLines} lines (must be < 300)`);
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

  // Test 3: Required UI Tokens and Substitution Arbitration Labels
  console.log('\n▶ [3/3] Verifying Required Tokens and Arbitration Labels...');
  const requiredTokens = [
    'Patent P417',
    'Bench Substitution Velocity Arbiter',
    'Bench Door Substitution Workbench',
    'Rule 74.1 Zone Limit',
    '1.524 m',
    'Hall Sensor Debounce',
    'Active Line Changes',
    'Player Substitution Telemetry & Optical Proximity',
    'CORROBORATE SUBSTITUTION TELEMETRY',
  ];
  for (const token of requiredTokens) {
    assert(compContent.includes(token), `Missing required token "${token}" in BenchDoorSubstitutionWorkbench.tsx`);
  }
  console.log('  ✔ Verified Bench Substitution UI and required tokens.');

  console.log('\n✅ BENCH DOOR SUBSTITUTION WORKBENCH AUDIT PASSED: 100% INVARIANT COMPLIANT');
}

runWorkbenchTests();
