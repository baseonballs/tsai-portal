"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { RinkTelemetryChart } from "@/components/landing/RinkTelemetryChart";
import { BetaSignupForm } from "@/components/landing/BetaSignupForm";
import { DualLedgersScienceSection } from "@/components/landing/DualLedgersScienceSection";
import { 
  Camera, 
  Network, 
  Server, 
  Cpu, 
  Shield, 
  Activity, 
  ArrowRight, 
  Check, 
  Layers, 
  Sparkles, 
  Film, 
  BookOpen, 
  Zap, 
  Brain, 
  BarChart2,
  Lock,
  Workflow
} from "lucide-react";

export default function TechnologySolutionsPage() {
  const [activeTier, setActiveTier] = useState<"encore" | "tempest" | "edgeiq" | "stratus">("encore");

  const appTiers = [
    {
      id: "encore" as const,
      name: "Encore",
      tagline: "THE COACH WORKBENCH",
      badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      description: "The media-forward coaching studio built to capture and command athlete attention. Features our SOTA Coach Workbench, dual-playback split-screen, and strict sub-second timestamp locking.",
      keyFeatures: [
        "Interactive Coach Workbench wrapping tactical curation in deep-slate frosted glass",
        "Dual-Playback Split-Screen side-by-side analysis (NHL benchmark vs Skater)",
        "Strict timestamp locking to scrub, pause, and sync reference clips instantly"
      ],
      icon: Film,
      color: "cyan"
    },
    {
      id: "tempest" as const,
      name: "Tempest",
      tagline: "THE POSSESSION ANALOGUE",
      badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
      description: "Translates team structure into plain bench language. Flow lines, zone grids, tactics lab, possession console, and storm decks.",
      keyFeatures: [
        "Narrates how your team earns space, zone residence, and pressure cycles",
        "Identifies who tilted the ice and when momentum flipped",
        "Situational analysis for special teams and overtime rhythms"
      ],
      icon: Activity,
      color: "indigo"
    },
    {
      id: "edgeiq" as const,
      name: "EdgeIQ",
      tagline: "THE EVALUATOR",
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      description: "For the scout who lives between telemetry and video. Threat maps, benchmark observatory, projection vaults, signals, and biomechanics-inspired panels.",
      keyFeatures: [
        "Scout the development delta and player progression, not just the leaderboard",
        "Dossier-style scouting reports and comparison tools built for placement meetings",
        "Layered danger topology indexing how risk is created or denied on the ice"
      ],
      icon: BarChart2,
      color: "emerald"
    },
    {
      id: "stratus" as const,
      name: "Stratus",
      tagline: "THE SKILLS SCIENTIST",
      badgeColor: "text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10",
      description: "Sequences micro-skills into season-long developmental arcs. Neural coaching lab, rink twins, kinetic surfaces, and apex arenas.",
      keyFeatures: [
        "Sequences what we drill this week, how we know it stuck, and what unlocks next",
        "Holographic 3D rink twins and kinetic surfaces mapping skater pathways",
        "Provides a plain-language development blueprint parents easily recognize"
      ],
      icon: Sparkles,
      color: "fuchsia"
    }
  ];

  const currentTier = appTiers.find(t => t.id === activeTier)!;

  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white flex flex-col">
      <LandingHeader />

      <main className="flex-1 flex flex-col pt-24 relative z-10">
        
        {/* HERO SECTION */}
        <section className="px-6 py-24 sm:py-32 lg:px-8 text-center max-w-5xl mx-auto relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-900/15 blur-[140px] rounded-full pointer-events-none" />

          <div className="inline-flex items-center justify-center gap-2.5 rounded-full border border-cyan-500/35 bg-black/90 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold tracking-widest backdrop-blur-xl shadow-xl shadow-cyan-500/15 mb-10 sm:mb-12 hover:border-cyan-400/60 transition-all font-mono">
            <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-cyan-400 font-bold">THE SCIENCE</span>
            <span className="text-zinc-600 font-normal">·</span>
            <span className="text-zinc-200 font-medium uppercase">HIGH-FIDELITY DUAL-LEDGER ENGINE</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-white mb-6 leading-[1.1]">
            Zero-hardware capture.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-400">
              Decision-grade analytics.
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-light text-zinc-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Spotlight is the modern, high-fidelity player development platform bringing decision-grade video intelligence and captive AI to grassroots youth hockey—transforming raw recordings into an interactive playground.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a href="#beta-access" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all transform hover:scale-105">
              Apply for Teams Beta Access
            </a>
            <a href="#architecture" className="w-full sm:w-auto rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2">
              Explore the Platform <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* THE SCIENCE: DUAL LEDGER ARCHITECTURE (CHRONOLOGY & POSSESSION) */}
        <div id="science">
          <DualLedgersScienceSection />
        </div>


        {/* AI-POWERED CLOUD ARCHITECTURE FOR SPORTS INTELLIGENCE */}
        <section id="architecture" className="px-6 py-24 lg:px-8 border-t border-white/10 bg-zinc-950/80 relative">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase font-mono">AI-Powered Cloud Architecture for Sports Intelligence</span>
              <h2 className="mt-4 text-4xl md:text-5xl font-serif text-white leading-tight">
                Two synergistic applications, and four sub-stack programs. One unified tape.
              </h2>
              <p className="mt-6 text-lg text-zinc-400 font-light leading-relaxed">
                Spotlight reconstructs raw game files through four distinct analytical lenses, then distributes tailored learning loops directly to your athletes.
              </p>
            </div>

            {/* Program Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {appTiers.map((tier) => {
                const Icon = tier.icon;
                const isActive = activeTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setActiveTier(tier.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-zinc-800 text-white border border-white/20 shadow-lg" 
                        : "bg-zinc-900/40 text-zinc-400 border border-white/5 hover:bg-zinc-900/80 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
                    <span>{tier.name}</span>
                    <span className="font-mono text-[10px] opacity-60 uppercase">({tier.tagline})</span>
                  </button>
                );
              })}
            </div>

            {/* Active Sub-Stack Card & Live Telemetry Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-6 bg-zinc-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-between shadow-2xl">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-zinc-950 border border-white/10">
                        {React.createElement(currentTier.icon, { className: "w-6 h-6 text-cyan-400" })}
                      </div>
                      <div>
                        <h3 className="text-3xl font-serif text-white">{currentTier.name}</h3>
                        <span className={`inline-block font-mono text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full border mt-1 ${currentTier.badgeColor}`}>
                          {currentTier.tagline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-base leading-relaxed mb-8 font-light">
                    {currentTier.description}
                  </p>

                  <div className="space-y-4 mb-8">
                    <h4 className="text-xs font-mono tracking-widest text-zinc-500 uppercase">Core Analytical Capabilities</h4>
                    {currentTier.keyFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
                        <span className="leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Engine Integration: <strong className="text-white">MASCE L2/L3</strong></span>
                  <span>Timestamp Lock: <strong className="text-cyan-400">Sub-second</strong></span>
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col justify-center">
                <RinkTelemetryChart />
              </div>
            </div>
          </div>
        </section>


        {/* PERIODICAL: ACCOUNTABILITY THROUGH COLLABORATION */}
        <section className="px-6 py-24 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 via-indigo-950/20 to-zinc-950 relative">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase font-mono">Accountability Through Collaboration</span>
                <h2 className="mt-4 text-4xl md:text-5xl font-serif text-white leading-tight">
                  Periodical: Personalized journals & micro-loops in their hands.
                </h2>
                <p className="mt-6 text-lg text-zinc-300 font-light leading-relaxed">
                  Feedback is only valuable if it is lived. Periodical is the collaborative bridge connecting coach intent with player execution. It packages whiteboard sketches, tagged clips, and coaching annotations into personalized journals and micro-loops.
                </p>
                <p className="mt-4 text-base text-zinc-400 font-light leading-relaxed">
                  With daily athlete journaling and interactive planners (macro, meso, micro cycles), players reflect on their decisions and take ownership of their development.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link href="/players-development" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Explore Player's Development <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-black/50 border border-indigo-500/20 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-serif text-lg text-white">Daily Athlete Journaling</h4>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">Voice note reflections and 1–5 self-ratings attached to coach cuts within 24 hours of ice time.</p>
                </div>
                <div className="bg-black/50 border border-fuchsia-500/20 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-fuchsia-400" />
                    <h4 className="font-serif text-lg text-white">Macro / Meso / Micro Cycle Planners</h4>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">Aligning personal Superpower goals with seasonal team tactical development arcs.</p>
                </div>
                <div className="bg-black/50 border border-cyan-500/20 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-serif text-lg text-white">Multi-Voice Accountability Network</h4>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">Player drives, Coach guides, Mentor supports, Parent sees—bringing everyone into one loop.</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* THE AI EDGE · MASCE ENGINE & COST UNLOCK */}
        <section className="px-6 py-24 lg:px-8 border-t border-white/10 bg-zinc-950 relative">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-cyan-400 uppercase font-mono mb-6">
                <Cpu className="w-3.5 h-3.5" /> The AI Edge · MASCE Engine
              </span>
              <p className="text-lg leading-relaxed text-zinc-300 font-light">
                Most AI guesses. Ours is auditable. By running our Multi-Agent Sports Cognition Engine (MASCE) on our owned hybrid GPU fabric and hybrid cloud, we collapsed the economics of automated video analysis.
              </p>
            </div>

            {/* 3 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="group relative rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-md transition-all hover:border-cyan-500/40 hover:bg-zinc-900/60">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 shadow-inner group-hover:scale-110 transition-transform">
                  <Camera className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="mt-8 font-serif text-xl font-medium text-white group-hover:text-cyan-400 transition-colors">
                  Captive AI Engine
                </h3>
                <span className="mt-1 font-mono text-[10px] tracking-widest text-cyan-500 uppercase block mb-6">
                  &gt;92% Deterministic Prediction
                </span>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 text-cyan-500 mt-0.5" />
                    <span>Stop scrubbing manually: query plays semantically in plain language.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 text-cyan-500 mt-0.5" />
                    <span>A pipeline of specialized agents builds provenance-tagged event and possession ledgers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 text-cyan-500 mt-0.5" />
                    <span>Every analytics run self-checks against 14 physics & hockey rules to prevent drift.</span>
                  </li>
                </ul>
              </div>

              <div className="group relative rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-md transition-all hover:border-indigo-500/40 hover:bg-zinc-900/60">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 shadow-inner group-hover:scale-110 transition-transform">
                  <Network className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="mt-8 font-serif text-xl font-medium text-white group-hover:text-indigo-400 transition-colors">
                  Semantic Chronology
                </h3>
                <span className="mt-1 font-mono text-[10px] tracking-widest text-indigo-400 uppercase block mb-6">
                  L1 → L4 Architecture
                </span>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                    <span>Atomic facts (Nano) roll deterministically up to shifts (Meso) and stats (Macro).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                    <span>YOLO tracking stabilized into consistent identities, grounded by OCR scoreboards.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                    <span>Timeline never drifts: reproducible, auditable, and not summarized.</span>
                  </li>
                </ul>
              </div>

              <div className="group relative rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-md transition-all hover:border-emerald-500/40 hover:bg-zinc-900/60">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 shadow-inner group-hover:scale-110 transition-transform">
                  <Server className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mt-8 font-serif text-xl font-medium text-white group-hover:text-emerald-400 transition-colors">
                  The Cost Unlock
                </h3>
                <span className="mt-1 font-mono text-[10px] tracking-widest text-emerald-400 uppercase block mb-6">
                  From $30 to $2.87 per game
                </span>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>Optimized cloud GPU architecture eliminates traditional compute overhead.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>Processes a full 90-minute 1080p game in under 60 minutes for pennies.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>Scale-to-zero cloud keeps fixed overhead near zero, producing high margins.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tactical Pipeline Node Visualization */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/20 p-2 overflow-hidden relative group">
              <div className="rounded-2xl border border-white/5 bg-zinc-950 p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[280px]">
                {/* Radial Grid */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-4xl justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full border border-cyan-500/30 bg-cyan-950/30 flex items-center justify-center animate-pulse">
                      <Camera className="text-cyan-400 w-6 h-6" />
                    </div>
                    <span className="font-mono text-[10px] tracking-widest text-zinc-400">RAW FOOTAGE INGEST</span>
                  </div>

                  <div className="hidden md:flex flex-1 h-px bg-zinc-800 relative">
                    <div className="absolute top-1/2 left-0 w-2 h-2 -translate-y-1/2 bg-cyan-400 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-xl border border-indigo-500/30 bg-indigo-950/30 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-xl border border-indigo-500/50 animate-[spin_4s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
                      <Network className="text-indigo-400 w-8 h-8" />
                    </div>
                    <span className="font-mono text-[10px] tracking-widest text-zinc-400 text-center">MASCE ENGINE<br/>L1–L4 CHRONOLOGY</span>
                  </div>

                  <div className="hidden md:flex flex-1 h-px bg-zinc-800 relative">
                    <div className="absolute top-1/2 left-0 w-2 h-2 -translate-y-1/2 bg-emerald-400 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full border border-emerald-500/30 bg-emerald-950/30 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                      <Activity className="text-emerald-400 w-6 h-6" />
                    </div>
                    <span className="font-mono text-[10px] tracking-widest text-zinc-400">AUDITABLE LEDGER</span>
                  </div>
                </div>
                
                <div className="relative z-10 mt-10 text-center">
                  <p className="text-xs text-zinc-400 font-mono">
                    Deterministic Provenance-Tagged Event &amp; Possession Ledgers · 14-Point Hockey Integrity Audit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ENTERPRISE INFRASTRUCTURE & SECURITY */}
        <section className="px-6 py-20 lg:px-8 border-t border-white/10 bg-zinc-950/60">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-3xl text-white mb-12">Enterprise-Grade Infrastructure & Minor Athlete Protection</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-cyan-950/50 flex items-center justify-center mb-4 border border-cyan-500/20">
                  <Workflow className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-serif text-white mb-2">Temporal Job Orchestration</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">Fault-tolerant workflow execution ensuring video ingest, AI inferencing, and clip stitching resume seamlessly across node restarts.</p>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-indigo-950/50 flex items-center justify-center mb-4 border border-indigo-500/20">
                  <Server className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-serif text-white mb-2">MinIO S3 Video Vault</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">Encrypted multi-tenant storage with strict retention rules and sub-second timestamped segment retrieval.</p>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/50 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-serif text-white mb-2">COPPA Minor Compliance</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">Strict COPPA compliance with verifiable parental consent, minor athlete data isolation, and parent-gated review loops.</p>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm hover:border-amber-500/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-950/50 flex items-center justify-center mb-4 border border-amber-500/20">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-serif text-white mb-2">SOC 2 & Zero-Trust</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">SOC 2 Type II architectural alignment, enterprise tenant isolation, end-to-end media encryption, and immutable audit logs.</p>
              </div>
            </div>
          </div>
        </section>


        {/* TEAMS BETA REGISTRATION */}
        <section id="beta-access" className="px-6 py-28 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 via-cyan-950/20 to-zinc-950 text-center relative overflow-hidden">
          <div className="mx-auto max-w-3xl relative z-10">
            <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">Teams Beta Program · Now Forming</span>
            <h2 className="mt-6 text-4xl font-serif tracking-tight text-white sm:text-6xl leading-tight">
              Bring <span className="text-zinc-400/80 font-semibold">Transcendental Sports </span><span className="text-cyan-400/80 font-sans">AI</span> to your team.
            </h2>
            <p className="mt-6 text-lg text-zinc-300 max-w-2xl mx-auto font-light">
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
