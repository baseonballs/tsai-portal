import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import {
  isValidLicensePlanType,
  resolveFreePlanId,
  resolveWebhookPlan,
  type ValidLicensePlanType,
} from "@/lib/billing/stripe-plans";
import { isStaleOutOfOrderEvent } from "@/lib/billing/stripe-webhook-claim";
import {
  applyStripeEntitlements,
  asStringId,
  bindStripeCustomer,
  resolveUserIdByCustomer,
  syncSubscriptionRow,
  unixToIso,
} from "@/lib/billing/stripe-webhook-sync";

const REVOKING_SUBSCRIPTION_STATUSES = new Set([
  "canceled",
  "unpaid",
  "incomplete_expired",
  "paused",
]);

export interface WebhookEventContext {
  eventId: string;
  eventCreatedAt: string;
  stripe?: Stripe;
}

export interface WebhookEventOutcome {
  userId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  outcome: string;
}

export async function handleCheckoutCompleted(
  supabaseAdmin: SupabaseClient,
  session: Stripe.Checkout.Session,
  ctx: WebhookEventContext,
): Promise<WebhookEventOutcome> {
  const customerId = asStringId(session.customer);
  const subscriptionId = asStringId(session.subscription);
  const metaUserId = session.metadata?.userId ?? session.client_reference_id ?? null;
  const userId = await resolveUserIdByCustomer(supabaseAdmin, customerId, metaUserId);

  if (userId && customerId) {
    await bindStripeCustomer(supabaseAdmin, userId, customerId, ctx.eventId);
  }
  if (session.payment_status === "unpaid") {
    return { userId, customerId, subscriptionId, outcome: "awaiting_payment" };
  }

  const resolvedPlan = await resolveWebhookPlan(supabaseAdmin, {
    planSku: session.metadata?.planSku ?? null,
    tier: session.metadata?.tier ?? null,
  });

  if (!userId || !resolvedPlan.planType) {
    return { userId, customerId, subscriptionId, outcome: "missing_metadata" };
  }

  const stale = await isStaleOutOfOrderEvent(supabaseAdmin, {
    eventId: ctx.eventId,
    eventCreatedAt: ctx.eventCreatedAt,
    subscriptionId,
    userId,
    checkStripeCanonical: true,
    stripe: ctx.stripe,
  });
  if (stale) {
    return { userId, customerId, subscriptionId, outcome: "stale_out_of_order_event" };
  }

  await applyStripeEntitlements(supabaseAdmin, {
    userId,
    planType: resolvedPlan.planType,
    planId: resolvedPlan.planId,
    planSku: resolvedPlan.planSku,
    subStatus: "active",
    customerId,
    subscriptionId,
    validFrom: ctx.eventCreatedAt,
    periodEnd: null,
    trialEnd: null,
    eventId: ctx.eventId,
    grantProductLicense: true,
  });

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
  ctx: WebhookEventContext,
): Promise<WebhookEventOutcome> {
  const customerId = asStringId(sub.customer);
  const subscriptionId = sub.id;
  const userId = await resolveUserIdByCustomer(
    supabaseAdmin,
    customerId,
    sub.metadata?.userId ?? null,
  );

  if (userId && customerId) {
    await bindStripeCustomer(supabaseAdmin, userId, customerId, ctx.eventId);
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
  const itemAny = firstItem as unknown as { current_period_end?: number; current_period_start?: number } | undefined;
  const subAny = sub as unknown as { current_period_end?: number; current_period_start?: number; start_date?: number };
  const licenseValidFrom =
    unixToIso(subAny.start_date ?? itemAny?.current_period_start ?? subAny.current_period_start) ?? ctx.eventCreatedAt;
  const periodEnd = unixToIso(itemAny?.current_period_end ?? subAny.current_period_end);
  const trialEnd = unixToIso(sub.trial_end);

  const resolvedPlan = await resolveWebhookPlan(supabaseAdmin, {
    priceId: firstItem?.price?.id ?? null,
    planSku: sub.metadata?.planSku ?? null,
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

  const stale = await isStaleOutOfOrderEvent(supabaseAdmin, {
    eventId: ctx.eventId,
    eventCreatedAt: ctx.eventCreatedAt,
    subscriptionId,
    userId,
    checkStripeCanonical: !isRevoked,
    stripe: ctx.stripe,
  });
  if (stale) {
    return { userId, customerId, subscriptionId, outcome: "stale_out_of_order_event" };
  }

  if (isRevoked) {
    const freePlanId = await resolveFreePlanId(supabaseAdmin);
    await applyStripeEntitlements(supabaseAdmin, {
      userId,
      planType: "FREE",
      planId: freePlanId,
      planSku: "SPOT-FREE-STD",
      subStatus: eventType === "customer.subscription.deleted" ? "canceled" : sub.status,
      customerId,
      subscriptionId,
      validFrom: null,
      periodEnd,
      trialEnd,
      eventId: ctx.eventId,
      grantProductLicense: false,
    });
    return { userId, customerId, subscriptionId, outcome: `${eventType}:revoked` };
  }

  const fallbackActivePlan: ValidLicensePlanType =
    existingSub?.active_plan && isValidLicensePlanType(existingSub.active_plan)
      ? existingSub.active_plan
      : "FREE";

  await applyStripeEntitlements(supabaseAdmin, {
    userId,
    planType: resolvedPlan.planType ?? fallbackActivePlan,
    planId: resolvedPlan.planId ?? existingSub?.plan_id ?? null,
    planSku: resolvedPlan.planSku,
    subStatus: sub.status,
    customerId,
    subscriptionId,
    validFrom: licenseValidFrom,
    periodEnd,
    trialEnd,
    eventId: ctx.eventId,
    grantProductLicense: sub.status === "active" || sub.status === "trialing" ? true : null,
  });
  return { userId, customerId, subscriptionId, outcome: `${eventType}:${sub.status}` };
}

export async function handleInvoicePaymentFailed(
  supabaseAdmin: SupabaseClient,
  invoice: Stripe.Invoice,
  ctx: WebhookEventContext,
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
  const metaUserId =
    invAny.parent?.subscription_details?.metadata?.userId ?? invAny.lines?.data?.[0]?.metadata?.userId ?? null;
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

  if (subscriptionId && existingSub?.stripe_subscription_id && existingSub.stripe_subscription_id !== subscriptionId) {
    return { userId, customerId, subscriptionId, outcome: "ignored_non_primary_subscription" };
  }

  const stale = await isStaleOutOfOrderEvent(supabaseAdmin, {
    eventId: ctx.eventId,
    eventCreatedAt: ctx.eventCreatedAt,
    subscriptionId,
    userId,
    checkStripeCanonical: true,
    stripe: ctx.stripe,
  });
  if (stale) {
    return { userId, customerId, subscriptionId, outcome: "stale_out_of_order_event" };
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
