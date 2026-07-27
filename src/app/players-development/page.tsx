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

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif tracking-tight text-white mb-8 sm:mb-10 leading-[1.15] sm:leading-[1.12] drop-shadow-2xl max-w-5xl mx-auto">
            From passive film to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-400">
              active growth.
            </span>
          </h1>

          <p className="mt-8 sm:mt-10 text-lg sm:text-xl lg:text-2xl leading-relaxed sm:leading-9 text-zinc-300 max-w-3xl mx-auto font-light">
            Spotlight &amp; Periodical unlock sports intelligence to guide, measure, and accelerate athlete growth on the path to their full potential.
          </p>

          <div className="mt-12 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6">
            <a href="#filmroom" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-9 py-4 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all transform hover:scale-105">
              Enter The Film Room
            </a>
            <a href="#superpowers" className="w-full sm:w-auto text-sm font-semibold leading-6 text-white hover:text-indigo-300 flex items-center justify-center gap-2 py-4 px-7 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all">
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

        {/* 5 VOICES ACCOUNTABILITY ROSTER */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-950 border-t border-white/5">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase">One Plan · Five Voices</span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Development is a Team Sport</h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Youth development fails in the gaps between the people who care. Periodical puts everyone on the same page.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              <div className="bg-black/40 border border-amber-500/30 rounded-xl p-6 hover:border-amber-500/50 transition-all">
                <div className="text-xs uppercase font-mono font-bold text-amber-400 mb-2">The Player</div>
                <h4 className="text-lg font-serif text-white mb-2">Drives It</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">Sets goals, journals daily, owns the plan. Reflection turns a kid into a student of the game.</p>
              </div>

              <div className="bg-black/40 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                <div className="text-xs uppercase font-mono font-bold text-blue-400 mb-2">The Coach</div>
                <div className="text-lg font-serif text-white mb-2">Guides It</div>
                <p className="text-xs text-zinc-400 leading-relaxed">Cuts moments in the Cut Room, answers in feedback loops, aligns personal goals with team macro-cycles.</p>
              </div>

              <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/50 transition-all">
                <div className="text-xs uppercase font-mono font-bold text-emerald-400 mb-2">The Trainer</div>
                <div className="text-lg font-serif text-white mb-2">Supports &amp; Develops It</div>
                <p className="text-xs text-zinc-400 leading-relaxed">Skills &amp; private trainers attach drill progressions, off-ice work, and log observations that feed the AI insight engine.</p>
              </div>

              <div className="bg-black/40 border border-fuchsia-500/30 rounded-xl p-6 hover:border-fuchsia-500/50 transition-all">
                <div className="text-xs uppercase font-mono font-bold text-fuchsia-400 mb-2">The Parent</div>
                <div className="text-lg font-serif text-white mb-2">Cultivates It</div>
                <p className="text-xs text-zinc-400 leading-relaxed">Embraces the sacrifice. Visibility without interference: milestones, streaks, and progress — the car ride home gets a lot better.</p>
              </div>

              <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
                <div className="text-xs uppercase font-mono font-bold text-cyan-400 mb-2">The Scout</div>
                <div className="text-lg font-serif text-white mb-2">Evaluates It</div>
                <p className="text-xs text-zinc-400 leading-relaxed">The ultimate voice for the last mile: verified shift dossiers, objective scouting reports, and high-performance evaluation for advancement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TEAMS BETA CTA */}
        <section id="beta" className="px-6 py-32 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 via-indigo-950/20 to-zinc-950 text-center relative overflow-hidden">
          <div className="mx-auto max-w-3xl relative z-10">
            <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">Teams Beta Program</span>
            <h2 className="mt-6 text-5xl md:text-7xl font-serif tracking-tight text-white mb-8">
              Start your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-400">growth continuum.</span>
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
