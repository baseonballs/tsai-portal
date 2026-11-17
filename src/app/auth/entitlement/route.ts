import { NextResponse } from "next/server";
import { getEntitledPortalUser } from "@/lib/auth/portal-entitlement";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { errorMessage } from "@/lib/errors";

/**
 * POST /auth/entitlement — the licence check for the password sign-in.
 *
 * Phase 156. The OAuth callback checked the licence and signed unlicensed accounts out; the
 * password form on /login did not, so it handed any GoTrue account a working Portal session. The
 * form now calls this route right after `signInWithPassword`, and an account without a licence is
 * signed out globally, exactly as the callback does it. The signed-in surfaces check again on
 * every request (getEntitledPortalUser) — this route is the sign-in half, not the only guard.
 */
export async function POST() {
  try {
    const access = await getEntitledPortalUser();
    if (access.status === "entitled") {
      return NextResponse.json({ entitled: true }, { headers: { "Cache-Control": "private, no-store" } });
    }
    if (access.status === "not-entitled") {
      const supabase = await createServerClient();
      await supabase.auth.signOut({ scope: "global" });
    }
    return NextResponse.json(
      { entitled: false, error: "unauthorized" },
      { status: access.status === "signed-out" ? 401 : 403, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[Portal entitlement] check failed:", errorMessage(err));
    return NextResponse.json(
      { entitled: false, error: "Entitlement could not be checked." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
