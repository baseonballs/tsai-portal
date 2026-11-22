import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import { claimStripeWebhookEvent, recordWebhookStatus } from "@/lib/billing/stripe-webhook-claim";
import {
  handleCheckoutCompleted,
  handleInvoicePaymentFailed,
  handleSubscriptionLifecycle,
} from "@/lib/billing/stripe-webhook-handlers";

export { handleCheckoutCompleted, handleInvoicePaymentFailed, handleSubscriptionLifecycle };

export async function processStripeWebhookEvent(
  supabaseAdmin: SupabaseClient,
  event: Stripe.Event,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const claim = await claimStripeWebhookEvent(supabaseAdmin, event);
  if (claim.action === "deduplicated") {
    return { status: 200, body: { received: true, deduplicated: true } };
  }
  if (claim.action === "inProgress") {
    return { status: 200, body: { received: true, inProgress: true } };
  }
  if (claim.action === "error") {
    return { status: claim.status, body: { error: claim.message } };
  }

  try {
    if (event.type === "checkout.session.completed") {
      const res = await handleCheckoutCompleted(
        supabaseAdmin,
        event.data.object as Stripe.Checkout.Session,
        event.id,
      );
      const status = res.outcome === "missing_metadata" ? "ignored" : "applied";
      await recordWebhookStatus(supabaseAdmin, event.id, status, {
        ...res,
        result: { outcome: res.outcome },
      });
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const res = await handleSubscriptionLifecycle(
        supabaseAdmin,
        event.data.object as Stripe.Subscription,
        event.type,
        event.id,
      );
      const ignored =
        res.outcome === "unmapped_customer" ||
        res.outcome === "ignored_non_primary_subscription" ||
        res.outcome === "ignored_unlinked_subscription_delete";
      await recordWebhookStatus(supabaseAdmin, event.id, ignored ? "ignored" : "applied", {
        ...res,
        result: { outcome: res.outcome },
      });
    } else if (event.type === "invoice.payment_failed") {
      const res = await handleInvoicePaymentFailed(
        supabaseAdmin,
        event.data.object as Stripe.Invoice,
      );
      const ignored =
        res.outcome === "unmapped_customer" ||
        res.outcome === "ignored_non_primary_subscription";
      await recordWebhookStatus(supabaseAdmin, event.id, ignored ? "ignored" : "applied", {
        ...res,
        result: { outcome: res.outcome },
      });
    } else {
      await recordWebhookStatus(supabaseAdmin, event.id, "ignored", {
        result: { outcome: "unhandled_event_type" },
      });
    }
    return { status: 200, body: { received: true } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process Stripe webhook";
    try {
      await recordWebhookStatus(supabaseAdmin, event.id, "failed", { error: message });
    } catch (recordErr) {
      console.error("[StripeWebhook] Failed to record failed status:", recordErr);
    }
    return { status: 500, body: { error: message } };
  }
}
