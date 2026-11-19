/**
 * Club Stripe Connect 50/50 Revenue Share Onboarding Types
 * Horizon D: Commercial App Store & Mobile Production Packaging
 * Units: Pure SI / Financial ISO 4217 (USD), fractions (0.0 - 1.0).
 */

export type KycStatus = 'UNSTARTED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'ACTION_REQUIRED';
export type PayoutFrequency = 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';

export interface ClubStripeConnectProfile {
  clubId: string;
  clubName: string;
  einOrTaxId: string;
  accountType: 'NON_PROFIT_501C3' | 'COMMERCIAL_LLC' | 'MUNICIPAL_PARKS_REC';
  kycStatus: KycStatus;
  stripeConnectAccountId?: string;
  bankRoutingNumberMasked?: string;
  bankAccountNumberMasked?: string;
  revenueShareRatio: number; // Strictly 0.50 (50/50 split)
  payoutFrequency: PayoutFrequency;
  estimatedEnrolledFamilies: number;
  monthlyPerFamilyFeeUsd: number;
}

