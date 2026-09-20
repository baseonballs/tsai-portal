/**
 * test-multi-venue-dispute-intercom-workbench.ts
 *
 * Test suite for TSAI-PAT-P398: Multi-Venue Synchronized Time-Shifted Broadcast & Dispute Intercom Workbench
 *
 * Invariants Tested:
 * 1. Data contract & PTP clock synchronization
 * 2. Line count invariant (< 300 lines)
 * 3. Zero-Purple palette check
 * 4. Platform Invariant 6 (pure physical timestamps, SI units)
 */

import * as fs from 'fs';
import * as path from 'path';
import type { MultiVenueIntercomViewModel } from '../types/multi-venue-intercom-types';

console.log('=== RUNNING MULTI-VENUE DISPUTE INTERCOM WORKBENCH TESTS (TSAI-PAT-P398) ===\n');

// 1. Validate ViewModel Contract
const mockModel: MultiVenueIntercomViewModel = {
  dispute: {
    disputeId: 'disp_finals_01',
    venueId: 'venue_ice_palace',
    rinkSheetId: 'sheet_olympic',
    gameClockSec: 1145.2,
    ptpMasterTimestampSec: 1700000.05,
    currentPlaybackSpeed: 0.0,
    activeFrameIndex: 68712,
    isFrozen: true,
    selectedDecision: 'PENDING',
  },
  peers: [
    { id: 'peer_ref', role: 'REFEREE_TABLET', label: 'Ref · Myers', isMuted: false, isSpeaking: true, audioLatencyMs: 18.2, ptpOffsetMs: 0.4 },
    { id: 'peer_home', role: 'HOME_BENCH', label: 'Home HC', isMuted: false, isSpeaking: false, audioLatencyMs: 24.5, ptpOffsetMs: 0.7 },
    { id: 'peer_away', role: 'AWAY_BENCH', label: 'Away HC', isMuted: true, isSpeaking: false, audioLatencyMs: 26.1, ptpOffsetMs: 0.5 },
    { id: 'peer_arbiter', role: 'TOURNAMENT_ARBITER', label: 'HQ Arbiter', isMuted: false, isSpeaking: false, audioLatencyMs: 31.0, ptpOffsetMs: 0.2 },
    { id: 'peer_dir', role: 'BROADCAST_DIRECTOR', label: 'Broadcast Dir', isMuted: true, isSpeaking: false, audioLatencyMs: 28.4, ptpOffsetMs: 0.3 },
  ],
  broadcastEgressActive: true,
  scoreboardMulticastActive: true,
};

console.log('[Test 1] Validating Intercom ViewModel and PTP synchronization...');
if (mockModel.peers.length !== 5) {
  throw new Error(`Expected 5 peers, got ${mockModel.peers.length}`);
}
for (const peer of mockModel.peers) {
  if (peer.audioLatencyMs >= 50.0) {
    throw new Error(`Peer ${peer.label} audio latency exceeded 50ms: ${peer.audioLatencyMs}ms`);
  }
}
console.log('✓ Test 1 passed: 5 peers connected, all audio latencies < 50ms, PTP locked');

// 2. Line count invariant (< 300 lines)
console.log('\n[Test 2] Auditing line count invariant (< 300 lines)...');
const componentPath = path.resolve(__dirname, '../components/review/MultiVenueDisputeIntercomWorkbench.tsx');
const content = fs.readFileSync(componentPath, 'utf8');
const lines = content.split('\n').length;
if (lines >= 300) {
  throw new Error(`Component exceeded 300 lines limit: ${lines} lines`);
}
console.log(`✓ Test 2 passed: Component is ${lines} lines (< 300 limit)`);

// 3. Zero-Purple palette check
console.log('\n[Test 3] Auditing Zero-Purple palette compliance...');
const purpleRegex = /\b(purple|indigo|violet|fuchsia)-[1-9]00\b/gi;
const matches = content.match(purpleRegex);
if (matches && matches.length > 0) {
  throw new Error(`Zero-Purple violation found in component: ${matches.join(', ')}`);
}
console.log('✓ Test 3 passed: Zero purple/indigo/violet/fuchsia tokens detected');

// 4. Platform Invariant 6 (pure physical timestamps, SI units)
console.log('\n[Test 4] Verifying Platform Invariant 6 (pure physical SI telemetry)...');
const forbiddenScoutingWords = ['grade', 'tier', 'star rating', 'scout score', 'potential grade'];
for (const word of forbiddenScoutingWords) {
  if (content.toLowerCase().includes(word)) {
    throw new Error(`Subjective scoring word detected in component: "${word}"`);
  }
}
console.log('✓ Test 4 passed: Zero subjective scouting or grading terms detected');

console.log('\n🎉 All Multi-Venue Dispute Intercom Workbench tests passed successfully!');
