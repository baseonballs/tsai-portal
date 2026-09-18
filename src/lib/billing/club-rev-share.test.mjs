/**
 * Unit Test Suite: Club Revenue Share 50% Non-Dilution Invariant
 */

import assert from "node:assert/strict";
import { calculateClubRevenueShare, PRICING_CONSTANTS } from "./club-rev-share.ts";

console.log("Starting Club Revenue Share & Fundraising Calculation Tests...");

// 1. Spec 06 Section 3.2 Canonical Invariant: 18 skaters, 25 family subscribers @ $79/yr = $987.50
const canonicalAnnual = calculateClubRevenueShare({
  playerCount: 18,
  subscribersCount: 25,
  plan: "annual",
});

assert.equal(canonicalAnnual.clubRevenueSharePercent, 50.0);
assert.equal(canonicalAnnual.pricePerSubscriber, 79.0);
assert.equal(canonicalAnnual.grossRevenueTotal, 1975.0);
assert.equal(canonicalAnnual.netClubPayoutTotal, 987.5);
assert.equal(canonicalAnnual.projectedAnnualTeamFundraising, 987.5);
console.log("✅ Canonical 25-subscriber Annual Pass yields exactly $987.50 / year");

// 2. Monthly Pass: 20 subscribers @ $9.99/mo = $99.80 / mo ($1,197.60 / yr)
const canonicalMonthly = calculateClubRevenueShare({
  playerCount: 18,
  subscribersCount: 20,
  plan: "monthly",
});

assert.equal(canonicalMonthly.pricePerSubscriber, 9.99);
assert.equal(canonicalMonthly.grossRevenueTotal, 199.8);
assert.equal(canonicalMonthly.netClubPayoutTotal, 99.8);
assert.equal(canonicalMonthly.projectedAnnualTeamFundraising, 1197.6);
console.log("✅ 20-subscriber Monthly Pass yields exactly $99.80 / mo ($1,197.60 / year)");

// 3. Zero subscribers edge case
const zeroSubscribers = calculateClubRevenueShare({
  subscribersCount: 0,
  plan: "annual",
});
assert.equal(zeroSubscribers.netClubPayoutTotal, 0);
assert.equal(zeroSubscribers.projectedAnnualTeamFundraising, 0);
console.log("✅ Zero subscribers safely yields $0.00 without NaN");

console.log("All Club Revenue Share Tests Passed Successfully!\n");
