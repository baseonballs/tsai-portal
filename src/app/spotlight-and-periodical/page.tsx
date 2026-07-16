"use client";

import React from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { ArrowRight, BrainCircuit, Activity, Repeat, RefreshCw, FileText, Target, ShieldCheck, Zap, BarChart2 } from "lucide-react";

export default function SpotlightAndPeriodicalPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white">
      <LandingHeader />

      <main className="flex flex-col pt-24">
        {/* HERO */}
        <section className="relative px-6 py-24 sm:py-32 lg:px-8 border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-400 mb-8">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              TSAI Spotlight × Periodical · The Development Loop · Brief 02
            </div>
            <h1 className="text-5xl font-serif tracking-tight text-white sm:text-7xl leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Spotlight sees the game.</span><br />
              Periodical hears <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">the player.</span>
            </h1>
            <p className="mt-8 text-lg leading-8 text-zinc-300 max-w-2xl mx-auto">
              One engine watches every shift with AI precision. The other captures the goals, the journals, and the voices — player, coach, mentor, parent — that turn what the film <em className="text-white">found</em> into who the athlete <em className="text-white">becomes</em>.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a href="#beta" className="rounded-full bg-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors">
                Run the full loop
              </a>
              <a href="#sequel" className="text-sm font-semibold leading-6 text-white hover:text-indigo-300 flex items-center gap-1 transition-colors">
                Pick up where #26 left off <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <p className="mt-6 text-xs text-zinc-500 uppercase tracking-widest">
              One platform · Both engines included
            </p>
          </div>
        </section>

        {/* COLD OPEN */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-950">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-12">
              <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">Cold Open</span>
              <span className="font-mono text-sm text-zinc-500 mt-2 md:mt-0 tracking-widest">THE LIMIT OF FILM</span>
            </div>
            
            <h2 className="text-3xl font-serif text-white sm:text-5xl mb-8 leading-tight">The film shows the turnover.<br />It doesn't show the hesitation.</h2>
            
            <div className="space-y-6 text-lg text-zinc-400 leading-relaxed">
              <p>
                Spotlight can find every D-zone giveaway in forty-one seconds. It can prove #26 looped your 3-second teaching window fourteen times. But there's a layer of the game no camera reaches: <strong className="text-zinc-200">what the player was thinking when the puck left her stick.</strong>
              </p>
              <p>
                Was it fear of the forecheck? A read she made too late? A habit nobody's named yet? The answer isn't in the pixels. It's in the player — and until now, it stayed there. The whiteboard is forgotten at the door, the video session ends, and the most valuable data in youth development goes home unrecorded every single night.
              </p>
              <p className="text-indigo-300 font-medium pt-4 text-xl border-l-2 border-indigo-500 pl-6 mt-8">
                Periodical is where the player tells you. Spotlight is what makes the telling actionable.
              </p>
            </div>
          </div>
        </section>

        {/* TWO ENGINES */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-900/50 border-t border-white/5 relative">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase">The Dual-Engine Ecosystem</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">Two engines.<br />One development loop.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Spotlight Engine */}
              <div className="rounded-2xl border border-cyan-500/20 bg-black/40 p-8 hover:border-cyan-500/40 transition-colors">
                <div className="text-[10px] font-semibold tracking-widest text-cyan-400 uppercase mb-4">Engine 01 · The Intelligence</div>
                <h3 className="text-3xl font-serif text-white mb-4">Spotlight</h3>
                <p className="text-zinc-300 text-lg mb-6 border-b border-white/10 pb-6">Sees the game with AI precision and proves what happened.</p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                    <p className="text-zinc-400"><strong className="text-white">Captive AI Discovery</strong> — semantic search across your full game library and pro master references.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                    <p className="text-zinc-400"><strong className="text-white">Workbench & Clipboards</strong> — directed assignments, dual-playback, locked micro-loops.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <BarChart2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                    <p className="text-zinc-400"><strong className="text-white">Watch Telemetry</strong> — loop counts, dwell time, completion. Objective proof of engagement.</p>
                  </li>
                </ul>
              </div>

              {/* Periodical Engine */}
              <div className="rounded-2xl border border-indigo-500/20 bg-black/40 p-8 hover:border-indigo-500/40 transition-colors">
                <div className="text-[10px] font-semibold tracking-widest text-indigo-400 uppercase mb-4">Engine 02 · The Bridge</div>
                <h3 className="text-3xl font-serif text-white mb-4">Periodical</h3>
                <p className="text-zinc-300 text-lg mb-6 border-b border-white/10 pb-6">Hears the player and turns reflection into a shared plan.</p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-zinc-400"><strong className="text-white">Personal Plans & Goals</strong> — objectives the player sets, shaped with coaches, mentors, and parents.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-zinc-400"><strong className="text-white">Player Journaling</strong> — daily prompts that turn every shift into a reflection. Repetition builds muscle memory; reflection builds Hockey IQ.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <Repeat className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-zinc-400"><strong className="text-white">Feedback Loops</strong> — continuous, asynchronous dialogue between every voice on the plan.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border border-white/10 p-8 text-center max-w-3xl mx-auto">
              <div className="text-sm font-semibold tracking-widest text-purple-400 uppercase mb-4">Together: the flywheel</div>
              <p className="text-lg text-zinc-300 leading-relaxed">
                Spotlight's telemetry tells Periodical what the player <em className="text-white">did</em>. Periodical's journals tell Spotlight what the player <em className="text-white">thought</em>. The AI reads both — and surfaces insights neither could produce alone.
              </p>
            </div>
          </div>
        </section>

        {/* THE SEQUEL */}
        <section id="sequel" className="px-6 py-24 lg:px-8 border-t border-white/5 bg-zinc-950">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-20">
              <span className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Previously on Spotlight · #26 looped your window 14 times</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">What the Workbench started,<br />Periodical finishes.</h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                You already know Wednesday night's telemetry. Here's the part of the story the film couldn't tell — and the three weeks that followed.
              </p>
            </div>

            <div className="space-y-32">
              {/* ACT 1 */}
              <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-zinc-700 md:border-t-0 md:border-l-2 md:pl-6">
                  <div className="text-3xl font-serif text-white mb-1">Wed</div>
                  <div className="font-mono text-zinc-400 tracking-wider">9:47 PM</div>
                  <div className="mt-4 text-sm text-zinc-500 uppercase tracking-widest font-semibold">Act I<br />The voice</div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-serif text-white mb-6"><span className="text-zinc-600 mr-2">01 /</span> The film ends. The journal opens.</h3>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    Fourteen loops later, #26 closes the Clipboard — and Periodical is already waiting with a prompt tied to the exact assignment she just finished. No blank page. No "write something." One question about one mechanic:
                  </p>
                  
                  {/* Journal Mock */}
                  <div className="rounded-xl border border-white/10 bg-black/60 p-6 mb-8 transform hover:scale-[1.01] transition-transform shadow-2xl">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                      <span className="text-sm text-zinc-300">Journal · <b className="text-white">#26 — Defense</b></span>
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-1 font-semibold">Streak: 12 Days</span>
                    </div>
                    <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Prompt · Linked to Clipboard: "Strong-Side Puck Protection"</div>
                    <p className="text-lg font-serif italic text-zinc-200 bg-zinc-900/50 p-4 rounded-lg border border-white/5 border-l-2 border-l-indigo-500 mb-4">
                      "I keep rimming it because I hear the forecheck coming before I even look. The pro waits an extra beat and checks her shoulder first. I panic early."
                    </p>
                    <div className="text-xs text-zinc-500">
                      Entry linked to <b className="text-zinc-300">2 clips</b> · visible to coach & mentor · <b className="font-mono">21:47:33</b>
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed">
                    Three sentences. But inside them is the thing no camera caught: <strong className="text-white">she panics before she looks.</strong> That's not a turnover problem. That's a scanning-habit problem — and your player just diagnosed it himself.
                  </p>
                </div>
              </div>

              {/* ACT 2 */}
              <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-cyan-500 md:border-t-0 md:border-l-2 md:pl-6">
                  <div className="text-3xl font-serif text-white mb-1">Wed</div>
                  <div className="font-mono text-cyan-400 tracking-wider">9:49 PM</div>
                  <div className="mt-4 text-sm text-zinc-500 uppercase tracking-widest font-semibold">Act II<br />The synthesis</div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-serif text-white mb-6"><span className="text-cyan-600 mr-2">02 /</span> The AI reads between the lines.</h3>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    Two minutes later, Spotlight's insight engine has done what would take a coaching staff a season of guesswork: it cross-references the journal entry against #26's watch telemetry, her game footage, and every prior reflection — her own, and the notes her coaches and trainers have logged along the way.
                  </p>
                  
                  {/* Insight Mock */}
                  <div className="rounded-xl border border-cyan-500/30 bg-black/60 p-6 mb-8 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <div className="text-sm font-semibold text-cyan-400 mb-6 pb-4 border-b border-cyan-500/20 flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" /> Spotlight AI · Player Insight — #26
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                        <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold w-32 shrink-0 pt-1">Pattern</span>
                        <span className="text-sm text-zinc-300 leading-relaxed">D-zone turnovers cluster on <strong className="text-white">right-wall retrievals under F1 pressure</strong> — 4 of 4 flagged clips, last 3 games.</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                        <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold w-32 shrink-0 pt-1">Player's words</span>
                        <span className="text-sm text-zinc-300 leading-relaxed"><em className="text-indigo-300">"I hear the forecheck coming before I even look."</em> — self-identified early panic, journal 21:47.</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                        <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold w-32 shrink-0 pt-1">Corroboration</span>
                        <span className="text-sm text-zinc-300 leading-relaxed">Trainer note (Oct 12) flagged <strong className="text-white">limited shoulder-checking</strong> in small-area games. Telemetry: 14 loops on the pro's pre-scan beat.</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 pt-4 border-t border-white/5">
                        <span className="text-xs uppercase tracking-widest text-cyan-500 font-semibold w-32 shrink-0 pt-1">Suggested focus</span>
                        <span className="text-sm text-cyan-100 font-medium">Shoulder-check habit on retrievals · gap-awareness reps · confidence under first pressure.</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed">
                    Video, telemetry, the player's own voice, and a trainer's note from three weeks ago — <strong className="text-white">synthesized into one card, delivered to your bench.</strong> The insight isn't generic. It's hers alone.
                  </p>
                </div>
              </div>

              {/* ACT 3 */}
              <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-indigo-500 md:border-t-0 md:border-l-2 md:pl-6">
                  <div className="text-3xl font-serif text-white mb-1">Thu</div>
                  <div className="font-mono text-indigo-400 tracking-wider">6:05 AM</div>
                  <div className="mt-4 text-sm text-zinc-500 uppercase tracking-widest font-semibold">Act III<br />The plan</div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-serif text-white mb-6"><span className="text-indigo-600 mr-2">03 /</span> Four voices sign one goal.</h3>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    Coffee in hand — same Thursday ritual, one tap past the Telemetry Board — you read the insight and reply in #26's feedback loop: <em className="text-zinc-200">"Great read on yourself. We fix the look, the panic fixes itself."</em> Then, together, the goal goes on the plan. He drafts it. You sharpen it. His skills mentor attaches a drill progression. His parents can see it.
                  </p>
                  
                  {/* Goal Mock */}
                  <div className="rounded-xl border border-white/10 bg-black/60 p-6 mb-8">
                    <h4 className="text-lg font-serif text-white mb-1">Clean D-zone exits under pressure</h4>
                    <div className="text-xs text-zinc-500 mb-6">Personal Plan · #26 · Meso-cycle: Nov–Jan · Reviewed weekly</div>
                    
                    <div className="h-2 bg-zinc-800 rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[43%]"></div>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-semibold mb-8">
                      <span className="text-zinc-500">Baseline 43%</span>
                      <span className="text-indigo-400">Now 43%</span>
                      <span className="text-zinc-500">Target 70% by playoffs</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-1">#26 · Owns it</span>
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-3 py-1">Coach · Guides it</span>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1">Mentor · Drills it</span>
                      <span className="rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs px-3 py-1">Parents · See it</span>
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed">
                    This is the bridge. Not a coach's demand, not a parent's wish, not a kid's vague hope — <strong className="text-white">one measurable objective, driven by the player, backed by every adult in her corner.</strong>
                  </p>
                </div>
              </div>

              {/* ACT 4 */}
              <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-emerald-500 md:border-t-0 md:border-l-2 md:pl-6">
                  <div className="text-3xl font-serif text-white mb-1">+3</div>
                  <div className="font-mono text-emerald-400 tracking-wider">WEEKS LATER</div>
                  <div className="mt-4 text-sm text-zinc-500 uppercase tracking-widest font-semibold">Act IV<br />The receipt</div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-serif text-white mb-6"><span className="text-emerald-600 mr-2">04 /</span> The loop closes on game night.</h3>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    Rivalry game. Heavy forecheck all night — exactly the pressure that used to make him rim it and pray. Spotlight tags her retrievals automatically: <strong className="text-white">8-for-9 clean exits.</strong> The goal tracker jumps. His parents see the milestone light up before she's out of her gear.
                  </p>
                  
                  {/* Journal Mock */}
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-6 mb-8 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-emerald-500/20">
                      <span className="text-sm text-zinc-300">Journal · <b className="text-white">#26 — Defense</b></span>
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-1 font-semibold flex items-center gap-1"><Zap className="w-3 h-3" /> Streak: 33 Days</span>
                    </div>
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Prompt · Post-Game Reflection</div>
                    <p className="text-lg font-serif italic text-white bg-black/40 p-4 rounded-lg border border-emerald-500/30 border-l-2 border-l-emerald-500 mb-4">
                      "Looked first every time. Heard him coming and didn't panic. It felt slow, like I had an extra second nobody else had."
                    </p>
                    <div className="text-xs text-zinc-400">
                      Milestone reached: <b className="text-emerald-400">89% clean exits</b> · goal updated · shared with plan
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed">
                    <em className="text-zinc-200">"An extra second nobody else had."</em> That's Hockey IQ being built in real time — and every lap of the loop is on the record: what she watched, what she wrote, what she was told, and what she did about it. <strong className="text-white">That record is her development story. Periodical is where it's written.</strong>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CAST */}
        <section className="px-6 py-24 lg:px-8 border-t border-white/5 bg-zinc-900/50">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">One plan · Every voice</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">Development is a team sport.<br />Now the team has a roster.</h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                Youth development fails in the gaps between the people who care. Periodical puts everyone on the same page — literally — with roles built around how real hockey families and staffs work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-black/30 border border-white/5 rounded-xl p-6 hover:border-amber-500/30 transition-colors group">
                <div className="text-xl font-serif text-white mb-1 group-hover:text-amber-400 transition-colors">The Player</div>
                <div className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-4">Drives it</div>
                <p className="text-sm text-zinc-400 leading-relaxed">Sets goals, journals daily, owns the plan. Reflection turns a kid who plays hockey into a student of the game.</p>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-6 hover:border-blue-500/30 transition-colors group">
                <div className="text-xl font-serif text-white mb-1 group-hover:text-blue-400 transition-colors">The Coach</div>
                <div className="text-xs uppercase tracking-widest text-blue-500 font-semibold mb-4">Guides it</div>
                <p className="text-sm text-zinc-400 leading-relaxed">Reviews journals, answers in the feedback loop, aligns personal goals with team macro, meso, and micro-cycles.</p>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-6 hover:border-emerald-500/30 transition-colors group">
                <div className="text-xl font-serif text-white mb-1 group-hover:text-emerald-400 transition-colors">The Mentor</div>
                <div className="text-xs uppercase tracking-widest text-emerald-500 font-semibold mb-4">Supports it</div>
                <p className="text-sm text-zinc-400 leading-relaxed">Skills trainers and mentors attach drill progressions and log observations that feed the insight engine.</p>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-6 hover:border-purple-500/30 transition-colors group">
                <div className="text-xl font-serif text-white mb-1 group-hover:text-purple-400 transition-colors">The Parent</div>
                <div className="text-xs uppercase tracking-widest text-purple-500 font-semibold mb-4">Sees it</div>
                <p className="text-sm text-zinc-400 leading-relaxed">Visibility without interference: milestones, streaks, and progress — the car ride home gets a lot better informed.</p>
              </div>
            </div>

            <p className="text-center text-zinc-400 mt-12 max-w-2xl mx-auto italic">
              Every entry, note, and goal feeds one place. The AI listens to all four voices — <strong className="text-white">so the insights you get reflect the whole player, not just the highlight reel.</strong>
            </p>
          </div>
        </section>

        {/* WORKBENCH CALLBACK */}
        <section className="px-6 py-16 lg:px-8 border-t border-white/5 bg-zinc-950">
          <div className="mx-auto max-w-4xl bg-zinc-900/40 rounded-2xl border border-white/5 p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div>
              <div className="text-xs font-semibold tracking-[0.2em] text-cyan-500 uppercase mb-3">Previously on Spotlight · Brief 01</div>
              <h3 className="text-2xl font-serif text-white mb-4">You've met the Workbench.</h3>
              <p className="text-zinc-400 mb-6 max-w-xl">
                The Coach's Clipboard Workbench is the intelligence half of this loop — AI discovery, directed Clipboards, and telemetry. Periodical is what happens after the loops stop counting.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded bg-black/50 border border-white/10 text-xs text-zinc-300">Captive AI Discovery</span>
                <span className="px-3 py-1 rounded bg-black/50 border border-white/10 text-xs text-zinc-300">Clipboards & Micro-Loops</span>
                <span className="px-3 py-1 rounded bg-black/50 border border-white/10 text-xs text-zinc-300">Watch Telemetry</span>
              </div>
            </div>
            <div className="shrink-0 p-6 rounded-xl bg-black/40 border border-white/5 text-center">
              <div className="text-xs text-zinc-500 mb-2">See:</div>
              <div className="font-serif text-white mb-1">Coach's Clipboard</div>
              <div className="text-sm text-zinc-400 mb-4">Workbench Brief · 01</div>
              <div className="text-[10px] uppercase tracking-widest text-cyan-500 font-semibold">Part of the platform</div>
            </div>
          </div>
        </section>

        {/* TELEMETRY / MATH OF THE LOOP */}
        <section className="px-6 py-24 lg:px-8 border-t border-white/5 bg-zinc-900/30">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">The math of the loop</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">Proof, on both sides of the glass.</h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                The Workbench proved they watched. Periodical proves they understood — and shows you, in their own words, what to teach next.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-white/5 bg-black/40 p-8 text-center">
                <div className="text-6xl font-serif text-white mb-2">4<span className="text-2xl text-zinc-500"> voices</span></div>
                <div className="text-sm font-semibold tracking-wider uppercase text-zinc-300 mb-4">On every personal plan</div>
                <p className="text-sm text-zinc-500 leading-relaxed">Player, coach, mentor, parent — <strong className="text-zinc-300">aligned on one objective</strong> instead of guessing at each other in the lobby.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/40 p-8 text-center">
                <div className="text-6xl font-serif text-white mb-2">3<span className="text-2xl text-zinc-500"> sources</span></div>
                <div className="text-sm font-semibold tracking-wider uppercase text-zinc-300 mb-4">Behind every AI insight</div>
                <p className="text-sm text-zinc-500 leading-relaxed">Game film, watch telemetry, and journal reflections — <strong className="text-zinc-300">synthesized per player</strong>, delivered to your bench.</p>
              </div>
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/10 p-8 text-center">
                <div className="text-5xl font-serif text-white mb-2">43<span className="text-2xl text-indigo-500">%</span> <span className="text-zinc-600">→</span> 89<span className="text-2xl text-indigo-500">%</span></div>
                <div className="text-sm font-semibold tracking-wider uppercase text-indigo-300 mb-4">One loop, 3 weeks, on record</div>
                <p className="text-sm text-zinc-400 leading-relaxed">Baseline to breakthrough, with <strong className="text-white">every step documented</strong> — the development story recruiters and rep tryouts never get to see. Until now.</p>
              </div>
            </div>
          </div>
        </section>

        {/* BETA CTA */}
        <section id="beta" className="px-6 py-32 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 to-indigo-950/20 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">Spotlight × Periodical · Now in Beta</span>
            <h2 className="mt-6 text-5xl font-serif tracking-tight text-white sm:text-7xl">
              Close the loop<br />on <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">development.</span>
            </h2>
            <p className="mt-8 text-xl leading-8 text-zinc-300 max-w-2xl mx-auto">
              Get the complete ecosystem — Spotlight's intelligence and Periodical's bridge — live on your roster for the season. One platform, one loop, every player developing on the record.
            </p>
            
            <div className="mt-12 flex items-center justify-center">
              <a href="#" className="rounded-full bg-white px-10 py-4 text-base font-semibold text-zinc-950 shadow-sm hover:bg-indigo-50 transition-all transform hover:scale-105">
                Request Access
              </a>
            </div>
            <p className="mt-8 text-xs text-zinc-500 uppercase tracking-widest font-serif">
              Spotlight sees. Periodical hears. Your players grow.
            </p>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
