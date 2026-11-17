import { createClient as createAdminClient, type SupabaseClient } from "@supabase/supabase-js";
import { pgrstEq } from "@/lib/supabase/postgrest-filter";
import { required } from "@/utils/require-env";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { resolveServerAuthUrl } from "@/utils/supabase/resolve-server-auth-url";

/**
 * Portal entitlement — the ONE rule for who may use the Portal's signed-in surfaces.
 *
 * Phase 156. This check used to run only in the OAuth callback. The password sign-in on /login
 * never reached it, so any GoTrue account — licensed or not — got a session the /docs route
 * accepted. Every signed-in surface now calls `getEntitledPortalUser()` on the server instead of
 * trusting that a session exists.
 *
 * Entitlement comes from the platform's licences (owner rule 3): an active row in
 * `user_product_licenses`, or the licence list the platform syncs into `app_metadata` (which
 * only the service role can write). Superadmin / devops accounts hold every licence.
 */

export function createPortalAdminClient(): SupabaseClient {
  return createAdminClient(
    resolveServerAuthUrl(),
    required(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export async function isUserEntitledToPortal(
  adminClient: SupabaseClient,
  userId: string,
  userEmail: string,
  appMetaData: Record<string, unknown> = {},
): Promise<{ isEntitled: boolean; profileId?: string }> {
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, approval_status, user_type, is_superadmin, email")
    .or([pgrstEq("id", userId), pgrstEq("email", userEmail)].join(","))
    .maybeSingle();
  if (profileError) {
    throw new Error(`Portal entitlement: profile lookup failed: ${profileError.message}`);
  }

  const profileId = profile?.id;

  const role = ((profile?.user_type || appMetaData.role || appMetaData.user_type || "") as string).toLowerCase();
  const isSuperadmin =
    profile?.is_superadmin === true || role === "superadmin" || role === "superuser" || role === "devops";
  if (isSuperadmin) {
    return { isEntitled: true, profileId };
  }

  const { data: userLicenses, error: licenceError } = await adminClient
    .from("user_product_licenses")
    .select("id, product_id, status")
    .eq("user_id", profileId || userId);
  if (licenceError) {
    throw new Error(`Portal entitlement: licence lookup failed: ${licenceError.message}`);
  }

  const activeLicenses = userLicenses?.filter((l: { status?: string }) => l.status === "active") || [];
  if (activeLicenses.length > 0) {
    return { isEntitled: true, profileId };
  }

  const syncedLicenses = appMetaData.licenses;
  if (Array.isArray(syncedLicenses) && syncedLicenses.length > 0) {
    return { isEntitled: true, profileId };
  }

  return { isEntitled: false, profileId };
}

export type PortalAccess =
  | { status: "signed-out" }
  | { status: "not-entitled"; userId: string }
  | { status: "entitled"; userId: string };

/**
 * Resolve the caller for a server component or route handler. The session is VERIFIED with
 * GoTrue (`getUser`), never read from the cookie alone (`getSession` returns whatever the cookie
 * says, unverified).
 */
export async function getEntitledPortalUser(): Promise<PortalAccess> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "signed-out" };
  }
  const { isEntitled } = await isUserEntitledToPortal(
    createPortalAdminClient(),
    user.id,
    (user.email || "").toLowerCase().trim(),
    user.app_metadata || {},
  );
  return isEntitled ? { status: "entitled", userId: user.id } : { status: "not-entitled", userId: user.id };
}
