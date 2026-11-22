import { NextRequest } from "next/server";

import { createPortalAdminClient } from "@/lib/auth/portal-entitlement";
import {
  getStripe,
  isActiveSubscriptionRecord,
  jsonNoStore,
  MissingSecretError,
} from "@/lib/billing/stripe-client";
import {
  derivePlanType,
  fetchActiveCheckoutPlan,
  isCheckoutPlanSku,
  resolvePublicCheckoutPlans,
  resolveStripePriceId,
} from "@/lib/billing/stripe-plans";
import { errorMessage } from "@/lib/errors";
import { OFFICIAL_HOST } from "@/lib/legacy-host-redirect";
import { createClient as createServerClient } from "@/utils/supabase/server";

const OFFICIAL_ORIGIN = `https://${OFFICIAL_HOST}`;
const TRANSCEND_APEX_ORIGIN = "https://transcendental-sports.ai";

function buildAllowedOrigins(): Set<string> {
  const allowed = new Set<string>([OFFICIAL_ORIGIN, TRANSCEND_APEX_ORIGIN]);
  for (const raw of [process.env.PORTAL_PUBLIC_ORIGIN, process.env.NEXT_PUBLIC_SITE_URL]) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "https:") {
        allowed.add(parsed.origin);
      }
    } catch {
      // Ignore malformed configured origin values.
    }
  }
  return allowed;
}

function isAllowedLoopbackOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const parsed = new URL(origin);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

function resolveCheckoutOrigin(req: NextRequest): string {
  const allowed = buildAllowedOrigins();
  const candidates: string[] = [req.nextUrl.origin];

  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (forwardedHost && /^[a-z0-9.-]+(?::\d+)?$/i.test(forwardedHost)) {
    const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "http" ? "http" : "https";
    candidates.push(`${proto}://${forwardedHost}`);
  }

  for (const candidate of candidates) {
    if (allowed.has(candidate) || isAllowedLoopbackOrigin(candidate)) {
      return candidate;
    }
  }
  return OFFICIAL_ORIGIN;
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
      hasActiveSubscription = isActiveSubscriptionRecord(subRecord);
    }

    return jsonNoStore({
      authenticated,
      checkoutConfigured,
      activePlan,
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
      return jsonNoStore({ error: "An active subscription already exists on this account." }, 409);
    }

    const existingCustomerId =
      (customerRow as { stripe_customer_id?: string | null } | null)?.stripe_customer_id ??
      subRecord?.stripe_customer_id ??
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
