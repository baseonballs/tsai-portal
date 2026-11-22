import { NextRequest } from "next/server";

import { createPortalAdminClient } from "@/lib/auth/portal-entitlement";
import { getStripe, jsonNoStore, MissingSecretError } from "@/lib/billing/stripe-client";
import { resolveBillingReturnUrl } from "@/lib/billing/stripe-origin";
import { errorMessage } from "@/lib/errors";
import { createClient as createServerClient } from "@/utils/supabase/server";

async function parsePortalBody(
  req: NextRequest,
): Promise<{ ok: true; returnPath?: unknown; return_url?: unknown } | { ok: false; error: string }> {
  const rawBody = await req.text().catch(() => "");
  if (rawBody.trim() === "") {
    return { ok: true };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { ok: false, error: "Invalid JSON request body." };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const obj = parsed as { returnPath?: unknown; return_url?: unknown };
  return { ok: true, returnPath: obj.returnPath, return_url: obj.return_url };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonNoStore({ error: "Authentication required." }, 401);
    }

    const parsedBody = await parsePortalBody(req);
    if (!parsedBody.ok) {
      return jsonNoStore({ error: parsedBody.error }, 400);
    }

    const returnTarget = resolveBillingReturnUrl(req, {
      returnPath: parsedBody.returnPath,
      return_url: parsedBody.return_url,
    });
    if (!returnTarget.ok) {
      return jsonNoStore({ error: returnTarget.error }, 400);
    }

    const stripe = getStripe();
    const adminClient = createPortalAdminClient();
    const [customerRes, subscriptionRes] = await Promise.all([
      adminClient
        .from("stripe_customers")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      adminClient
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (customerRes.error) {
      console.error("[StripePortal POST] Customer lookup failed:", customerRes.error.message);
      return jsonNoStore({ error: "Billing service is temporarily unavailable." }, 503);
    }

    const customerFromBinding = (customerRes.data as { stripe_customer_id?: string | null } | null)
      ?.stripe_customer_id?.trim();
    if (!customerFromBinding && subscriptionRes.error) {
      console.error(
        "[StripePortal POST] Subscription customer lookup failed:",
        subscriptionRes.error.message,
      );
      return jsonNoStore({ error: "Billing service is temporarily unavailable." }, 503);
    }

    const customerFromSub = (subscriptionRes.data as { stripe_customer_id?: string | null } | null)
      ?.stripe_customer_id?.trim();
    const stripeCustomerId = customerFromBinding || customerFromSub;
    if (!stripeCustomerId) {
      return jsonNoStore(
        { error: "No Stripe billing customer record exists for this account yet." },
        404,
      );
    }

    let portalSession: { url?: string | null };
    try {
      portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnTarget.url,
      });
    } catch (stripeErr) {
      console.error(
        "[StripePortal POST] Billing portal session creation failed:",
        errorMessage(stripeErr),
      );
      return jsonNoStore({ error: "Unable to open Stripe billing portal right now." }, 502);
    }

    if (!portalSession?.url) {
      return jsonNoStore({ error: "Billing portal session could not be initialized." }, 502);
    }

    return jsonNoStore({ url: portalSession.url });
  } catch (err) {
    if (err instanceof MissingSecretError) {
      return jsonNoStore({ error: "Stripe billing portal is not yet configured on this server." }, 503);
    }
    console.error("[StripePortal POST] Failed:", errorMessage(err));
    return jsonNoStore({ error: "Failed to initialize Stripe billing portal." }, 500);
  }
}
