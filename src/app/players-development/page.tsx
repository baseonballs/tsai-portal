"use client";

import React, { useState } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { BetaSignupForm } from "@/components/landing/BetaSignupForm";
import { HockeyStickTrajectoryIllustration } from "@/components/landing/HockeyStickTrajectoryIllustration";
import { 
  ArrowRight, 
  Target, 
  Brain, 
  MessageSquare, 
  Search, 
  Layers, 
  Lock, 
  Repeat, 
  Send, 
  BarChart,
  Sparkles,
  Flame,
  Zap,
  CheckCircle,
  TrendingUp,
  Award,
  Users,
  User,
  ShieldCheck,
  Activity,
  Heart,
  Mic,
  Smile,
  Shield
} from "lucide-react";

export default function PlayersDevelopmentPage() {
  const [activeTab, setActiveTab] = useState<"Drop" | "Readback" | "Rip">("Drop");

  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-indigo-500/35 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-900/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-fuchsia-900/15 blur-[140px]" />
      </div>

      <LandingHeader />

      <main className="flex flex-col pt-24 relative z-10">
        
        {/* HERO */}
        <section className="px-6 py-24 sm:py-32 lg:px-8 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center justify-center gap-2.5 rounded-full border border-indigo-500/35 bg-black/90 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold tracking-wider text-indigo-300 backdrop-blur-xl shadow-xl shadow-indigo-500/15 mb-10 sm:mb-12 hover:border-indigo-400/60 transition-all">
            <TrendingUp className="h-4 w-4 text-indigo-400 shrink-0" />
            <span className="text-indigo-400 font-bold tracking-widest uppercase">Player's Development</span>
            <span className="text-zinc-600 font-normal">·</span>
            <span className="text-zinc-200 font-medium tracking-wide uppercase">The Athlete's Growth Continuum</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-white mb-6 leading-[1.1]">
            From passive film to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-400">
              active growth.
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-light text-zinc-300 italic mb-12 max-w-3xl mx-auto leading-relaxed">
            Spotlight & Periodical unlock sports intelligence to guide, measure, and accelerate athlete growth on the path to their full potential.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#filmroom" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all transform hover:scale-105">
              Enter The Film Room
            </a>
            <a href="#superpowers" className="w-full sm:w-auto text-sm font-semibold leading-6 text-white hover:text-indigo-300 flex items-center justify-center gap-1.5 py-4 px-6 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all">
              Explore All Superpowers <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* THE GAP BETWEEN THEORY & EXECUTION */}
        <section className="px-6 py-20 lg:px-8 border-y border-white/5 bg-black/40 backdrop-blur-md">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">
              ⚡ The Film Shows the Turnover.<br />
              <span className="text-indigo-400">Periodical Shows the Hesitation.</span>
            </h2>
            <div className="space-y-6 text-lg text-zinc-400 leading-relaxed max-w-3xl mx-auto text-left">
              <p>
                Spotlight can find every D-zone giveaway in forty-one seconds. It can prove an athlete looped a 3-second teaching window fourteen times. But there's a layer of the game no camera reaches: <strong className="text-white">what the player was thinking when the puck left her stick.</strong>
              </p>
              <p className="text-2xl text-white font-serif text-center py-4 border-y border-white/10 my-8">
                Was it fear of the forecheck? A read she made too late?
              </p>
              <p>
                The answer isn't in the pixels. It's in the player — and until now, it stayed there. Periodical is where the player tells you. Spotlight is what makes the telling actionable.
              </p>
            </div>
          </div>
        </section>

        {/* THE LOOP IN ACTION: FILM ROOM & READ-BACK */}
        <section id="filmroom" className="px-6 py-24 lg:px-8 bg-zinc-950">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-fuchsia-400 uppercase">Inside Periodical</span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">The Film Room Experience</h2>
              <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
                Where the coach's cut lands inside the athlete's day and turns into a coach-reviewed rep on the record.
              </p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex justify-center gap-3 mb-12">
              {[
                { id: "Drop" as const, label: "01 / The Drop", sub: "Cinematic Tile" },
                { id: "Readback" as const, label: "02 / The Read-back", sub: "Reflect & Rate" },
                { id: "Rip" as const, label: "03 / The Rip", sub: "Superpower Level Up" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-500/10"
                      : "border-white/5 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900"
                  }`}
                >
                  <span className="text-sm font-serif font-bold block">{tab.label}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{tab.sub}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENT DEMO */}
            <div className="bg-black/60 border border-indigo-500/30 rounded-2xl p-8 max-w-4xl mx-auto backdrop-blur-xl shadow-2xl">
              {activeTab === "Drop" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-fuchsia-400">New Drop Arrived · 7:14 PM</span>
                    <span className="text-xs font-mono text-zinc-400">From Coach Dave</span>
                  </div>
                  <div className="bg-fuchsia-950/20 border border-fuchsia-500/30 rounded-xl p-6 relative overflow-hidden">
                    <div className="text-xs font-mono uppercase tracking-widest text-fuchsia-400 mb-2">Be a Threat</div>
                    <h3 className="text-xl font-serif text-white font-bold mb-3 font-serif">"Watch for this — you're a shooter. Trust it."</h3>
                    <p className="text-sm text-zinc-300 italic mb-4">
                      "3 moments bound to your goal: 'Shoot first, look second.'"
                    </p>
                    <div className="text-xs text-zinc-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle className="w-4 h-4" /> Opened 7:31 PM
                      </span>
                      <span className="text-zinc-500">3 moments · ~48s</span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 text-center italic">
                    The tile is the daily-open magnet: a kid opens the app and there's a cut waiting, in her superpower's color, about the exact thing she's working on.
                  </p>
                </div>
              )}

              {activeTab === "Readback" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">The Read-back · Journal Entry</span>
                    <span className="text-xs font-mono text-zinc-400">9:30 PM</span>
                  </div>
                  <div className="bg-zinc-900/80 p-6 rounded-xl border border-white/10">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Prompt: Did you see the shot before the pass?</span>
                    <p className="text-base font-serif italic text-zinc-200 mb-4 bg-black/40 p-4 rounded border border-white/5">
                      "Yeah — I had it and I looked away. I do that when I'm not sure I'll score. Next game I'm shooting the first one that opens."
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-cyan-400" /> Voice-to-text recorded
                      </span>
                      <span className="text-xs font-mono text-fuchsia-400 font-semibold bg-fuchsia-500/10 border border-fuchsia-500/20 px-3 py-1 rounded-full">
                        Self-Rating: 3 / 5 (Be a Threat)
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 text-center italic">
                    Talking is lower friction than writing for a fourteen-year-old. The rating starts a second series: what the coach's cuts are moving.
                  </p>
                </div>
              )}

              {activeTab === "Rip" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">The Rip · Superpower Level Up</span>
                    <span className="text-xs font-mono text-amber-400 font-bold">+1 Rep Recorded</span>
                  </div>
                  <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-6 text-center">
                    <div className="text-5xl font-serif text-white font-bold mb-2">3.4 <span className="text-2xl text-emerald-400 font-sans">▲</span></div>
                    <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-4">Be a Threat Trend (Baseline 2.6)</div>
                    <p className="text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed">
                      Rivalry game tonight: 5 shots on net, 2 goals. Spotlight tagged the reads automatically, and the fuchsia ring filled with a coach-reviewed point.
                    </p>
                  </div>
                  <p className="text-sm text-zinc-400 text-center italic">
                    That's a superpower being built in real time — and every lap of the loop is on the record.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* THE 8 SUPERPOWERS */}
        <section id="superpowers" className="px-6 py-24 lg:px-8 bg-zinc-900/40 border-t border-white/5">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">The Pillars of Hockey Skill</span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Eight Superpowers. One Rising Line.</h2>
              <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
                Development stops being a vague word and becomes eight tangible superpowers an athlete can actually chase.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-zinc-900/60 border border-amber-500/30 rounded-2xl p-6 hover:bg-zinc-900/80 transition-all shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded">rExplode</span>
                <h3 className="text-2xl font-serif text-white font-bold mt-4 mb-2">Explode</h3>
                <p className="text-xs text-amber-300 italic mb-4 font-serif">"First three steps. Explode and go."</p>
                <p className="text-xs text-zinc-400 leading-relaxed">First-step acceleration, gap closing, and explosive breakout drive.</p>
              </div>

              <div className="bg-zinc-900/60 border border-cyan-500/30 rounded-2xl p-6 hover:bg-zinc-900/80 transition-all shadow-[0_0_20px_rgba(6,182,212,0.05)]">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded">rOwnPuck</span>
                <h3 className="text-2xl font-serif text-white font-bold mt-4 mb-2">Own the Puck</h3>
                <p className="text-xs text-cyan-300 italic mb-4 font-serif">"Hold it a beat. Make them come."</p>
                <p className="text-xs text-zinc-400 leading-relaxed">Puck protection on forehand hip, scanning before retrievals, composure.</p>
              </div>

              <div className="bg-zinc-900/60 border border-fuchsia-500/30 rounded-2xl p-6 hover:bg-zinc-900/80 transition-all shadow-[0_0_20px_rgba(217,70,239,0.05)]">
                <span className="text-xs font-mono font-bold text-fuchsia-400 bg-fuchsia-500/10 px-2.5 py-1 rounded">rThreat</span>
                <h3 className="text-2xl font-serif text-white font-bold mt-4 mb-2">Be a Threat</h3>
                <p className="text-xs text-fuchsia-300 italic mb-4 font-serif">"Shoot first, look second."</p>
                <p className="text-xs text-zinc-400 leading-relaxed">Shot-first mentality, net-front presence, aggressive slot reads.</p>
              </div>

              <div className="bg-zinc-900/60 border border-emerald-500/30 rounded-2xl p-6 hover:bg-zinc-900/80 transition-all shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">rQuickFeet</span>
                <h3 className="text-2xl font-serif text-white font-bold mt-4 mb-2">Quick Feet</h3>
                <p className="text-xs text-emerald-300 italic mb-4 font-serif">"Light feet. Strong edges."</p>
                <p className="text-xs text-zinc-400 leading-relaxed">Agility, edge control, dynamic speed changes in tight spaces.</p>
              </div>

              <div className="bg-zinc-900/60 border border-indigo-500/30 rounded-2xl p-6 hover:bg-zinc-900/80 transition-all shadow-[0_0_20px_rgba(99,102,241,0.05)]">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded">rReadPlay</span>
                <h3 className="text-2xl font-serif text-white font-bold mt-4 mb-2">Read the Play</h3>
                <p className="text-xs text-indigo-300 italic mb-4 font-serif">"See two passes ahead."</p>
                <p className="text-xs text-zinc-400 leading-relaxed">Spatial vision, ice scanning, dynamic lane mapping, high-IQ positioning.</p>
              </div>

              <div className="bg-zinc-900/60 border border-rose-500/30 rounded-2xl p-6 hover:bg-zinc-900/80 transition-all shadow-[0_0_20px_rgba(244,63,94,0.05)]">
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded">rWinBattle</span>
                <h3 className="text-2xl font-serif text-white font-bold mt-4 mb-2">Win the Battle</h3>
                <p className="text-xs text-rose-300 italic mb-4 font-serif">"Low leverage. Heavy stick."</p>
                <p className="text-xs text-zinc-400 leading-relaxed">Corner grinding, 1v1 battle win rates, net-front leverage, puck recovery.</p>
              </div>

              <div className="bg-zinc-900/60 border border-violet-500/30 rounded-2xl p-6 hover:bg-zinc-900/80 transition-all shadow-[0_0_20px_rgba(139,92,246,0.05)]">
                <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded">rWallMaster</span>
                <h3 className="text-2xl font-serif text-white font-bold mt-4 mb-2">Hard Along Walls</h3>
                <p className="text-xs text-violet-300 italic mb-4 font-serif">"Clean wall chips. Seal boards."</p>
                <p className="text-xs text-zinc-400 leading-relaxed">Board battles, wall pins, rim retrievals, chips past pressing defenders.</p>
              </div>

              <div className="bg-zinc-900/60 border border-sky-500/30 rounded-2xl p-6 hover:bg-zinc-900/80 transition-all shadow-[0_0_20px_rgba(14,165,233,0.05)]">
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded">rDotDominance</span>
                <h3 className="text-2xl font-serif text-white font-bold mt-4 mb-2">Dot Dominance</h3>
                <p className="text-xs text-sky-300 italic mb-4 font-serif">"Own the dot. Set the tempo."</p>
                <p className="text-xs text-zinc-400 leading-relaxed">Face-off win technique, quick-stick reaction, tie-up leverage, situational wins.</p>
              </div>
            </div>
          </div>
        </section>

        {/* HOCKEY STICK TRAJECTORY CURVE METAPHOR */}
        <HockeyStickTrajectoryIllustration />

        {/* 8 VOICES ACCOUNTABILITY ROSTER */}
        <section className="px-6 py-28 lg:px-8 bg-zinc-950 border-t border-white/10 relative overflow-hidden">
          {/* Ambient Background Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-7xl relative z-10">
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-black/80 px-4 py-1.5 text-xs font-mono font-semibold uppercase tracking-widest text-indigo-300 backdrop-blur-xl shadow-lg shadow-indigo-500/10 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>One Plan · Eight Voices</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-white mb-6">
                Development is a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-amber-400 font-medium">Team Sport</span>.
              </h2>
              <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
                Youth development fails in the gaps between the people who care. Periodical unifies all 8 key stakeholders into a single continuous feedback loop.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1. THE PLAYER */}
              <div className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-zinc-900/40 to-black p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-inner group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    The Core
                  </span>
                </div>
                <div className="text-xs uppercase font-mono font-bold text-amber-400 tracking-wider mb-1">The Player</div>
                <h4 className="text-xl font-serif font-medium text-white mb-2 group-hover:text-amber-200 transition-colors">Drives It</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Sets goals, journals daily, owns the plan. Reflection turns a kid into an intentional student of the game.
                </p>
              </div>

              {/* 2. THE TEAMMATE */}
              <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-zinc-900/40 to-black p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-500/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-inner group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Culture
                  </span>
                </div>
                <div className="text-xs uppercase font-mono font-bold text-cyan-400 tracking-wider mb-1">The Teammate</div>
                <h4 className="text-xl font-serif font-medium text-white mb-2 group-hover:text-cyan-200 transition-colors">Amplifies It</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Locker Room camaraderie, shared video cut feedback, and peer accountability on and off the ice.
                </p>
              </div>

              {/* 3. THE COACH */}
              <div className="group relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 via-zinc-900/40 to-black p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/60 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    Strategy
                  </span>
                </div>
                <div className="text-xs uppercase font-mono font-bold text-indigo-400 tracking-wider mb-1">The Coach</div>
                <h4 className="text-xl font-serif font-medium text-white mb-2 group-hover:text-indigo-200 transition-colors">Guides It</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Cuts moments in the Cut Room, answers feedback loops, and aligns personal goals with team macro-cycles.
                </p>
              </div>

              {/* 4. THE TRAINER */}
              <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-zinc-900/40 to-black p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Skills
                  </span>
                </div>
                <div className="text-xs uppercase font-mono font-bold text-emerald-400 tracking-wider mb-1">The Trainer</div>
                <h4 className="text-xl font-serif font-medium text-white mb-2 group-hover:text-emerald-200 transition-colors">Builds It</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Skills & private trainers attach drill progressions, off-ice work, and log physical mechanics observations.
                </p>
              </div>

              {/* 5. THE MENTOR */}
              <div className="group relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-950/20 via-zinc-900/40 to-black p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/60 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 shadow-inner group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/30 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                    Character
                  </span>
                </div>
                <div className="text-xs uppercase font-mono font-bold text-violet-400 tracking-wider mb-1">The Mentor / Academic Advisor</div>
                <h4 className="text-xl font-serif font-medium text-white mb-2 group-hover:text-violet-200 transition-colors">Shapes It</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Character development, psychological resilience, emotional poise, and mental game preparation.
                </p>
              </div>

              {/* 6. THE NUTRITIONIST */}
              <div className="group relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 via-zinc-900/40 to-black p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-rose-500/60 hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-inner group-hover:scale-110 transition-transform">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                    Health &amp; Fuel
                  </span>
                </div>
                <div className="text-xs uppercase font-mono font-bold text-rose-400 tracking-wider mb-1">The Nutritionist</div>
                <h4 className="text-xl font-serif font-medium text-white mb-2 group-hover:text-rose-200 transition-colors">Fuels It</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Energy intake protocols, hydration tracking, post-game recovery regimens, and optimal fueling plans.
                </p>
              </div>

              {/* 7. THE PARENT */}
              <div className="group relative overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-b from-fuchsia-950/20 via-zinc-900/40 to-black p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-fuchsia-500/60 hover:shadow-[0_0_30px_rgba(217,70,239,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-400 shadow-inner group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/30 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                    Support
                  </span>
                </div>
                <div className="text-xs uppercase font-mono font-bold text-fuchsia-400 tracking-wider mb-1">The Parent</div>
                <h4 className="text-xl font-serif font-medium text-white mb-2 group-hover:text-fuchsia-200 transition-colors">Cultivates It</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Visibility without interference: milestones, streaks, and progress — the car ride home gets a lot better.
                </p>
              </div>

              {/* 8. THE SCOUT */}
              <div className="group relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-950/20 via-zinc-900/40 to-black p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-500/60 hover:shadow-[0_0_30px_rgba(14,165,233,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shadow-inner group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                    Advancement
                  </span>
                </div>
                <div className="text-xs uppercase font-mono font-bold text-sky-400 tracking-wider mb-1">The Scout</div>
                <h4 className="text-xl font-serif font-medium text-white mb-2 group-hover:text-sky-200 transition-colors">Evaluates It</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The ultimate voice for the last mile: verified shift dossiers, objective scouting reports, and high-performance evaluation.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* TEAMS BETA CTA */}
        <section id="beta" className="px-6 py-32 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 via-indigo-950/20 to-zinc-950 text-center relative overflow-hidden">
          <div className="mx-auto max-w-3xl relative z-10">
            <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">Teams Beta Program</span>
            <h2 className="mt-6 text-5xl md:text-7xl font-serif tracking-tight text-white mb-8">
              Start your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-400">growth continuum.</span>
            </h2>
            <p className="text-xl text-zinc-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Empower your athletes with the tools of tomorrow. Join the Teams Beta Program today.
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
