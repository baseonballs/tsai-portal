import { NextRequest } from "next/server";

import { createPortalAdminClient } from "@/lib/auth/portal-entitlement";
import {
  getStripe,
  isActiveSubscriptionRecord,
  jsonNoStore,
  MissingSecretError,
} from "@/lib/billing/stripe-client";
import {
  hasLiveActiveStripeSubscription,
  prepareCheckoutSessionCreation,
  resolveOrCreateCheckoutCustomerId,
} from "@/lib/billing/stripe-checkout-guard";
import { resolveBillingOrigin } from "@/lib/billing/stripe-origin";
import {
  derivePlanType,
  fetchActiveCheckoutPlan,
  isCheckoutPlanSku,
  resolvePublicCheckoutPlans,
  resolveStripePriceId,
} from "@/lib/billing/stripe-plans";
import { errorMessage } from "@/lib/errors";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    const authenticated = Boolean(user && !authError);

    const adminClient = createPortalAdminClient();
    const { checkoutConfigured, plans } = await resolvePublicCheckoutPlans(adminClient);

    let activePlan: string | null = null;
    let subscriptionStatus: string | null = null;
    let hasActiveSubscription = false;
    if (authenticated && user) {
      const { data: subRow, error: subError } = await adminClient
        .from("subscriptions")
        .select("active_plan, status, stripe_subscription_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subError) {
        console.error("[StripeCheckout GET] Subscription lookup failed:", subError.message);
        return jsonNoStore({ error: "Billing status is currently unavailable." }, 503);
      }
      const subRecord = subRow as {
        active_plan?: string | null;
        status?: string | null;
        stripe_subscription_id?: string | null;
      } | null;
      activePlan = subRecord?.active_plan ?? null;
      subscriptionStatus = subRecord?.status ?? null;
      hasActiveSubscription = isActiveSubscriptionRecord(subRecord);
    }

    return jsonNoStore({
      authenticated,
      checkoutConfigured,
      activePlan,
      subscriptionStatus,
      hasActiveSubscription,
      plans,
    });
  } catch (err) {
    console.error("[StripeCheckout GET] Failed:", errorMessage(err));
    return jsonNoStore({ error: "Billing catalog is currently unavailable." }, 503);
  }
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

    const body = await req.json().catch(() => null);
    const planSku =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as { planSku?: unknown }).planSku
        : undefined;

    if (!isCheckoutPlanSku(planSku)) {
      return jsonNoStore({ error: "Invalid planSku requested." }, 400);
    }

    const stripe = getStripe();
    const adminClient = createPortalAdminClient();
    const planRow = await fetchActiveCheckoutPlan(adminClient, planSku);
    if (!planRow) {
      return jsonNoStore({ error: "Selected plan is currently unavailable." }, 503);
    }

    const priceId = resolveStripePriceId(planSku, planRow.stripe_price_id);
    if (!priceId) {
      return jsonNoStore(
        { error: "Stripe checkout is not yet configured for this plan." },
        503,
      );
    }

    const tier = derivePlanType(planRow);

    const [
      { data: profileRow, error: profileErr },
      { data: customerRow, error: custErr },
      { data: subRow, error: subErr },
    ] = await Promise.all([
      adminClient.from("profiles").select("id").eq("id", user.id).maybeSingle(),
      adminClient
        .from("stripe_customers")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      adminClient
        .from("subscriptions")
        .select("stripe_customer_id, stripe_subscription_id, status, active_plan")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (profileErr || custErr || subErr) {
      console.error(
        "[StripeCheckout POST] Account billing lookup failed:",
        profileErr?.message ?? custErr?.message ?? subErr?.message,
      );
      return jsonNoStore({ error: "Billing service is temporarily unavailable." }, 503);
    }

    if (!(profileRow as { id?: string } | null)?.id) {
      return jsonNoStore({ error: "Account profile is not initialized." }, 409);
    }

    const subRecord = subRow as {
      stripe_customer_id?: string | null;
      stripe_subscription_id?: string | null;
      status?: string | null;
      active_plan?: string | null;
    } | null;

    if (isActiveSubscriptionRecord(subRecord)) {
      return jsonNoStore(
        { error: "An active subscription already exists on this account. Manage your plan in the Billing Portal." },
        409,
      );
    }

    const existingDbCustomerId =
      (customerRow as { stripe_customer_id?: string | null } | null)?.stripe_customer_id ??
      subRecord?.stripe_customer_id ??
      null;

    // Resolve or create Stripe customer idempotently first so even first-time buyers
    // share open-session reuse, expiry, and deterministic non-wall-clock idempotency.
    let customerId: string;
    try {
      customerId = await resolveOrCreateCheckoutCustomerId({
        stripe,
        adminClient,
        userId: user.id,
        email: user.email,
        existingDbCustomerId,
      });
    } catch (stripeCustErr) {
      console.error(
        "[StripeCheckout POST] Stripe customer resolution failed:",
        errorMessage(stripeCustErr),
      );
      return jsonNoStore({ error: "Billing service is temporarily unavailable." }, 502);
    }

    let hasLiveActiveSub: boolean;
    try {
      hasLiveActiveSub = await hasLiveActiveStripeSubscription(stripe, customerId);
    } catch (stripeListErr) {
      console.error(
        "[StripeCheckout POST] Live subscription lookup failed:",
        errorMessage(stripeListErr),
      );
      return jsonNoStore({ error: "Billing service is temporarily unavailable." }, 502);
    }

    if (hasLiveActiveSub) {
      return jsonNoStore(
        {
          error:
            "An active or pending subscription already exists on this account. Manage your plan in the Billing Portal.",
        },
        409,
      );
    }

    let sessionPrep;
    try {
      sessionPrep = await prepareCheckoutSessionCreation({
        stripe,
        customerId,
        userId: user.id,
        planSku: planRow.sku,
      });
    } catch (prepErr) {
      console.error(
        "[StripeCheckout POST] Open session guard failed:",
        errorMessage(prepErr),
      );
      return jsonNoStore({ error: "Billing service is temporarily unavailable." }, 502);
    }

    if (sessionPrep.action === "reuse") {
      return jsonNoStore({ url: sessionPrep.url });
    }
    if (sessionPrep.action === "conflict") {
      return jsonNoStore(
        {
          error:
            "An active or pending subscription already exists on this account. Manage your plan in the Billing Portal.",
        },
        409,
      );
    }

    const origin = resolveBillingOrigin(req);
    let session: { url?: string | null };
    try {
      session = await stripe.checkout.sessions.create(
        {
          mode: "subscription",
          customer: customerId,
          line_items: [{ price: priceId, quantity: 1 }],
          client_reference_id: user.id,
          metadata: {
            userId: user.id,
            planSku: planRow.sku,
            tier,
          },
          subscription_data: {
            metadata: {
              userId: user.id,
              planSku: planRow.sku,
              tier,
            },
          },
          success_url: `${origin}/pricing?checkout=success`,
          cancel_url: `${origin}/pricing?checkout=canceled`,
        },
        { idempotencyKey: sessionPrep.idempotencyKey },
      );
    } catch (stripeSessionErr) {
      console.error(
        "[StripeCheckout POST] Checkout session creation failed:",
        errorMessage(stripeSessionErr),
      );
      return jsonNoStore({ error: "Failed to initialize checkout." }, 502);
    }

    if (!session.url) {
      return jsonNoStore({ error: "Checkout session could not be initialized." }, 502);
    }

    return jsonNoStore({ url: session.url });
  } catch (err) {
    if (err instanceof MissingSecretError) {
      return jsonNoStore({ error: "Stripe checkout is not yet configured on this server." }, 503);
    }
    console.error("[StripeCheckout POST] Failed:", errorMessage(err));
    return jsonNoStore({ error: "Failed to initialize checkout." }, 500);
  }
}
