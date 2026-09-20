/**
//  club-revenue-share-types.ts
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Commercial Rollout: 50% Club Revenue Sharing & Scout Download Console
*/

export interface ClubPayoutTelemetry {
  clubId: string;
  clubName: string;
  activeFamilySubscribers: number;
  monthlySubscriptionRateUsd: number; // e.g. $15.00
  clubRevSharePercent: number; // 50.0%
  pendingPayoutUsd: number;
  lifetimePayoutUsd: number;
  nextAchTransferDate: string;
  stripeAccountId: string;
  isStripeConnectActive: boolean;
}

export interface ScoutDownloadOrder {
  orderId: string;
  matchId: string;
  matchTitle: string;
  purchasedAt: string;
  scoutOrg: string;
  priceUsd: number; // e.g. $35.00
  clubCutUsd: number; // e.g. $17.50 (50%)
  status: "completed" | "processing";
}

export interface ClubRevenueShareConsoleProps {
  initialTelemetry?: ClubPayoutTelemetry;
  initialScoutOrders?: ScoutDownloadOrder[];
  onTriggerPayout?: (clubId: string) => Promise<void>;
}
