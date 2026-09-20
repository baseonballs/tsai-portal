"use client";

//
//  ClubRevenueShareConsole.tsx
//  tsai-portal
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Commercial Rollout: Horizon D 50% Club Revenue Share & Scout Cutover
//  Palette: slate/zinc/cyan/emerald/amber/rose only
//  Rule: Component < 300 lines
//

import React, { useState } from "react";
import { DollarSign, TrendingUp, Users, Download, ArrowUpRight, CheckCircle2, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { ClubPayoutTelemetry, ClubRevenueShareConsoleProps, ScoutDownloadOrder } from "../../types/club-revenue-share-types";

export const DEFAULT_CLUB_TELEMETRY: ClubPayoutTelemetry = {
  clubId: "club-edina-hockey-assoc",
  clubName: "Edina Hockey Association",
  activeFamilySubscribers: 420,
  monthlySubscriptionRateUsd: 15.0,
  clubRevSharePercent: 50.0,
  pendingPayoutUsd: 3150.0,
  lifetimePayoutUsd: 37800.0,
  nextAchTransferDate: "2026-10-01",
  stripeAccountId: "acct_1TSAI_EDINA_001",
  isStripeConnectActive: true,
};

export const DEFAULT_SCOUT_ORDERS: ScoutDownloadOrder[] = [
  { orderId: "ord-scout-801", matchId: "m-u16-championship", matchTitle: "Edina U16 vs Wayzata U16", purchasedAt: "12m ago", scoutOrg: "USHL Central Scouting", priceUsd: 35.0, clubCutUsd: 17.5, status: "completed" },
  { orderId: "ord-scout-802", matchId: "m-u18-showcase", matchTitle: "Edina U18 vs Shattuck St. Mary's", purchasedAt: "2h ago", scoutOrg: "NCAA Div 1 Scout", priceUsd: 35.0, clubCutUsd: 17.5, status: "completed" },
  { orderId: "ord-scout-803", matchId: "m-u14-regional", matchTitle: "Edina U14 vs Minnetonka U14", purchasedAt: "5h ago", scoutOrg: "WHL Western Scout", priceUsd: 35.0, clubCutUsd: 17.5, status: "completed" },
];

export function ClubRevenueShareConsole({
  initialTelemetry = DEFAULT_CLUB_TELEMETRY,
  initialScoutOrders = DEFAULT_SCOUT_ORDERS,
  onTriggerPayout,
}: ClubRevenueShareConsoleProps) {
  const [telemetry] = useState<ClubPayoutTelemetry>(initialTelemetry);
  const [scoutOrders] = useState<ScoutDownloadOrder[]>(initialScoutOrders);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferDone, setTransferDone] = useState(false);

  const monthlyGross = telemetry.activeFamilySubscribers * telemetry.monthlySubscriptionRateUsd;
  const monthlyClubPayout = monthlyGross * (telemetry.clubRevSharePercent / 100.0);
  const scoutCutTotal = scoutOrders.reduce((acc, curr) => acc + curr.clubCutUsd, 0);

  const handlePayout = async () => {
    setIsTransferring(true);
    if (onTriggerPayout) await onTriggerPayout(telemetry.clubId);
    setTimeout(() => {
      setIsTransferring(false);
      setTransferDone(true);
    }, 600);
  };

  return (
    <div className="flex flex-col bg-slate-950 text-slate-100 rounded-xl border border-slate-800 p-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">{telemetry.clubName}</h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Stripe Connect Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Commercial Partner Portal • 50% Club Revenue Share Automated Pipeline</p>
        </div>
        <button
          onClick={handlePayout}
          disabled={isTransferring || transferDone}
          className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center transition ${
            transferDone
              ? "bg-emerald-600 text-white"
              : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
          }`}
        >
          {isTransferring ? (
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : transferDone ? (
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
          ) : (
            <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
          )}
          {transferDone ? "ACH Transfer Dispatched" : "Initiate Direct ACH Transfer"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Payout</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">${telemetry.pendingPayoutUsd.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Next transfer: {telemetry.nextAchTransferDate}
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Family Subs</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{telemetry.activeFamilySubscribers}</div>
          <div className="text-[11px] text-emerald-400 mt-1">@ ${telemetry.monthlySubscriptionRateUsd.toFixed(2)}/mo ($7.50 club cut)</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Monthly Run-Rate</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">${monthlyClubPayout.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 mt-1">50% of ${monthlyGross.toFixed(2)} monthly pool</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Scout Download Share</span>
            <Download className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">${scoutCutTotal.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 mt-1">{scoutOrders.length} passes @ $17.50/match cut</div>
        </div>
      </div>

      <div className="mt-6 bg-slate-900/40 rounded-lg border border-slate-800 p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">Scout Match Download Feed ($35 / Match)</span>
          <span className="text-slate-500 font-mono">50% Net Club Share ($17.50)</span>
        </div>
        <div className="divide-y divide-slate-800/60 mt-1">
          {scoutOrders.map((ord) => (
            <div key={ord.orderId} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-slate-200">{ord.matchTitle}</div>
                <div className="text-[11px] text-slate-500">{ord.scoutOrg} • {ord.purchasedAt}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-emerald-400">+${ord.clubCutUsd.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500">Gross: ${ord.priceUsd.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
