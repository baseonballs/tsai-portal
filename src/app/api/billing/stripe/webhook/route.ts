import { NextRequest } from "next/server";
import type Stripe from "stripe";

import { createPortalAdminClient } from "@/lib/auth/portal-entitlement";
import {
  getStripe,
  jsonNoStore,
  MissingSecretError,
  requiredSecret,
} from "@/lib/billing/stripe-client";
import { processStripeWebhookEvent } from "@/lib/billing/stripe-webhook";
import { errorMessage } from "@/lib/errors";

export async function POST(req: NextRequest) {
  let webhookSecret: string;
  let stripe: Stripe;
  try {
    webhookSecret = requiredSecret("STRIPE_WEBHOOK_SECRET");
    stripe = getStripe();
  } catch (err) {
    if (err instanceof MissingSecretError) {
      return jsonNoStore({ error: err.message }, 503);
    }
    return jsonNoStore({ error: "Stripe webhook configuration error." }, 503);
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return jsonNoStore({ error: "Missing stripe-signature header." }, 400);
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return jsonNoStore({ error: `Webhook Error: ${errorMessage(err)}` }, 400);
  }

  try {
    const supabaseAdmin = createPortalAdminClient();
    const result = await processStripeWebhookEvent(supabaseAdmin, event, stripe);
    return jsonNoStore(result.body, result.status);
  } catch (err) {
    console.error("[StripeWebhook POST] Failed:", errorMessage(err));
    return jsonNoStore({ error: errorMessage(err) || "Stripe webhook processing failed." }, 500);
  }
}
