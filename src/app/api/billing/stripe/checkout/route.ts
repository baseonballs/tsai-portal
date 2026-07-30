import { NextResponse } from "next/server";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key", {
  apiVersion: "2024-06-20" as any,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { priceId, tier = "TIER_TEAM_24_SEATS", userEmail } = body;

    const portalOrigin = request.headers.get("origin") || "https://portal.tsai.app";

    // Create Stripe Checkout Session for Team / Family / Pro subscriptions
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId || "price_team_24seats_monthly",
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: userEmail,
      metadata: {
        subscription_tier: tier,
        seat_limit: "24",
      },
      success_url: `${portalOrigin}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${portalOrigin}/pricing?canceled=true`,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err: any) {
    console.error("[Stripe Checkout API] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create Stripe checkout session" },
      { status: 500 }
    );
  }
}
