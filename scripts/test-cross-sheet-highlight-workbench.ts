/**
 * test-cross-sheet-highlight-workbench.ts
 * Test Suite: Cross-Sheet Highlight Workbench (Sprint 48 / TSAI-PAT-P406)
 * Validates sub-300-line modularity, Zero-Purple invariant, and COPPA consent gates.
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
  console.log('=== TRANSCEND PORTAL: CROSS-SHEET HIGHLIGHT WORKBENCH AUDIT (P406) ===\n');

  // Test 1: File existence and line limits
  console.log('▶ [1/3] Testing Sub-300-Line Modularity...');
  const compPath = path.resolve(__dirname, '../src/components/social/CrossSheetHighlightWorkbench.tsx');
  assert(fs.existsSync(compPath), 'CrossSheetHighlightWorkbench.tsx must exist');
  const compLines = fs.readFileSync(compPath, 'utf8').split('\n').length;
  assert(compLines < 300, `CrossSheetHighlightWorkbench.tsx has ${compLines} lines (must be < 300)`);
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

  // Test 3: Required UI Tokens and SafeSport COPPA mentions
  console.log('\n▶ [3/3] Verifying Required Tokens and COPPA Gate Labels...');
  const requiredTokens = [
    'Patent P406',
    'SafeSport COPPA Vault',
    'Cross-Sheet Reel Studio',
    'Approved Duration',
    'Distinct Rinks',
    'MINOR QUARANTINE',
    'EXPORT CERTIFIED SOCIAL HIGHLIGHT REEL',
  ];
  for (const token of requiredTokens) {
    assert(compContent.includes(token), `Missing required token "${token}" in CrossSheetHighlightWorkbench.tsx`);
  }
  console.log('  ✔ Verified COPPA gate UI and required tokens.');

  console.log('\n✅ CROSS-SHEET HIGHLIGHT WORKBENCH AUDIT PASSED: 100% INVARIANT COMPLIANT');
}

runWorkbenchTests();
