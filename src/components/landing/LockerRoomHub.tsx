"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  User, 
  ShieldCheck, 
  BarChart2, 
  Zap, 
  Play, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Target, 
  Flame, 
  Sparkles,
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { landingPageCopy, LockerRoomStall } from "@/data/landingPageCopy";

export function LockerRoomHub() {
  const copy = landingPageCopy.lockerRoom;
  const [activeStallId, setActiveStallId] = useState<"athlete" | "coach" | "scout" | "trainer">("athlete");
  const [mode, setMode] = useState<"pre" | "post">("pre");

  const activeStall = copy.stalls.find((s) => s.id === activeStallId) || copy.stalls[0];

  const getHueClasses = (hue: string) => {
    switch (hue) {
      case "cyan":
        return {
          border: "border-cyan-500/40 hover:border-cyan-400/60",
          activeBg: "bg-cyan-500/15",
          activeBorder: "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
          text: "text-cyan-400",
          badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
          gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
        };
      case "amber":
        return {
          border: "border-amber-500/40 hover:border-amber-400/60",
          activeBg: "bg-amber-500/15",
          activeBorder: "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
          text: "text-amber-400",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
        };
      case "emerald":
        return {
          border: "border-emerald-500/40 hover:border-emerald-400/60",
          activeBg: "bg-emerald-500/15",
          activeBorder: "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
          text: "text-emerald-400",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
        };
      case "violet":
      default:
        return {
          border: "border-violet-500/40 hover:border-violet-400/60",
          activeBg: "bg-violet-500/15",
          activeBorder: "border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.15)]",
          text: "text-violet-400",
          badgeBg: "bg-violet-500/20 text-violet-300 border-violet-500/30",
          gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
        };
    }
  };

  const currentHue = getHueClasses(activeStall.hue);

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "User":
        return <User className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      case "BarChart2":
        return <BarChart2 className={className} />;
      case "Zap":
      default:
        return <Zap className={className} />;
    }
  };

  return (
    <section className="relative overflow-hidden bg-zinc-950 py-16 sm:py-24 lg:py-32">
      {/* Dynamic Background Glow Layer */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/15 via-zinc-950/80 to-zinc-950" />
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-0 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{copy.eyebrow}</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl font-serif">
            {copy.title}
          </h2>
          <p className="mt-4 text-base text-zinc-400 sm:text-lg leading-relaxed">
            {copy.subtitle}
          </p>
        </div>

        {/* Persona Stall Selection Carousel (Mobile Horizontal Scrollable Pills) */}
        <div className="mt-10 sm:mt-14">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none max-w-full">
            {copy.stalls.map((stall) => {
              const isActive = stall.id === activeStallId;
              const stallHue = getHueClasses(stall.hue);

              return (
                <button
                  key={stall.id}
                  onClick={() => setActiveStallId(stall.id)}
                  className={`snap-start shrink-0 flex items-center gap-2.5 rounded-full px-5 py-3 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[44px] touch-manipulation ${
                    isActive
                      ? `${stallHue.activeBg} ${stallHue.activeBorder} ${stallHue.text} border-2`
                      : "bg-zinc-900/60 border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                  aria-selected={isActive}
                >
                  {renderIcon(stall.icon, `h-4 w-4 ${isActive ? stallHue.text : "text-zinc-500"}`)}
                  <span className="whitespace-nowrap">{stall.role}</span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${stallHue.badgeBg}`}>
                    {stall.persona}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pre-Skate Intent vs Post-Skate Reflection Mode Switcher */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-xl bg-zinc-900/80 p-1 border border-white/10 shadow-inner">
            <button
              onClick={() => setMode("pre")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                mode === "pre"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Target className="h-4 w-4" />
              <span>Pre-Skate Intent</span>
            </button>
            <button
              onClick={() => setMode("post")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                mode === "post"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Post-Skate Reflection</span>
            </button>
          </div>
        </div>

        {/* Main Interactive Locker Room Hub Glass Card */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Persona Details & Feature Pillars */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className={`rounded-2xl border ${currentHue.border} bg-zinc-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl ${currentHue.gradient} blur-2xl pointer-events-none`} />

              {/* Role Header */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-3 bg-zinc-950 border border-white/10 ${currentHue.text}`}>
                    {renderIcon(activeStall.icon, "h-6 w-6")}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-serif">{activeStall.role}</h3>
                    <p className="text-xs text-zinc-400">{activeStall.title}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${currentHue.badgeBg}`}>
                  {activeStall.badge}
                </span>
              </div>

              {/* Focus Statement */}
              <div className="mt-5">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Development Anchor</span>
                <p className="mt-1 text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
                  {activeStall.focus}
                </p>
              </div>

              {/* Quote Box */}
              <div className="mt-5 rounded-xl border border-white/10 bg-zinc-950/80 p-4 relative">
                <MessageSquare className={`absolute top-3 right-3 h-4 w-4 opacity-40 ${currentHue.text}`} />
                <p className="text-xs sm:text-sm italic text-zinc-300">
                  {activeStall.quote}
                </p>
              </div>

              {/* Features List */}
              <div className="mt-6 space-y-3">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Key Ecosystem Pillars</span>
                {activeStall.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${currentHue.text}`} />
                    <span className="text-xs sm:text-sm text-zinc-300 leading-snug">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Call-to-Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href={activeStall.id === "coach" ? "/coachs-corner" : "/locker-room"}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-xs sm:text-sm font-semibold text-zinc-950 transition-all hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 active:scale-95 min-h-[48px]"
                >
                  <span>{activeStall.id === "coach" ? "Explore Coach's Corner" : copy.primaryCta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/players-development"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-xs sm:text-sm font-semibold text-zinc-300 transition-all hover:border-white/20 hover:text-white active:scale-95 min-h-[48px]"
                >
                  <span>{copy.secondaryCta}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Video Micro-Loop Showcase (16:9 Responsive) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 sm:p-7 backdrop-blur-xl shadow-2xl">
              {/* Media Player Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    {mode === "pre" ? "Pre-Skate Intent Briefing" : "Post-Skate Micro-Loop Debrief"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>15s Video Clip Locked</span>
                </div>
              </div>

              {/* Video Player Display Screen (16:9 Aspect Ratio) */}
              <div className="mt-5 relative aspect-video w-full overflow-hidden rounded-xl border border-white/15 bg-zinc-950 shadow-inner group">
                <img
                  src="/logos/tsai-emblem-full.png"
                  alt="Micro-Loop Video Preview"
                  className="absolute inset-0 h-full w-full object-cover opacity-20 filter blur-sm scale-105 transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Simulated Tactical Overlay */}
                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="rounded-md bg-zinc-900/90 border border-white/10 px-2.5 py-1 text-[11px] font-mono text-cyan-300">
                      TSAI :: MASCE-VPR-002
                    </span>
                    <span className="rounded-md bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                      Tag: rExplode · Shift #4
                    </span>
                  </div>

                  {/* Center Interactive Play Button */}
                  <div className="flex flex-col items-center justify-center">
                    <button
                      className="group/btn flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/90 text-zinc-950 shadow-2xl shadow-cyan-500/40 transition-all hover:scale-110 hover:bg-cyan-400 active:scale-95 cursor-pointer min-h-[48px] min-w-[48px]"
                      aria-label="Play Micro-Loop Video Clip"
                    >
                      <Play className="h-7 w-7 fill-current ml-1" />
                    </button>
                    <span className="mt-3 text-xs font-semibold text-zinc-300 bg-zinc-900/80 px-3 py-1 rounded-full border border-white/10">
                      Tap to Preview 15s Micro-Loop
                    </span>
                  </div>

                  {/* Lower Overlay Data Bar */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono bg-zinc-950/80 p-2.5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">Skater #19</span>
                      <span className="text-zinc-500">|</span>
                      <span className="text-cyan-400">First 3 Steps Acceleration</span>
                    </div>
                    <span>00:14.2 / 00:15.0</span>
                  </div>
                </div>
              </div>

              {/* Periodical Daily Reflection Bridge Preview */}
              <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-cyan-400" />
                    <h4 className="text-xs sm:text-sm font-semibold text-white">Periodical Athlete Mobile Journal</h4>
                  </div>
                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Daily Reflection
                  </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-zinc-300 italic">
                  {mode === "pre"
                    ? '"Pre-Game Brief: Drive hard through the neutral zone, lock inside edge posture, and track puck retrieval speed."'
                    : '"Post-Game Reflection: Executed 3 high-danger corner retrievals as briefed in Coach Workbench clip #4."'}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs font-medium text-cyan-400">
                  <span>Synced directly to player device</span>
                  <Link href="/players-development" className="inline-flex items-center gap-1 hover:underline">
                    <span>View Micro-Loop Ledger</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
