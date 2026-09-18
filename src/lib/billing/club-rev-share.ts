/**
 * Transcend Vision Club Revenue Share Calculator & Specifications
 * Governed by: 06-competitive-autopsy-and-gtm.md (Section 3.2: 50% Club Revenue Share)
 * Author: Jeffrey T. Lucas
 * Assignee: Transcendental Sports AI LLC
 */

export interface RevShareCalculationResult {
  playerCount: number;
  subscribersCount: number;
  subscriptionPlan: "monthly" | "annual";
  pricePerSubscriber: number;
  grossRevenueTotal: number;
  clubRevenueSharePercent: number;
  netClubPayoutTotal: number;
  projectedAnnualTeamFundraising: number;
  veoAnnualAlternativeLoss: number;
  liveBarnZeroReturnDelta: number;
}

export const PRICING_CONSTANTS = {
  FAMILY_PRO_MONTHLY_PRICE: 9.99,
  FAMILY_PRO_ANNUAL_PRICE: 79.0,
  CLUB_REV_SHARE_PERCENT: 50.0,
  MONTHLY_NET_CLUB_PAYOUT: 4.99,
  ANNUAL_NET_CLUB_PAYOUT: 39.5,
  VEO_ANNUAL_COST_PER_TEAM: 1500.0,
  LIVEBARN_ANNUAL_PARENT_COST: 240.0,
};

/**
 * Calculates net fundraising revenue for a youth sports team or club.
 * Example (Spec 06, Section 3.2):
 * 18 players, 25 family subscribers @ $79/yr = $987.50 / year in net fundraising!
 */
export function calculateClubRevenueShare(params: {
  playerCount?: number;
  subscribersCount: number;
  plan: "monthly" | "annual";
}): RevShareCalculationResult {
  const playerCount = params.playerCount ?? 18;
  const subscribersCount = Math.max(0, params.subscribersCount);
  const plan = params.plan;

  const pricePerSubscriber =
    plan === "annual"
      ? PRICING_CONSTANTS.FAMILY_PRO_ANNUAL_PRICE
      : PRICING_CONSTANTS.FAMILY_PRO_MONTHLY_PRICE;

  const payoutPerSubscriber =
    plan === "annual"
      ? PRICING_CONSTANTS.ANNUAL_NET_CLUB_PAYOUT
      : PRICING_CONSTANTS.MONTHLY_NET_CLUB_PAYOUT;

  const grossRevenueTotal = Number((subscribersCount * pricePerSubscriber).toFixed(2));
  const netClubPayoutTotal = Number((subscribersCount * payoutPerSubscriber).toFixed(2));

  const projectedAnnualTeamFundraising =
    plan === "annual"
      ? netClubPayoutTotal
      : Number((netClubPayoutTotal * 12).toFixed(2));

  // Economic advantage vs legacy hardware models
  const veoAnnualAlternativeLoss = PRICING_CONSTANTS.VEO_ANNUAL_COST_PER_TEAM;
  const liveBarnZeroReturnDelta = Number(
    (subscribersCount * PRICING_CONSTANTS.LIVEBARN_ANNUAL_PARENT_COST).toFixed(2)
  );

  return {
    playerCount,
    subscribersCount,
    subscriptionPlan: plan,
    pricePerSubscriber,
    grossRevenueTotal,
    clubRevenueSharePercent: PRICING_CONSTANTS.CLUB_REV_SHARE_PERCENT,
    netClubPayoutTotal,
    projectedAnnualTeamFundraising,
    veoAnnualAlternativeLoss,
    liveBarnZeroReturnDelta,
  };
}
