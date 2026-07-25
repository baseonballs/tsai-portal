"use client";

import React from "react";
import Link from "next/link";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { BetaSignupForm } from "@/components/landing/BetaSignupForm";
import { RinkTelemetryChart } from "@/components/landing/RinkTelemetryChart";
import { 
  ArrowRight, 
  Search, 
  Layers, 
  Lock, 
  Repeat, 
  Send, 
  BarChart, 
  BrainCircuit, 
  Sparkles,
  Flame,
  Target,
  Users,
  Shield,
  Activity,
  Check
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/15 blur-[140px]" />
      </div>

      <LandingHeader />

      <main className="flex flex-col pt-24 relative z-10">
        
        {/* HERO */}
        <section className="px-6 py-24 sm:py-32 lg:px-8 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-zinc-300 mb-8 backdrop-blur-md">
            <span className="mr-2 h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-cyan-400 font-bold">Spotlight</span> <span className="text-amber-400 font-bold mx-1.5">·</span> <span className="text-indigo-400 font-bold">Periodical</span> <span className="mx-2 text-zinc-600">·</span> Teams Beta Program
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-white mb-6 leading-[1.1]">
            Where video intelligence meets<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400">
              player reflection.
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-light text-zinc-300 italic mb-12 max-w-3xl mx-auto leading-relaxed">
            Unlocking sports intelligence to guide, measure, and accelerate athlete growth on the path to their full potential.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href="#beta-access" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all transform hover:scale-105">
              Apply for Teams Beta Access
            </a>
            <Link href="/coachs-corner" className="w-full sm:w-auto text-sm font-semibold leading-6 text-white hover:text-cyan-300 flex items-center justify-center gap-1.5 py-4 px-6 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all">
              Explore Coach's Corner <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* QUICK STATS STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left border-t border-white/10 pt-8">
            <div>
              <div className="text-2xl font-serif text-white font-bold">41s</div>
              <div className="text-xs text-zinc-400">Natural-language clip search</div>
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-cyan-400">4 Superpowers</div>
              <div className="text-xs text-zinc-400">Explode, Own Puck, Threat, Quick Feet</div>
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-indigo-400">The Loop</div>
              <div className="text-xs text-zinc-400">Cut Room × Film Room</div>
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-fuchsia-400">4 Voices</div>
              <div className="text-xs text-zinc-400">Player, Coach, Mentor, Parent</div>
            </div>
          </div>
        </section>

        {/* ABSTRACTION BANNER: THE LOOP CONNECTS THE DOTS */}
        <section className="px-6 py-20 lg:px-8 border-y border-white/10 bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-fuchsia-950/40 backdrop-blur-md">
          <div className="mx-auto max-w-6xl text-center">
            <span className="text-xs font-semibold tracking-[0.25em] text-cyan-400 uppercase mb-3 block">Platform Architecture</span>
            <h2 className="text-4xl sm:text-6xl font-serif text-white mb-6">
              The Loop — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">Connects the Dots</span>
            </h2>
            <blockquote className="text-xl sm:text-2xl font-serif italic text-zinc-200 max-w-4xl mx-auto mb-10">
              "The goal lived in the journal. The proof lived in the film. They never met — until now. The Loop connects the dots."
            </blockquote>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 max-w-5xl mx-auto text-left">
              {[
                { step: "01", title: "Spot it", desc: "AI surfaces reads in 41s" },
                { step: "02", title: "Cut it", desc: "Bind superpower & goal" },
                { step: "03", title: "Send it", desc: "Push cut + voice note" },
                { step: "04", title: "The Drop", desc: "Lands in player journal" },
                { step: "05", title: "Read-back", desc: "Reflect & self-rate rep" },
                { step: "06", title: "The Rip", desc: "Superpower levels up" },
              ].map((s, i) => (
                <div key={i} className="bg-black/50 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">{s.step}</span>
                  <h4 className="text-sm font-serif text-white font-semibold mb-0.5">{s.title}</h4>
                  <p className="text-[10px] text-zinc-400 leading-tight">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DUAL ENGINES FLYWHEEL */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-950">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-fuchsia-400 uppercase">The Synergy</span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Spotlight Sees the Game. Periodical Hears the Player.</h2>
              <p className="text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                Spotlight's telemetry tells Periodical what the player <em className="text-white">did</em>. Periodical's journals tell Spotlight what the player <em className="text-white">thought</em>. The AI connects both—keeping coaches and mentors right at the heart of the loop.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black/50 border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-500/50 transition-colors shadow-2xl">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase block mb-2">Spotlight Engine</span>
                <h3 className="text-3xl font-serif text-white mb-4">Video Intelligence</h3>
                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Captive AI natural-language discovery</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> 3-tier Hockey Taxonomy (Macro, Meso, Micro)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Cut Room Workbench & Superpower Rail</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Dual-playback split-screen & locked micro-loops</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Telemetry Board (dwell time, loop counts)</li>
                </ul>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <Link href="/coachs-corner" className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-1">
                    Explore Coach's Corner <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="bg-black/50 border border-indigo-500/30 rounded-2xl p-8 hover:border-indigo-500/50 transition-colors shadow-2xl">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase block mb-2">Periodical Engine</span>
                <h3 className="text-3xl font-serif text-white mb-4">Player Reflection</h3>
                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Interactive weekly planners & agendas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Daily voice/text player journaling</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> The Drop (hued cinematic cuts in journal)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Read-back self-rating & Superpower trend lines</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> 4-Voice accountability (Player, Coach, Mentor, Parent)</li>
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

        {/* TEAMS BETA REGISTRATION FORM */}
        <section id="beta-access" className="px-6 py-32 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 via-cyan-950/20 to-zinc-950 text-center relative overflow-hidden">
          <div className="mx-auto max-w-3xl relative z-10">
            <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">Teams Beta Program · Now Forming</span>
            <h2 className="mt-6 text-5xl font-serif tracking-tight text-white sm:text-7xl leading-tight">
              Bring <span className="text-amber-400 font-semibold">Transcendental Sports</span> to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400">team.</span>
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
