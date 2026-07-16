"use client";

import React from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { ArrowRight, Play, CheckCircle, Clock, Search, Send, Zap } from "lucide-react";

export default function CoachsCornerPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white">
      <LandingHeader />

      <main className="flex flex-col pt-24">
        {/* HERO */}
        <section className="relative px-6 py-24 sm:py-32 lg:px-8 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-400">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              TSAI Spotlight · Coach Beta Program · Founding Cohort
            </div>
            <h1 className="mt-8 text-5xl font-serif tracking-tight text-white sm:text-7xl">
              Your clipboard<br />just learned <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">hockey.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-300 max-w-2xl mx-auto">
              The <strong className="text-white font-medium">Coach's Clipboard Workbench</strong> turns four hours of Sunday-night scrubbing into ninety seconds of asking — then proves, player by player, that the lesson landed before you ever hit the ice.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a href="#beta" className="rounded-full bg-cyan-500 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 transition-colors">
                Claim your bench spot
              </a>
              <a href="#week" className="text-sm font-semibold leading-6 text-white hover:text-cyan-300 flex items-center gap-1 transition-colors">
                See a week with it <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <p className="mt-6 text-xs text-zinc-500 uppercase tracking-widest">
              Limited founding cohort · Youth hockey coaching staffs
            </p>
          </div>
        </section>

        {/* COLD OPEN */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-950">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-12">
              <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">Cold Open</span>
              <span className="font-mono text-sm text-zinc-500 mt-2 md:mt-0 tracking-widest">SUN · 11:47 PM · YOUR KITCHEN TABLE</span>
            </div>
            
            <h2 className="text-3xl font-serif text-white sm:text-5xl mb-8">You know this scene.</h2>
            
            <div className="space-y-6 text-lg text-zinc-400 leading-relaxed">
              <p>
                Two games of weekend film. A laptop, a cold coffee, and a scrub bar. You're hunting for the four D-zone turnovers you <em className="text-zinc-200">know</em> are in there somewhere — because Thursday's practice depends on your defensemen seeing them before they step on the ice.
              </p>
              <p>
                Two hours later you find three of them, text a raw video link to the team group chat, and hope. No one confirms they watched. Nothing tells you whether the lesson landed. On Thursday, you'll re-teach it from scratch at center ice, eating fifteen minutes of the only practice you get this week.
              </p>
              <p className="text-xl text-white font-serif border-l-2 border-cyan-500 pl-6 my-8 py-2">
                That's not coaching. That's clerical work with a whistle.
              </p>
              <p className="text-cyan-300 font-medium pt-4">
                Now run the same week back — with the Workbench on your bench.
              </p>
            </div>
          </div>
        </section>

        {/* THE WEEK - ACTS */}
        <section id="week" className="px-6 py-24 lg:px-8 bg-zinc-900/50 border-t border-white/5 relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
          
          <div className="mx-auto max-w-5xl relative z-10">
            <div className="text-center mb-20">
              <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">One week · One coach · One clipboard</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">Four moments that change<br />how your team learns.</h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                Same games. Same roster. Same Thursday practice. Watch what happens when the film room understands hockey.
              </p>
            </div>

            <div className="space-y-32">
              {/* ACT 1 */}
              <div className="flex flex-col md:flex-row gap-12 group">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-cyan-500 md:border-t-0 md:border-l-2 md:pl-6 opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="text-3xl font-serif text-white mb-1">Sun</div>
                  <div className="font-mono text-cyan-400 tracking-wider">11:47 PM</div>
                  <div className="mt-4 text-sm text-zinc-500 uppercase tracking-widest font-semibold">Act I<br />The ask</div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-serif text-white mb-6"><span className="text-cyan-500/50 mr-2">01 /</span> You don't scrub. You ask.</h3>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    You open the Workbench and type into the <strong className="text-zinc-200 font-medium">Captive AI Search Bar</strong> — the same way you'd ask an assistant coach who watched every shift of every game you've ever played:
                  </p>
                  
                  {/* UI Mock */}
                  <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-2xl mb-8 transform transition-transform hover:-translate-y-1">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Search className="w-3 h-3 text-cyan-400" /> Captive AI · Spotlight Discovery Engine</div>
                    <div className="font-mono text-white/90 text-sm md:text-base leading-relaxed bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                      "Show me our D-zone turnovers under pressure from the last 3 games, and find a master reference clip of strong-side puck protection on a zone entry."<span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse align-middle"></span>
                    </div>
                    <div className="mt-4 text-xs text-zinc-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span><strong className="text-zinc-200">7 clips surfaced</strong> · 4 team turnovers + 3 pro reference clips · mapped via Hockey Taxonomy · <strong className="text-zinc-200">elapsed: 00:00:41</strong></span>
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed">
                    The AI scans your team's full game library <em className="text-zinc-200">and</em> a curated set of pro-level master references, mapping your words against a taxonomy built for hockey — not generic sports video. Every turnover. The exact mechanic. Forty-one seconds. <strong className="text-white">The two hours you just got back? That's yours.</strong>
                  </p>
                </div>
              </div>

              {/* ACT 2 */}
              <div className="flex flex-col md:flex-row gap-12 group">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-indigo-500 md:border-t-0 md:border-l-2 md:pl-6 opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="text-3xl font-serif text-white mb-1">Mon</div>
                  <div className="font-mono text-indigo-400 tracking-wider">7:15 AM</div>
                  <div className="mt-4 text-sm text-zinc-500 uppercase tracking-widest font-semibold">Act II<br />The assignment</div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-serif text-white mb-6"><span className="text-indigo-500/50 mr-2">02 /</span> A clipboard with an address on it.</h3>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    You drag the clips onto a new <strong className="text-zinc-200 font-medium">Clipboard</strong>. This isn't a playlist — it's a directed instructional package. You pick the audience (<em className="text-zinc-200">Defensemen</em>), draw your tactical overlay right on the frame, and attach the note you'd otherwise be shouting over the glass:
                  </p>
                  
                  {/* UI Mock */}
                  <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-2xl mb-8 transform transition-transform hover:-translate-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
                      <span className="text-sm text-zinc-300">To: <b className="text-white">Defensive Unit (6 players)</b></span>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1 flex items-center gap-1"><Zap className="w-3 h-3" /> High Priority</span>
                        <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-3 py-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Due Thu · Before Practice</span>
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 p-5 rounded-lg border border-white/5 border-l-4 border-l-indigo-500 italic text-zinc-300 font-serif text-lg">
                      "Keep your hips square to the boards. Protect the puck on your forehand hip."
                    </div>
                    <div className="mt-4 text-xs text-zinc-500 flex items-center gap-2">
                      <Send className="w-4 h-4 text-zinc-400" />
                      <span>7 clips · 1 tactical overlay · push notifications sent <strong className="text-zinc-300">07:15:22</strong></span>
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed">
                    Six phones buzz before first period of the school day. Your teaching moment is already in their pocket — <strong className="text-white">with your voice attached to it.</strong>
                  </p>
                </div>
              </div>

              {/* ACT 3 */}
              <div className="flex flex-col md:flex-row gap-12 group">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-emerald-500 md:border-t-0 md:border-l-2 md:pl-6 opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="text-3xl font-serif text-white mb-1">Wed</div>
                  <div className="font-mono text-emerald-400 tracking-wider">9:32 PM</div>
                  <div className="mt-4 text-sm text-zinc-500 uppercase tracking-widest font-semibold">Act III<br />The rep</div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-serif text-white mb-6"><span className="text-emerald-500/50 mr-2">03 /</span> Your player, side-by-side with the standard.</h3>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    #24 opens his Clipboard after homework. He isn't handed a highlight reel — he enters a <strong className="text-zinc-200 font-medium">dual-playback learning environment</strong>: a pro reference clip running beside his own turnover from Saturday. Posture against posture. Decision against decision.
                  </p>
                  
                  {/* UI Mock */}
                  <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-2xl mb-8 transform transition-transform hover:-translate-y-1">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="aspect-video bg-zinc-900 rounded-lg border border-emerald-500/30 relative flex flex-col justify-end p-3 overflow-hidden group/vid">
                        <div className="absolute inset-0 bg-emerald-500/5 group-hover/vid:bg-emerald-500/10 transition-colors"></div>
                        <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold relative z-10 drop-shadow-md">Master Reference · Pro</span>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50"><Play className="w-8 h-8" /></div>
                      </div>
                      <div className="aspect-video bg-zinc-900 rounded-lg border border-white/10 relative flex flex-col justify-end p-3 overflow-hidden group/vid">
                        <div className="absolute inset-0 bg-white/5 group-hover/vid:bg-white/10 transition-colors"></div>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold relative z-10 drop-shadow-md">#24 · Sat · P2 08:41</span>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50"><Play className="w-8 h-8" /></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-zinc-900/80 rounded border border-white/5 p-2 px-4">
                      <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Micro-Loop · Locked</span>
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full relative">
                        <div className="absolute top-0 bottom-0 left-1/4 right-1/2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">3.0s window</span>
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed">
                    You defined a three-second window on the exact mechanic — and <strong className="text-zinc-200 font-medium">strict timestamp locking</strong> holds him inside it. No scrubbing ahead, no drifting to highlights. The moment repeats until the pattern is his. That's not screen time. <strong className="text-white">That's reps.</strong>
                  </p>
                </div>
              </div>

              {/* ACT 4 */}
              <div className="flex flex-col md:flex-row gap-12 group">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-amber-500 md:border-t-0 md:border-l-2 md:pl-6 opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="text-3xl font-serif text-white mb-1">Thu</div>
                  <div className="font-mono text-amber-400 tracking-wider">6:00 AM</div>
                  <div className="mt-4 text-sm text-zinc-500 uppercase tracking-widest font-semibold">Act IV<br />The proof</div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-serif text-white mb-6"><span className="text-amber-500/50 mr-2">04 /</span> You never ask "did you watch it?" again.</h3>
                  <p className="text-zinc-400 mb-6 leading-relaxed">
                    Coffee in hand, you open the <strong className="text-zinc-200 font-medium">Telemetry Board</strong>. Every interaction with your Clipboard is on it — not just who logged in, but exactly how each player engaged with your curriculum.
                  </p>
                  <p className="text-zinc-400 mb-6 leading-relaxed">
                    #24 watched Wednesday night. He looped your three-second window <strong className="text-amber-400 font-medium">fourteen times</strong>. He spent two full minutes inside one mechanic. And the completion column for your defensive unit reads a clean, undeniable <strong className="text-white">100%</strong>.
                  </p>
                  <p className="text-xl text-white font-serif border-l-2 border-amber-500 pl-6 my-8 py-2">
                    You step onto the ice tonight coaching a team that already had the meeting. Practice starts at the drill, not the whiteboard.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TELEMETRY STATS */}
        <section className="px-6 py-24 lg:px-8 border-t border-white/5 bg-zinc-950">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">The math of a better Thursday</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">Accountability you can point at.</h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                Coaches don't need more video. They need proof the video worked. The Clipboard Analytics engine tracks the loop counts, dwell time, and completion state behind every assignment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-8 text-center hover:bg-zinc-900/50 transition-colors">
                <div className="text-6xl font-serif text-white mb-2">41<span className="text-3xl text-cyan-500">s</span></div>
                <div className="text-sm font-semibold tracking-wider uppercase text-zinc-300 mb-4">From question to clips</div>
                <p className="text-sm text-zinc-500 leading-relaxed">Natural-language discovery across <strong className="text-zinc-300">your full game library</strong> plus pro master references. The scrub bar is retired.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-8 text-center hover:bg-zinc-900/50 transition-colors">
                <div className="text-6xl font-serif text-white mb-2">14<span className="text-3xl text-indigo-500">×</span></div>
                <div className="text-sm font-semibold tracking-wider uppercase text-zinc-300 mb-4">Loops on one window</div>
                <p className="text-sm text-zinc-500 leading-relaxed">Per-player telemetry shows <strong className="text-zinc-300">exactly how deep</strong> each athlete went on each mechanic — loop counts, duration, timestamps.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-8 text-center hover:bg-zinc-900/50 transition-colors relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
                <div className="text-6xl font-serif text-white mb-2">100<span className="text-3xl text-emerald-500">%</span></div>
                <div className="text-sm font-semibold tracking-wider uppercase text-zinc-300 mb-4">Unit completion</div>
                <p className="text-sm text-zinc-500 leading-relaxed">Deadlines, push notifications, and a board that turns <strong className="text-zinc-300">"did you watch it?"</strong> into a question you never ask again.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TAXONOMY */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-900/50 border-t border-white/5">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">Under the hood · Hockey Taxonomy</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">It speaks hockey.<br />Not just "video."</h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                Generic AI sees pixels. Spotlight's discovery engine maps every clip against a proprietary three-tier Hockey Taxonomy — so when you ask for a strong-side puck protection mechanic, it knows exactly what you mean, and exactly where it lives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/20 border border-white/5 rounded-xl p-6 hover:border-cyan-500/30 transition-colors group">
                <div className="flex items-baseline justify-between mb-4">
                  <h4 className="text-xl font-serif text-white group-hover:text-cyan-400 transition-colors">Macro</h4>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">Tier 1 · Game state</span>
                </div>
                <p className="text-sm text-zinc-400">The situation: zone, strength, possession, pressure. <em className="text-zinc-300 block mt-2">"D-zone, even strength, under forecheck."</em></p>
              </div>
              <div className="bg-black/20 border border-white/5 rounded-xl p-6 hover:border-indigo-500/30 transition-colors group">
                <div className="flex items-baseline justify-between mb-4">
                  <h4 className="text-xl font-serif text-white group-hover:text-indigo-400 transition-colors">Meso</h4>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">Tier 2 · Tactical</span>
                </div>
                <p className="text-sm text-zinc-400">The system: breakouts, entries, cycles, coverage schemes. <em className="text-zinc-300 block mt-2">"Strong-side breakout on a zone exit."</em></p>
              </div>
              <div className="bg-black/20 border border-white/5 rounded-xl p-6 hover:border-emerald-500/30 transition-colors group">
                <div className="flex items-baseline justify-between mb-4">
                  <h4 className="text-xl font-serif text-white group-hover:text-emerald-400 transition-colors">Micro</h4>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">Tier 3 · Mechanic</span>
                </div>
                <p className="text-sm text-zinc-400">The skill: body position, puck placement, timing. <em className="text-zinc-300 block mt-2">"Hips square to the boards, puck on forehand."</em></p>
              </div>
            </div>
            
            <p className="text-center text-zinc-400 mt-12 max-w-2xl mx-auto italic">
              Your question travels down all three tiers at once. That's why the right clip surfaces in seconds — and why the reference the AI pairs it with is the <strong className="text-zinc-200">right</strong> reference, not just a similar-looking one.
            </p>
          </div>
        </section>

        {/* BETA CTA */}
        <section id="beta" className="px-6 py-32 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 to-cyan-950/20 text-center relative overflow-hidden">
          <div className="mx-auto max-w-3xl relative z-10">
            <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">Founding Coach Beta · Now Forming</span>
            <h2 className="mt-6 text-5xl font-serif tracking-tight text-white sm:text-7xl">Take the first <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">shift.</span></h2>
            <p className="mt-8 text-xl leading-8 text-zinc-300 max-w-2xl mx-auto">
              The Clipboard Workbench beta is opening to a limited cohort of youth hockey coaching staffs. Founding coaches don't just get early access — they shape what this becomes.
            </p>
            
            <div className="mt-12 flex items-center justify-center">
              <a href="#" className="rounded-full bg-white px-10 py-4 text-base font-semibold text-zinc-950 shadow-sm hover:bg-cyan-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all transform hover:scale-105">
                Request beta access
              </a>
            </div>
            <p className="mt-8 text-xs text-zinc-500 uppercase tracking-widest">
              Stop scrubbing. Start teaching. · Cohort size limited
            </p>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
