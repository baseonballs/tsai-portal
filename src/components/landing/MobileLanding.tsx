"use client";

import React from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BetaSignupForm } from "@/components/landing/BetaSignupForm";
import Link from "next/link";
import { Sparkles, ArrowRight, Monitor, Film, BookOpen, Check, ShieldCheck } from "lucide-react";

export function MobileLanding() {
  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white">
      {/* Background glow effects tailored for mobile */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[80%] h-[40%] rounded-full bg-cyan-900/20 blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[80%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px]" />
      </div>

      <LandingHeader />

      <main className="flex flex-col pt-14 relative z-10">

        {/* MOBILE HERO SECTION */}
        <section className="px-5 pt-8 pb-12 text-center relative overflow-hidden">
          {/* Compact Top Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-black/85 px-3 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur-md mb-6 shadow-md">
            <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 animate-pulse" />
            <span className="text-cyan-400 font-bold tracking-wider uppercase">Transcendental Sports AI</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-serif tracking-tight text-white mb-4 leading-[1.18]">
            Where{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-amber-400 font-medium">
              video intelligence
            </span>{" "}
            meets<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-amber-300 font-medium">
              player reflection
            </span>
            <span className="text-white">.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm font-light text-zinc-300 max-w-sm mx-auto leading-relaxed mb-8">
            Unlocking sports intelligence to guide, measure, and accelerate youth athlete growth on the path to their full potential.
          </p>

          {/* Mobile CTA Buttons */}
          <div className="flex flex-col gap-3 mb-10">
            <Link
              href="#beta-access"
              className="w-full rounded-full border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 active:scale-[0.98] px-6 py-3.5 text-xs font-bold text-cyan-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Join the Team Beta Program</span>
            </Link>

            <Link
              href="/coachs-corner"
              className="w-full rounded-full border border-white/15 bg-black/50 hover:bg-white/10 active:scale-[0.98] px-6 py-3.5 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore Coach's Corner</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            </Link>
          </div>

          {/* Mobile Quick Stats */}
          <div className="grid grid-cols-2 gap-2.5 text-left border-t border-white/10 pt-5 bg-black/40 p-4 rounded-xl border backdrop-blur-md">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="text-xl font-serif text-white font-bold flex items-center gap-1">
                41s <Sparkles className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">Natural Language Discovery</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="text-xl font-serif font-bold text-cyan-400">
                8 <span className="text-xs text-cyan-300 font-sans">Superpowers</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">Spatial Micro-Loop Rail</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="text-xl font-serif font-bold text-indigo-400">The Loop</div>
              <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">Continuous Feedback</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="text-xl font-serif font-bold text-amber-400">7 Voices</div>
              <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">Player, Coach, Trainer, Mentor, Nutritionist, Parent &amp; Scout</div>
            </div>
          </div>
        </section>

        {/* SPOTLIGHT DESKTOP NOTICE (DESKTOP WORKBENCH NOTICE) */}
        <section className="px-5 py-6 bg-gradient-to-r from-amber-950/30 via-zinc-900/60 to-cyan-950/30 border-y border-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                Desktop Experience Recommended for Spotlight
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Spotlight's multi-angle Cut Room, split-screen playback, and spatial telemetry workbench are optimized for desktop monitors. Periodical athlete journals and team beta registration are fully supported on mobile.
              </p>
            </div>
          </div>
        </section>

        {/* MOBILE VALUE PROP: THE LOOP */}
        <section className="px-5 py-12 border-b border-white/10 bg-zinc-950">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-cyan-400 uppercase mb-2 block text-center">Product Value</span>
          <h2 className="text-2xl font-serif text-white text-center mb-4">
            The Loop — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-400">Connecting the Dots</span>
          </h2>
          <blockquote className="text-sm font-serif italic text-zinc-300 text-center mb-6 leading-relaxed">
            "The goal lived in the journal. The proof lived in the film. They never met — until now."
          </blockquote>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-black/60 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Spotlight Engine</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                AI video intelligence mapping shift events, puck possession, and player velocity.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Periodical Journal</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Daily voice & text player reflections, weekly agendas, and multi-voice accountability.
              </p>
            </div>
          </div>
        </section>

        {/* MOBILE TEAM BETA FORM */}
        <section id="beta-access" className="px-5 py-14 bg-gradient-to-b from-zinc-950 via-cyan-950/20 to-zinc-950 text-center">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-cyan-400 uppercase block mb-2">Team Beta Program</span>
          <h2 className="text-3xl font-serif text-white mb-3">
            Bring <span className="text-cyan-400">Transcend AI</span> to your team.
          </h2>
          <p className="text-xs text-zinc-300 mb-8 max-w-xs mx-auto leading-relaxed">
            Join the founding cohort of youth ice hockey coaching staffs and clubs.
          </p>

          <div className="text-left bg-black/70 border border-white/10 p-5 rounded-xl backdrop-blur-xl shadow-2xl">
            <BetaSignupForm />
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
