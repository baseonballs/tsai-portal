/**
 * Verification Script: Live Bracket Ingestion & Match Highlight Slicer UI
 *
 * Validates:
 * 1. Initial tournament bracket configuration.
 * 2. Clock formatting helper (regular and overtime periods).
 * 3. Platform Invariant 6 adherence (physical metrics).
 * 4. Sub-300-line modularity compliance.
 * 5. Strict Zero-Purple Tailwind design rule compliance.
 */

import fs from 'fs';
import path from 'path';
import {
  INITIAL_PORTAL_MATCHES,
  formatMatchClock,
  PortalTournamentMatch,
} from '../src/components/tournaments/bracket-highlight-slicer-types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

async function runBracketHighlightSlicerTests() {
  console.log('=================================================');
  console.log('🏆 [Portal Test] Live Bracket & Highlight Slicer UI');
  console.log('=================================================\n');

  // Test 1: Initial Bracket Matches
  console.log('▶ [1/5] Verifying Initial Tournament Matches Configuration...');
  assert(INITIAL_PORTAL_MATCHES.length >= 2, 'Must have at least 2 tournament matches');
  const qf1 = INITIAL_PORTAL_MATCHES[0];
  assert(qf1.matchId === 'match-qf-1', 'First match is QF1');
  assert(qf1.status === 'COMPLETED', 'QF1 is completed');
  assert(qf1.homeTeam.score === 4, 'North Stars score 4');
  assert(qf1.awayTeam.score === 3, 'South Blades score 3');
  assert(qf1.highlightClips.length === 2, 'QF1 has 2 sliced highlight clips');
  console.log('  ✔ Verified tournament matches, scores, and sliced highlight clips.\n');

  // Test 2: Time and Clock Formatter
  console.log('▶ [2/5] Testing Clock & Period Formatter...');
  assert(formatMatchClock(1, 1200) === 'P1 20:00', 'Period 1 1200s');
  assert(formatMatchClock(3, 45) === 'P3 0:45', 'Period 3 45s');
  assert(formatMatchClock(4, 300) === 'OT1 5:00', 'Overtime 1 300s');
  assert(formatMatchClock(5, 120) === 'OT2 2:00', 'Overtime 2 120s');
  console.log('  ✔ Match clock formatting verified across regulation and overtime periods.\n');

  // Test 3: Platform Invariant 6 Adherence
  console.log('▶ [3/5] Auditing Platform Invariant 6 Physical Contracts...');
  qf1.highlightClips.forEach((clip) => {
    assert(typeof clip.durationSeconds === 'number', 'Duration is physical seconds');
    assert(typeof clip.gameClockSeconds === 'number', 'Game clock is physical seconds');
    assert(clip.durationSeconds > 0, 'Duration is positive');
  });
  console.log('  ✔ All clips use physical seconds without synthetic ratings.\n');

  // Test 4: Sub-300-Line Modularity
  console.log('▶ [4/5] Checking Sub-300-Line Modularity...');
  const componentPath = path.resolve(__dirname, '../src/components/tournaments/LiveBracketHighlightSlicer.tsx');
  const fileContent = fs.readFileSync(componentPath, 'utf8');
  const lines = fileContent.split('\n').length;
  assert(lines <= 300, `LiveBracketHighlightSlicer.tsx has ${lines} lines (must be <= 300)`);
  console.log(`  ✔ Modularity check passed: ${lines} lines <= 300.\n`);

  // Test 5: Strict Zero-Purple Compliance
  console.log('▶ [5/5] Auditing Zero-Purple Tailwind Design Rule...');
  const nonCommentLines = fileContent
    .split('\n')
    .filter((line) => !line.trim().startsWith('*') && !line.trim().startsWith('//'))
    .join('\n');
  const forbiddenPatterns = [/purple/i, /indigo/i, /violet/i];
  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(nonCommentLines), `Found forbidden color pattern: ${pattern}`);
  }
  console.log('  ✔ Zero-Purple audit clean: strictly zero purple/indigo/violet tokens.\n');

  console.log('=================================================');
  console.log('🎉 ALL 5 PORTAL BRACKET HIGHLIGHT SLICER TESTS PASSED!');
  console.log('=================================================\n');
}

runBracketHighlightSlicerTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
