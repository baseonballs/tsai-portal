"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Check, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  ArrowRight, 
  HelpCircle, 
  Sparkles,
  Camera,
  Activity,
  Layers,
  User,
  Users
} from "lucide-react";

import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"team" | "season">("team");
  const [familyTier, setFamilyTier] = useState<"basic" | "advantage">("basic");
  const [proTier, setProTier] = useState<"standard" | "advantage">("standard");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500 selection:text-zinc-950">
      {/* HEADER */}
      <LandingHeader />

      <main className="relative overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative px-6 pt-20 pb-16 lg:px-8 border-b border-white/10 bg-gradient-to-b from-zinc-900/60 via-zinc-950 to-zinc-950">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-fuchsia-500/10 blur-[120px] pointer-events-none" />

          <div className="mx-auto max-w-4xl text-center relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-cyan-400 uppercase font-mono mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Transparent Enterprise Economics
            </span>

            <h1 className="text-4xl font-serif font-normal tracking-tight text-white sm:text-6xl mb-6">
              Decision-Grade AI Intelligence. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent font-medium">
                Built for Every Bench.
              </span>
            </h1>

            <p className="text-lg text-zinc-300 font-light leading-relaxed max-w-2xl mx-auto mb-10">
              By owning our hybrid GPU fabric, we collapsed video AI processing costs from <span className="text-white font-medium">$200</span> down to <span className="text-cyan-400 font-semibold">$1.17 per game</span>. Simple, predictable pricing for youth hockey programs.
            </p>

            {/* BILLING TOGGLE */}
            <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-zinc-900/80 border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setBillingCycle("team")}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === "team"
                    ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-950/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Founding Cohort
              </button>
              <button
                onClick={() => setBillingCycle("season")}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === "season"
                    ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-950/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Full Season Pass
              </button>
            </div>
          </div>
        </section>

        {/* PRICING TIERS GRID */}
        <section className="px-6 py-20 lg:px-8 bg-zinc-950 relative">
          <div className="mx-auto max-w-7xl">
            
            {/* SECTION 1: INDIVIDUAL & FAMILY PLANS */}
            <div className="mb-12">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">Individual &amp; Family Plans</h2>
              <p className="text-lg font-serif text-white">Habit-building tools for skaters, families, and elite prospects.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              
              {/* TIER 1: ATHLETE JOURNAL */}
              <div className="group relative rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800/80 px-3 py-1 rounded-full border border-white/10">
                      Athlete Pass
                    </span>
                    <User className="w-5 h-5 text-zinc-400" />
                  </div>

                  <h3 className="font-serif text-2xl text-white font-medium">Periodical Athlete</h3>
                  <p className="mt-2 text-xs text-zinc-400 font-light leading-relaxed">
                    Designed for skaters, goalies, and parents building daily development habits.
                  </p>

                  <div className="mt-6 mb-8 flex items-baseline gap-2">
                    <span className="text-4xl font-serif font-bold text-white">$0</span>
                    <span className="text-xs text-zinc-400 font-mono">/ forever free</span>
                  </div>

                  <ul className="space-y-3.5 text-xs text-zinc-300 border-t border-white/10 pt-6">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Personal Periodical Journal mobile feed</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Receive coach micro-loops &amp; voice note cuts</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>1–5 self-rating &amp; voice note reflections</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Personal Superpower trend line tracking</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    disabled
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/50 py-3 text-xs font-semibold text-zinc-500 cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Included for Roster Athletes</span>
                  </button>
                </div>
              </div>              {/* TIER 2: FAMILY PLAN */}
              <div className="group relative rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 via-zinc-900/40 to-zinc-950 p-8 backdrop-blur-md flex flex-col justify-between hover:border-indigo-400/50 transition-all">
                <div>
                  {/* TOP BADGE ROW */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
                      Family Pass
                    </span>
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>

                  {/* TITLE & SUB-TIER TOGGLE ROW */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="font-serif text-2xl text-white font-medium">Family</h3>
                    
                    {/* SUB-TIER LINK TOGGLE */}
                    <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-900/90 border border-indigo-500/30 text-[11px]">
                      <button
                        onClick={() => setFamilyTier("basic")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                          familyTier === "basic"
                            ? "bg-indigo-600 text-white shadow-sm font-semibold"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Basic
                      </button>
                      <button
                        onClick={() => setFamilyTier("advantage")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                          familyTier === "advantage"
                            ? "bg-indigo-600 text-white shadow-sm font-semibold"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Advantage
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-light leading-relaxed">
                    {familyTier === "basic"
                      ? "Essential journaling and coach feedback sharing for a single skater family."
                      : "Built for hockey families managing multi-skater growth and shared parent reflections."}
                  </p>

                  <div className="mt-6 mb-8 flex items-baseline gap-2">
                    <span className="text-4xl font-serif font-bold text-white">
                      {billingCycle === "team" ? "$0" : familyTier === "basic" ? "$9.99" : "$29"}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {billingCycle === "team"
                        ? "/ month (beta period)"
                        : familyTier === "basic"
                        ? "/ month (individual)"
                        : "/ month (4 seats)"}
                    </span>
                  </div>

                  <ul className="space-y-3.5 text-xs text-zinc-200 border-t border-white/10 pt-6">
                    {familyTier === "basic" ? (
                      <>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Single skater &amp; guardian account link</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Shared Periodical reflection log &amp; parent co-journaling</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Standard video clip vault &amp; micro-loop feed</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>4 seats: 2 guardians + 2 members / skaters</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Shared Periodical reflection log &amp; parent co-journaling</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Multi-skater Superpower Matrix comparison</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Shared video clip vault &amp; coach micro-loop archive</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    disabled
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/50 py-3 text-xs font-semibold text-zinc-500 cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{familyTier === "basic" ? "Family Basic (Inactive)" : "Family Advantage (Inactive)"}</span>
                  </button>
                </div>
              </div>

              {/* TIER 3: PRO PROSPECT PLAN */}
              <div className="group relative rounded-3xl border border-fuchsia-500/30 bg-gradient-to-b from-fuchsia-950/20 via-zinc-900/40 to-zinc-950 p-8 backdrop-blur-md flex flex-col justify-between hover:border-fuchsia-400/50 transition-all">
                <div>
                  {/* TOP BADGE ROW */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-500/30">
                      Prospect Pass
                    </span>
                    <Sparkles className="w-5 h-5 text-fuchsia-400" />
                  </div>

                  {/* TITLE & SUB-TIER TOGGLE ROW */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="font-serif text-2xl text-white font-medium">
                      {proTier === "advantage" ? "Elite Prospect" : "Pro Prospect"}
                    </h3>
                    
                    {/* SUB-TIER LINK TOGGLE */}
                    <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-900/90 border border-fuchsia-500/30 text-[11px]">
                      <button
                        onClick={() => setProTier("standard")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                          proTier === "standard"
                            ? "bg-fuchsia-600 text-white shadow-sm font-semibold"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Standard
                      </button>
                      <button
                        onClick={() => setProTier("advantage")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                          proTier === "advantage"
                            ? "bg-fuchsia-600 text-white shadow-sm font-semibold"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Advantage
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-light leading-relaxed">
                    {proTier === "standard"
                      ? "Dedicated AI shift parsing & individual development tracking for AAA prospects."
                      : "For AAA prospects, private skills coaches, and scouts wanting solo AI shift parsing & dossiers."}
                  </p>

                  <div className="mt-6 mb-8 flex items-baseline gap-2">
                    <span className="text-4xl font-serif font-bold text-white">
                      {billingCycle === "team" ? "$0" : proTier === "standard" ? "$49" : "$69"}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {billingCycle === "team" ? "/ month (beta period)" : "/ month (athlete + 2 guardians)"}
                    </span>
                  </div>

                  <ul className="space-y-3.5 text-xs text-zinc-200 border-t border-white/10 pt-6">
                    {proTier === "standard" ? (
                      <>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>EdgeIQ Video Intelligence Suite</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>Solo MASCE AI game parsing &amp; individual shift tagging</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>Standard Cut Room Workbench &amp; Natural Language Discovery &amp; Semantic Search</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>1 TB Cloud Storage, Cloud GPU/CPU Workloads</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>$10 monthly credits of GPU tokens</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>EdgeIQ &amp; Stratus Performance &amp; Scout Suite</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>Solo MASCE AI game parsing &amp; individual shift tagging</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>Private Cut Room Workbench &amp; 41s Natural Language Querying</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>Bi-weekly AI Superpower synthesis &amp; scouting dossiers</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>Priority processing queue on dedicated GPU fabric</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>1 TB Cloud Storage, Cloud GPU/CPU Workloads</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          <span>$20 monthly credits of GPU tokens</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    disabled
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/50 py-3 text-xs font-semibold text-zinc-500 cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{proTier === "standard" ? "Pro Standard (Inactive)" : "Pro Advantage (Inactive)"}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* SECTION 2: TEAM & ASSOCIATION PLANS */}
            <div className="mb-12 border-t border-white/10 pt-16">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">Team &amp; Association Plans</h2>
              <p className="text-lg font-serif text-white">Full-roster video intelligence and organization-wide infrastructure.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* TIER 4: FOUNDING TEAMS BETA (HIGHLIGHTED) */}
              <div className="group relative rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-cyan-950/30 via-zinc-900/50 to-zinc-950 p-8 sm:p-10 backdrop-blur-md flex flex-col justify-between shadow-[0_0_50px_rgba(6,182,212,0.12)] hover:border-cyan-400 transition-all">
                <div className="absolute -top-3.5 left-8 bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-1 rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-widest shadow-md">
                  Founding Teams Beta
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 mt-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                      Coaching Staff Pass
                    </span>
                    <Zap className="w-6 h-6 text-cyan-400" />
                  </div>

                  <h3 className="font-serif text-3xl text-white font-medium">Spotlight &amp; Periodical</h3>
                  <p className="mt-2 text-sm text-zinc-300 font-light leading-relaxed">
                    Full AI video intelligence, Cut Room Workbench, and athlete feedback loops for your entire roster.
                  </p>

                  <div className="mt-6 mb-8 flex items-baseline gap-2">
                    <span className="text-5xl font-serif font-bold text-white">
                      {billingCycle === "team" ? "$0" : "$2,400"}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {billingCycle === "team" ? "/ month (during beta period)" : "/ full team season (24 seats)"}
                    </span>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-zinc-200 border-t border-white/10 pt-6">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Full MASCE AI video ingest &amp; telemetry parsing</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>41s Natural Language Querying &amp; Cut Room</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Provenance-Tagged Event &amp; Possession Ledgers</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Multi-Voice Accountability Network</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Automated 14-point physics &amp; rule audit</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Includes 24 Periodical Athlete roster seats</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    disabled
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/60 py-3.5 text-xs font-semibold text-zinc-500 cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Founding Cohort Program (Inactive)</span>
                  </button>
                </div>
              </div>

              {/* TIER 5: CLUB / ENTERPRISE */}
              <div className="group relative rounded-3xl border border-white/10 bg-zinc-900/30 p-8 sm:p-10 backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-500/30">
                      Association / Club
                    </span>
                    <ShieldCheck className="w-6 h-6 text-fuchsia-400" />
                  </div>

                  <h3 className="font-serif text-3xl text-white font-medium">Enterprise Organization</h3>
                  <p className="mt-2 text-sm text-zinc-400 font-light leading-relaxed">
                    Custom deployment for multi-team youth clubs, leagues, and high-performance academies.
                  </p>

                  <div className="mt-6 mb-8 flex items-baseline gap-2">
                    <span className="text-5xl font-serif font-bold text-white">Custom</span>
                    <span className="text-xs text-zinc-400 font-mono">/ multi-team volume</span>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-zinc-300 border-t border-white/10 pt-6">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                      <span>Dedicated GPU fabric node allocation</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                      <span>Custom Hockey Taxonomy &amp; ML tuning</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                      <span>MinIO S3 Video Vault &amp; Temporal workers</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                      <span>Multi-rink automated video ingestion</span>
                    </li>
                    <li className="flex items-start gap-2.5 sm:col-span-2">
                      <Check className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                      <span>COPPA Minor &amp; SOC 2 Type II audit compliance</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    disabled
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/50 py-3.5 text-xs font-semibold text-zinc-500 cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Enterprise Contact (Inactive)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* COST UNLOCK COMPARISON STRIP */}
        <section className="px-6 py-20 lg:px-8 border-t border-white/10 bg-zinc-950">
          <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-950/40 via-zinc-900/80 to-fuchsia-950/40 p-8 sm:p-12 backdrop-blur-xl shadow-2xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2">The Economic Collapse</span>
              <h2 className="text-3xl font-serif text-white sm:text-4xl">How We Achieved $1.17 Per Game</h2>
              <p className="mt-3 text-sm text-zinc-300 font-light">
                Traditional video tagging relies on manual human labor or third-party cloud GPUs charging up to $30 per game. Our captive infrastructure eliminates the cloud tax.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-xs text-zinc-500 font-mono block mb-1">Traditional Manual Tagging</span>
                <span className="text-3xl font-serif font-bold text-red-400">$15 - $30</span>
                <span className="text-[11px] text-zinc-400 block mt-2">2–5 days turnaround time</span>
              </div>
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-xs text-zinc-500 font-mono block mb-1">Mainstream Cloud AI APIs</span>
                <span className="text-3xl font-serif font-bold text-amber-400">$6 - $10</span>
                <span className="text-[11px] text-zinc-400 block mt-2">per game</span>
              </div>
              <div className="p-6 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                <span className="text-xs text-cyan-400 font-mono font-semibold block mb-1">TSAI MASCE Engine</span>
                <span className="text-3xl font-serif font-bold text-white">$1.17</span>
                <span className="text-[11px] text-cyan-300 block mt-2">Sub-minute deterministic inference</span>
              </div>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="px-6 py-20 lg:px-8 border-t border-white/10 bg-zinc-950">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">Clear Answers</span>
              <h2 className="mt-4 text-3xl font-serif text-white sm:text-4xl">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  q: "Do we need specialized camera hardware or rink installations?",
                  a: "No. Spotlight works with zero dedicated hardware. Upload standard 1080p game recordings from handheld cameras, smartphones, or standard rink streaming cameras."
                },
                {
                  q: "How does the $1.17 per game cost structure work?",
                  a: "Because TSAI operates its own captive GPU fabric (on-premise DGX cluster), we compute video inferencing locally rather than paying cloud provider fees. We pass those direct electricity & compute savings directly to youth teams."
                },
                {
                  q: "How are minor athlete privacy and COPPA compliance handled?",
                  a: "Periodical requires verifiable parental consent for minor accounts. All athlete media and reflection logs are isolated within strict multi-tenant encryption boundaries, with parent-gated visibility controls."
                },
                {
                  q: "How quickly are AI reads generated after uploading game video?",
                  a: "Our MASCE pipeline parses and indexes game events in under 60 minutes for a full 90-minute 1080p game recording, with natural language queries taking under 41 seconds."
                }
              ].map((faq, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-md">
                  <h4 className="text-base font-serif text-white font-semibold flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-xs text-zinc-300 font-light leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
}
