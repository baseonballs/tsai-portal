"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Scissors, 
  Send, 
  BookmarkCheck, 
  MessageSquareQuote, 
  TrendingUp, 
  ArrowRight, 
  Sparkles,
  Play,
  Mic,
  CheckCircle2,
  Zap,
  Activity,
  Layers
} from "lucide-react";

interface StepItem {
  step: string;
  title: string;
  subtitle: string;
  desc: string;
  badge: string;
  icon: any;
  color: string;
  borderColor: string;
  glowColor: string;
  gradient: string;
  badgeBg: string;
  iconColor: string;
  detail: {
    label: string;
    metrics: string;
    previewText: string;
  };
}

const steps: StepItem[] = [
  {
    step: "01",
    title: "Spot it",
    subtitle: "AI Telemetry Ingest",
    desc: "MASCE engine detects plays & surfaces reads in 41s.",
    badge: "Spotlight Engine",
    icon: Search,
    color: "cyan",
    borderColor: "border-cyan-500/40 hover:border-cyan-400",
    glowColor: "shadow-[0_0_25px_rgba(6,182,212,0.2)]",
    gradient: "from-cyan-950/60 via-zinc-900/60 to-black/80",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    iconColor: "text-cyan-400",
    detail: {
      label: "Autonomous Play Tagging",
      metrics: ">92% Deterministic Accuracy",
      previewText: "Game video parsed. Shift boundaries & puck possession events tagged with millisecond timestamps."
    }
  },
  {
    step: "02",
    title: "Cut it",
    subtitle: "Coach's Workbench",
    desc: "Bind teaching moments directly to athlete goals.",
    badge: "Tactical Clip",
    icon: Scissors,
    color: "indigo",
    borderColor: "border-indigo-500/40 hover:border-indigo-400",
    glowColor: "shadow-[0_0_25px_rgba(99,102,241,0.2)]",
    gradient: "from-indigo-950/60 via-zinc-900/60 to-black/80",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    iconColor: "text-indigo-400",
    detail: {
      label: "Superpower Alignment",
      metrics: "8 Core Superpowers",
      previewText: "Coach isolates a 4-second sequence and tags it to player's active 'Explode' development goal."
    }
  },
  {
    step: "03",
    title: "Send it",
    subtitle: "Continuous Feedback",
    desc: "Push directed video cut with audio & voice notes.",
    badge: "Continuous Feedback",
    icon: Send,
    color: "purple",
    borderColor: "border-purple-500/40 hover:border-purple-400",
    glowColor: "shadow-[0_0_25px_rgba(168,85,247,0.2)]",
    gradient: "from-purple-950/60 via-zinc-900/60 to-black/80",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    iconColor: "text-purple-400",
    detail: {
      label: "1-Tap Coach Dispatch",
      metrics: "Sub-Minute Sync",
      previewText: "Recorded audio overlay attached to the clip, queued for immediate athlete mobile arrival."
    }
  },
  {
    step: "04",
    title: "The Drop",
    subtitle: "Periodical Journal",
    desc: "Cinematic cut lands directly in athlete's feed.",
    badge: "Journal Entry",
    icon: BookmarkCheck,
    color: "fuchsia",
    borderColor: "border-fuchsia-500/40 hover:border-fuchsia-400",
    glowColor: "shadow-[0_0_25px_rgba(217,70,239,0.2)]",
    gradient: "from-fuchsia-950/60 via-zinc-900/60 to-black/80",
    badgeBg: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
    iconColor: "text-fuchsia-400",
    detail: {
      label: "Personalized Athlete Feed",
      metrics: "High-Visibility Alert",
      previewText: "Notification triggers inside Periodical journal with coach note and embedded video loop."
    }
  },
  {
    step: "05",
    title: "Read-back",
    subtitle: "Athlete Ownership",
    desc: "Player reflects, rates rep & records voice note.",
    badge: "Self-Reflection",
    icon: MessageSquareQuote,
    color: "emerald",
    borderColor: "border-emerald-500/40 hover:border-emerald-400",
    glowColor: "shadow-[0_0_25px_rgba(16,185,129,0.2)]",
    gradient: "from-emerald-950/60 via-zinc-900/60 to-black/80",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    iconColor: "text-emerald-400",
    detail: {
      label: "Multi-Voice Dialogue",
      metrics: "1-to-5 Rating Scale",
      previewText: "Athlete self-rates execution 4/5, writes a reflection: 'Felt my first 3 steps were explosive on the turn.'"
    }
  },
  {
    step: "06",
    title: "The Rip",
    subtitle: "Growth Tracked",
    desc: "Superpower levels up on record with verified reps.",
    badge: "Superpower Level Up",
    icon: TrendingUp,
    color: "amber",
    borderColor: "border-amber-500/40 hover:border-amber-400",
    glowColor: "shadow-[0_0_25px_rgba(245,158,11,0.2)]",
    gradient: "from-amber-950/60 via-zinc-900/60 to-black/80",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    iconColor: "text-amber-400",
    detail: {
      label: "Progress Trend Line",
      metrics: "+1 Verified Rep",
      previewText: "Analytics engine updates skill trend lines, unlocking positive reinforcement for player & parents."
    }
  }
];

export function TheLoopIllustration() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto cycle steps every 4 seconds if user isn't interacting
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = steps[activeStep];

  return (
    <div className="w-full max-w-6xl mx-auto my-6 text-left">
      {/* PIPELINE HEADER TRAIL BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-6 px-4 py-3 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl font-mono text-xs">
        <div className="flex items-center gap-2 text-cyan-400">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold tracking-wider uppercase">SPOTLIGHT</span>
          <span className="text-zinc-500 text-[10px] hidden sm:inline">(Film & AI Telemetry)</span>
        </div>

        <div className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 via-indigo-500/50 to-fuchsia-500/50" />
          <span className="text-[10px] sm:text-[11px] font-sans font-medium text-zinc-300 px-2.5 sm:px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 shadow-sm text-center">
            <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>The Continuous Feedback Continuum</span>
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-fuchsia-500/50 via-emerald-500/50 to-amber-500/50" />
        </div>

        <div className="flex items-center gap-2 text-fuchsia-400">
          <span className="font-bold tracking-wider uppercase">PERIODICAL</span>
          <span className="text-zinc-500 text-[10px] hidden sm:inline">(Athlete Journal)</span>
          <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse" />
        </div>
      </div>

      {/* 6-STEP INTERACTIVE CONTINUUM CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeStep === idx;

          return (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 border backdrop-blur-md flex flex-col justify-between overflow-hidden ${
                isActive
                  ? `bg-gradient-to-b ${item.gradient} ${item.borderColor} ${item.glowColor} ring-1 ring-white/20 -translate-y-1`
                  : "bg-zinc-950/60 border-white/10 hover:border-white/25 hover:bg-zinc-900/60"
              }`}
            >
              {/* TOP SHINE BEAM ON ACTIVE */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent animate-pulse" />
              )}

              {/* CARD TOP ROW */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${item.badgeBg}`}>
                    {item.step}
                  </span>
                  <div className={`p-2 rounded-xl bg-zinc-900/80 border border-white/10 transition-transform group-hover:scale-110 ${isActive ? item.iconColor : 'text-zinc-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* TITLE & SUBTITLE */}
                <h4 className="text-base font-serif font-bold text-white mb-0.5 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[10px] font-mono tracking-wide text-zinc-400 uppercase mb-2">
                  {item.subtitle}
                </p>

                {/* DESCRIPTION */}
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>

              {/* BOTTOM METADATA BADGE */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono">
                  {item.badge}
                </span>
                {isActive ? (
                  <span className={`w-2 h-2 rounded-full ${item.iconColor} bg-current animate-ping`} />
                ) : (
                  <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE STEP INTERACTIVE DETAIL DISPLAY BENCH */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-zinc-950 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Subtle Background Glow corresponding to current active color */}
        <div className={`absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700 ${current.badgeBg}`} />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${current.badgeBg} flex items-center gap-1.5`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Stage {current.step} · {current.detail.label}</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {current.detail.metrics}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif text-white font-bold flex items-center gap-2">
              <span>{current.title}:</span>
              <span className="font-sans font-normal text-zinc-300 text-lg">{current.subtitle}</span>
            </h3>

            <p className="text-sm text-zinc-300 leading-relaxed font-light">
              {current.detail.previewText}
            </p>
          </div>

          {/* DYNAMIC PROGRESS RADIAL CONTROL */}
          <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
            <div className="flex items-center gap-1.5 bg-black/50 p-1.5 rounded-full border border-white/10">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                    activeStep === i
                      ? `${steps[i].iconColor} bg-current scale-125 ring-2 ring-white/30`
                      : "bg-zinc-800 hover:bg-zinc-600"
                  }`}
                  title={`Jump to step 0${i + 1}`}
                />
              ))}
            </div>

            <div className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Step {activeStep + 1} of 6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
