/**
 * test-club-revshare-dashboard.ts
 * TsaiPortal / Rev-Share Dashboard & Commercial Verification Suite
 *
 * Author / Inventor: Jeffrey T. Lucas
 * Assignee: Transcendental Sports AI LLC
 * Commercial Strategy: Option D - Turnkey Arena Rig ($78.99) & 50% Net Rev Share ($4.60/sub/mo)
 *
 * Run: npx tsx scripts/test-club-revshare-dashboard.ts
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  calculateClubRevenue,
  TURNKEY_ARENA_RIG_BOM,
  HARDWARE_RIG_KIT_PRICE_CENTS,
  PRO_FAMILY_PASS_PRICE_CENTS,
} from "../src/lib/commercial/club-revenue-calculator";
import {
  calculateClubRevenueShare,
  PRICING_CONSTANTS,
} from "../src/lib/billing/club-rev-share";
import { POST as handleStripeConnect } from "../src/app/api/billing/stripe/connect/route";
import { POST as handleHardwareCheckout } from "../src/app/api/billing/hardware/checkout/route";

async function runClubRevShareDashboardTests() {
  console.log("─────────────────────────────────────────────────────────────────");
  console.log("🏒 [Portal Test] Club Rev-Share Dashboard & Turnkey BOM Suite");
  console.log("Strategy: 50% Net Rev Share ($4.60/sub/mo) + Turnkey BOM ($78.99)");
  console.log("─────────────────────────────────────────────────────────────────\n");

  // TEST 1: Exact $4.60 / subscriber / month Net Rev-Share Verification
  console.log("1. Validating 50% Net Revenue Split ($4.60/sub/month)...");
  const singleSub = calculateClubRevenue({ subscribersCount: 1 });
  assert.equal(singleSub.subscribersCount, 1);
  assert.equal(singleSub.grossRevenueMonthlyDollars, 9.99);
  assert.equal(singleSub.stripeFeesMonthlyDollars, 0.59);
  assert.equal(singleSub.cdnHostingMonthlyDollars, 0.20);
  assert.equal(singleSub.netRevenueMonthlyDollars, 9.20);
  assert.equal(singleSub.clubPayoutMonthlyDollars, 4.60);
  assert.equal(singleSub.platformShareMonthlyDollars, 4.60);
  console.log("   ✓ Exactly $4.60 / subscriber / month net payout confirmed");

  // Multi-tier modeling
  const cohort350 = calculateClubRevenue({ subscribersCount: 350 });
  assert.equal(cohort350.clubPayoutMonthlyDollars, 1610.00); // 350 * 4.60
  assert.equal(cohort350.clubPayoutAnnualDollars, 19320.00);
  assert.equal(cohort350.effectiveClubSharePercentage, 46.0); // 1610 / 3496.50
  console.log("   ✓ 350 subscribers cohort yields $1,610.00/mo ($19,320.00/yr)");

  // TEST 2: Turnkey Arena Hardware Rig Kit BOM Sum ($78.99 USD)
  console.log("\n2. Validating Turnkey Arena Rig Kit BOM Sum ($78.99 USD)...");
  assert.equal(TURNKEY_ARENA_RIG_BOM.length, 7, "Must contain exactly 7 line items");
  const totalBOM = Number(
    TURNKEY_ARENA_RIG_BOM.reduce((sum, item) => sum + item.unitCostDollars * item.quantity, 0).toFixed(2)
  );
  assert.equal(totalBOM, 78.99, "BOM total must equal exactly $78.99 USD");
  assert.equal(HARDWARE_RIG_KIT_PRICE_CENTS, 7899, "Hardware price in cents must be 7899");

  // Verify critical physical safety specs
  const suction = TURNKEY_ARENA_RIG_BOM.find((i) => i.sku === "TSAI-MNT-VAC-01");
  assert.ok(suction, "Vacuum suction mount must exist in BOM");
  assert.ok(suction.safetyRating.includes("180 lbs Pull Force"));

  const cradle = TURNKEY_ARENA_RIG_BOM.find((i) => i.sku === "TSAI-MNT-CRADLE-01");
  assert.ok(cradle, "MagSafe cradle must exist in BOM");
  assert.ok(cradle.safetyRating.includes("350ms"));
  console.log("   ✓ All 7 BOM components verified ($78.99 total, 180 lbs vacuum safety, 350ms settling)");

  // TEST 3: Stripe Connect Express Onboarding Sandbox
  console.log("\n3. Testing Stripe Connect Express Route Handler...");
  const invalidReq = new Request("https://portal.tsai.app/api/billing/stripe/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const invalidRes = await handleStripeConnect(invalidReq);
  assert.equal(invalidRes.status, 400);

  const validReq = new Request("https://portal.tsai.app/api/billing/stripe/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin: "https://portal.tsai.app" },
    body: JSON.stringify({
      clubId: "club_jr_sharks_01",
      clubName: "San Jose Jr Sharks AAA",
      contactEmail: "director@sharksice.com",
    }),
  });
  const validRes = await handleStripeConnect(validReq);
  assert.equal(validRes.status, 200);
  const validJson = await validRes.json();
  assert.ok(validJson.url && (validJson.url.includes("connect") || validJson.url.includes("stripe")));
  assert.ok(validJson.accountId.startsWith("acct_"));
  console.log(`   ✓ Stripe Connect Express onboarding generated: ${validJson.accountId}`);

  // TEST 4: Hardware Checkout Route Handler
  console.log("\n4. Testing Hardware Checkout Route Handler...");
  const hwReq = new Request("https://portal.tsai.app/api/billing/hardware/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin: "https://portal.tsai.app" },
    body: JSON.stringify({
      clubId: "club_jr_sharks_01",
      userEmail: "director@sharksice.com",
      quantity: 1,
      sheetIdentifier: "Sheet 1 (Main Arena)",
    }),
  });
  const hwRes = await handleHardwareCheckout(hwReq);
  assert.equal(hwRes.status, 200);
  const hwJson = await hwRes.json();
  assert.ok(hwJson.url);
  assert.ok(hwJson.sessionId.startsWith("cs_"));
  console.log(`   ✓ Hardware checkout session created: ${hwJson.sessionId}`);

  // TEST 5: Canonical Annual Pass Fundraising ($987.50 / yr)
  console.log("\n5. Testing Canonical Team Fundraising Calculation ($987.50 / yr)...");
  const canonical = calculateClubRevenueShare({
    playerCount: 18,
    subscribersCount: 25,
    plan: "annual",
  });
  assert.equal(canonical.clubRevenueSharePercent, 50.0);
  assert.equal(canonical.pricePerSubscriber, 79.0);
  assert.equal(canonical.netClubPayoutTotal, 987.50);
  assert.equal(canonical.projectedAnnualTeamFundraising, 987.50);
  console.log("   ✓ Canonical 25-subscriber Annual Pass yields exactly $987.50 / year");

  // TEST 6: Zero-Purple Invariant (INV-4) on ClubRevShareDashboard
  console.log("\n6. Auditing Zero-Purple Invariant (INV-4)...");
  const dashboardPath = path.join(process.cwd(), "src/components/billing/ClubRevShareDashboard.tsx");
  const dashboardSrc = fs.readFileSync(dashboardPath, "utf8");
  const forbiddenPurple = dashboardSrc.match(/(?:purple|indigo|violet)-[0-9]{2,3}/gi);
  assert.equal(forbiddenPurple, null, `Found forbidden purple tokens: ${forbiddenPurple?.join(", ")}`);
  console.log("   ✓ Zero unanchored purple tokens in ClubRevShareDashboard (100% compliant)");

  console.log("\n🎉 ALL 6 CLUB REV-SHARE & DASHBOARD VERIFICATION TESTS PASSED!\n");
}

runClubRevShareDashboardTests().catch((err) => {
  console.error("\n❌ CLUB REV-SHARE DASHBOARD TEST FAILED:", err);
  process.exit(1);
});
