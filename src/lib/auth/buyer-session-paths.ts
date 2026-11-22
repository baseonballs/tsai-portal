import { resolveAuthRedirectPath } from "@/lib/auth/safe-internal-next-path";

const ALLOWED_UNLICENSED_BUYER_PATHNAMES = new Set([
  "/pricing",
  "/tournament/director",
]);

/**
 * Unlicensed GoTrue accounts may hold a session ONLY to enter public buyer flows
 * (`/pricing` and `/tournament/director`), keeping `/docs` and `/` strictly licence-gated.
 */
export function isAllowedUnlicensedNextPath(next: string | null | undefined): boolean {
  if (typeof next !== "string") return false;
  const safePath = resolveAuthRedirectPath(next, "/");
  try {
    const parsed = new URL(safePath, "https://sentinel.invalid");
    return (
      parsed.origin === "https://sentinel.invalid" &&
      ALLOWED_UNLICENSED_BUYER_PATHNAMES.has(parsed.pathname)
    );
  } catch {
    return false;
  }
}
