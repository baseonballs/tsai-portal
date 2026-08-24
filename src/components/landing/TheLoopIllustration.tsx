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
  Pause,
  Mic,
  CheckCircle2,
  Zap,
  Activity,
  Radio,
  Flame,
  Volume2,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Check
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
  accentHex: string;
  detail: {
    label: string;
    metrics: string;
    previewText: string;
    cinematicMeta: string;
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
    borderColor: "border-cyan-500/50 hover:border-cyan-400",
    glowColor: "shadow-[0_0_30px_rgba(6,182,212,0.25)]",
    gradient: "from-cyan-950/80 via-zinc-900/80 to-black",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    iconColor: "text-cyan-400",
    accentHex: "#06b6d4",
    detail: {
      label: "Autonomous Play Tagging",
      metrics: ">95% Precision · 41s Scan",
      previewText: "Game video parsed. Shift boundaries & puck possession events tagged with millisecond timestamps.",
      cinematicMeta: "MASCE v2.4 Neural Ingest"
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
    borderColor: "border-indigo-500/50 hover:border-indigo-400",
    glowColor: "shadow-[0_0_30px_rgba(99,102,241,0.25)]",
    gradient: "from-indigo-950/80 via-zinc-900/80 to-black",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    iconColor: "text-indigo-400",
    accentHex: "#6366f1",
    detail: {
      label: "Superpower Alignment",
      metrics: "8 Core Superpowers",
      previewText: "Coach isolates a 4-second sequence and tags it to player's active 'Explode' development goal.",
      cinematicMeta: "Cut Room Workbench v3"
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
    borderColor: "border-purple-500/50 hover:border-purple-400",
    glowColor: "shadow-[0_0_30px_rgba(168,85,247,0.25)]",
    gradient: "from-purple-950/80 via-zinc-900/80 to-black",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    iconColor: "text-purple-400",
    accentHex: "#a855f7",
    detail: {
      label: "1-Tap Coach Dispatch",
      metrics: "Sub-Minute Sync",
      previewText: "Recorded audio overlay attached to the clip, queued for immediate athlete mobile arrival.",
      cinematicMeta: "Direct Athlete Pipeline"
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
    borderColor: "border-fuchsia-500/50 hover:border-fuchsia-400",
    glowColor: "shadow-[0_0_30px_rgba(217,70,239,0.25)]",
    gradient: "from-fuchsia-950/80 via-zinc-900/80 to-black",
    badgeBg: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
    iconColor: "text-fuchsia-400",
    accentHex: "#d946ef",
    detail: {
      label: "Personalized Athlete Feed",
      metrics: "High-Visibility Alert",
      previewText: "Notification triggers inside Periodical journal with coach note and embedded video loop.",
      cinematicMeta: "Mobile Sanctuary Feed"
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
    borderColor: "border-emerald-500/50 hover:border-emerald-400",
    glowColor: "shadow-[0_0_30px_rgba(16,185,129,0.25)]",
    gradient: "from-emerald-950/80 via-zinc-900/80 to-black",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    iconColor: "text-emerald-400",
    accentHex: "#10b981",
    detail: {
      label: "Multi-Voice Dialogue",
      metrics: "1-to-5 Rating Scale",
      previewText: "Athlete self-rates execution 4/5, writes a reflection: 'Felt my first 3 steps were explosive on the turn.'",
      cinematicMeta: "Voice Reflection Loop"
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
    borderColor: "border-amber-500/50 hover:border-amber-400",
    glowColor: "shadow-[0_0_30px_rgba(245,158,11,0.25)]",
    gradient: "from-amber-950/80 via-zinc-900/80 to-black",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    iconColor: "text-amber-400",
    accentHex: "#f59e0b",
    detail: {
      label: "Progress Trend Line",
      metrics: "+1 Verified Rep",
      previewText: "Analytics engine updates skill trend lines, unlocking positive reinforcement for player & parents.",
      cinematicMeta: "Verified Mastery Ledger"
    }
  }
];

export function TheLoopIllustration() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto cycle steps every 4.5 seconds if auto-play is enabled
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = steps[activeStep];

  return (
    <div className="w-full max-w-6xl mx-auto my-8 text-left">
      {/* PIPELINE HEADER TRAIL BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-8 px-5 py-3.5 rounded-2xl bg-zinc-950/90 border border-white/10 backdrop-blur-xl font-mono text-xs shadow-xl">
        <div className="flex items-center gap-2.5 text-cyan-400">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute opacity-75" />
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 relative" />
          </div>
          <span className="font-bold tracking-wider uppercase text-white">SPOTLIGHT</span>
          <span className="text-zinc-500 text-[10px] hidden sm:inline">(Film & AI Telemetry)</span>
        </div>

        <div className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/60 via-indigo-500/60 to-fuchsia-500/60" />
          <div className="px-3.5 py-1 rounded-full bg-black/80 border border-white/15 flex items-center gap-2 shadow-inner">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-sans font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-fuchsia-300">
              The Continuous Development Continuum
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-fuchsia-500/60 via-emerald-500/60 to-amber-500/60" />
        </div>

        <div className="flex items-center gap-2.5 text-fuchsia-400">
          <span className="font-bold tracking-wider uppercase text-white">PERIODICAL</span>
          <span className="text-zinc-500 text-[10px] hidden sm:inline">(Athlete Journal)</span>
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-fuchsia-400 animate-ping absolute opacity-75" />
            <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 relative" />
          </div>
        </div>
      </div>

      {/* STAGE CONTINUUM CONNECTORS & CARDS GRID */}
      <div className="relative">
        {/* HORIZONTAL GLOW CONNECTOR LINE */}
        <div className="hidden lg:block absolute top-[44px] left-6 right-6 h-[2px] bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-amber-500/30 z-0 pointer-events-none" />
        
        {/* ACTIVE PULSE BEAM ALONG CONNECTOR */}
        <div 
          className="hidden lg:block absolute top-[44px] h-[3px] bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 z-0 transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]"
          style={{
            left: `${(activeStep / (steps.length - 1)) * 80 + 5}%`,
            width: "15%"
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 relative z-10">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeStep === idx;

            return (
              <div
                key={idx}
                onClick={() => {
                  setActiveStep(idx);
                  setIsPlaying(false);
                }}
                className={`group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 border backdrop-blur-xl flex flex-col justify-between overflow-hidden ${
                  isActive
                    ? `bg-gradient-to-b ${item.gradient} ${item.borderColor} ${item.glowColor} ring-1 ring-white/30 scale-[1.03] z-20`
                    : "bg-zinc-950/70 border-white/10 hover:border-white/25 hover:bg-zinc-900/70"
                }`}
              >
                {/* TOP GLOW BAR FOR ACTIVE STAGE */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
                )}

                <div>
                  {/* CARD HEADER / STEP & ICON */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${item.badgeBg}`}>
                      {item.step}
                    </span>
                    <div className={`p-2 rounded-xl bg-zinc-900/90 border border-white/10 transition-all duration-300 group-hover:scale-110 ${isActive ? `${item.iconColor} border-white/30 shadow-lg` : 'text-zinc-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* TITLE & SUBTITLE */}
                  <h4 className="text-base font-serif font-bold text-white mb-0.5 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10px] font-mono tracking-wide text-zinc-400 uppercase mb-2 font-semibold">
                    {item.subtitle}
                  </p>

                  {/* SHORT DESCRIPTION */}
                  <p className="text-xs text-zinc-300 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>

                {/* BOTTOM FOOTER BADGE */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[80%]">
                    {item.badge}
                  </span>
                  {isActive ? (
                    <span className={`w-2 h-2 rounded-full ${item.iconColor} bg-current animate-ping`} />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CINEMATIC ACTIVE STAGE SHOWCASE BENCH */}
      <div className="mt-6 rounded-2xl border border-white/15 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Dynamic Background Glow */}
        <div 
          className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700" 
          style={{ backgroundColor: current.accentHex }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* LEFT COLUMN: STAGE DETAILS & PROMPT */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${current.badgeBg} flex items-center gap-1.5 shadow-md`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Stage {current.step} · {current.detail.label}</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                {current.detail.metrics}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest ml-auto">
                {current.detail.cinematicMeta}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif text-white font-bold flex flex-wrap items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-300">{current.title}</span>
              <span className="text-zinc-500 font-serif font-normal">/</span>
              <span className="font-sans font-medium text-zinc-300 text-xl">{current.subtitle}</span>
            </h3>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
              {current.detail.previewText}
            </p>

            {/* INTERACTIVE PLAY/PAUSE CONTROLS & TIMELINE INDICATORS */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all cursor-pointer flex items-center justify-center"
                  title={isPlaying ? "Pause auto-tour" : "Play auto-tour"}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />}
                </button>
                <span className="text-xs text-zinc-400 font-mono">
                  {isPlaying ? "Live Stage Tour Running" : "Tour Paused (Click Stage to Inspect)"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full border border-white/10">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveStep(i);
                      setIsPlaying(false);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      activeStep === i
                        ? `${steps[i].iconColor} bg-current scale-125 ring-2 ring-white/30`
                        : "bg-zinc-800 hover:bg-zinc-600"
                    }`}
                    title={`Jump to stage 0${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CINEMATIC VISUAL MOCKUP FOR ACTIVE STAGE */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-white/15 bg-black/80 p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${current.iconColor} bg-current animate-pulse`} />
                  <span className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                    {current.badge} Preview
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">STAGE {current.step} OF 06</span>
              </div>

              {/* DYNAMIC MOCKUP ACCORDING TO STAGE */}
              {activeStep === 0 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-zinc-900/90 p-3 rounded-lg border border-cyan-500/30 flex items-center justify-between">
                    <span className="text-cyan-400">MASCE-YOLO Ingest</span>
                    <span className="text-zinc-400">00:41s</span>
                  </div>
                  <div className="bg-black/60 p-3 rounded-lg border border-white/10 space-y-1.5 text-[11px]">
                    <div className="text-zinc-300 flex justify-between">
                      <span>Shift #12 (Corinne L.)</span>
                      <span className="text-emerald-400 font-bold">D-Zone Exit</span>
                    </div>
                    <div className="text-zinc-500 text-[10px]">
                      Timestamp: 14:22:08 · Puck Proximity: 0.2m · Speed: 18.4mph
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-zinc-900/90 p-3 rounded-lg border border-indigo-500/30 flex items-center justify-between">
                    <span className="text-indigo-400">Cut Room Workbench</span>
                    <span className="text-zinc-400">4s Clip</span>
                  </div>
                  <div className="bg-indigo-950/40 p-3 rounded-lg border border-indigo-500/30 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-zinc-200 text-xs font-sans font-medium">Bound Superpower: &apos;Explode&apos; (First 3 Steps)</span>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-zinc-900/90 p-3 rounded-lg border border-purple-500/30 flex items-center justify-between">
                    <span className="text-purple-400">Dispatch Queued</span>
                    <span className="text-zinc-400">1-Tap Push</span>
                  </div>
                  <div className="bg-black/60 p-3 rounded-lg border border-white/10 flex items-center gap-3">
                    <Mic className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="flex-1">
                      <div className="h-1.5 bg-purple-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 w-3/4 animate-pulse" />
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400">8s Voice Note</span>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-zinc-900/90 p-3 rounded-lg border border-fuchsia-500/30 flex items-center justify-between">
                    <span className="text-fuchsia-400">Periodical Mobile Drop</span>
                    <span className="text-zinc-400">Received</span>
                  </div>
                  <div className="bg-fuchsia-950/30 p-3 rounded-lg border border-fuchsia-500/30 text-xs font-sans text-zinc-200 space-y-1">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-fuchsia-400" /> New Film Room Card
                    </div>
                    <div className="text-zinc-400 text-[11px]">&quot;Watch how you turn your hips before taking the pass.&quot;</div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-zinc-900/90 p-3 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                    <span className="text-emerald-400">Read-back Reflection</span>
                    <span className="text-zinc-400">Rated 4 / 5</span>
                  </div>
                  <div className="bg-black/60 p-3 rounded-lg border border-white/10 text-xs font-sans text-zinc-300 italic">
                    &quot;I saw the defender bite on my fake. Next time I&apos;ll cut inside earlier.&quot;
                  </div>
                </div>
              )}

              {activeStep === 5 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-zinc-900/90 p-3 rounded-lg border border-amber-500/30 flex items-center justify-between">
                    <span className="text-amber-400">Superpower Level Up</span>
                    <span className="text-zinc-400">+1 Verified Rep</span>
                  </div>
                  <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-bold font-sans">
                      <Flame className="w-4 h-4 text-amber-400" /> Explosiveness Level 4
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">Streak: 6 Reps</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
