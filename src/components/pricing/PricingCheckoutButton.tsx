"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, Lock } from "lucide-react";
import {
  isAllowedStripeCheckoutUrl,
  isAllowedStripePortalUrl,
} from "@/lib/billing/pricing-catalog-client";

interface PricingCheckoutButtonProps {
  planSku: string;
  planLabel: string;
  loading: boolean;
  catalogError: string | null;
  authenticated: boolean;
  checkoutReady: boolean;
  activePlan?: string | null;
  subscriptionStatus?: string | null;
  hasActiveSubscription?: boolean;
  variant?: "sky" | "teal" | "cyan";
}

const VARIANT_CLASSES: Record<"sky" | "teal" | "cyan", string> = {
  sky: "bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-950/40",
  teal: "bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-950/40",
  cyan: "bg-gradient-to-r from-cyan-500 to-teal-600 hover:opacity-95 text-white shadow-lg shadow-cyan-950/40",
};

export function PricingCheckoutButton({
  planSku,
  planLabel,
  loading,
  catalogError,
  authenticated,
  checkoutReady,
  activePlan,
  subscriptionStatus,
  hasActiveSubscription = false,
  variant = "cyan",
}: PricingCheckoutButtonProps) {
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const launchBillingRedirect = async (
    endpoint: string,
    payload: Record<string, unknown>,
    isValidUrl: (raw: unknown) => raw is string,
    messages: { unavailable: string; failed: string; badRedirect: string },
  ) => {
    setInlineError(null);
    setSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as { url?: unknown; error?: string } | null;

      if (res.status === 401) {
        window.location.href = "/login?next=/pricing";
        return;
      }
      if (res.status === 503) {
        setInlineError(data?.error || messages.unavailable);
        return;
      }
      if (!res.ok) {
        setInlineError(data?.error || messages.failed);
        return;
      }
      if (!isValidUrl(data?.url)) {
        setInlineError(messages.badRedirect);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setInlineError("Could not reach the billing service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!checkoutReady) {
      setInlineError("Stripe checkout is not yet configured on this server.");
      return;
    }
    await launchBillingRedirect(
      "/api/billing/stripe/checkout",
      { planSku },
      isAllowedStripeCheckoutUrl,
      {
        unavailable: "Stripe checkout is not yet configured on this server.",
        failed: "Unable to start Stripe checkout.",
        badRedirect: "Checkout returned an unexpected redirect destination.",
      },
    );
  };

  const handleManageBilling = async () => {
    await launchBillingRedirect(
      "/api/billing/stripe/portal",
      { returnPath: "/pricing" },
      isAllowedStripePortalUrl,
      {
        unavailable: "Stripe billing portal is not yet configured on this server.",
        failed: "Unable to open Stripe billing portal.",
        badRedirect: "Billing portal returned an unexpected redirect destination.",
      },
    );
  };

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-xl border border-white/10 bg-zinc-900/50 py-3 text-xs font-semibold text-zinc-400 cursor-wait flex items-center justify-center gap-2"
      >
        <span>Loading live pricing...</span>
      </button>
    );
  }

  if (catalogError) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="w-full rounded-xl border border-rose-500/30 bg-rose-950/20 py-3 text-xs font-semibold text-rose-300 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Pricing Unavailable</span>
        </button>
        <p className="text-[11px] text-rose-300 text-center leading-snug">{catalogError}</p>
      </div>
    );
  }

  const normalizedStatus = subscriptionStatus?.trim().toLowerCase() ?? "";
  const hasManageableSub =
    authenticated &&
    (hasActiveSubscription ||
      normalizedStatus === "paused" ||
      Boolean(activePlan && activePlan.trim().toUpperCase() !== "FREE"));

  if (hasManageableSub) {
    const isPaused = normalizedStatus === "paused";
    const isPastDue = normalizedStatus === "past_due";
    const ctaLabel = submitting
      ? "Opening Billing Portal..."
      : isPaused
        ? "Resume Subscription"
        : "Manage Billing";
    const statusText = isPaused
      ? "Subscription paused. Resume or update billing in Stripe."
      : isPastDue
        ? `Subscription payment past due (${activePlan ?? "Active"}). Update billing in Stripe.`
        : `Active account plan: ${activePlan ?? "Active"}.`;

    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleManageBilling()}
          data-testid={isPaused ? `portal-resume-${planSku}` : `portal-manage-${planSku}`}
          className={`w-full rounded-xl py-3 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${
            isPaused || isPastDue
              ? "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950/40"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
          }`}
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <p
          className={`text-[11px] text-center leading-snug ${
            isPaused || isPastDue ? "text-amber-300" : "text-emerald-300"
          }`}
        >
          {statusText}
        </p>
        {inlineError && (
          <p className="text-[11px] text-rose-300 text-center leading-snug" role="status">
            {inlineError}
          </p>
        )}
      </div>
    );
  }

  if (authenticated && !checkoutReady) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          data-testid={`checkout-unavailable-${planSku}`}
          className="w-full rounded-xl border border-amber-500/30 bg-amber-950/20 py-3 text-xs font-semibold text-amber-200 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Checkout Not Configured</span>
        </button>
        <p className="text-[11px] text-amber-300 text-center leading-snug">
          Stripe checkout is not yet configured on this server.
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="space-y-2">
        <Link
          href="/login?next=/pricing"
          data-testid={`checkout-button-${planSku}`}
          className={`w-full rounded-xl py-3 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${VARIANT_CLASSES[variant]}`}
        >
          <span>Sign in to Subscribe — {planLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {!checkoutReady && (
          <p className="text-[11px] text-amber-300 text-center leading-snug">
            Stripe checkout is not yet configured on this server.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={submitting}
        onClick={() => void handleCheckout()}
        data-testid={`checkout-button-${planSku}`}
        className={`w-full rounded-xl py-3 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${VARIANT_CLASSES[variant]}`}
      >
        <span>
          {submitting ? "Connecting to Stripe..." : `Subscribe to ${planLabel}`}
        </span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {inlineError && (
        <p className="text-[11px] text-amber-300 text-center leading-snug" role="status">
          {inlineError}
        </p>
      )}
    </div>
  );
}
