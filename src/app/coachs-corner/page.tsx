"use client";

import React, { useState } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { TheLoopIllustration } from "@/components/landing/TheLoopIllustration";
import { BetaSignupForm } from "@/components/landing/BetaSignupForm";
import { 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Clock, 
  Search, 
  Send, 
  Zap, 
  Target, 
  Brain, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  BarChart2, 
  Repeat, 
  Users, 
  Film, 
  Activity, 
  MessageSquare,
  Award,
  Flame,
  Check,
  ChevronRight,
  Mic,
  Eye,
  TrendingUp,
  Volume2
} from "lucide-react";

export default function CoachsCornerPage() {
  const [activeSuperpower, setActiveSuperpower] = useState<"Explode" | "OwnPuck" | "Threat" | "QuickFeet" | "ReadPlay" | "WinBattle" | "WallMaster" | "DotDominance">("Threat");

  const superpowers = [
    {
      id: "Explode" as const,
      name: "Explode",
      hue: "amber",
      border: "border-amber-500/40",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      badgeBg: "bg-amber-500/20",
      glow: "shadow-[0_0_25px_rgba(245,158,11,0.15)]",
      cue: '"First three steps. Explode and go."',
      tag: "rExplode",
    },
    {
      id: "OwnPuck" as const,
      name: "Own the Puck",
      hue: "cyan",
      border: "border-cyan-500/40",
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      badgeBg: "bg-cyan-500/20",
      glow: "shadow-[0_0_25px_rgba(6,182,212,0.15)]",
      cue: '"Hold it a beat. Make them come."',
      tag: "rOwnPuck",
    },
    {
      id: "Threat" as const,
      name: "Be a Threat",
      hue: "fuchsia",
      border: "border-fuchsia-500/40",
      bg: "bg-fuchsia-500/10",
      text: "text-fuchsia-400",
      badgeBg: "bg-fuchsia-500/20",
      glow: "shadow-[0_0_25px_rgba(217,70,239,0.2)]",
      cue: '"Shoot first, look second."',
      tag: "rThreat",
    },
    {
      id: "QuickFeet" as const,
      name: "Quick Feet",
      hue: "emerald",
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      badgeBg: "bg-emerald-500/20",
      glow: "shadow-[0_0_25px_rgba(16,185,129,0.15)]",
      cue: '"Light feet. Strong edges."',
      tag: "rQuickFeet",
    },
    {
      id: "ReadPlay" as const,
      name: "Read the Play",
      hue: "indigo",
      border: "border-indigo-500/40",
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      badgeBg: "bg-indigo-500/20",
      glow: "shadow-[0_0_25px_rgba(99,102,241,0.15)]",
      cue: '"See two passes ahead."',
      tag: "rReadPlay",
    },
    {
      id: "WinBattle" as const,
      name: "Win the Battle",
      hue: "rose",
      border: "border-rose-500/40",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      badgeBg: "bg-rose-500/20",
      glow: "shadow-[0_0_25px_rgba(244,63,94,0.15)]",
      cue: '"Low leverage. Heavy stick."',
      tag: "rWinBattle",
    },
    {
      id: "WallMaster" as const,
      name: "Hard Along Walls",
      hue: "violet",
      border: "border-violet-500/40",
      bg: "bg-violet-500/10",
      text: "text-violet-400",
      badgeBg: "bg-violet-500/20",
      glow: "shadow-[0_0_25px_rgba(139,92,246,0.15)]",
      cue: '"Clean wall chips. Seal boards."',
      tag: "rWallMaster",
    },
    {
      id: "DotDominance" as const,
      name: "Dot Dominance",
      hue: "sky",
      border: "border-sky-500/40",
      bg: "bg-sky-500/10",
      text: "text-sky-400",
      badgeBg: "bg-sky-500/20",
      glow: "shadow-[0_0_25px_rgba(14,165,233,0.15)]",
      cue: '"Own the dot. Set the tempo."',
      tag: "rDotDominance",
    },
  ];

  const activeSP = superpowers.find(s => s.id === activeSuperpower)!;

  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white">
      <LandingHeader />

      <main className="flex flex-col pt-24">
        {/* HERO */}
        <section className="relative px-6 py-24 sm:py-32 lg:px-8 border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/30 via-zinc-950/80 to-zinc-950 pointer-events-none" />
          
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-400 mb-8 backdrop-blur-md">
              <span className="mr-2 h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Spotlight · Periodical · Teams Beta Program · Founding Cohort
            </div>
            
            <h1 className="text-5xl font-serif tracking-tight text-white sm:text-7xl leading-[1.1]">
              Your clipboard<br />
              just learned <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-400">hockey.</span>
            </h1>

            <p className="mt-8 text-xl leading-8 text-zinc-300 max-w-2xl mx-auto font-light">
              The <strong className="text-white font-medium">Cut Room Workbench</strong> turns four hours of Sunday-night scrubbing into ninety seconds of asking — then binds your cuts directly to the athlete's goals via <strong className="text-cyan-400 font-medium">The Loop</strong>.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#beta" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all transform hover:scale-105">
                Join the Teams Beta Program
              </a>
              <a href="/locker-room" className="w-full sm:w-auto text-sm font-semibold leading-6 text-white hover:text-cyan-300 flex items-center justify-center gap-1.5 py-4 px-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 backdrop-blur-sm transition-all">
                Step Into The Locker Room <ArrowRight className="w-4 h-4 text-cyan-400" />
              </a>
            </div>

            <p className="mt-6 text-xs text-zinc-500 uppercase tracking-widest font-mono">
              Limited Founding Cohort · Amateur Youth Ice Hockey Staffs
            </p>
          </div>
        </section>

        {/* COLD OPEN */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-950">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-12">
              <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400" /> Cold Open
              </span>
              <span className="font-mono text-sm text-zinc-500 mt-2 md:mt-0 tracking-widest">SUN · 11:47 PM · YOUR KITCHEN TABLE</span>
            </div>
            
            <h2 className="text-3xl font-serif text-white sm:text-5xl mb-8 leading-tight">You know this scene.</h2>
            
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
                Now run the same week back — with The Loop and the Cut Room Workbench on your bench.
              </p>
            </div>
          </div>
        </section>

        {/* ABSTRACTION BANNER: THE LOOP CONNECTS THE DOTS */}
        <section id="loop" className="px-6 py-20 lg:px-8 border-y border-white/10 bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-amber-950/30 relative backdrop-blur-md">
          <div className="mx-auto max-w-6xl text-center">
            <span className="text-xs font-semibold tracking-[0.25em] text-cyan-400 uppercase mb-4 block">The Central Abstraction</span>
            <h2 className="text-4xl sm:text-6xl font-serif text-white mb-6">
              The Loop — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-400">Connects the Dots</span>
            </h2>
            <blockquote className="text-xl sm:text-2xl font-serif italic text-zinc-200 max-w-4xl mx-auto mb-12">
              "The goal lived in the journal. The proof lived in the film. They never met — until now. The Loop connects the dots."
            </blockquote>

            <TheLoopIllustration />
          </div>
        </section>

        {/* SUPERPOWER RAIL INTERACTIVE WORKBENCH DEMO */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-950 border-b border-white/5">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-fuchsia-400 uppercase">The Cut Room Console</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">Four Superpowers. One Rising Line.</h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                Select a superpower on the Cut Room rail. The console washes in its hue, filters your moments, and binds the cut directly to the athlete's personal goal.
              </p>
            </div>

            {/* SUPERPOWER RAIL BUTTONS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
              {superpowers.map(sp => (
                <button
                  key={sp.id}
                  onClick={() => setActiveSuperpower(sp.id)}
                  className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                    activeSuperpower === sp.id
                      ? `${sp.border} ${sp.bg} ${sp.glow} text-white ring-1 ring-white/20`
                      : "border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${sp.badgeBg} ${sp.text}`}>
                      {sp.tag}
                    </span>
                    {activeSuperpower === sp.id && <Sparkles className={`w-4 h-4 ${sp.text}`} />}
                  </div>
                  <h4 className="text-lg font-serif text-white font-bold">{sp.name}</h4>
                  <p className="text-xs text-zinc-400 mt-2 italic">{sp.cue}</p>
                </button>
              ))}
            </div>

            {/* CUT ROOM WORKBENCH SIMULATOR */}
            <div className={`rounded-2xl border ${activeSP.border} bg-black/60 backdrop-blur-xl p-8 shadow-2xl transition-all max-w-5xl mx-auto`}>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${activeSP.bg} ${activeSP.text} flex items-center justify-center animate-ping`}>●</div>
                  <span className="text-sm text-zinc-300 font-medium">The Cut Room · Development Binding</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${activeSP.badgeBg} ${activeSP.text} font-mono font-bold`}>
                    Superpower: {activeSP.name}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 font-mono">Target: #26 Corinne L. (Center · LA Lions 14U)</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT: BINDING SPEC */}
                <div className="space-y-6">
                  <div className="bg-zinc-900/70 p-5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Bound Player Goal (from Periodical Plan)</span>
                    <p className="text-lg font-serif text-white italic">"Shoot first, look second. Drive the slot."</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> She-Asked-For-This Badge
                    </span>
                  </div>

                  <div className="bg-zinc-900/70 p-5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Coach Voice Prompt (8s Voice Note Attached)</span>
                    <div className="flex items-center gap-3 bg-black/50 p-3 rounded-lg border border-white/10">
                      <Mic className="w-4 h-4 text-cyan-400 shrink-0" />
                      <p className="text-xs text-zinc-300 italic flex-1">"You're a shooter, Corinne. Trust it. The shot's there a full beat before the pass is."</p>
                      <Volume2 className="w-4 h-4 text-zinc-500" />
                    </div>
                  </div>
                </div>

                {/* RIGHT: MOMENT CUT PREVIEW */}
                <div className="bg-zinc-900/70 p-6 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cut Package Preview</span>
                      <span className="text-xs font-mono text-zinc-500">3 moments · ~48s total</span>
                    </div>
                    <div className="aspect-video bg-black rounded-lg border border-white/10 relative flex flex-col justify-end p-4 overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40 group-hover:text-white transition-colors">
                        <Play className="w-10 h-10" />
                      </div>
                      <span className="relative z-10 text-xs font-mono text-cyan-400 font-semibold flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" /> Hands Spotlighted · Edge Rendered
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                    <span className="text-xs text-zinc-400">One tap bind & send to Periodical</span>
                    <button className={`px-6 py-2.5 rounded-lg font-semibold text-xs text-white ${activeSP.badgeBg} border ${activeSP.border} hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer`}>
                      <Send className="w-3.5 h-3.5" /> Bind & Send Drop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ONE WEEK STORYBOARD (ACTS 1-4) */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-900/50 border-t border-white/5 relative overflow-hidden">
          <div className="mx-auto max-w-5xl relative z-10">
            <div className="text-center mb-20">
              <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">One Week · One Bench · The Full Loop</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">Four moments that change<br />how your team learns.</h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                Same games. Same roster. Same Thursday practice. Watch what happens when the Cut Room connects the dots to Periodical.
              </p>
            </div>

            <div className="space-y-32">
              {/* ACT 1 */}
              <div className="flex flex-col md:flex-row gap-12 group">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-cyan-500 md:border-t-0 md:border-l-2 md:pl-6 opacity-70 group-hover:opacity-100 transition-opacity">
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
                      <span><strong className="text-zinc-200">7 clips surfaced</strong> · 4 team turnovers + 3 pro reference clips · mapped via 4-tier Hockey Taxonomy · <strong className="text-zinc-200">elapsed: 00:00:41</strong></span>
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed">
                    The AI scans your team's full game library <em className="text-zinc-200">and</em> a curated set of pro-level master references, mapping your words against a taxonomy built for hockey — not generic sports video. Every turnover. The exact mechanic. Forty-one seconds. <strong className="text-white">The two hours you just got back? That's yours.</strong>
                  </p>
                </div>
              </div>

              {/* ACT 2 */}
              <div className="flex flex-col md:flex-row gap-12 group">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-indigo-500 md:border-t-0 md:border-l-2 md:pl-6 opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className="text-3xl font-serif text-white mb-1">Mon</div>
                  <div className="font-mono text-indigo-400 tracking-wider">7:14 PM</div>
                  <div className="mt-4 text-sm text-zinc-500 uppercase tracking-widest font-semibold">Act II<br />The drop</div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-serif text-white mb-6"><span className="text-indigo-500/50 mr-2">02 /</span> Send it. The Drop lands inside her day.</h3>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    One tap. The cut arrives in Corinne's Periodical Film Room as a <strong className="text-fuchsia-400 font-medium">fuchsia cinematic tile</strong> — not a text link to ignore, but a piece of film addressed to her by name and tied to her goal.
                  </p>
                  
                  {/* UI Mock */}
                  <div className="rounded-xl border border-fuchsia-500/30 bg-black/40 backdrop-blur-md p-6 shadow-2xl mb-8 transform transition-transform hover:-translate-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
                      <span className="text-sm font-semibold text-white">Film Room Drop · #26 Corinne L.</span>
                      <span className="rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs px-3 py-1 font-mono font-bold">Be a Threat</span>
                    </div>
                    <div className="bg-zinc-900/60 p-4 rounded-lg border border-white/5 text-zinc-300 font-serif italic mb-4">
                      "New Drop from Coach Dave: 'Watch for this — you're a shooter. The shot's there a full beat before the pass is. Trust it.'"
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center justify-between">
                      <span>Receipt: <strong className="text-emerald-400">Pushed 7:14 PM → Seen 7:31 PM</strong></span>
                      <span className="text-zinc-500 font-mono">Tied to goal: "Shoot first, look second"</span>
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed">
                    She opens it because it's hers. On your bench, the receipt chip flips from <strong className="text-zinc-400">Pushed</strong> to <strong className="text-emerald-400">Seen</strong> before you're off the ice.
                  </p>
                </div>
              </div>

              {/* ACT 3 */}
              <div className="flex flex-col md:flex-row gap-12 group">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-emerald-500 md:border-t-0 md:border-l-2 md:pl-6 opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className="text-3xl font-serif text-white mb-1">Mon</div>
                  <div className="font-mono text-emerald-400 tracking-wider">9:30 PM</div>
                  <div className="mt-4 text-sm text-zinc-500 uppercase tracking-widest font-semibold">Act III<br />The read-back</div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-serif text-white mb-6"><span className="text-emerald-500/50 mr-2">03 /</span> Watch. Reflect. Rate.</h3>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    The cut plays inside that night's journal entry — not a separate app — with your voice note playing over the read. Then comes <strong className="text-zinc-200 font-medium">The Read-back</strong>: one question, one self-rating (3/5).
                  </p>
                  
                  {/* UI Mock */}
                  <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-2xl mb-8 transform transition-transform hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Read-back Logged · #26</span>
                      <span className="text-xs text-zinc-400 font-mono">Self-Rating: 3 / 5 (Be a Threat)</span>
                    </div>
                    <p className="text-sm font-serif italic text-zinc-200 bg-zinc-900/60 p-4 rounded border border-white/5 mb-3">
                      "Yeah — I had the shot and I looked away. Next game I'm shooting the first one that opens."
                    </p>
                    <div className="text-xs text-zinc-500">
                      Writes a <strong className="text-zinc-300">coach-reviewed rep</strong> to her ledger without touching her game-day baseline.
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed">
                    She talks her response into her phone before going to sleep. <strong className="text-white">That's not passive screen time. That's a rep on the record.</strong>
                  </p>
                </div>
              </div>

              {/* ACT 4 */}
              <div className="flex flex-col md:flex-row gap-12 group">
                <div className="md:w-1/4 flex flex-col pt-2 border-t-2 border-amber-500 md:border-t-0 md:border-l-2 md:pl-6 opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className="text-3xl font-serif text-white mb-1">Thu</div>
                  <div className="font-mono text-amber-400 tracking-wider">6:00 AM</div>
                  <div className="mt-4 text-sm text-zinc-500 uppercase tracking-widest font-semibold">Act IV<br />The proof</div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-serif text-white mb-6"><span className="text-amber-500/50 mr-2">04 /</span> You never ask "did you watch it?" again.</h3>
                  <p className="text-zinc-400 mb-6 leading-relaxed">
                    Coffee in hand, you open the <strong className="text-zinc-200 font-medium">Telemetry Board</strong>. Every interaction with your cut is on it — not just who logged in, but loop counts, dwell time, and read-back completions.
                  </p>
                  <p className="text-zinc-400 mb-6 leading-relaxed">
                    Corinne looped your 3-second teaching window <strong className="text-amber-400 font-medium">14 times</strong>. She spent two full minutes inside one mechanic. And your unit completion reads a clean, undeniable <strong className="text-white">100%</strong>.
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
              <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">The Math of a Better Bench</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">Accountability you can point at.</h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                Coaches don't need more video. They need proof the video worked. The Telemetry Board tracks loop counts, dwell time, and completion state behind every cut.
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

        {/* HOCKEY TAXONOMY */}
        <section className="px-6 py-24 lg:px-8 bg-zinc-900/50 border-t border-white/5">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">Under the hood · Hockey Taxonomy</span>
              <h2 className="mt-4 text-4xl font-serif text-white sm:text-5xl">It speaks hockey.<br />Not just "video."</h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
                Generic AI sees pixels. Spotlight's discovery engine maps every clip against a proprietary four-tier Hockey Taxonomy — from physical and spatial vectors (<span className="text-cyan-400 font-medium">Nano</span>) up to <span className="text-emerald-400 font-medium">Macro</span> game states.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-black/20 border border-white/5 rounded-xl p-6 hover:border-cyan-500/30 transition-colors group">
                <div className="flex items-baseline justify-between mb-4">
                  <h4 className="text-xl font-serif text-cyan-400 font-bold">Nano</h4>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">Tier 0 · Physical</span>
                </div>
                <p className="text-sm text-zinc-400">The physics: proximity, vectors, velocity &amp; blade orientation. <em className="text-zinc-300 block mt-2">"Puck proximity 0.18m, 18.4mph velocity vector."</em></p>
              </div>
              <div className="bg-black/20 border border-white/5 rounded-xl p-6 hover:border-indigo-500/30 transition-colors group">
                <div className="flex items-baseline justify-between mb-4">
                  <h4 className="text-xl font-serif text-indigo-400 font-bold">Micro</h4>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">Tier 1 · Mechanic</span>
                </div>
                <p className="text-sm text-zinc-400">The skill: body position, puck placement, timing. <em className="text-zinc-300 block mt-2">"Hips square to the boards, puck on forehand."</em></p>
              </div>
              <div className="bg-black/20 border border-white/5 rounded-xl p-6 hover:border-fuchsia-500/30 transition-colors group">
                <div className="flex items-baseline justify-between mb-4">
                  <h4 className="text-xl font-serif text-fuchsia-400 font-bold">Meso</h4>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">Tier 2 · Tactical</span>
                </div>
                <p className="text-sm text-zinc-400">The system: breakouts, entries, cycles, coverage schemes. <em className="text-zinc-300 block mt-2">"Strong-side breakout on a zone exit."</em></p>
              </div>
              <div className="bg-black/20 border border-white/5 rounded-xl p-6 hover:border-emerald-500/30 transition-colors group">
                <div className="flex items-baseline justify-between mb-4">
                  <h4 className="text-xl font-serif text-emerald-400 font-bold">Macro</h4>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">Tier 3 · Game state</span>
                </div>
                <p className="text-sm text-zinc-400">The situation: zone, strength, possession, pressure. <em className="text-zinc-300 block mt-2">"D-zone, even strength, under forecheck."</em></p>
              </div>
            </div>
          </div>
        </section>

        {/* TEAMS BETA CTA */}
        <section id="beta" className="px-6 py-32 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 via-cyan-950/20 to-zinc-950 text-center relative overflow-hidden">
          <div className="mx-auto max-w-3xl relative z-10">
            <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">Teams Beta Program · Now Forming</span>
            <h2 className="mt-6 text-5xl font-serif tracking-tight text-white sm:text-7xl leading-tight">
              Take the first <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400">shift.</span>
            </h2>
            <p className="mt-8 text-xl leading-8 text-zinc-300 max-w-2xl mx-auto">
              The Teams Beta Program is opening to a limited cohort of youth ice hockey coaching staffs and clubs. Founding teams don't just get early access — they shape what this becomes.
            </p>
            
            <div className="mt-12 text-left max-w-2xl mx-auto">
              <BetaSignupForm />
            </div>
            <p className="mt-8 text-xs text-zinc-500 uppercase tracking-widest font-mono">
              Stop scrubbing. Connect the dots. · Rolling staff approvals
            </p>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
