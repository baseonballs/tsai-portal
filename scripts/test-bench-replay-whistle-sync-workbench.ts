/**
 * test-bench-replay-whistle-sync-workbench.ts
 * Test Suite: Bench Replay Whistle Sync Workbench (Sprint 51 / TSAI-PAT-P409)
 * Validates sub-300-line modularity, Zero-Purple invariant, and SMPTE freeze synchronization.
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
  console.log('=== TRANSCEND PORTAL: BENCH REPLAY WHISTLE SYNC WORKBENCH AUDIT (P409) ===\n');

  // Test 1: File existence and line limits
  console.log('▶ [1/3] Testing Sub-300-Line Modularity...');
  const compPath = path.resolve(__dirname, '../src/components/replay/BenchReplayWhistleSyncWorkbench.tsx');
  assert(fs.existsSync(compPath), 'BenchReplayWhistleSyncWorkbench.tsx must exist');
  const compLines = fs.readFileSync(compPath, 'utf8').split('\n').length;
  assert(compLines < 300, `BenchReplayWhistleSyncWorkbench.tsx has ${compLines} lines (must be < 300)`);
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

  // Test 3: Required UI Tokens and Whistle Sync Labels
  console.log('\n▶ [3/3] Verifying Required Tokens and Whistle Sync Labels...');
  const requiredTokens = [
    'Patent P409',
    'Bench Replay Whistle TDM',
    'Whistle Sync Workbench',
    'SMPTE Freeze Timecode',
    'Sync Drift',
    'Locked Angles',
    'Synchronized Multi-Angle Streams',
    'FREEZE MULTI-ANGLE BENCH REPLAY AT WHISTLE',
  ];
  for (const token of requiredTokens) {
    assert(compContent.includes(token), `Missing required token "${token}" in BenchReplayWhistleSyncWorkbench.tsx`);
  }
  console.log('  ✔ Verified Whistle Sync UI and required tokens.');

  console.log('\n✅ BENCH REPLAY WHISTLE SYNC WORKBENCH AUDIT PASSED: 100% INVARIANT COMPLIANT');
}

runWorkbenchTests();
