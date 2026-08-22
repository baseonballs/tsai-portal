import { required } from "@/utils/require-env";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const contactName = (body.contact_name || body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const organization = (body.organization || body.org || "").trim();
    const primaryRole = (body.primary_role || body.role || "coach").trim();
    const submissionSource = (body.submission_source || "portal_landing").trim();
    const honeypot = body.website || body.hp; // Spam honeypot field

    // Honeypot check for automated spam bots
    if (honeypot) {
      return NextResponse.json(
        { success: true, message: "Request received successfully." },
        { status: 200 }
      );
    }

    if (!contactName || !email) {
      return NextResponse.json(
        { error: "Contact name and a valid email address are required." },
        { status: 400 }
      );
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Extract headers for provenance auditing
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Supabase client instance (prefer service role for background server inserts)
    let supabase;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const { createClient: createSupabaseJsClient } = await import("@supabase/supabase-js");
      // The URL was hardcoded to http://127.0.0.1:5550, which resolves to nothing inside Cloud Run.
      //
      // This was LATENT, not merely wrong: the branch is only taken when SUPABASE_SERVICE_ROLE_KEY
      // is set, and the service had no environment variables at all, so every request fell through
      // to the `else` and worked. Binding the service-role secret during the 2026-08-22 credential
      // rotation flipped the branch and broke beta signup with `TypeError: fetch failed` — a
      // security fix taking out the lead-capture path as a side effect.
      supabase = createSupabaseJsClient(required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"), serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    } else {
      supabase = await createClient(req.headers.get("origin") || undefined);
    }

    const res = await supabase
      .from("lead_submissions")
      .insert([
        {
          contact_name: contactName,
          email: email,
          organization: organization || null,
          primary_role: primaryRole,
          submission_source: submissionSource,
          ip_address: ipAddress,
          user_agent: userAgent,
          status: "pending",
          metadata: {
            referrer: req.headers.get("referer") || null,
          },
        },
      ]);

    console.log("[BetaRequestsAPI] Full res:", res);

    if (res.error) {
      return NextResponse.json(
        { error: (res.error as any).message || "Failed to submit beta request. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Beta request submitted successfully! Your application is queued for administrator review.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[BetaRequestsAPI] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
