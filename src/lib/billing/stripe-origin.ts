import "server-only";

import type { NextRequest } from "next/server";

import { safeInternalNextPath } from "@/lib/auth/safe-internal-next-path";
import { OFFICIAL_HOST } from "@/lib/legacy-host-redirect";

export const OFFICIAL_ORIGIN = `https://${OFFICIAL_HOST}`;
export const TRANSCEND_APEX_ORIGIN = "https://transcendental-sports.ai";

export function buildAllowedBillingOrigins(): Set<string> {
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

export function isAllowedLoopbackOrigin(origin: string): boolean {
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

export function isAllowedBillingOrigin(origin: string): boolean {
  return buildAllowedBillingOrigins().has(origin) || isAllowedLoopbackOrigin(origin);
}

export function resolveBillingOrigin(req: NextRequest): string {
  const allowed = buildAllowedBillingOrigins();
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

function validateAllowedReturnUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.username !== "" || parsed.password !== "") return null;
    if (!isAllowedBillingOrigin(parsed.origin)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function resolveBillingReturnUrl(
  req: NextRequest,
  input: { returnPath?: unknown; return_url?: unknown },
  defaultPath = "/pricing",
): { ok: true; url: string } | { ok: false; error: string } {
  const origin = resolveBillingOrigin(req);

  let validatedUrl: string | null = null;
  if (input.return_url !== undefined && input.return_url !== null) {
    if (typeof input.return_url !== "string") {
      return { ok: false, error: "Invalid return_url." };
    }
    if (input.return_url.trim() !== "") {
      validatedUrl = validateAllowedReturnUrl(input.return_url);
      if (!validatedUrl) {
        return { ok: false, error: "Invalid return_url origin." };
      }
    }
  }

  let validatedPathUrl: string | null = null;
  if (input.returnPath !== undefined && input.returnPath !== null) {
    if (typeof input.returnPath !== "string") {
      return { ok: false, error: "Invalid returnPath." };
    }
    if (input.returnPath.trim() !== "") {
      const safePath = safeInternalNextPath(input.returnPath);
      if (!safePath) {
        return { ok: false, error: "Invalid returnPath." };
      }
      const composed = new URL(safePath, origin);
      if (composed.origin !== origin) {
        return { ok: false, error: "Invalid returnPath." };
      }
      validatedPathUrl = composed.toString();
    }
  }

  if (validatedUrl) return { ok: true, url: validatedUrl };
  if (validatedPathUrl) return { ok: true, url: validatedPathUrl };
  return { ok: true, url: new URL(defaultPath, origin).toString() };
}
