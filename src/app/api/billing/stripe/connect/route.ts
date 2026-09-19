import { required } from "@/utils/require-env";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import { errorMessage } from "@/lib/errors";

function stripeClient(): Stripe {
  return new Stripe(required(process.env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY"), {
    apiVersion: "2024-06-20" as any,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clubId, clubName, contactEmail } = body;

    if (!clubId || !contactEmail) {
      return NextResponse.json(
        { error: "clubId and contactEmail are required parameters." },
        { status: 400 }
      );
    }

    const portalOrigin = request.headers.get("origin") || "https://portal.tsai.app";

    // In local development or testing without live Stripe keys, provide simulated onboarding URL
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("mock") || process.env.STRIPE_SECRET_KEY.includes("dummy")) {
      const simulatedAccountId = `acct_sim_${clubId}`;
      const simulatedUrl = `${portalOrigin}/commercial?connect_onboarding=active&account_id=${simulatedAccountId}`;
      return NextResponse.json({
        accountId: simulatedAccountId,
        url: simulatedUrl,
        isSimulation: true,
      });
    }

    const stripe = stripeClient();

    // 1. Create a Stripe Express Connected Account for partner club revenue share
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: contactEmail,
      capabilities: {
        transfers: { requested: true },
      },
      business_profile: {
        name: clubName || `Transcend Partner Club ${clubId}`,
        product_description: "50% Net Club Revenue Share on Transcend Vision Pro Family Passes",
      },
      metadata: {
        club_id: clubId,
        program: "TRANSCEND_CLUB_REV_SHARE_50",
      },
    });

    // 2. Generate Account Link for Director Onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${portalOrigin}/commercial?refresh=true`,
      return_url: `${portalOrigin}/commercial?connect_success=true&account_id=${account.id}`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      accountId: account.id,
      url: accountLink.url,
      isSimulation: false,
    });
  } catch (err) {
    console.error("[Stripe Connect API] Error:", err);
    return NextResponse.json(
      { error: errorMessage(err) || "Failed to create Stripe Connect onboarding session" },
      { status: 500 }
    );
  }
}
