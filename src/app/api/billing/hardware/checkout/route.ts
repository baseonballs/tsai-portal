import { required } from "@/utils/require-env";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import { errorMessage } from "@/lib/errors";
import { HARDWARE_RIG_KIT_PRICE_CENTS } from "@/lib/commercial/club-revenue-calculator";

function stripeClient(): Stripe {
  return new Stripe(required(process.env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY"), {
    apiVersion: "2024-06-20" as any,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clubId, userEmail, quantity = 1, sheetIdentifier = "Sheet 1 (Main Arena)" } = body;

    const portalOrigin = request.headers.get("origin") || "https://portal.tsai.app";

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("mock") || process.env.STRIPE_SECRET_KEY.includes("dummy")) {
      const simulatedSessionId = `cs_hardware_sim_${Date.now()}`;
      return NextResponse.json({
        sessionId: simulatedSessionId,
        url: `${portalOrigin}/commercial?hardware_checkout_success=true&session_id=${simulatedSessionId}`,
        isSimulation: true,
      });
    }

    const stripe = stripeClient();

    // Create Checkout Session for Turnkey Arena Hardware Rig Kit ($78.99)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Transcend Vision Turnkey Arena Rig Kit (Itemized $78.99 BOM)",
              description:
                "Dual 4.5\" Vacuum Suction Mount (180 lbs pull force), CNC 360° Ball-Head, Anti-Vibration MagSafe Cradle, 100W USB-C Cable, Neoprene Cold-Shield, Optical Prep Wipes & Quick-Start Card.",
              images: ["https://portal.tsai.app/images/turnkey-arena-rig-kit.png"],
            },
            unit_amount: HARDWARE_RIG_KIT_PRICE_CENTS,
          },
          quantity: Math.max(1, quantity),
        },
      ],
      mode: "payment",
      customer_email: userEmail,
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      metadata: {
        item_sku: "TSAI-RIG-KIT-7899",
        club_id: clubId || "independent_director",
        sheet_target: sheetIdentifier,
        fulfillment_status: "AWAITING_SHIPPING",
      },
      success_url: `${portalOrigin}/commercial?hardware_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${portalOrigin}/commercial?canceled=true`,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      isSimulation: false,
    });
  } catch (err) {
    console.error("[Hardware Checkout API] Error:", err);
    return NextResponse.json(
      { error: errorMessage(err) || "Failed to create hardware checkout session" },
      { status: 500 }
    );
  }
}
