import { NextResponse } from "next/server";
import { isAllowedUnlicensedNextPath } from "@/lib/auth/buyer-session-paths";
import { getEntitledPortalUser } from "@/lib/auth/portal-entitlement";
import { resolveAuthRedirectPath } from "@/lib/auth/safe-internal-next-path";
import { errorMessage } from "@/lib/errors";
import { createClient as createServerClient } from "@/utils/supabase/server";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" } as const;

async function parseRequestedNextPath(request?: Request): Promise<string> {
  if (!request) return "/";
  const rawBody = await request.text().catch(() => "");
  if (rawBody.trim() === "") return "/";
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const candidate = (parsed as { next?: unknown }).next;
      if (typeof candidate === "string") {
        return resolveAuthRedirectPath(candidate, "/");
      }
    }
  } catch {
    // Malformed JSON falls back to "/", which is never a buyer path.
  }
  return "/";
}

/**
 * POST /auth/entitlement — the licence check for password sign-in.
 *
 * Phase 156: accounts without an active licence are signed out globally unless the
 * caller is entering an allowed self-serve buyer route (`/pricing` or `/tournament/director`).
 * `/docs` and `/` remain strictly licence-gated on every request.
 */
export async function POST(request?: Request) {
  try {
    const safeNext = await parseRequestedNextPath(request);
    const access = await getEntitledPortalUser();
    if (access.status === "entitled") {
      return NextResponse.json(
        { entitled: true, allowed: true },
        { headers: NO_STORE_HEADERS },
      );
    }
    if (access.status === "not-entitled") {
      if (isAllowedUnlicensedNextPath(safeNext)) {
        return NextResponse.json(
          { entitled: false, allowed: true, scope: "buyer" },
          { headers: NO_STORE_HEADERS },
        );
      }
      const supabase = await createServerClient();
      await supabase.auth.signOut({ scope: "global" });
      return NextResponse.json(
        { entitled: false, allowed: false, error: "unauthorized" },
        { status: 403, headers: NO_STORE_HEADERS },
      );
    }
    return NextResponse.json(
      { entitled: false, allowed: false, error: "unauthorized" },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  } catch (err) {
    console.error("[Portal entitlement] check failed:", errorMessage(err));
    return NextResponse.json(
      { entitled: false, allowed: false, error: "Entitlement could not be checked." },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }
}
