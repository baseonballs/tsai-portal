"use client";

import React from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { BetaSignupForm } from "@/components/landing/BetaSignupForm";
import { LoopingDotsFlow } from "@/components/landing/LoopingDotsFlow";
import { TranscendEngineSubstrate } from "@/components/landing/TranscendEngineSubstrate";
import { ArrowRight, BrainCircuit, Activity, Repeat, FileText, Target, ShieldCheck, Zap, BarChart2 } from "lucide-react";

export default function SpotlightAndPeriodicalPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white">
      <LandingHeader />

      <main className="flex flex-col pt-24">
        {/* HERO */}
        <section className="relative px-6 py-24 sm:py-32 lg:px-8 border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-zinc-950/80 to-zinc-950 pointer-events-none" />
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-400 mb-8 backdrop-blur-md">
              <span className="mr-2 h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
              TSAI Spotlight × Periodical · Teams Beta Program
            </div>
            <h1 className="text-5xl font-serif tracking-tight text-white sm:text-7xl leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Spotlight sees the game.</span><br />
              Periodical hears <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">the player.</span>
            </h1>
            <p className="mt-8 text-xl leading-8 text-zinc-300 max-w-2xl mx-auto font-light">
              One engine watches every shift with AI precision. The other captures the goals, the journals, and the voices — player, coach, mentor, parent — that turn what the film <em className="text-white">found</em> into who the athlete <em className="text-white">becomes</em>.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#beta" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all transform hover:scale-105">
                Join the Teams Beta Program
              </a>
              <a href="#sequel" className="w-full sm:w-auto text-sm font-semibold leading-6 text-white hover:text-indigo-300 flex items-center justify-center gap-1.5 py-4 px-6 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all">
                See the 3-Week Journey <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <p className="mt-6 text-xs text-zinc-500 uppercase tracking-widest font-mono">
              One Platform · Both Engines Included
            </p>
          </div>
        </section>

        {/* ABSTRACTION: THE LOOP CONNECTS THE DOTS */}
        <section className="px-6 py-20 lg:px-8 border-b border-white/5 bg-gradient-to-r from-cyan-950/30 via-indigo-950/30 to-fuchsia-950/30 backdrop-blur-md">
          <div className="mx-auto max-w-6xl text-center">
            <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase mb-3 block">The Core Synergy</span>
            <h2 className="text-3xl sm:text-5xl font-serif text-white mb-6">
              The Loop — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">Connects the Dots</span>
            </h2>
            <p className="text-xl font-serif italic text-zinc-200 max-w-3xl mx-auto mb-10">
              "The goal lived in the journal. The proof lived in the film. They never met — until now. The Loop connects the dots."
            </p>

            <LoopingDotsFlow />
          </div>
        </section>

        {/* TWO ENGINES */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-950 relative">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-fuchsia-400 uppercase">The Dual-Engine Ecosystem</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">Two engines.<br />One development loop.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Spotlight Engine */}
              <div className="rounded-2xl border border-cyan-500/30 bg-black/50 p-8 hover:border-cyan-500/50 transition-colors shadow-2xl">
                <div className="text-[10px] font-semibold tracking-widest text-cyan-400 uppercase mb-4 font-mono">Engine 01 · The Intelligence</div>
                <h3 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-rose-500 mb-4">Spotlight</h3>
                <p className="text-zinc-300 text-lg mb-6 border-b border-white/10 pb-6 font-light">Sees the game with AI precision and proves what happened.</p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-zinc-400 text-sm"><strong className="text-white">Captive AI Discovery</strong> — 41s semantic search across your full game library and pro master references.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-zinc-400 text-sm"><strong className="text-white">Cut Room &amp; Superpower Rail</strong> — directed cuts, dual-playback split screen, locked micro-loops.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <BarChart2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-zinc-400 text-sm"><strong className="text-white">Watch Telemetry</strong> — loop counts, dwell time, 100% unit completion proof.</p>
                  </li>
                </ul>
              </div>

              {/* Periodical Engine */}
              <div className="rounded-2xl border border-indigo-500/30 bg-black/50 p-8 hover:border-indigo-500/50 transition-colors shadow-2xl">
                <div className="text-[10px] font-semibold tracking-widest text-indigo-400 uppercase mb-4 font-mono">Engine 02 · The Bridge</div>
                <h3 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 mb-4">Periodical</h3>
                <p className="text-zinc-300 text-lg mb-6 border-b border-white/10 pb-6 font-light">Hears the player and turns reflection into a shared plan.</p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-zinc-400 text-sm"><strong className="text-white">Personal Plans &amp; Goals</strong> — objectives the player sets, shaped with coaches, trainers, parents, and scouts.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-zinc-400 text-sm"><strong className="text-white">Player Journaling &amp; Read-back</strong> — daily prompts that turn every shift into a coach-reviewed rep.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <Repeat className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-zinc-400 text-sm"><strong className="text-white">Multi-Voice Feedback Loops</strong> — continuous dialogue between player, coach, trainer, parent, and scout.</p>
                  </li>
                </ul>
              </div>
            </div>

            {/* TRANSCEND PLATFORM FOUNDATION (AI ENGINE SUBSTRATE) */}
            <TranscendEngineSubstrate />

            {/* TOGETHER: THE FLYWHEEL */}
            <div className="mt-12 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-fuchsia-950/40 border border-white/10 p-8 text-center max-w-3xl mx-auto shadow-xl">
              <div className="text-xs font-semibold tracking-widest text-fuchsia-400 uppercase mb-3 font-mono">Together: The Flywheel</div>
              <p className="text-lg text-zinc-200 leading-relaxed">
                Spotlight's telemetry tells Periodical what the player <em className="text-white">did</em>. Periodical's journals tell Spotlight what the player <em className="text-white">thought</em>. The AI reads both — and surfaces insights neither could produce alone.
              </p>
            </div>
          </div>
        </section>

        {/* 3-WEEK JOURNEY STORYBOARD */}
        <section id="sequel" className="px-6 py-24 lg:px-8 border-t border-white/5 bg-zinc-900/50">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-20">
              <span className="text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase">Case Study · #26 Corinne L. (14U Center)</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">What the Cut Room started,<br />Periodical finishes.</h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                Follow #26 across three weeks — from a 2.6 superpower trend baseline to 89% clean D-zone exits on game night.
              </p>
            </div>

            <div className="space-y-24">
              {/* ACT 1 */}
              <div className="flex flex-col md:flex-row gap-8 bg-black/40 p-8 rounded-2xl border border-white/5">
                <div className="md:w-1/4">
                  <div className="text-2xl font-serif text-white">Act I</div>
                  <div className="text-xs font-mono text-cyan-400">The Voice</div>
                </div>
                <div className="md:w-3/4 text-sm text-zinc-300 leading-relaxed space-y-3">
                  <h4 className="text-lg font-serif text-white">Fourteen loops later, the journal opens.</h4>
                  <p className="text-zinc-400">Corinne finishes her Clipboard assignment and enters Periodical. One question about one read:</p>
                  <p className="italic text-zinc-200 bg-zinc-900/80 p-4 rounded border border-white/5 font-serif">
                    "I keep rimming it because I hear the forecheck coming before I even look. The pro waits an extra beat and checks her shoulder first. I panic early."
                  </p>
                </div>
              </div>

              {/* ACT 2 */}
              <div className="flex flex-col md:flex-row gap-8 bg-black/40 p-8 rounded-2xl border border-white/5">
                <div className="md:w-1/4">
                  <div className="text-2xl font-serif text-white">Act II</div>
                  <div className="text-xs font-mono text-indigo-400">The Synthesis</div>
                </div>
                <div className="md:w-3/4 text-sm text-zinc-300 leading-relaxed space-y-3">
                  <h4 className="text-lg font-serif text-white">The AI reads between the lines.</h4>
                  <p className="text-zinc-400">Spotlight cross-references her journal entry against watch telemetry, game film, and a trainer's note from three weeks ago:</p>
                  <div className="bg-zinc-900/80 p-4 rounded border border-cyan-500/20 text-xs text-zinc-300 space-y-2">
                    <div><strong className="text-cyan-400">Pattern:</strong> D-zone turnovers cluster on right-wall retrievals under F1 pressure.</div>
                    <div><strong className="text-cyan-400">Insight:</strong> Early panic stems from limited shoulder-checking habit.</div>
                  </div>
                </div>
              </div>

              {/* ACT 3 */}
              <div className="flex flex-col md:flex-row gap-8 bg-black/40 p-8 rounded-2xl border border-white/5">
                <div className="md:w-1/4">
                  <div className="text-2xl font-serif text-white">Act III</div>
                  <div className="text-xs font-mono text-emerald-400">The Receipt</div>
                </div>
                <div className="md:w-3/4 text-sm text-zinc-300 leading-relaxed space-y-3">
                  <h4 className="text-lg font-serif text-white">Game night: 8-for-9 clean exits.</h4>
                  <p className="text-zinc-400">Three weeks later, rival game under heavy forecheck. Corinne shoots first and leads 8-for-9 clean exits.</p>
                  <p className="italic text-white bg-emerald-950/20 border border-emerald-500/30 p-4 rounded font-serif">
                    "Looked first every time. Heard him coming and didn't panic. It felt slow, like I had an extra second nobody else had."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TEAMS BETA CTA */}
        <section id="beta" className="px-6 py-32 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 via-cyan-950/20 to-zinc-950 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase font-mono">Teams Beta Program</span>
            <h2 className="mt-6 text-5xl font-serif tracking-tight text-white sm:text-7xl leading-tight">
              Connect the dots on <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400">development.</span>
            </h2>
            <p className="mt-8 text-xl leading-8 text-zinc-300 max-w-2xl mx-auto">
              Get the complete ecosystem — Spotlight's intelligence and Periodical's bridge — live on your team's roster for the season.
            </p>
            
            <div className="mt-12 text-left max-w-2xl mx-auto">
              <BetaSignupForm />
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
