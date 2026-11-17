/**
 * test-club-monetization.ts
 * TsaiPortal / Commercial Verification Script
 *
 * Author / Inventor: Jeffrey T. Lucas
 * Assignee: Transcendental Sports AI LLC
 * Commercial Strategy: Option D - Club Director Commercial Self-Service & 50% Net Rev Share
 *
 * Run: npx tsx scripts/test-club-monetization.ts
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  calculateClubRevenue,
  TURNKEY_ARENA_RIG_BOM,
  HARDWARE_RIG_KIT_PRICE_CENTS,
} from "../src/lib/commercial/club-revenue-calculator";

async function runClubMonetizationTests() {
  console.log("─────────────────────────────────────────────────────────────────");
  console.log("💼 [Portal Test] Club Monetization, Rev Share & Hardware Checkout");
  console.log("Option D: Disruptive 50% Net Partner Club Streaming Distribution");
  console.log("─────────────────────────────────────────────────────────────────\n");

  // TEST PILLAR 1: Club Revenue Calculator & 50% Net Split Modeling
  console.log("1. Testing Club Revenue Split Calculation (50% Net Pool)...");
  const rev350 = calculateClubRevenue({ subscribersCount: 350 });
  assert.equal(rev350.subscribersCount, 350);
  assert.equal(rev350.grossRevenueMonthlyDollars, 3496.50);
  assert.equal(rev350.grossRevenueAnnualDollars, 41958.00);
  assert.equal(rev350.stripeFeesMonthlyDollars, 206.50);
  assert.equal(rev350.cdnHostingMonthlyDollars, 70.00);
  assert.equal(rev350.netRevenueMonthlyDollars, 3220.00);
  assert.equal(rev350.clubPayoutMonthlyDollars, 1610.00);
  assert.equal(rev350.clubPayoutAnnualDollars, 19320.00);
  assert.equal(rev350.platformShareMonthlyDollars, 1610.00);
  assert.equal(rev350.effectiveClubSharePercentage, 46.0); // 1610 / 3496.50 = 46.0% of gross
  console.log("   ✓ 350 subscribers @ $9.99/mo yields exactly $1,610.00/mo ($19,320/yr) club direct deposit");

  // Zero subscribers boundary condition
  const rev0 = calculateClubRevenue({ subscribersCount: 0 });
  assert.equal(rev0.grossRevenueMonthlyDollars, 0);
  assert.equal(rev0.clubPayoutMonthlyDollars, 0);
  assert.equal(rev0.clubPayoutAnnualDollars, 0);
  console.log("   ✓ Zero subscribers returns $0 without divide-by-zero errors");

  // Large 8-sheet complex modeling (1,200 subscribers)
  const rev1200 = calculateClubRevenue({ subscribersCount: 1200 });
  assert.equal(rev1200.grossRevenueMonthlyDollars, 11988.00);
  assert.equal(rev1200.clubPayoutMonthlyDollars, 5520.00);
  assert.equal(rev1200.clubPayoutAnnualDollars, 66240.00);
  console.log("   ✓ 1,200 subscribers (8-sheet facility) yields $5,520.00/mo ($66,240/yr) club revenue");

  // TEST PILLAR 2: Turnkey Arena Hardware Rig Kit BOM Itemization ($78.99)
  console.log("\n2. Validating Turnkey Arena Hardware Rig Kit BOM ($78.99)...");
  assert.equal(TURNKEY_ARENA_RIG_BOM.length, 7, "Expected exactly 7 BOM line items");

  const totalBOMDollars = Number(
    TURNKEY_ARENA_RIG_BOM.reduce((acc, item) => acc + item.unitCostDollars * item.quantity, 0).toFixed(2)
  );
  assert.equal(totalBOMDollars, 78.99, "BOM itemized sum must equal exactly $78.99 USD");
  assert.equal(HARDWARE_RIG_KIT_PRICE_CENTS, 7899, "Hardcoded price in cents must equal 7899");

  // Check critical safety specifications
  const vacMount = TURNKEY_ARENA_RIG_BOM.find((i) => i.sku === "TSAI-MNT-VAC-01");
  assert.ok(vacMount, "Vacuum mount SKU missing");
  assert.ok(vacMount.safetyRating.includes("180 lbs Pull Force"));

  const cradle = TURNKEY_ARENA_RIG_BOM.find((i) => i.sku === "TSAI-MNT-CRADLE-01");
  assert.ok(cradle, "MagSafe cradle SKU missing");
  assert.ok(cradle.safetyRating.includes("350ms"));
  console.log("   ✓ All 7 BOM components verified ($78.99 total, 180 lbs vacuum safety, 350ms settling)");

  // Phase 156: the Stripe Connect and hardware-checkout routes are gone. They were open to
  // anyone, created real Stripe Express accounts from a body-supplied club id and email, and
  // answered "success" with a simulated account when the key was missing. Nothing mounted them.
  console.log("\n3. Confirming the unauthenticated billing routes are gone...");
  for (const route of [
    "src/app/api/billing/stripe/connect/route.ts",
    "src/app/api/billing/hardware/checkout/route.ts",
    "src/app/api/billing/stripe/checkout/route.ts",
  ]) {
    assert.equal(fs.existsSync(path.join(process.cwd(), route)), false, `${route} must not exist`);
  }
  console.log("   ✓ No open Stripe Connect, hardware or subscription checkout route");

  console.log("\n🎉 ALL CLUB MONETIZATION TESTS PASSED!\n");
}

runClubMonetizationTests().catch((err) => {
  console.error("\n❌ CLUB MONETIZATION TEST FAILED:", err);
  process.exit(1);
});
