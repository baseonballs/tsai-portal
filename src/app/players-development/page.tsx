"use client";

import React from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
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
  BarChart 
} from "lucide-react";

export default function PlayersDevelopmentPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <LandingHeader />

      <main className="flex flex-col pt-24 relative z-10">
        
        {/* HERO */}
        <section className="px-6 py-24 sm:py-32 lg:px-8 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-zinc-300 mb-8 backdrop-blur-sm">
            Version v0.1.72.beta
          </div>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Spotlight & Periodical</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-zinc-300 italic mb-12">
            The Next Evolution in Elite Youth Ice Hockey Development
          </p>
        </section>

        {/* THE GAP */}
        <section className="px-6 py-20 lg:px-8 border-y border-white/5 bg-black/20 backdrop-blur-md">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">
              ⚡ The Gap Between Theory & Execution is Closing
            </h2>
            <div className="space-y-6 text-lg text-zinc-400 leading-relaxed max-w-3xl mx-auto text-left">
              <p>
                For decades, coaches have possessed elite tactical knowledge, yet struggled to effectively transfer it to youth athletes in a way that sticks. The whiteboard is forgotten the moment the players step on the ice. The video sessions are passive. The engagement ends when practice is over.
              </p>
              <p className="text-2xl text-white font-serif text-center py-4 border-y border-white/10 my-8">
                Until now.
              </p>
              <p>
                Welcome to the <strong className="text-white">Spotlight Platform</strong> and <strong className="text-white">Periodical</strong> — a seamless, dual-engine ecosystem explicitly engineered to accelerate the youth sport development process. We aren't just offering a video tool; we are providing a <strong className="text-cyan-400">cinematic, high-fidelity development lifecycle</strong> driven by state-of-the-art (SOTA) captive AI and an immersive glassmorphic viewing experience.
              </p>
              <p className="text-center font-medium text-white italic pt-4">
                Spotlight redefines how coaches teach. Periodical redefines how players learn. Together, they redefine how teams win.
              </p>
            </div>
          </div>
        </section>

        {/* PERIODICAL SECTION */}
        <section className="px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">📖 Periodical: Building the Ultimate Hockey IQ</h2>
              <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
                At the core of elite development is consistent, active engagement. <strong className="text-white">Periodical</strong> bridges the gap between rink sessions, transforming passive athletes into active students of the game through a collaborative platform built for the modern youth athlete.
              </p>
            </div>

            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-8 mb-16 max-w-3xl mx-auto text-center backdrop-blur-sm">
              <h3 className="text-indigo-400 font-semibold uppercase tracking-widest text-sm mb-3">Accountability Through Collaboration</h3>
              <p className="text-zinc-300 text-lg">
                Periodical isn't just a diary; it's a dynamic bridge connecting coach intent with player execution.
              </p>
            </div>

            <h3 className="text-2xl font-serif text-white mb-8 text-center">The Foundation of Engagement</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 hover:bg-zinc-900/60 hover:border-indigo-500/30 transition-all transform hover:-translate-y-2">
                <Target className="w-10 h-10 text-indigo-400 mb-6" />
                <h4 className="text-xl font-serif text-white mb-4">Interactive Planners & Agendas</h4>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  Move beyond group texts and PDF schedules. Seamlessly map out weekly macro, meso, and micro-cycles. Align your team on tactical themes <em className="text-zinc-200">before</em> they ever lace up their skates.
                </p>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 hover:bg-zinc-900/60 hover:border-indigo-500/30 transition-all transform hover:-translate-y-2">
                <Brain className="w-10 h-10 text-indigo-400 mb-6" />
                <h4 className="text-xl font-serif text-white mb-4">Player Journaling</h4>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  Repetition builds muscle memory; reflection builds Hockey IQ. Periodical encourages daily journaling, prompting players to reflect on their own shifts, evaluate their decisions, and take ownership of their development.
                </p>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 hover:bg-zinc-900/60 hover:border-indigo-500/30 transition-all transform hover:-translate-y-2">
                <MessageSquare className="w-10 h-10 text-indigo-400 mb-6" />
                <h4 className="text-xl font-serif text-white mb-4">Coach-Player Feedback Loops</h4>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  Create a continuous, asynchronous dialogue. Coaches can review journals, gauge comprehension, and provide actionable, personalized feedback directly within the platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SPOTLIGHT SECTION */}
        <section className="px-6 py-24 lg:px-8 bg-black/40 border-t border-white/5 backdrop-blur-md">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">🧠 Spotlight Coach's Corner: The AI-Powered Workbench</h2>
              <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
                The newly unveiled <strong className="text-white">Coach Workbench</strong> is a powerhouse of tactical curation wrapped in a stunning, deep-slate frosted glass aesthetic. It gives coaches broadcast-level analytical tools without the broadcast-level complexity.
              </p>
            </div>

            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-8 mb-16 max-w-4xl mx-auto text-center shadow-[0_0_40px_rgba(6,182,212,0.1)]">
              <h3 className="text-cyan-400 font-semibold uppercase tracking-widest text-sm mb-3 flex items-center justify-center gap-2">
                <Search className="w-4 h-4" /> Captive AI Discovery Engine
              </h3>
              <p className="text-zinc-300 text-lg">
                Stop scrubbing through hours of footage manually. Use semantic, AI-driven queries (e.g., <em className="text-cyan-200">"Show me strong-side puck protection on a zone entry"</em>) to instantly surface the perfect tactical reference from our internal library or YouTube.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                <h3 className="text-2xl font-serif text-white mb-8 border-b border-white/10 pb-4">Next-Generation Value Drivers</h3>
                <ul className="space-y-8">
                  <li className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif text-white mb-2">Dual-Playback Split-Screen Analysis</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">The ultimate teaching mechanic. Play a master reference clip of an NHL pro side-by-side with your own player's execution video. Compare posture, spacing, and decision-making in real time.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif text-white mb-2">Strict Timestamp Locking</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">Our SOTA playback engine locks the master reference and the player's execution video together within a sub-second tolerance. Pause, rewind, or scrub the master clip, and the player's video syncs instantly.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center">
                      <Repeat className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif text-white mb-2">Micro-Loop Windows</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">Define exact start and end boundaries to trap players in a highly-focused 3-second loop. Force them to absorb the precise tactical mechanic being taught without distractions.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-serif text-white mb-8 border-b border-white/10 pb-4">Must-Have Workflow Tools</h3>
                <ul className="space-y-8">
                  <li className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center">
                      <Send className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif text-white mb-2">Active Roster Clipboards</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">Curate personalized playlists of reference clips. Draw up your tactical annotations, overlay structured feedback logs, and push them directly to a specific player or the entire team.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center">
                      <BarChart className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif text-white mb-2">Real-Time Watch Telemetry</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">Never wonder if your players did their homework again. The Telemetry Board tracks exactly who watched your assignments, how many times they looped the critical moments, and their average view duration.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* WHY SPOTLIGHT */}
        <section className="px-6 py-32 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-900 text-center relative overflow-hidden">
          <div className="mx-auto max-w-4xl relative z-10">
            <h2 className="text-5xl md:text-7xl font-serif tracking-tight text-white mb-8">
              🏆 Why Spotlight?
            </h2>
            <p className="text-2xl font-light text-cyan-400 italic mb-8">
              Spotlight is not just software—it is a competitive advantage.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-12 max-w-3xl mx-auto">
              By wrapping SOTA video analysis and Captive AI inside a premium, immersive interface, Spotlight commands the attention of the modern youth athlete. When paired with the collaborative strength of Periodical, it transforms standard youth hockey organizations into <strong className="text-white">elite development academies.</strong>
            </p>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 max-w-2xl mx-auto backdrop-blur-lg">
              <h3 className="text-2xl font-serif text-white mb-6">Are you ready to change the way your team sees the game?</h3>
              <p className="text-zinc-400 mb-8">Join the Spotlight Platform today and empower your athletes with the tools of tomorrow.</p>
              <a href="#" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all transform hover:scale-105">
                Start your journey <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
