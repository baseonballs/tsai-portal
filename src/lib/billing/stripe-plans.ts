import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export const CHECKOUT_PLAN_CONFIGS = [
  { sku: "SPOT-FAM-BASIC", envVars: ["STRIPE_PRICE_ID_FAM_BASIC"] },
  { sku: "SPOT-FAM-PRO", envVars: ["STRIPE_PRICE_ID_FAM_PRO"] },
  { sku: "SPOT-PRO-STD", envVars: ["STRIPE_PRICE_ID_PRO_STD", "STRIPE_PRICE_ID_PRO"] },
  { sku: "SPOT-PRO-PLUS", envVars: ["STRIPE_PRICE_ID_PRO_PLUS"] },
  { sku: "SPOT-TEAM-SEASON-24", envVars: ["STRIPE_PRICE_ID_TEAM_SEASON_24", "STRIPE_PRICE_ID_TEAM"] },
] as const;

export type CheckoutPlanSku = (typeof CHECKOUT_PLAN_CONFIGS)[number]["sku"];

const CONFIG_BY_SKU = new Map<CheckoutPlanSku, readonly string[]>(
  CHECKOUT_PLAN_CONFIGS.map((entry) => [entry.sku, entry.envVars]),
);

export const ALLOWLISTED_CHECKOUT_SKUS: readonly CheckoutPlanSku[] = CHECKOUT_PLAN_CONFIGS.map(
  (entry) => entry.sku,
);

export const VALID_LICENSE_PLAN_TYPES = new Set([
  "FREE",
  "FAMILY",
  "PRO",
  "TEAM",
  "SKILLS_DEV",
  "SCOUTING",
  "BASIC",
] as const);

export type ValidLicensePlanType =
  | "FREE"
  | "FAMILY"
  | "PRO"
  | "TEAM"
  | "SKILLS_DEV"
  | "SCOUTING"
  | "BASIC";

const TIER_TO_CANONICAL_SKU: Record<string, string> = {
  FREE: "SPOT-FREE-STD",
  BASIC: "SPOT-FAM-BASIC",
  FAMILY: "SPOT-FAM-PRO",
  PRO: "SPOT-PRO-STD",
  TEAM: "SPOT-TEAM-SEASON-24",
};

export interface PlanCatalogRow {
  id: string;
  sku: string;
  name: string;
  kind_code: string;
  tier_code: string;
  legacy_plan_type: string | null;
  list_price_cents: number | null;
  currency: string;
  billing_interval: string;
  member_seats_included: number | null;
  stripe_price_id: string | null;
}

export interface PublicCheckoutPlan {
  sku: string;
  name: string;
  kind_code: string;
  tier_code: string;
  list_price_cents: number | null;
  currency: string;
  billing_interval: string;
  member_seats_included: number | null;
  checkoutReady: boolean;
}

export function isCheckoutPlanSku(value: unknown): value is CheckoutPlanSku {
  return typeof value === "string" && CONFIG_BY_SKU.has(value as CheckoutPlanSku);
}

export function isValidLicensePlanType(value: string): value is ValidLicensePlanType {
  return VALID_LICENSE_PLAN_TYPES.has(value as ValidLicensePlanType);
}

/**
 * Derive a valid `licenses.plan_type` / `subscriptions.active_plan` from `public.plans`.
 * `plans.tier_code` (`STANDARD`, `PLUS`, `CLUB`, etc.) violates `licenses_plan_type_check`;
 * live Postgres requires `COALESCE(legacy_plan_type, kind_code)`.
 */
export function derivePlanType(plan: {
  legacy_plan_type?: string | null;
  kind_code?: string | null;
}): ValidLicensePlanType {
  const candidate = (plan.legacy_plan_type?.trim() || plan.kind_code?.trim() || "").toUpperCase();
  if (!isValidLicensePlanType(candidate)) {
    throw new Error(`Unsupported license plan_type derived from plan catalog: ${candidate || "(empty)"}`);
  }
  return candidate;
}

/**
 * Resolve a plan's Stripe Price ID: live `public.plans.stripe_price_id` first, then
 * ordered env vars. Never invents or falls back to fake `price_*` strings.
 */
export function resolveStripePriceId(
  sku: CheckoutPlanSku,
  dbStripePriceId: string | null | undefined,
): string | null {
  const fromDb = typeof dbStripePriceId === "string" ? dbStripePriceId.trim() : "";
  if (fromDb) return fromDb;

  const envVars = CONFIG_BY_SKU.get(sku) ?? [];
  for (const envName of envVars) {
    const val = process.env[envName]?.trim();
    if (val) return val;
  }
  return null;
}

const PLAN_SELECT =
  "id, sku, name, kind_code, tier_code, legacy_plan_type, list_price_cents, currency, billing_interval, member_seats_included, stripe_price_id";

export async function fetchAllowlistedPlans(adminClient: SupabaseClient): Promise<PlanCatalogRow[]> {
  const { data, error } = await adminClient
    .from("plans")
    .select(PLAN_SELECT)
    .in("sku", [...ALLOWLISTED_CHECKOUT_SKUS])
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to query plans catalog: ${error.message}`);
  }

  const rows = (data ?? []) as PlanCatalogRow[];
  const order = new Map<string, number>(ALLOWLISTED_CHECKOUT_SKUS.map((sku, idx) => [sku, idx]));
  return [...rows].sort((a, b) => (order.get(a.sku) ?? 999) - (order.get(b.sku) ?? 999));
}

export async function resolvePublicCheckoutPlans(
  adminClient: SupabaseClient,
): Promise<{ checkoutConfigured: boolean; plans: PublicCheckoutPlan[] }> {
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim() || "";
  const checkoutConfigured = Boolean(stripeKey);
  const rows = await fetchAllowlistedPlans(adminClient);

  const plans: PublicCheckoutPlan[] = rows.map((row) => {
    const resolvedPrice = isCheckoutPlanSku(row.sku)
      ? resolveStripePriceId(row.sku, row.stripe_price_id)
      : null;
    return {
      sku: row.sku,
      name: row.name,
      kind_code: row.kind_code,
      tier_code: row.tier_code,
      list_price_cents: row.list_price_cents,
      currency: row.currency,
      billing_interval: row.billing_interval,
      member_seats_included: row.member_seats_included,
      checkoutReady: Boolean(checkoutConfigured && resolvedPrice),
    };
  });

  return { checkoutConfigured, plans };
}

export async function fetchActiveCheckoutPlan(
  adminClient: SupabaseClient,
  sku: CheckoutPlanSku,
): Promise<PlanCatalogRow | null> {
  const { data, error } = await adminClient
    .from("plans")
    .select(PLAN_SELECT)
    .eq("sku", sku)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to look up plan ${sku}: ${error.message}`);
  }
  return (data as PlanCatalogRow | null) ?? null;
}

function findSkuByConfiguredEnvPrice(priceId: string): CheckoutPlanSku | null {
  for (const cfg of CHECKOUT_PLAN_CONFIGS) {
    for (const envName of cfg.envVars) {
      if (process.env[envName]?.trim() === priceId) {
        return cfg.sku;
      }
    }
  }
  return null;
}

export async function resolveWebhookPlan(
  adminClient: SupabaseClient,
  opts: { planSku?: string | null; priceId?: string | null; tier?: string | null },
): Promise<{ planId: string | null; planSku: string | null; planType: ValidLicensePlanType | null }> {
  // Prefer Stripe price_id before metadata so out-of-band Stripe price updates win over stale metadata.
  const priceId = opts.priceId?.trim() || null;
  if (priceId) {
    const { data, error } = await adminClient
      .from("plans")
      .select(PLAN_SELECT)
      .eq("stripe_price_id", priceId)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`Failed to look up plan by stripe_price_id: ${error.message}`);
    if (data) {
      const row = data as PlanCatalogRow;
      return { planId: row.id, planSku: row.sku, planType: derivePlanType(row) };
    }

    const envMatchedSku = findSkuByConfiguredEnvPrice(priceId);
    if (envMatchedSku) {
      const { data: envRow, error: envErr } = await adminClient
        .from("plans")
        .select(PLAN_SELECT)
        .eq("sku", envMatchedSku)
        .maybeSingle();
      if (envErr) throw new Error(`Failed to look up plan SKU ${envMatchedSku}: ${envErr.message}`);
      if (envRow) {
        const row = envRow as PlanCatalogRow;
        return { planId: row.id, planSku: row.sku, planType: derivePlanType(row) };
      }
    }
  }

  const sku = opts.planSku?.trim() || null;
  if (sku) {
    const { data, error } = await adminClient.from("plans").select(PLAN_SELECT).eq("sku", sku).maybeSingle();
    if (error) throw new Error(`Failed to look up plan SKU ${sku}: ${error.message}`);
    if (data) {
      const row = data as PlanCatalogRow;
      return { planId: row.id, planSku: row.sku, planType: derivePlanType(row) };
    }
  }

  const normalizedTier = opts.tier?.trim().toUpperCase() || null;
  if (normalizedTier) {
    const canonicalSku = TIER_TO_CANONICAL_SKU[normalizedTier];
    if (canonicalSku) {
      const { data, error } = await adminClient
        .from("plans")
        .select(PLAN_SELECT)
        .eq("sku", canonicalSku)
        .maybeSingle();
      if (error) throw new Error(`Failed to look up canonical plan ${canonicalSku}: ${error.message}`);
      if (data) {
        const row = data as PlanCatalogRow;
        return { planId: row.id, planSku: row.sku, planType: derivePlanType(row) };
      }
    }

    const { data: legacyRow, error: legacyErr } = await adminClient
      .from("plans")
      .select(PLAN_SELECT)
      .eq("legacy_plan_type", normalizedTier)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (legacyErr) throw new Error(`Failed to look up legacy plan ${normalizedTier}: ${legacyErr.message}`);
    if (legacyRow) {
      const row = legacyRow as PlanCatalogRow;
      return { planId: row.id, planSku: row.sku, planType: derivePlanType(row) };
    }

    if (isValidLicensePlanType(normalizedTier)) {
      return { planId: null, planSku: null, planType: normalizedTier };
    }
  }

  return { planId: null, planSku: null, planType: null };
}

export async function resolveFreePlanId(adminClient: SupabaseClient): Promise<string | null> {
  const { data: freeBySku, error: skuErr } = await adminClient
    .from("plans")
    .select("id")
    .eq("sku", "SPOT-FREE-STD")
    .maybeSingle();
  if (skuErr) throw new Error(`Failed to look up FREE plan: ${skuErr.message}`);
  if (freeBySku?.id) return (freeBySku as { id: string }).id;

  const { data: freeByLegacy, error: legErr } = await adminClient
    .from("plans")
    .select("id")
    .eq("legacy_plan_type", "FREE")
    .limit(1)
    .maybeSingle();
  if (legErr) throw new Error(`Failed to look up legacy FREE plan: ${legErr.message}`);
  return (freeByLegacy as { id?: string } | null)?.id ?? null;
}
