import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ValidLicensePlanType } from "@/lib/billing/stripe-plans";

export function unixToIso(epochSec: number | null | undefined): string | null {
  return typeof epochSec === "number" && Number.isFinite(epochSec)
    ? new Date(epochSec * 1000).toISOString()
    : null;
}

export function asStringId(value: string | { id?: string | null } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : (value.id ?? null);
}

export async function resolveUserIdByCustomer(
  supabaseAdmin: SupabaseClient,
  customerId: string | null,
  metadataUserId: string | null,
): Promise<string | null> {
  if (customerId) {
    const { data: sc, error: scErr } = await supabaseAdmin
      .from("stripe_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (scErr) throw new Error(`Failed to look up stripe_customers: ${scErr.message}`);
    if (sc?.user_id) {
      if (metadataUserId && sc.user_id !== metadataUserId) {
        throw new Error(`Stripe customer ${customerId} is bound to a different user.`);
      }
      return sc.user_id as string;
    }
  }

  if (metadataUserId) return metadataUserId;
  if (!customerId) return null;

  const { data: sub, error: subErr } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .not("user_id", "is", null)
    .maybeSingle();
  if (subErr) throw new Error(`Failed to look up subscription by customer: ${subErr.message}`);
  return (sub as { user_id?: string } | null)?.user_id ?? null;
}

export async function bindStripeCustomer(
  supabaseAdmin: SupabaseClient,
  userId: string,
  customerId: string,
  eventId: string,
): Promise<void> {
  const [{ data: byUser, error: userErr }, { data: byCust, error: custErr }] = await Promise.all([
    supabaseAdmin.from("stripe_customers").select("stripe_customer_id").eq("user_id", userId).maybeSingle(),
    supabaseAdmin.from("stripe_customers").select("user_id").eq("stripe_customer_id", customerId).maybeSingle(),
  ]);
  if (userErr) throw new Error(`Failed to inspect stripe_customers for user: ${userErr.message}`);
  if (custErr) throw new Error(`Failed to inspect stripe_customers for customer: ${custErr.message}`);

  const existingCustId = (byUser as { stripe_customer_id?: string | null } | null)?.stripe_customer_id;
  if (existingCustId && existingCustId !== customerId) {
    throw new Error(
      `Refusing to overwrite stripe_customer_id ${existingCustId} for user ${userId} with ${customerId}.`,
    );
  }
  const existingOwner = (byCust as { user_id?: string | null } | null)?.user_id;
  if (existingOwner && existingOwner !== userId) {
    throw new Error(`Stripe customer ${customerId} is already bound to another user.`);
  }

  const { error } = await supabaseAdmin.from("stripe_customers").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      bound_via: "stripe_webhook",
      bound_event_id: eventId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`Failed to bind stripe customer: ${error.message}`);
}

export async function assertProfileExists(
  supabaseAdmin: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(`Failed to verify user profile: ${error.message}`);
  if (!profile?.id) {
    throw new Error(`Profile ${userId} does not exist for Stripe license sync.`);
  }
}

/**
 * Sync `public.subscriptions` using only the columns present on live `tsai-core_db`.
 */
export async function syncSubscriptionRow(
  supabaseAdmin: SupabaseClient,
  opts: {
    userId: string;
    activePlan: ValidLicensePlanType;
    status: string;
    planId?: string | null;
    customerId?: string | null;
    subscriptionId?: string | null;
    currentPeriodEnd?: string | null;
    trialEnd?: string | null;
  },
): Promise<void> {
  const payload: Record<string, unknown> = {
    user_id: opts.userId,
    active_plan: opts.activePlan,
    status: opts.status,
    updated_at: new Date().toISOString(),
  };
  if (opts.planId !== undefined) payload.plan_id = opts.planId;
  if (opts.customerId) payload.stripe_customer_id = opts.customerId;
  if (opts.subscriptionId) payload.stripe_subscription_id = opts.subscriptionId;
  if (opts.currentPeriodEnd !== undefined) payload.current_period_end = opts.currentPeriodEnd;
  if (opts.trialEnd !== undefined) payload.trial_end = opts.trialEnd;

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(payload, { onConflict: "user_id" });
  if (error) throw new Error(`Failed to upsert subscription: ${error.message}`);
}

/**
 * Sync the caller's personal `public.licenses` row (`tenant_id IS NULL`).
 * Never writes `valid_from` (`OD-25` awaiting owner schema decision).
 */
export async function syncPersonalLicenseRow(
  supabaseAdmin: SupabaseClient,
  opts: {
    userId: string;
    planType: ValidLicensePlanType;
    planId: string | null;
    planSku: string | null;
    customerId: string | null;
    subscriptionId: string | null;
    validUntil: string | null;
    trialEndsAt: string | null;
    eventId: string;
  },
): Promise<void> {
  await assertProfileExists(supabaseAdmin, opts.userId);

  const { data: existing, error: lookupErr } = await supabaseAdmin
    .from("licenses")
    .select("id, features")
    .eq("profile_id", opts.userId)
    .is("tenant_id", null)
    .maybeSingle();

  if (lookupErr) throw new Error(`Failed to inspect personal license: ${lookupErr.message}`);

  const existingRow = existing as { id: string; features?: Record<string, unknown> | null } | null;
  const mergedFeatures: Record<string, unknown> = {
    ...(existingRow?.features && typeof existingRow.features === "object" ? existingRow.features : {}),
    stripe_customer_id: opts.customerId,
    stripe_subscription_id: opts.subscriptionId,
    plan_sku: opts.planSku,
    last_stripe_event_id: opts.eventId,
  };

  const nowIso = new Date().toISOString();
  const baseFields = {
    plan_type: opts.planType,
    plan_id: opts.planId,
    lifecycle_phase: "ACTIVE",
    valid_until: opts.validUntil,
    trial_ends_at: opts.trialEndsAt,
    features: mergedFeatures,
    updated_at: nowIso,
  };

  if (existingRow?.id) {
    const { error: updateErr } = await supabaseAdmin
      .from("licenses")
      .update(baseFields)
      .eq("id", existingRow.id);
    if (updateErr) throw new Error(`Failed to update personal license: ${updateErr.message}`);
    return;
  }

  const { error: insertErr } = await supabaseAdmin.from("licenses").insert({
    profile_id: opts.userId,
    tenant_id: null,
    ...baseFields,
  });
  if (insertErr) throw new Error(`Failed to insert personal license: ${insertErr.message}`);
}

/**
 * Sync `public.user_product_licenses` (`product_id: "spotlight"`), preserving non-Stripe
 * grants (`invite_code`, `admin_override`, `provisioning`, etc.) on both activation and revocation.
 */
export async function syncUserProductLicenseRow(
  supabaseAdmin: SupabaseClient,
  opts: { userId: string; active: boolean },
): Promise<void> {
  await assertProfileExists(supabaseAdmin, opts.userId);

  const { data: existing, error: lookupErr } = await supabaseAdmin
    .from("user_product_licenses")
    .select("id, status, granted_via")
    .eq("user_id", opts.userId)
    .eq("product_id", "spotlight")
    .maybeSingle();
  if (lookupErr) throw new Error(`Failed to inspect user_product_licenses: ${lookupErr.message}`);

  const row = existing as { id: string; status: string; granted_via: string } | null;
  if (opts.active) {
    if (row?.status === "active" && row.granted_via !== "stripe_webhook") {
      return;
    }
  } else if (!row || row.granted_via !== "stripe_webhook") {
    return;
  }

  const { error } = await supabaseAdmin.from("user_product_licenses").upsert(
    {
      user_id: opts.userId,
      product_id: "spotlight",
      status: opts.active ? "active" : "revoked",
      granted_via: "stripe_webhook",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product_id" },
  );
  if (error) throw new Error(`Failed to upsert user_product_licenses: ${error.message}`);
}

export async function applyStripeEntitlements(
  supabaseAdmin: SupabaseClient,
  opts: {
    userId: string;
    planType: ValidLicensePlanType;
    planId: string | null;
    planSku: string | null;
    subStatus: string;
    customerId: string | null;
    subscriptionId: string | null;
    periodEnd: string | null;
    trialEnd: string | null;
    eventId: string;
    grantProductLicense: boolean | null;
  },
): Promise<void> {
  await syncSubscriptionRow(supabaseAdmin, {
    userId: opts.userId,
    activePlan: opts.planType,
    status: opts.subStatus,
    planId: opts.planId,
    customerId: opts.customerId,
    subscriptionId: opts.subscriptionId,
    currentPeriodEnd: opts.periodEnd,
    trialEnd: opts.trialEnd,
  });
  await syncPersonalLicenseRow(supabaseAdmin, {
    userId: opts.userId,
    planType: opts.planType,
    planId: opts.planId,
    planSku: opts.planSku,
    customerId: opts.customerId,
    subscriptionId: opts.subscriptionId,
    validUntil: opts.periodEnd,
    trialEndsAt: opts.trialEnd,
    eventId: opts.eventId,
  });
  if (opts.grantProductLicense !== null) {
    await syncUserProductLicenseRow(supabaseAdmin, {
      userId: opts.userId,
      active: opts.grantProductLicense,
    });
  }
}
