"use client";

import React from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { YouthHockeyCinematicBanner } from "@/components/landing/YouthHockeyCinematicBanner";
import { TheLoopIllustration } from "@/components/landing/TheLoopIllustration";
import { LockerRoomHub } from "@/components/landing/LockerRoomHub";
import { RinkTelemetryChart } from "@/components/landing/RinkTelemetryChart";
import { BetaSignupForm } from "@/components/landing/BetaSignupForm";
import { LandingFooter } from "@/components/landing/LandingFooter";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export function DesktopLanding() {
  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/15 blur-[140px]" />
      </div>

      <LandingHeader />

      <main className="flex flex-col pt-16 relative z-10" suppressHydrationWarning>
        
        {/* HERO BANNER WITH CINEMATIC YOUTH HOCKEY GRAPHICS */}
        <YouthHockeyCinematicBanner />

        {/* ABSTRACTION BANNER: THE LOOP CONNECTS THE DOTS */}
        <section className="px-6 py-20 lg:px-8 border-y border-white/10 bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-amber-950/30 backdrop-blur-md">
          <div className="mx-auto max-w-6xl text-center">
            <span className="text-xs font-semibold tracking-[0.25em] text-cyan-400 uppercase mb-3 block">Product Value</span>
            <h2 className="text-4xl sm:text-6xl font-serif text-white mb-6">
              The Loop — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-400">Connecting the Dots</span>
            </h2>
            <blockquote className="text-xl sm:text-2xl font-serif italic text-zinc-200 max-w-4xl mx-auto mb-10">
              "The goal lived in the journal. The proof lived in the film. They never met — until now. The Loop connects the dots."
            </blockquote>

            <TheLoopIllustration />
          </div>
        </section>

        {/* DUAL ENGINES FLYWHEEL */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-950">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">The Synergy</span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Spotlight <span className="text-cyan-400 font-medium">Sees</span> the Game. Periodical <span className="text-amber-400 font-medium">Hears</span> the Player.</h2>
              <p className="text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                Spotlight's telemetry tells Periodical what the player <em className="text-white">did</em>. Periodical's journals tell Spotlight what the player <em className="text-white">thought</em>. The AI connects both—keeping coaches and mentors right at the heart of the loop.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black/50 border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-500/50 transition-colors shadow-2xl">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase block mb-2">Spotlight Engine</span>
                <h3 className="text-3xl font-serif font-medium text-white mb-4 block">Video Intelligence</h3>
                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Captive AI natural-language discovery</li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400" /> 
                    <span>4-tier Hockey Taxonomy (<span className="text-cyan-400 font-medium">Nano</span>, <span className="text-indigo-400 font-medium">Micro</span>, <span className="text-amber-400 font-medium">Meso</span>, <span className="text-emerald-400 font-medium">Macro</span>)</span>
                  </li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Cut Room Workbench &amp; Superpower Rail</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Dual-playback split-screen &amp; locked micro-loops</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Telemetry Board (dwell time, loop counts)</li>
                </ul>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <Link href="/locker-room" className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-1">
                    Step Into The Locker Room <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="bg-black/50 border border-indigo-500/30 rounded-2xl p-8 hover:border-indigo-500/50 transition-colors shadow-2xl">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase block mb-2">Periodical Engine</span>
                <h3 className="text-3xl font-serif font-medium text-white mb-4 block">Player Reflection</h3>
                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Interactive weekly planners &amp; agendas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Daily voice/text player journaling</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> The Drop (hued cinematic cuts in journal)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Read-back self-rating &amp; Superpower trend lines</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Multi-Voice accountability (Player, Coach, Trainer, Parent, Scout)</li>
                </ul>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <Link href="/players-development" className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs flex items-center gap-1">
                    Explore Player's Development <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THE LOCKER ROOM INTERACTIVE SHOWCASE */}
        <LockerRoomHub />

        {/* RINK TELEMETRY CHART COMPONENT */}
        <section className="px-6 py-24 lg:px-8 border-t border-white/5 bg-zinc-900/40">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">Live Telemetry Visualization</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">Rink Telemetry & Spatial Intelligence</h2>
              <p className="mt-4 text-base text-zinc-400 max-w-2xl mx-auto">
                Real-time spatial tracking mapping shift events across the rink surface.
              </p>
            </div>
            <RinkTelemetryChart />
          </div>
        </section>

        {/* TEAM BETA REGISTRATION FORM */}
        <section id="beta-access" className="px-6 py-32 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 via-cyan-950/20 to-zinc-950 text-center relative overflow-hidden">
          <div className="mx-auto max-w-3xl relative z-10">
            <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">Team Beta Program · Now Forming</span>
            <h2 className="mt-6 text-5xl font-serif tracking-tight text-white sm:text-7xl leading-tight">
              Bring <span className="text-zinc-400/80 font-semibold">Transcendental Sports </span><span className="text-cyan-400/80 font-sans">AI</span> to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-400">team.</span>
            </h2>
            <p className="mt-6 text-lg text-zinc-300 max-w-2xl mx-auto">
              Join the founding cohort of youth ice hockey coaching staffs and clubs. Request early access for your team today.
            </p>

            <div className="mt-12 text-left bg-black/60 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
              <BetaSignupForm />
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
