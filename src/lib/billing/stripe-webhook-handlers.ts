import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import {
  isValidLicensePlanType,
  resolveFreePlanId,
  resolveWebhookPlan,
  type ValidLicensePlanType,
} from "@/lib/billing/stripe-plans";
import {
  asStringId,
  bindStripeCustomer,
  resolveUserIdByCustomer,
  syncPersonalLicenseRow,
  syncSubscriptionRow,
  syncUserProductLicenseRow,
  unixToIso,
} from "@/lib/billing/stripe-webhook-sync";

const REVOKING_SUBSCRIPTION_STATUSES = new Set([
  "canceled",
  "unpaid",
  "incomplete_expired",
]);

export interface WebhookEventOutcome {
  userId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  outcome: string;
}

export async function handleCheckoutCompleted(
  supabaseAdmin: SupabaseClient,
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<WebhookEventOutcome> {
  const customerId = asStringId(session.customer);
  const subscriptionId = asStringId(session.subscription);
  const metaUserId = session.metadata?.userId ?? session.client_reference_id ?? null;
  const userId = await resolveUserIdByCustomer(supabaseAdmin, customerId, metaUserId);

  if (userId && customerId) {
    await bindStripeCustomer(supabaseAdmin, userId, customerId, eventId);
  }

  const resolvedPlan = await resolveWebhookPlan(supabaseAdmin, {
    planSku: session.metadata?.planSku ?? null,
    tier: session.metadata?.tier ?? null,
  });

  if (!userId || !resolvedPlan.planType) {
    return { userId, customerId, subscriptionId, outcome: "missing_metadata" };
  }

  await syncSubscriptionRow(supabaseAdmin, {
    userId,
    activePlan: resolvedPlan.planType,
    status: "active",
    planId: resolvedPlan.planId,
    customerId,
    subscriptionId,
  });

  await syncPersonalLicenseRow(supabaseAdmin, {
    userId,
    planType: resolvedPlan.planType,
    planId: resolvedPlan.planId,
    planSku: resolvedPlan.planSku,
    customerId,
    subscriptionId,
    validUntil: null,
    trialEndsAt: null,
    eventId,
  });

  await syncUserProductLicenseRow(supabaseAdmin, { userId, active: true });

  return {
    userId,
    customerId,
    subscriptionId,
    outcome: `plan:${resolvedPlan.planSku ?? resolvedPlan.planType}`,
  };
}

export async function handleSubscriptionLifecycle(
  supabaseAdmin: SupabaseClient,
  sub: Stripe.Subscription,
  eventType: string,
  eventId: string,
): Promise<WebhookEventOutcome> {
  const customerId = asStringId(sub.customer);
  const subscriptionId = sub.id;
  const userId = await resolveUserIdByCustomer(
    supabaseAdmin,
    customerId,
    sub.metadata?.userId ?? null,
  );

  if (userId && customerId) {
    await bindStripeCustomer(supabaseAdmin, userId, customerId, eventId);
  }
  if (!userId) {
    return { userId: null, customerId, subscriptionId, outcome: "unmapped_customer" };
  }

  const { data: currentSub, error: currentSubErr } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_subscription_id, active_plan, plan_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (currentSubErr) {
    throw new Error(`Failed to inspect existing subscription: ${currentSubErr.message}`);
  }

  const existingSub = currentSub as {
    stripe_subscription_id?: string | null;
    active_plan?: string | null;
    plan_id?: string | null;
  } | null;

  if (existingSub?.stripe_subscription_id && existingSub.stripe_subscription_id !== subscriptionId) {
    return { userId, customerId, subscriptionId, outcome: "ignored_non_primary_subscription" };
  }

  const firstItem = sub.items?.data?.[0];
  const itemAny = firstItem as unknown as { current_period_end?: number } | undefined;
  const subAny = sub as unknown as { current_period_end?: number };
  const periodEnd = unixToIso(itemAny?.current_period_end ?? subAny.current_period_end);
  const trialEnd = unixToIso(sub.trial_end);

  const resolvedPlan = await resolveWebhookPlan(supabaseAdmin, {
    planSku: sub.metadata?.planSku ?? null,
    priceId: firstItem?.price?.id ?? null,
    tier: sub.metadata?.tier ?? null,
  });

  if (
    eventType === "customer.subscription.deleted" &&
    !existingSub?.stripe_subscription_id &&
    !resolvedPlan.planType
  ) {
    return { userId, customerId, subscriptionId, outcome: "ignored_unlinked_subscription_delete" };
  }

  const isRevoked =
    eventType === "customer.subscription.deleted" || REVOKING_SUBSCRIPTION_STATUSES.has(sub.status);

  if (isRevoked) {
    const freePlanId = await resolveFreePlanId(supabaseAdmin);
    await syncSubscriptionRow(supabaseAdmin, {
      userId,
      activePlan: "FREE",
      status: eventType === "customer.subscription.deleted" ? "canceled" : sub.status,
      planId: freePlanId,
      customerId,
      subscriptionId,
      currentPeriodEnd: periodEnd,
      trialEnd,
    });
    await syncPersonalLicenseRow(supabaseAdmin, {
      userId,
      planType: "FREE",
      planId: freePlanId,
      planSku: "SPOT-FREE-STD",
      customerId,
      subscriptionId,
      validUntil: periodEnd,
      trialEndsAt: trialEnd,
      eventId,
    });
    await syncUserProductLicenseRow(supabaseAdmin, { userId, active: false });
    return { userId, customerId, subscriptionId, outcome: `${eventType}:revoked` };
  }

  const fallbackActivePlan: ValidLicensePlanType =
    existingSub?.active_plan && isValidLicensePlanType(existingSub.active_plan)
      ? existingSub.active_plan
      : "FREE";
  const nextPlanType = resolvedPlan.planType ?? fallbackActivePlan;
  const nextPlanId = resolvedPlan.planId ?? existingSub?.plan_id ?? null;

  await syncSubscriptionRow(supabaseAdmin, {
    userId,
    activePlan: nextPlanType,
    status: sub.status,
    planId: nextPlanId,
    customerId,
    subscriptionId,
    currentPeriodEnd: periodEnd,
    trialEnd,
  });

  await syncPersonalLicenseRow(supabaseAdmin, {
    userId,
    planType: nextPlanType,
    planId: nextPlanId,
    planSku: resolvedPlan.planSku,
    customerId,
    subscriptionId,
    validUntil: periodEnd,
    trialEndsAt: trialEnd,
    eventId,
  });

  if (sub.status === "active" || sub.status === "trialing") {
    await syncUserProductLicenseRow(supabaseAdmin, { userId, active: true });
  }

  return { userId, customerId, subscriptionId, outcome: `${eventType}:${sub.status}` };
}

export async function handleInvoicePaymentFailed(
  supabaseAdmin: SupabaseClient,
  invoice: Stripe.Invoice,
): Promise<WebhookEventOutcome> {
  const customerId = asStringId(invoice.customer);
  const invAny = invoice as unknown as {
    subscription?: string | { id: string } | null;
    parent?: {
      subscription_details?: {
        subscription?: string | { id: string } | null;
        metadata?: Record<string, string> | null;
      } | null;
    } | null;
    lines?: { data?: Array<{ metadata?: Record<string, string> | null }> };
  };
  const subscriptionId = asStringId(
    invAny.parent?.subscription_details?.subscription ?? invAny.subscription,
  );
  const line0 = invAny.lines?.data?.[0];
  const metaUserId =
    invAny.parent?.subscription_details?.metadata?.userId ?? line0?.metadata?.userId ?? null;
  const userId = await resolveUserIdByCustomer(supabaseAdmin, customerId, metaUserId);

  if (!userId) {
    return { userId: null, customerId, subscriptionId, outcome: "unmapped_customer" };
  }

  const { data: currentSub, error: currentSubErr } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_subscription_id, active_plan, plan_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (currentSubErr) {
    throw new Error(`Failed to inspect subscription for invoice failure: ${currentSubErr.message}`);
  }

  const existingSub = currentSub as {
    stripe_subscription_id?: string | null;
    active_plan?: string | null;
    plan_id?: string | null;
  } | null;

  if (
    subscriptionId &&
    existingSub?.stripe_subscription_id &&
    existingSub.stripe_subscription_id !== subscriptionId
  ) {
    return { userId, customerId, subscriptionId, outcome: "ignored_non_primary_subscription" };
  }

  const activePlan: ValidLicensePlanType =
    existingSub?.active_plan && isValidLicensePlanType(existingSub.active_plan)
      ? existingSub.active_plan
      : "FREE";

  await syncSubscriptionRow(supabaseAdmin, {
    userId,
    activePlan,
    status: "past_due",
    planId: existingSub?.plan_id ?? null,
    customerId,
    subscriptionId,
  });

  return { userId, customerId, subscriptionId, outcome: "past_due" };
}
