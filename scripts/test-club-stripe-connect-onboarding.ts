/**
 * Test Suite: Club Stripe Connect 50/50 Revenue Share Onboarding (Horizon D)
 * Validates sub-300-line modularity, Zero-Purple invariant, and 50/50 financial revenue split math.
 */

import fs from 'fs';
import path from 'path';
import {
  DEFAULT_CLUB_STRIPE_PROFILE,
} from '../src/types/club-stripe-connect-types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

async function runStripeOnboardingTests() {
  console.log('=== TRANSCEND PORTAL: CLUB STRIPE CONNECT ONBOARDING AUDIT (HORIZON D) ===\n');

  // Test 1: 50/50 Revenue Share Ratio & Invariants
  console.log('▶ [1/4] Verifying 50/50 Revenue Share Invariant...');
  assert(DEFAULT_CLUB_STRIPE_PROFILE.revenueShareRatio === 0.50, 'Club revenue share ratio must be exactly 50% (0.50)');
  const gross = DEFAULT_CLUB_STRIPE_PROFILE.estimatedEnrolledFamilies * DEFAULT_CLUB_STRIPE_PROFILE.monthlyPerFamilyFeeUsd;
  const clubShare = gross * DEFAULT_CLUB_STRIPE_PROFILE.revenueShareRatio;
  assert(gross === 5250.0, `Expected gross $5250, got $${gross}`);
  assert(clubShare === 2625.0, `Expected club share $2625, got $${clubShare}`);
  console.log(`  ✔ Verified financial invariant: Gross $${gross}/mo -> Club Cut $${clubShare}/mo.`);

  // Test 2: Sub-300-line Modularity
  console.log('\n▶ [2/4] Testing Sub-300-Line Modularity...');
  const compPath = path.resolve(__dirname, '../src/components/commercial/ClubStripeConnectOnboarding.tsx');
  const typesPath = path.resolve(__dirname, '../src/types/club-stripe-connect-types.ts');
  const compLines = fs.readFileSync(compPath, 'utf8').split('\n').length;
  const typesLines = fs.readFileSync(typesPath, 'utf8').split('\n').length;

  assert(compLines < 300, `ClubStripeConnectOnboarding.tsx has ${compLines} lines (must be < 300)`);
  assert(typesLines < 300, `club-stripe-connect-types.ts has ${typesLines} lines (must be < 300)`);
  console.log(`  ✔ Modularity confirmed: Component (${compLines} lines), Types (${typesLines} lines).`);

  // Test 3: Zero-Purple Rule
  console.log('\n▶ [3/4] Testing Strict Zero-Purple Rule Compliance (INV-4)...');
  const prohibitedPurpleTokens = ['purple', 'violet', 'indigo', 'fuchsia'];
  const compContent = fs.readFileSync(compPath, 'utf8');
  for (const token of prohibitedPurpleTokens) {
    const regex = new RegExp(`\\b${token}[-\\d]*\\b`, 'i');
    assert(!regex.test(compContent), `Prohibited color token "${token}" found in stripe onboarding component`);
  }
  console.log('  ✔ Zero-purple invariant strictly preserved.');

  // Test 4: KYC Status
  console.log('\n▶ [4/4] Verifying KYC Status Transition Models...');
  assert(DEFAULT_CLUB_STRIPE_PROFILE.kycStatus === 'VERIFIED', 'Default club profile should have verified KYC');
  assert(!!DEFAULT_CLUB_STRIPE_PROFILE.stripeConnectAccountId, 'Stripe Connect Account ID must be defined');
  console.log('  ✔ Stripe Connect account identifiers verified.');

  console.log('\n✅ CLUB STRIPE CONNECT ONBOARDING AUDIT PASSED: 100% INVARIANT COMPLIANT');
}

runStripeOnboardingTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
