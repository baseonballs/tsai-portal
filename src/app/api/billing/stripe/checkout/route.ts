import { NextRequest } from "next/server";

import { createPortalAdminClient } from "@/lib/auth/portal-entitlement";
import { getStripe, jsonNoStore, MissingSecretError } from "@/lib/billing/stripe-client";
import {
  derivePlanType,
  fetchActiveCheckoutPlan,
  isCheckoutPlanSku,
  resolvePublicCheckoutPlans,
  resolveStripePriceId,
} from "@/lib/billing/stripe-plans";
import { errorMessage } from "@/lib/errors";
import { createClient as createServerClient } from "@/utils/supabase/server";

function resolveCheckoutOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (
    forwardedHost &&
    /^[a-z0-9.-]+(?::\d+)?$/i.test(forwardedHost) &&
    !forwardedHost.startsWith("0.0.0.0")
  ) {
    const proto = forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : "https";
    return `${proto}://${forwardedHost}`;
  }
  const reqOrigin = req.nextUrl.origin;
  if (reqOrigin && !reqOrigin.includes("0.0.0.0")) {
    return reqOrigin;
  }
  return "https://transcendental-sports.ai";
}

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
    if (authenticated && user) {
      const { data: subRow, error: subError } = await adminClient
        .from("subscriptions")
        .select("active_plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subError) {
        return jsonNoStore(
          { error: `Failed to inspect caller subscription: ${subError.message}` },
          503,
        );
      }
      activePlan = (subRow as { active_plan?: string | null } | null)?.active_plan ?? null;
    }

    return jsonNoStore({
      authenticated,
      checkoutConfigured,
      activePlan,
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
      return jsonNoStore({ error: `Plan ${planSku} is not active or missing in catalog.` }, 503);
    }

    const priceId = resolveStripePriceId(planSku, planRow.stripe_price_id);
    if (!priceId) {
      return jsonNoStore(
        { error: `Stripe checkout price is not configured for ${planSku}.` },
        503,
      );
    }

    const tier = derivePlanType(planRow);

    const [{ data: customerRow, error: custErr }, { data: subRow, error: subErr }] = await Promise.all([
      adminClient
        .from("stripe_customers")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      adminClient
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .not("stripe_customer_id", "is", null)
        .maybeSingle(),
    ]);

    if (custErr || subErr) {
      const msg = custErr?.message ?? subErr?.message ?? "Customer lookup failed";
      return jsonNoStore({ error: `Failed to resolve Stripe customer: ${msg}` }, 503);
    }

    const existingCustomerId =
      (customerRow as { stripe_customer_id?: string | null } | null)?.stripe_customer_id ??
      (subRow as { stripe_customer_id?: string | null } | null)?.stripe_customer_id ??
      null;

    const origin = resolveCheckoutOrigin(req);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
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
      ...(existingCustomerId
        ? { customer: existingCustomerId }
        : user.email
          ? { customer_email: user.email }
          : {}),
    });

    if (!session.url) {
      return jsonNoStore({ error: "Stripe did not return a checkout session URL." }, 502);
    }

    return jsonNoStore({ url: session.url });
  } catch (err) {
    if (err instanceof MissingSecretError) {
      return jsonNoStore({ error: err.message }, 503);
    }
    console.error("[StripeCheckout POST] Failed:", errorMessage(err));
    return jsonNoStore({ error: errorMessage(err) || "Failed to initialize checkout." }, 500);
  }
}
