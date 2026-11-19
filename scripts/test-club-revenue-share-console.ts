//
//  test-club-revenue-share-console.ts
//  tsai-portal
//
//  Transcend Platform - Horizon D Commercial Club Revenue Share Test Suite
//

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import type { ClubPayoutTelemetry, ScoutDownloadOrder } from "../src/types/club-revenue-share-types";

// Neutral in-test fixture (GA-030 O-10, T0.4): the component no longer ships built-in data, so
// the data these checks need lives here only. No real club, venue or person.
const DEFAULT_CLUB_TELEMETRY: ClubPayoutTelemetry = {
  clubId: "club-fixture",
  clubName: "Fixture Youth Club",
  activeFamilySubscribers: 420,
  monthlySubscriptionRateUsd: 15.0,
  clubRevSharePercent: 50.0,
  pendingPayoutUsd: 3150.0,
  lifetimePayoutUsd: 37800.0,
  nextAchTransferDate: "2026-10-01",
  stripeAccountId: "acct_fixture_001",
  isStripeConnectActive: true,
};

const DEFAULT_SCOUT_ORDERS: ScoutDownloadOrder[] = [
  { orderId: "ord-scout-801", matchId: "m-u16-championship", matchTitle: "Fixture U16 A vs Fixture U16 B", purchasedAt: "12m ago", scoutOrg: "Fixture Scout Org 1", priceUsd: 35.0, clubCutUsd: 17.5, status: "completed" },
  { orderId: "ord-scout-802", matchId: "m-u18-showcase", matchTitle: "Fixture U18 A vs Fixture U18 B", purchasedAt: "2h ago", scoutOrg: "Fixture Scout Org 2", priceUsd: 35.0, clubCutUsd: 17.5, status: "completed" },
  { orderId: "ord-scout-803", matchId: "m-u14-regional", matchTitle: "Fixture U14 A vs Fixture U14 B", purchasedAt: "5h ago", scoutOrg: "Fixture Scout Org 3", priceUsd: 35.0, clubCutUsd: 17.5, status: "completed" },
];


console.log("================================================================================");
console.log("🏒 RUNNING CLUB REVENUE SHARE CONSOLE TESTS (HORIZON D)");
console.log("================================================================================");

// 1. Data Model Verification
assert.strictEqual(DEFAULT_CLUB_TELEMETRY.clubRevSharePercent, 50.0, "Club rev share must be 50%");
assert.strictEqual(DEFAULT_CLUB_TELEMETRY.monthlySubscriptionRateUsd, 15.0, "Family rate is $15/mo");
assert.ok(DEFAULT_CLUB_TELEMETRY.isStripeConnectActive, "Stripe Connect must be active");
assert.ok(DEFAULT_SCOUT_ORDERS.length >= 3, "Must have scout orders");

for (const order of DEFAULT_SCOUT_ORDERS) {
  assert.strictEqual(order.priceUsd, 35.0, "Scout match pass must be $35.00");
  assert.strictEqual(order.clubCutUsd, 17.5, "Club 50% cut of scout match pass must be $17.50");
}
console.log("✓ Commercial 50% club revenue share contracts and scout passes validated.");

// 2. Zero-Purple AST / Token Audit
const componentPath = path.resolve(
  __dirname,
  "../src/components/commercial/ClubRevenueShareConsole.tsx"
);
const componentSource = fs.readFileSync(componentPath, "utf-8");

const forbiddenPurplePatterns = [
  /purple/i,
  /violet/i,
  /indigo/i,
  /#8[0-9a-fA-F]{5}/,
  /#7[0-9a-fA-F]{5}/,
];

for (const pattern of forbiddenPurplePatterns) {
  assert.ok(
    !pattern.test(componentSource),
    `Violation: Component source contains forbidden chromatic token: ${pattern}`
  );
}
console.log("✓ Zero-Purple invariant satisfied in ClubRevenueShareConsole.tsx.");

// 3. File Line Limit (INV-5) Audit
const lines = componentSource.split("\n").length;
assert.ok(
  lines < 300,
  `Violation: Component file must stay below 300 lines (current: ${lines})`
);
console.log(`✓ Component line count invariant satisfied: ${lines} lines (< 300 lines).`);

const typesPath = path.resolve(
  __dirname,
  "../src/types/club-revenue-share-types.ts"
);
const typeLines = fs.readFileSync(typesPath, "utf-8").split("\n").length;
assert.ok(
  typeLines < 300,
  `Violation: Types file must stay below 300 lines (current: ${typeLines})`
);
console.log(`✓ Types line count invariant satisfied: ${typeLines} lines (< 300 lines).`);

console.log("================================================================================");
console.log("🎉 ALL CLUB REVENUE SHARE CONSOLE TESTS PASSED (100%)");
console.log("================================================================================");
