/**
 * Verification Script: Multi-Sheet Broadcast Cloud Switcher & Live Instant Replay
 *
 * Validates:
 * 1. Initial 4-sheet channels configuration & 60 FPS / bitrate telemetry.
 * 2. Time formatting helper.
 * 3. Platform Invariant 6 adherence (pure physical metrics).
 * 4. Sub-300-line modularity compliance.
 * 5. Strict Zero-Purple Tailwind design rule compliance.
 */

import fs from 'fs';
import path from 'path';
import {
  INITIAL_CHANNELS,
  formatStreamTime,
  PortalSheetChannel,
} from '../src/components/broadcast/broadcast-cloud-switcher-types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

async function runBroadcastCloudSwitcherTests() {
  console.log('=================================================');
  console.log('📡 [Portal Test] Multi-Sheet Broadcast Cloud Switcher UI');
  console.log('=================================================\n');

  // Test 1: Initial Channels Verification
  console.log('▶ [1/5] Testing Initial Sheet Broadcast Channels...');
  assert(INITIAL_CHANNELS.length >= 4, 'Must configure at least 4 active sheets.');
  for (const ch of INITIAL_CHANNELS) {
    assert(ch.fps === 60.0, 'Frame rate must be 60.0 FPS.');
    assert(ch.bitrateKbps >= 4000, 'Bitrate must be >= 4000 kbps.');
    assert(ch.isLive === true, 'Channels must be marked LIVE.');
  }
  console.log(`  ✔ Verified ${INITIAL_CHANNELS.length} initial channels running at 60 FPS.`);

  // Test 2: Temporal Formatter
  console.log('\n▶ [2/5] Testing Stream Time Formatter...');
  assert(formatStreamTime(65) === '01:05', '65 seconds should format as 01:05.');
  assert(formatStreamTime(1420) === '23:40', '1420 seconds should format as 23:40.');
  console.log('  ✔ Stream uptime formatting verified.');

  // Test 3: Sub-300-line Modularity Rule
  console.log('\n▶ [3/5] Testing Sub-300-Line Modularity...');
  const componentPath = path.resolve(__dirname, '../src/components/broadcast/MultiSheetCloudSwitcher.tsx');
  const typesPath = path.resolve(__dirname, '../src/components/broadcast/broadcast-cloud-switcher-types.ts');
  const componentLines = fs.readFileSync(componentPath, 'utf8').split('\n').length;
  const typesLines = fs.readFileSync(typesPath, 'utf8').split('\n').length;

  assert(componentLines < 300, `MultiSheetCloudSwitcher.tsx has ${componentLines} lines (must be < 300).`);
  assert(typesLines < 300, `broadcast-cloud-switcher-types.ts has ${typesLines} lines (must be < 300).`);
  console.log(`  ✔ Modularity confirmed: Component (${componentLines} lines), Types (${typesLines} lines).`);

  // Test 4: Strict Zero-Purple Tailwind Design Rule
  console.log('\n▶ [4/5] Testing Strict Zero-Purple Rule Compliance...');
  const forbiddenTokens = ['purple-', 'indigo-', 'violet-', '#8B5CF6', '#6366F1', '#7C3AED'];
  const componentContent = fs.readFileSync(componentPath, 'utf8');

  for (const token of forbiddenTokens) {
    assert(!componentContent.includes(token), `Forbidden token '${token}' found in MultiSheetCloudSwitcher.tsx.`);
  }
  console.log('  ✔ Zero-Purple verified (0 purple, indigo, or violet tokens found).');

  // Test 5: Platform Invariant 6 Physical Contracts
  console.log('\n▶ [5/5] Testing Platform Invariant 6 (Physical Units)...');
  for (const ch of INITIAL_CHANNELS) {
    assert(typeof ch.bitrateKbps === 'number', 'Bitrate must be numerical kbps.');
    assert(typeof ch.fps === 'number', 'FPS must be numerical.');
    assert(typeof ch.streamUptimeSeconds === 'number', 'Uptime must be numerical seconds.');
  }
  console.log('  ✔ Platform Invariant 6 physical metrics verified.');

  console.log('\n=================================================');
  console.log('🎉 ALL 5 PORTAL CLOUD SWITCHER TESTS PASSED!');
  console.log('=================================================');
}

runBroadcastCloudSwitcherTests();
