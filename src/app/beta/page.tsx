"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, ArrowRight, Clock, Users, CheckCircle } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BetaSignupForm } from "@/components/landing/BetaSignupForm";

export default function BetaPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-cyan-500 selection:text-zinc-950">
      {/* HEADER */}
      <LandingHeader />

      <main className="relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-b from-cyan-500/15 via-indigo-500/10 to-amber-500/5 blur-[140px]" />
        </div>

        {/* HERO SECTION */}
        <section className="relative px-6 pt-24 sm:pt-32 pb-20 lg:px-8 text-center border-b border-white/10 relative z-10">
          <div className="mx-auto max-w-5xl">
            
            {/* FOUNDING COHORT BADGE */}
            <div className="inline-flex items-center justify-center gap-2.5 rounded-full border border-cyan-500/35 bg-black/90 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold tracking-wider text-cyan-300 backdrop-blur-xl shadow-xl shadow-cyan-500/15 mb-10 sm:mb-12 hover:border-cyan-400/60 transition-all">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-400 font-bold tracking-widest uppercase">Founding Cohort</span>
              <span className="text-zinc-600 font-normal">·</span>
              <span className="text-zinc-200 font-medium tracking-wide uppercase">Youth Ice Hockey Clubs Now Forming</span>
            </div>

            {/* PRIMARY HEADLINE */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif tracking-tight text-white mb-8 sm:mb-10 leading-[1.15] sm:leading-[1.12] drop-shadow-2xl">
              Coming Early <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-400 font-medium">September 2026.</span>
            </h1>

            {/* SUBTITLE */}
            <p className="mt-8 sm:mt-10 text-lg sm:text-xl lg:text-2xl leading-relaxed sm:leading-9 text-zinc-300 max-w-3xl mx-auto font-light">
              We are onboarding our founding cohort of youth ice hockey clubs, coaching staffs, and development programs. Early access invitations will be dispatched in <strong className="text-white font-medium">Early September 2026</strong>.
            </p>

            {/* EMBEDDED BETA APPLICATION FORM CARD */}
            <div id="application-form" className="mt-14 sm:mt-16 text-left bg-black/70 border border-cyan-500/30 p-8 sm:p-12 rounded-3xl backdrop-blur-2xl shadow-2xl max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/10 blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Reserve Your Club's Early September Invitation</h3>
                  <p className="text-xs text-zinc-400">Directly queued for the September 2026 founding cohort deployment batch.</p>
                </div>
              </div>

              <BetaSignupForm />
            </div>

            {/* PROGRAM HIGHLIGHTS GRID */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase block mb-2">01. Captive AI Fabric</span>
                <h4 className="text-lg font-serif text-white mb-2">Sub-Second Video Reasoning</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  41-second natural language game scrubbing powered by on-premise DGX GPU clusters.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl">
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase block mb-2">02. The Loop Ecosystem</span>
                <h4 className="text-lg font-serif text-white mb-2">Video to Journal Synergy</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Spotlight video cuts automatically bound to Periodical mobile athlete development journals.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase block mb-2">03. 5-Voice Network</span>
                <h4 className="text-lg font-serif text-white mb-2">Unified Accountability</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Connecting Skater, Head Coach, Evaluator, Skills Trainer, and Parent in one developmental flow.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
}
