"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface PricingStatusBannerProps {
  authenticated: boolean;
  activePlan: string | null;
  catalogError: string | null;
}

export function PricingStatusBanner({
  authenticated,
  activePlan,
  catalogError,
}: PricingStatusBannerProps) {
  const searchParams = useSearchParams();
  const checkoutState = searchParams?.get("checkout");

  return (
    <div className="mx-auto max-w-4xl space-y-3 mt-6">
      {checkoutState === "success" && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 px-5 py-3.5 text-xs text-emerald-200 flex items-center justify-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {activePlan && activePlan !== "FREE"
              ? `Returned from checkout. Active plan on your account: ${activePlan}.`
              : "Returned from checkout. Subscription activation completes once Stripe confirms payment."}
          </span>
        </div>
      )}

      {checkoutState === "canceled" && (
        <div
          role="status"
          className="rounded-2xl border border-amber-500/40 bg-amber-950/30 px-5 py-3.5 text-xs text-amber-200 flex items-center justify-center gap-2.5"
        >
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Stripe checkout was canceled. No charge was made.</span>
        </div>
      )}

      {authenticated && activePlan && (
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-4 py-1.5 text-xs font-mono text-cyan-300">
          <span>Signed-in account plan:</span>
          <strong className="text-white">{activePlan}</strong>
        </div>
      )}

      {catalogError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/40 bg-rose-950/30 px-5 py-3.5 text-xs text-rose-200 flex items-center justify-center gap-2.5"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{catalogError}</span>
        </div>
      )}
    </div>
  );
}
