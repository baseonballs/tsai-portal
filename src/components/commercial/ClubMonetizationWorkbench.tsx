"use client";

import React, { useState, useMemo } from "react";
import { errorMessage } from "@/lib/errors";
import {
  calculateClubRevenue,
  TURNKEY_ARENA_RIG_BOM,
  HARDWARE_RIG_KIT_PRICE_CENTS,
  type ClubRevenueBreakdown,
} from "@/lib/commercial/club-revenue-calculator";
import {
  DollarSign,
  Users,
  TrendingUp,
  ShieldCheck,
  Package,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

interface ClubMonetizationWorkbenchProps {
  clubId?: string;
  clubName?: string;
  contactEmail?: string;
  initialSubscribers?: number;
  stripeConnected?: boolean;
}

export function ClubMonetizationWorkbench({
  clubId = "club_norcal_sharks_01",
  clubName = "San Jose Jr. Sharks AAA Hockey",
  contactEmail = "director@sharksice.com",
  initialSubscribers = 350,
  stripeConnected = true,
}: ClubMonetizationWorkbenchProps) {
  const [subscribers, setSubscribers] = useState<number>(initialSubscribers);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(2);
  const [selectedSheet, setSelectedSheet] = useState("Sheet 1 (Main Arena)");
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const revenue: ClubRevenueBreakdown = useMemo(() => {
    return calculateClubRevenue({ subscribersCount: subscribers });
  }, [subscribers]);

  const handleStartStripeOnboarding = async () => {
    setIsOnboardingLoading(true);
    setFeedbackNotice(null);
    try {
      const res = await fetch("/api/billing/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, clubName, contactEmail }),
      });
      const data = await res.json();
      if (data.url) {
        setFeedbackNotice("Stripe Connect Express session generated. Redirecting to onboarding portal...");
        window.open(data.url, "_blank");
      } else {
        setFeedbackNotice(data.error || "Failed to initialize Stripe Connect onboarding.");
      }
    } catch (e: unknown) {
      setFeedbackNotice(errorMessage(e) || "Network communication failure.");
    } finally {
      setIsOnboardingLoading(false);
    }
  };

  const handleOrderHardwareKits = async () => {
    setIsCheckoutLoading(true);
    setFeedbackNotice(null);
    try {
      const res = await fetch("/api/billing/hardware/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          userEmail: contactEmail,
          quantity: orderQuantity,
          sheetIdentifier: selectedSheet,
        }),
      });
      const data = await res.json();
      if (data.url) {
        setFeedbackNotice("Stripe Checkout Session initialized for Turnkey Arena Rig Kit ($78.99 BOM).");
        window.open(data.url, "_blank");
      } else {
        setFeedbackNotice(data.error || "Failed to create hardware checkout session.");
      }
    } catch (e: unknown) {
      setFeedbackNotice(errorMessage(e) || "Network communication failure.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-zinc-100 font-sans" data-testid="club-monetization-workbench">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            50% Net Partner Club Revenue Share
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Club Director Commercial & Revenue Command
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {clubName} • Partner Club Payout Portal • Transparent 50/50 net streaming pass revenue distribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartStripeOnboarding}
            disabled={isOnboardingLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm disabled:opacity-50"
            data-testid="stripe-connect-btn"
          >
            {stripeConnected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                Stripe Express Active
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                {isOnboardingLoading ? "Connecting..." : "Enable Stripe Express Payouts"}
              </>
            )}
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-200 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Subscribers */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Pro Family Subscribers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {revenue.subscribersCount.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-zinc-400 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">$9.99/mo</span> family streaming passes
          </div>
        </div>

        {/* Gross Monthly Revenue */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Monthly Gross Ingress</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            ${revenue.grossRevenueMonthlyDollars.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            ${revenue.grossRevenueAnnualDollars.toLocaleString(undefined, { minimumFractionDigits: 2 })} annualized run-rate
          </div>
        </div>

        {/* Club 50% Net Share (Monthly) */}
        <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400 font-semibold">Club 50% Monthly Payout</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 tracking-tight">
            ${revenue.clubPayoutMonthlyDollars.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            Effective split: <span className="text-white font-medium">{revenue.effectiveClubSharePercentage}%</span> of gross
          </div>
        </div>

        {/* Club 50% Net Share (Annualized) */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Annual Club Direct Payout</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            ${revenue.clubPayoutAnnualDollars.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            Direct deposit via Stripe Express
          </div>
        </div>
      </div>

      {/* Interactive Volume Simulator */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Tournament & Season Subscriber Volume Modeler
            </h2>
            <p className="text-xs text-zinc-400">
              Model your club earnings across active team rosters and multi-sheet weekend tournaments.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400">Active Projection:</span>
            <div className="text-sm font-bold text-white">{subscribers} Participating Families</div>
          </div>
        </div>

        <div className="pt-2">
          <input
            type="range"
            min="25"
            max="1500"
            step="25"
            value={subscribers}
            onChange={(e) => setSubscribers(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            data-testid="subscriber-volume-slider"
          />
          <div className="flex justify-between text-[11px] text-zinc-500 mt-1 font-mono">
            <span>25 (1 Team)</span>
            <span>250 (10 Teams)</span>
            <span>500 (20 Teams)</span>
            <span>1,000 (Major Tournament)</span>
            <span>1,500 (8-Sheet Complex)</span>
          </div>
        </div>

        {/* Cost & Split Breakdown Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-zinc-800/80">
          <div>
            <span className="text-zinc-500">Stripe Interchange (2.9% + $0.30):</span>
            <div className="font-mono font-medium text-zinc-300 mt-0.5">${revenue.stripeFeesMonthlyDollars}/mo</div>
          </div>
          <div>
            <span className="text-zinc-500">Cloud & SEI Metadata Bandwidth:</span>
            <div className="font-mono font-medium text-zinc-300 mt-0.5">${revenue.cdnHostingMonthlyDollars}/mo</div>
          </div>
          <div>
            <span className="text-zinc-500">Net Distributable Pool:</span>
            <div className="font-mono font-medium text-white mt-0.5">${revenue.netRevenueMonthlyDollars}/mo</div>
          </div>
          <div>
            <span className="text-zinc-500">Club Direct Payout (50%):</span>
            <div className="font-mono font-bold text-emerald-400 mt-0.5">${revenue.clubPayoutMonthlyDollars}/mo</div>
          </div>
        </div>
      </div>

      {/* Hardware Rig Kit Ordering Section */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <Package className="w-3.5 h-3.5" />
              Turnkey Arena Hardware Rig Kit ($78.99 Complete BOM)
            </div>
            <h2 className="text-lg font-bold text-white">
              Instant 90-Second Glass-Mounted Capture Hardware
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Disrupts \\$4,500–\\$12,000 legacy installations with 100% spectator glass ballistic safety and dual 4K/1080p capture.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-xs rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option>Sheet 1 (Main Arena)</option>
              <option>Sheet 2 (North Rink)</option>
              <option>Sheet 3 (South Rink)</option>
              <option>Sheet 4 (Olympic Sheet)</option>
              <option>Sheet 5 (Training Sheet)</option>
              <option>Sheet 6 (Community Rink)</option>
              <option>Sheet 7 (East Rink)</option>
              <option>Sheet 8 (West Rink)</option>
            </select>

            <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1">
              <span className="text-xs text-zinc-400 mr-1">Qty:</span>
              <button
                onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                className="w-6 h-6 rounded bg-zinc-700 text-white flex items-center justify-center text-xs hover:bg-zinc-600"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-bold text-white">{orderQuantity}</span>
              <button
                onClick={() => setOrderQuantity(orderQuantity + 1)}
                className="w-6 h-6 rounded bg-zinc-700 text-white flex items-center justify-center text-xs hover:bg-zinc-600"
              >
                +
              </button>
            </div>

            <button
              onClick={handleOrderHardwareKits}
              disabled={isCheckoutLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm disabled:opacity-50"
              data-testid="order-hardware-kit-btn"
            >
              <Package className="w-4 h-4" />
              {isCheckoutLoading ? "Preparing..." : `Order Kits ($${((HARDWARE_RIG_KIT_PRICE_CENTS * orderQuantity) / 100).toFixed(2)})`}
            </button>
          </div>
        </div>

        {/* BOM Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                <th className="py-2 pr-3">SKU</th>
                <th className="py-2 px-3">Item Name & Component Description</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Safety & Kinematic Rating</th>
                <th className="py-2 pl-3 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {TURNKEY_ARENA_RIG_BOM.map((item) => (
                <tr key={item.sku} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2 pr-3 text-cyan-400 font-medium">{item.sku}</td>
                  <td className="py-2 px-3 font-sans text-zinc-200">{item.name}</td>
                  <td className="py-2 px-3 font-sans text-zinc-400">{item.vendorCategory}</td>
                  <td className="py-2 px-3 font-sans text-emerald-400 text-[11px]">{item.safetyRating}</td>
                  <td className="py-2 pl-3 text-right font-medium text-white">${item.unitCostDollars.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-t border-zinc-700 bg-zinc-900/90 font-bold font-sans">
                <td colSpan={4} className="py-2.5 px-3 text-right text-zinc-300">
                  Itemized Total Turnkey Kit BOM (Disrupting Legacy $4,500 Hardware):
                </td>
                <td className="py-2.5 pl-3 text-right text-emerald-400 font-mono text-sm">
                  ${(HARDWARE_RIG_KIT_PRICE_CENTS / 100).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
