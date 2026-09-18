"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  Building2,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Percent,
  Calculator,
  CheckCircle2,
  XCircle,
  CreditCard,
  Download,
} from "lucide-react";
import { calculateClubRevenueShare, PRICING_CONSTANTS } from "@/lib/billing/club-rev-share";

export function ClubRevShareDashboard() {
  const [playerCount, setPlayerCount] = useState<number>(18);
  const [subscribersCount, setSubscribersCount] = useState<number>(25);
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");

  const calc = calculateClubRevenueShare({
    playerCount,
    subscribersCount,
    plan,
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> 50% Net Club Revenue Share Revolution
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-white font-normal">
            Youth Team Fundraising &amp; Rev-Share
          </h1>
          <p className="text-sm md:text-base text-zinc-400 mt-2 max-w-2xl font-light">
            Instead of paying \$1,500/year to Veo or having parents pay \$240/year to LiveBarn with zero return, Transcend deposits <span className="text-cyan-400 font-semibold">50% of all subscription revenue</span> directly into your team&apos;s travel and tournament fund.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold font-mono transition-all cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export Ledger CSV
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-cyan-950/40 hover:opacity-95 transition-all cursor-pointer">
            <CreditCard className="w-3.5 h-3.5" /> Stripe Connect Payouts
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase mb-2">
            <span>Annual Projected Fundraising</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-white">
            ${calc.projectedAnnualTeamFundraising.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-cyan-400 mt-2 font-mono">
            Direct deposit to team bank account
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase mb-2">
            <span>Club Net Revenue Share</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-emerald-400">
            50.0%
          </div>
          <p className="text-[11px] text-zinc-400 mt-2 font-mono">
            Guaranteed non-dilution invariant
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase mb-2">
            <span>Active Family Subscribers</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-white">
            {subscribersCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2 font-mono">
            Parents, grandparents &amp; relatives
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase mb-2">
            <span>Vs. Veo Cost Avoided</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-amber-400">
            +$1,500
          </div>
          <p className="text-[11px] text-zinc-400 mt-2 font-mono">
            $0 hardware capex + $0 software fees
          </p>
        </div>
      </div>

      {/* INTERACTIVE CALCULATOR */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-zinc-950 p-6 md:p-10 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
              <Calculator className="w-4 h-4" /> Interactive Team Revenue Calculator
            </div>
            <h2 className="text-xl md:text-2xl font-serif text-white">
              Model Your Program&apos;s Annual Payout
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 p-1 rounded-full bg-zinc-950 border border-white/10">
            <button
              onClick={() => setPlan("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer ${
                plan === "monthly"
                  ? "bg-cyan-500 text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly Pass ($9.99/mo)
            </button>
            <button
              onClick={() => setPlan("annual")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer ${
                plan === "annual"
                  ? "bg-cyan-500 text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Annual Pass ($79/yr)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* SLIDERS */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="text-zinc-300">Active Skaters on Team</span>
                <span className="text-cyan-400 font-bold text-sm">{playerCount} Athletes</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono mt-1">
                <span>10 (Small Roster)</span>
                <span>18 (Standard)</span>
                <span>30 (Club Pool)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="text-zinc-300">Subscribing Parents &amp; Relatives</span>
                <span className="text-cyan-400 font-bold text-sm">{subscribersCount} Subscriptions</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={subscribersCount}
                onChange={(e) => setSubscribersCount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono mt-1">
                <span>5 Parents</span>
                <span>25 (Average for 18 players)</span>
                <span>100 (Full Program)</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-zinc-300">Gross vs. Net Breakdown</h4>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Total Gross Subscriptions:</span>
                <span className="text-white font-mono font-semibold">${calc.grossRevenueTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Transcend Cloud &amp; AI Processing:</span>
                <span className="text-zinc-400 font-mono">50.0% (${(calc.grossRevenueTotal - calc.netClubPayoutTotal).toFixed(2)})</span>
              </div>
              <div className="flex justify-between text-xs border-t border-white/10 pt-2 font-semibold">
                <span className="text-cyan-400">Net Team Payout (50.0%):</span>
                <span className="text-cyan-400 font-mono">${calc.netClubPayoutTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* SUMMARY DISPLAY CARD */}
          <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/20 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase font-bold text-cyan-400">Net Annual Team Revenue</span>
              <div className="text-4xl md:text-6xl font-mono font-bold text-white mt-2 mb-4">
                ${calc.projectedAnnualTeamFundraising.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                For a team with <strong className="text-white">{playerCount} skaters</strong> and <strong className="text-white">{subscribersCount} subscribing family members</strong>, Transcend delivers <strong className="text-cyan-400">${calc.projectedAnnualTeamFundraising.toFixed(2)}</strong> directly into your team&apos;s travel fund.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero hardware cost — use existing iPhones on arena glass</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Automated monthly direct deposit via Stripe Connect</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Parents pay \$79/year (vs. \$240/yr on LiveBarn)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPETITIVE AUTOPSY TABLE */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
            Economic Autopsy vs. Legacy Monopolies
          </h3>
          <p className="text-lg font-serif text-white">Why Transcend Vision renders legacy hardware obsolete.</p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-950/60 font-mono uppercase text-zinc-400">
                <th className="p-4">Platform</th>
                <th className="p-4">Hardware Capex</th>
                <th className="p-4">Software Fee / Team</th>
                <th className="p-4">Parent Cost</th>
                <th className="p-4 text-cyan-400">Club Revenue Share</th>
                <th className="p-4">Net Financial Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              <tr className="bg-cyan-950/20 font-medium">
                <td className="p-4 text-white font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Transcend Vision
                </td>
                <td className="p-4 text-emerald-400">$0 (BYOD iPhone)</td>
                <td className="p-4 text-emerald-400">$0 (Free)</td>
                <td className="p-4 text-zinc-300">$79.00 / yr</td>
                <td className="p-4 text-cyan-400 font-bold">50% Net Rev-Share</td>
                <td className="p-4 text-cyan-400 font-bold">+${calc.projectedAnnualTeamFundraising.toFixed(0)} / yr (Profitable)</td>
              </tr>
              <tr className="text-zinc-400">
                <td className="p-4 text-zinc-300 font-semibold">Veo Cam 3</td>
                <td className="p-4 text-rose-400">$1,200 hardware</td>
                <td className="p-4 text-rose-400">$1,500 / team / yr</td>
                <td className="p-4 text-zinc-400">$0 (included)</td>
                <td className="p-4 text-rose-400">0%</td>
                <td className="p-4 text-rose-400 font-bold">-$2,700 / yr (Cost)</td>
              </tr>
              <tr className="text-zinc-400">
                <td className="p-4 text-zinc-300 font-semibold">LiveBarn</td>
                <td className="p-4 text-zinc-400">Venue Contract</td>
                <td className="p-4 text-zinc-400">$0</td>
                <td className="p-4 text-rose-400">$240–$300 / yr</td>
                <td className="p-4 text-zinc-500">0–10% venue only</td>
                <td className="p-4 text-zinc-500 font-bold">$0 to youth team</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* STRIPE CONNECT PAYOUT STATUS */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">San Jose Jr. Sharks Youth Hockey Club</h4>
            <p className="text-xs text-zinc-400">Stripe Connect Account: <code className="text-cyan-400 font-mono">acct_sj_sharks_fundraising_01</code></p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono text-emerald-400">Active Direct Deposit · Next Payout: 1st of Month</span>
            </div>
          </div>
        </div>

        <Link
          href="/byod-setup"
          className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all cursor-pointer shrink-0"
        >
          Configure Rinkside BYOD Rig →
        </Link>
      </div>
    </div>
  );
}
