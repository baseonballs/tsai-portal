"use client";

import React, { useState } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LockerRoomHub } from "@/components/landing/LockerRoomHub";
import { BetaSignupForm } from "@/components/landing/BetaSignupForm";
import { 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Clock, 
  Zap, 
  Target, 
  Brain, 
  Sparkles, 
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
  TrendingUp
} from "lucide-react";

export default function LockerRoomPage() {
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
      cue: '"Protect the house. Protect your ice."',
      tag: "rOwnPuck",
    },
    {
      id: "Threat" as const,
      name: "Be a Threat",
      hue: "rose",
      border: "border-rose-500/40",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      badgeBg: "bg-rose-500/20",
      glow: "shadow-[0_0_25px_rgba(244,63,94,0.15)]",
      cue: '"Eyes up in the high slot."',
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
      cue: '"Constant motor. Lateral mobility."',
      tag: "rQuickFeet",
    },
    {
      id: "ReadPlay" as const,
      name: "Read the Play",
      hue: "violet",
      border: "border-violet-500/40",
      bg: "bg-violet-500/10",
      text: "text-violet-400",
      badgeBg: "bg-violet-500/20",
      glow: "shadow-[0_0_25px_rgba(139,92,246,0.15)]",
      cue: '"Anticipate structure before it folds."',
      tag: "rReadPlay",
    },
    {
      id: "WinBattle" as const,
      name: "Win the Battle",
      hue: "blue",
      border: "border-blue-500/40",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      badgeBg: "bg-blue-500/20",
      glow: "shadow-[0_0_25px_rgba(59,130,246,0.15)]",
      cue: '"Body position first, puck second."',
      tag: "rWinBattle",
    },
    {
      id: "WallMaster" as const,
      name: "Wall Master",
      hue: "indigo",
      border: "border-indigo-500/40",
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      badgeBg: "bg-indigo-500/20",
      glow: "shadow-[0_0_25px_rgba(99,102,241,0.15)]",
      cue: '"Puck control under pressure along the glass."',
      tag: "rWallMaster",
    },
    {
      id: "DotDominance" as const,
      name: "Dot Dominance",
      hue: "orange",
      border: "border-orange-500/40",
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      badgeBg: "bg-orange-500/20",
      glow: "shadow-[0_0_25px_rgba(249,115,22,0.15)]",
      cue: '"Clean tie-ups and immediate possession control."',
      tag: "rDotDominance",
    },
  ];

  const currentSuperpower = superpowers.find((s) => s.id === activeSuperpower) || superpowers[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500 selection:text-zinc-950 font-sans">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-12 sm:pb-16 border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/30 via-zinc-950 to-zinc-950" />
        
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center gap-2.5 rounded-full border border-cyan-500/35 bg-black/90 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold tracking-wider text-cyan-300 backdrop-blur-xl shadow-xl shadow-cyan-500/15 mb-10 sm:mb-12 hover:border-cyan-400/60 transition-all">
            <Users className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-cyan-400 font-bold tracking-widest uppercase">The Locker Room</span>
            <span className="text-zinc-600 font-normal">·</span>
            <span className="text-zinc-200 font-medium tracking-wide uppercase">The Shared Sanctuary of Athlete Development</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif tracking-tight text-white mb-8 sm:mb-10 leading-[1.15] sm:leading-[1.12] drop-shadow-2xl max-w-5xl mx-auto">
            Step Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-cyan-200">The Locker Room</span>
          </h1>

          <p className="mt-8 sm:mt-10 text-lg sm:text-xl lg:text-2xl leading-relaxed sm:leading-9 text-zinc-300 max-w-3xl mx-auto font-light">
            Where pre-skate intentionality meets post-skate video intelligence. Connecting coaches, skaters, evaluators, and skills trainers in one shared developmental loop.
          </p>

          <div className="mt-12 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6">
            <a
              href="#locker-hub"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-9 py-4 text-sm font-semibold text-zinc-950 shadow-xl shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-95 min-h-[48px]"
            >
              <span>Explore The Locker Room</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#superpowers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-900/60 px-8 py-4 text-sm font-semibold text-zinc-300 transition-all hover:border-white/20 hover:text-white active:scale-95 min-h-[48px]"
            >
              <span>Micro-Skill Superpowers</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Locker Room Hub Section */}
      <div id="locker-hub">
        <LockerRoomHub />
      </div>

      {/* Micro-Skill Superpowers Matrix */}
      <section id="superpowers" className="relative py-16 sm:py-24 border-t border-white/5 bg-zinc-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <Zap className="h-3.5 w-3.5" />
              <span>Micro-Skill Micro-Loops</span>
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold font-serif text-white">
              8 Core Player Development Superpowers
            </h2>
            <p className="mt-3 text-zinc-400 text-sm sm:text-base">
              Every video clip captured in Spotlight is tagged into plain-language player superpowers, instantly delivered into Periodical athlete journals.
            </p>
          </div>

          {/* Superpower Selector Tabs (Mobile Scrollable) */}
          <div className="mt-10 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none max-w-full">
            {superpowers.map((sp) => {
              const isActive = sp.id === activeSuperpower;
              return (
                <button
                  key={sp.id}
                  onClick={() => setActiveSuperpower(sp.id)}
                  className={`snap-start shrink-0 rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                    isActive
                      ? `${sp.bg} ${sp.border} ${sp.text} border ${sp.glow}`
                      : "bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {sp.name}
                </button>
              );
            })}
          </div>

          {/* Selected Superpower Showcase Display Card */}
          <div className="mt-8 max-w-4xl mx-auto rounded-2xl border border-white/10 bg-zinc-900/70 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${currentSuperpower.badgeBg} ${currentSuperpower.text} border border-white/10`}>
                  Tag: {currentSuperpower.tag}
                </span>
                <h3 className="mt-2 text-2xl sm:text-3xl font-bold font-serif text-white">{currentSuperpower.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Coaching Cue</span>
                <p className="text-sm font-medium text-zinc-300 italic">{currentSuperpower.cue}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">How The Locker Room Trains This</h4>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${currentSuperpower.text}`} />
                  <span className="text-xs sm:text-sm text-zinc-300">MASCE AI automatically identifies shift execution timestamps.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${currentSuperpower.text}`} />
                  <span className="text-xs sm:text-sm text-zinc-300">Coaches annotate 15-second micro-loops on the Encore Workbench.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${currentSuperpower.text}`} />
                  <span className="text-xs sm:text-sm text-zinc-300">Skaters reflect and self-score in their Periodical mobile journal.</span>
                </div>
              </div>

              {/* Mock Video Micro-Loop Container */}
              <div className="relative aspect-video w-full rounded-xl border border-white/10 bg-zinc-950 p-4 flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                  <span>Micro-Loop Clip</span>
                  <span className={currentSuperpower.text}>15.0s Locked</span>
                </div>
                <div className="flex items-center justify-center my-auto">
                  <Play className={`h-10 w-10 ${currentSuperpower.text} animate-pulse`} />
                </div>
                <div className="text-xs font-mono text-zinc-400 bg-zinc-900/90 p-2 rounded border border-white/10">
                  {currentSuperpower.cue}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Signup Form Section */}
      <section className="py-16 sm:py-24 bg-zinc-950 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <BetaSignupForm />
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
