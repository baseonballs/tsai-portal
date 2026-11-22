import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import {
  claimStripeWebhookEvent,
  eventCreatedIso,
  recordWebhookStatus,
} from "@/lib/billing/stripe-webhook-claim";
import {
  handleCheckoutCompleted,
  handleInvoicePaymentFailed,
  handleSubscriptionLifecycle,
} from "@/lib/billing/stripe-webhook-handlers";

export { handleCheckoutCompleted, handleInvoicePaymentFailed, handleSubscriptionLifecycle };

const IGNORED_OUTCOMES = new Set([
  "missing_metadata",
  "awaiting_payment",
  "stale_out_of_order_event",
  "unmapped_customer",
  "ignored_non_primary_subscription",
  "ignored_unlinked_subscription_delete",
]);

export async function processStripeWebhookEvent(
  supabaseAdmin: SupabaseClient,
  event: Stripe.Event,
  stripe?: Stripe,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const claim = await claimStripeWebhookEvent(supabaseAdmin, event);
  if (claim.action === "deduplicated") {
    return { status: 200, body: { received: true, deduplicated: true } };
  }
  if (claim.action === "inProgress") {
    return { status: 409, body: { received: false, inProgress: true } };
  }
  if (claim.action === "error") {
    return { status: claim.status, body: { error: claim.message } };
  }

  const ctx = {
    eventId: event.id,
    eventCreatedAt: eventCreatedIso(event),
    stripe,
  };

  try {
    let recorded = false;
    if (event.type === "checkout.session.completed") {
      const res = await handleCheckoutCompleted(
        supabaseAdmin,
        event.data.object as Stripe.Checkout.Session,
        ctx,
      );
      const status = IGNORED_OUTCOMES.has(res.outcome) ? "ignored" : "applied";
      recorded = await recordWebhookStatus(supabaseAdmin, event.id, status, {
        ...res,
        result: { outcome: res.outcome },
        claimReceivedAt: claim.claimReceivedAt,
      });
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const res = await handleSubscriptionLifecycle(
        supabaseAdmin,
        event.data.object as Stripe.Subscription,
        event.type,
        ctx,
      );
      const status = IGNORED_OUTCOMES.has(res.outcome) ? "ignored" : "applied";
      recorded = await recordWebhookStatus(supabaseAdmin, event.id, status, {
        ...res,
        result: { outcome: res.outcome },
        claimReceivedAt: claim.claimReceivedAt,
      });
    } else if (event.type === "invoice.payment_failed") {
      const res = await handleInvoicePaymentFailed(
        supabaseAdmin,
        event.data.object as Stripe.Invoice,
        ctx,
      );
      const status = IGNORED_OUTCOMES.has(res.outcome) ? "ignored" : "applied";
      recorded = await recordWebhookStatus(supabaseAdmin, event.id, status, {
        ...res,
        result: { outcome: res.outcome },
        claimReceivedAt: claim.claimReceivedAt,
      });
    } else {
      recorded = await recordWebhookStatus(supabaseAdmin, event.id, "ignored", {
        result: { outcome: "unhandled_event_type" },
        claimReceivedAt: claim.claimReceivedAt,
      });
    }

    if (!recorded) {
      return { status: 409, body: { received: false, inProgress: true } };
    }
    return { status: 200, body: { received: true } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process Stripe webhook";
    try {
      await recordWebhookStatus(supabaseAdmin, event.id, "failed", {
        error: message,
        claimReceivedAt: claim.claimReceivedAt,
      });
    } catch (recordErr) {
      console.error("[StripeWebhook] Failed to record failed status:", recordErr);
    }
    return { status: 500, body: { error: message } };
  }
}
