/**
 * club-revenue-calculator.ts
 * tsai-portal
 *
 * Author / Inventor: Jeffrey T. Lucas
 * Assignee: Transcendental Sports AI LLC
 * Commercial Strategy: Disruptive Club Revenue Sharing (50% Net Pass Subscription)
 *
 * Calculates the exact 50% net subscription split for partner clubs
 * on the $9.99/month Pro Family Pass, accounting for Stripe interchange
 * fees and YouTube/TSAI dual-egress streaming costs.
 */

export interface RevenueCalculationInput {
  subscribersCount: number;
  grossPricePerMonthCents?: number; // Defaults to 999 ($9.99)
  stripePercentFee?: number; // Defaults to 0.029 (2.9%)
  stripeFixedFeeCents?: number; // Defaults to 30 ($0.30)
  cdnHostingPerSubCents?: number; // Defaults to 20 ($0.20)
  clubShareRatio?: number; // Defaults to 0.50 (50%)
}

export interface ClubRevenueBreakdown {
  subscribersCount: number;
  grossRevenueMonthlyDollars: number;
  grossRevenueAnnualDollars: number;
  stripeFeesMonthlyDollars: number;
  cdnHostingMonthlyDollars: number;
  netRevenueMonthlyDollars: number;
  clubPayoutMonthlyDollars: number;
  clubPayoutAnnualDollars: number;
  platformShareMonthlyDollars: number;
  effectiveClubSharePercentage: number;
}

export const HARDWARE_RIG_KIT_PRICE_CENTS = 7899; // $78.99 USD
export const PRO_FAMILY_PASS_PRICE_CENTS = 999; // $9.99/mo USD

/**
 * Calculates monthly and annualized club revenue distributions.
 */
export function calculateClubRevenue(input: RevenueCalculationInput): ClubRevenueBreakdown {
  const count = Math.max(0, input.subscribersCount);
  const grossPriceCents = input.grossPricePerMonthCents ?? PRO_FAMILY_PASS_PRICE_CENTS;
  const stripePercent = input.stripePercentFee ?? 0.029;
  const stripeFixed = input.stripeFixedFeeCents ?? 30;
  const cdnHosting = input.cdnHostingPerSubCents ?? 20;
  const clubRatio = input.clubShareRatio ?? 0.50;

  const totalGrossCents = count * grossPriceCents;
  const stripeFeePerSubCents = Math.round(grossPriceCents * stripePercent) + stripeFixed;
  const totalStripeFeesCents = count * stripeFeePerSubCents;
  const totalCdnHostingCents = count * cdnHosting;

  const totalCostsCents = totalStripeFeesCents + totalCdnHostingCents;
  const netPoolCents = Math.max(0, totalGrossCents - totalCostsCents);

  const clubPayoutCents = Math.round(netPoolCents * clubRatio);
  const platformShareCents = netPoolCents - clubPayoutCents;

  const toDollars = (cents: number) => Number((cents / 100).toFixed(2));

  const monthlyGross = toDollars(totalGrossCents);
  const monthlyClub = toDollars(clubPayoutCents);

  return {
    subscribersCount: count,
    grossRevenueMonthlyDollars: monthlyGross,
    grossRevenueAnnualDollars: Number((monthlyGross * 12).toFixed(2)),
    stripeFeesMonthlyDollars: toDollars(totalStripeFeesCents),
    cdnHostingMonthlyDollars: toDollars(totalCdnHostingCents),
    netRevenueMonthlyDollars: toDollars(netPoolCents),
    clubPayoutMonthlyDollars: monthlyClub,
    clubPayoutAnnualDollars: Number((monthlyClub * 12).toFixed(2)),
    platformShareMonthlyDollars: toDollars(platformShareCents),
    effectiveClubSharePercentage: monthlyGross > 0 ? Number(((monthlyClub / monthlyGross) * 100).toFixed(1)) : 50.0,
  };
}

/**
 * Itemized Bill of Materials for the $78.99 Turnkey Arena Hardware Rig Kit.
 */
export interface HardwareBOMItem {
  sku: string;
  name: string;
  quantity: number;
  unitCostDollars: number;
  vendorCategory: string;
  safetyRating: string;
}

export const TURNKEY_ARENA_RIG_BOM: HardwareBOMItem[] = [
  {
    sku: "TSAI-MNT-VAC-01",
    name: 'Dual 4.5" Vacuum Suction Glass Mount with Red Safety Check Indicator',
    quantity: 1,
    unitCostDollars: 24.50,
    vendorCategory: "Structural Mounting",
    safetyRating: "180 lbs Pull Force / Spectator Glass Isolation",
  },
  {
    sku: "TSAI-MNT-BALL-01",
    name: "CNC Anodized Aluminum 360° Ball-Head with Arca-Swiss Quick-Release",
    quantity: 1,
    unitCostDollars: 14.99,
    vendorCategory: "Kinematic Positioning",
    safetyRating: "25 lbs Ballistic Torque Resistance",
  },
  {
    sku: "TSAI-MNT-CRADLE-01",
    name: "Silicone Anti-Vibration MagSafe Cradle with Qi2 Mechanical Lock",
    quantity: 1,
    unitCostDollars: 18.50,
    vendorCategory: "Device Retention",
    safetyRating: "Settling Time ≤ 350ms under 210 lb board check",
  },
  {
    sku: "TSAI-CAB-USBC-01",
    name: "10ft Braided 100W USB-C PD 3.1 90° Right-Angle Cable",
    quantity: 1,
    unitCostDollars: 8.25,
    vendorCategory: "Power Delivery",
    safetyRating: "-20°C Cold Rink Bend-Proof Tested",
  },
  {
    sku: "TSAI-THM-SLV-01",
    name: "Neoprene Cold-Shield & Aluminum Thermal Heat-Sink Sleeve",
    quantity: 1,
    unitCostDollars: 6.75,
    vendorCategory: "Thermal Management",
    safetyRating: "Prevents battery voltage drop in sub-zero rinks",
  },
  {
    sku: "TSAI-CLN-OPT-01",
    name: "Microfiber Optical Cleaning Cloth & 70% Isopropanol Prep Wipes",
    quantity: 1,
    unitCostDollars: 1.50,
    vendorCategory: "Optics Maintenance",
    safetyRating: "Anti-Residue / Zamboni Mist Elimination",
  },
  {
    sku: "TSAI-DOC-CARD-01",
    name: "Laminated 90-Second Deployment Quick-Start Card & QR Target",
    quantity: 1,
    unitCostDollars: 4.50,
    vendorCategory: "Operations",
    safetyRating: "UV-Coated / Tear-Resistant",
  },
];
