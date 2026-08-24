"use client";

import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Brain, 
  Layers, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Database, 
  GitMerge, 
  Terminal,
  ChevronRight,
  TrendingUp,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  ChevronUp
} from "lucide-react";

export function TranscendEngineSubstrate() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [pulseCount, setPulseCount] = useState<number>(1422);

  // Simulating live engine telemetry counter increments
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const pillars = [
    {
      id: 0,
      tag: "PERCEPTION",
      title: "MASCE AI Vision Pipeline",
      subtitle: "Autonomous Video Intelligence",
      desc: "Multi-Agent Sports Cognition Engine running YOLO v11 object tracking, homography pixel-to-meter translation, and shift parsing in 41 seconds.",
      accent: "cyan",
      badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      border: "border-cyan-500/40",
      glow: "shadow-[0_0_30px_rgba(6,182,212,0.25)]",
      gradient: "from-cyan-950/60 via-zinc-900/60 to-black/80",
      metrics: "60 FPS Processing · 41s Shift Ingest",
      icon: Cpu,
    },
    {
      id: 1,
      tag: "SYNTHESIS",
      title: "Semantic Synthesis Ledger",
      subtitle: "Film Proof × Player Intent",
      desc: "Cross-references hard visual telemetry from Spotlight with subjective reflection notes from Periodical. Resolves what happened against why it happened.",
      accent: "indigo",
      badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      border: "border-indigo-500/40",
      glow: "shadow-[0_0_30px_rgba(99,102,241,0.25)]",
      gradient: "from-indigo-950/60 via-zinc-900/60 to-black/80",
      metrics: ">95% Decision-Grade Alignment",
      icon: GitMerge,
    },
    {
      id: 2,
      tag: "ONTOLOGY",
      title: "4-Tier Hockey Taxonomy",
      subtitle: "Nano · Micro · Meso · Macro Context Domain Model",
      desc: "Proprietary 4-tier domain graph mapping physical & spatial vectors (Nano), individual skater mechanics (Micro), team tactics (Meso), and game states (Macro).",
      accent: "amber",
      badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      border: "border-amber-500/40",
      glow: "shadow-[0_0_30px_rgba(251,191,36,0.25)]",
      gradient: "from-amber-950/60 via-zinc-900/60 to-black/80",
      metrics: "100% Hockey Native Ontology",
      icon: Layers,
    },
    {
      id: 3,
      tag: "FLYWHEEL",
      title: "Closed-Loop Intelligence Engine",
      subtitle: "Self-Reinforcing Mastery",
      desc: "Every cut dispatched and journal read-back updates player trend lines, training the model to surface higher-leverage clips for coaches on the next shift.",
      accent: "cyan",
      badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      border: "border-cyan-500/40",
      glow: "shadow-[0_0_30px_rgba(6,182,212,0.25)]",
      gradient: "from-cyan-950/60 via-zinc-900/60 to-black/80",
      metrics: "Continuous Athlete Feedback",
      icon: Brain,
    },
  ];

  const currentPillar = pillars[activeTab];
  const CurrentIcon = currentPillar.icon;

  return (
    <div className="w-full relative mt-8 pt-8">
      {/* POWERING APPLICATIONS ARROW BRIDGE & CONDUITS */}
      <div className="relative h-32 w-full flex items-center justify-between px-6 pointer-events-none mb-3">
        {/* Left Arrow Conduit (Pointing up to Spotlight Card) */}
        <div className="hidden sm:flex flex-col items-center absolute left-[25%] -translate-x-1/2 top-0 bottom-0 justify-between py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/90 px-3 py-1 rounded-full border border-cyan-500/50 backdrop-blur-md shadow-lg animate-bounce">
            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Powering Spotlight</span>
          </div>
          <div className="w-0.5 flex-1 bg-gradient-to-t from-cyan-500/90 via-cyan-400/50 to-cyan-500/20 my-1 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
        </div>

        {/* Center Convergence Badge (Positioned at bottom near pedestal) */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 px-5 py-2 rounded-full bg-zinc-950/95 border border-white/20 text-xs font-mono flex items-center gap-2.5 shadow-2xl backdrop-blur-xl">
          <div className="p-1 rounded-full bg-indigo-500/20 border border-indigo-500/40">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          </div>
          <span className="text-zinc-200 font-semibold uppercase tracking-wider text-[11px]">
            Transcend AI Substrate
          </span>
          <span className="text-cyan-400 font-bold text-[11px] bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
            {pulseCount} events/sec
          </span>
        </div>

        {/* Right Arrow Conduit (Pointing up to Periodical Card) */}
        <div className="hidden sm:flex flex-col items-center absolute right-[25%] translate-x-1/2 top-0 bottom-0 justify-between py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-fuchsia-400 bg-fuchsia-950/90 px-3 py-1 rounded-full border border-fuchsia-500/50 backdrop-blur-md shadow-lg animate-bounce">
            <span>Powering Periodical</span>
            <ArrowUp className="w-3.5 h-3.5 text-fuchsia-400" />
          </div>
          <div className="w-0.5 flex-1 bg-gradient-to-t from-fuchsia-500/90 via-fuchsia-400/50 to-fuchsia-500/20 my-1 shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
          <div className="w-3 h-3 rounded-full bg-fuchsia-400 animate-ping" />
        </div>
      </div>

      {/* TRANSCEND PLATFORM FOUNDATION PEDESTAL */}
      <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-zinc-950 via-zinc-900/90 to-black p-8 md:p-12 shadow-2xl backdrop-blur-2xl relative overflow-hidden text-left">
        {/* Ambient Neon Platform Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/20 via-indigo-500/25 to-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* PEDESTAL HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE UNDERLYING PLATFORM FOUNDATION</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Transcend <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">AI Core Engine</span>
            </h3>
            <p className="text-sm md:text-base text-zinc-300 max-w-2xl font-light leading-relaxed">
              Spotlight sees the film. Periodical captures the athlete&apos;s voice. <strong className="text-white font-medium">Transcend is the decision-grade AI engine underneath</strong> — fusing computer vision, semantic synthesis, and hockey domain graphs into one unified intelligence substrate.
            </p>
          </div>

          {/* ENGINE STATUS TELEMETRY BADGE */}
          <div className="bg-black/80 border border-white/15 p-4 rounded-2xl font-mono text-xs space-y-2 shrink-0 shadow-inner">
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-400 text-[11px]">PLATFORM STATUS</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> ONLINE
              </span>
            </div>
            <div className="text-zinc-200 font-semibold text-[11px] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> MASCE Neural Core v2.4
            </div>
            <div className="text-[10px] text-zinc-500">
              Latency: 41s ingest · Sync: Realtime
            </div>
          </div>
        </div>

        {/* 4 ENGINE PILLARS TABS & SHOWCASE */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
          {/* PILLAR SELECTOR CARDS */}
          <div className="lg:col-span-6 space-y-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const isSelected = activeTab === pillar.id;

              return (
                <div
                  key={pillar.id}
                  onClick={() => setActiveTab(pillar.id)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-4 ${
                    isSelected
                      ? `bg-gradient-to-r ${pillar.gradient} ${pillar.border} ${pillar.glow} ring-1 ring-white/20`
                      : "bg-black/50 border-white/5 hover:border-white/20 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border border-white/10 ${isSelected ? pillar.badgeBg : "bg-zinc-900 text-zinc-400"}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${pillar.badgeBg} px-2 py-0.5 rounded`}>
                        {pillar.tag}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {pillar.metrics}
                      </span>
                    </div>

                    <h4 className="text-base font-serif font-bold text-white">{pillar.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 font-light">
                      {pillar.id === 2 ? (
                        <span>
                          <span className="text-cyan-400 font-medium">Nano</span> · <span className="text-indigo-400 font-medium">Micro</span> · <span className="text-fuchsia-400 font-medium">Meso</span> · <span className="text-emerald-400 font-medium">Macro</span> Context Domain Model
                        </span>
                      ) : (
                        pillar.subtitle
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTIVE PILLAR HIGH-TECH INSPECTOR CONSOLE */}
          <div className="lg:col-span-6">
            <div className={`rounded-2xl border ${currentPillar.border} bg-black/90 p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl ${currentPillar.glow}`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <CurrentIcon className={`w-5 h-5 ${currentPillar.badgeBg.split(" ")[1]}`} />
                  <span className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    {currentPillar.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  TRANSCEND PLATFORM SUBSTRATE
                </span>
              </div>

              <div className="space-y-4">
                <h5 className="text-xl font-serif font-bold text-white">
                  {currentPillar.id === 2 ? (
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-cyan-400">Nano</span>
                      <span className="text-zinc-500 font-sans">·</span>
                      <span className="text-indigo-400">Micro</span>
                      <span className="text-zinc-500 font-sans">·</span>
                      <span className="text-fuchsia-400">Meso</span>
                      <span className="text-zinc-500 font-sans">·</span>
                      <span className="text-emerald-400">Macro</span>
                      <span className="text-white ml-1">Context Domain Model</span>
                    </span>
                  ) : (
                    currentPillar.subtitle
                  )}
                </h5>
                <p className="text-sm text-zinc-300 leading-relaxed font-light">
                  {currentPillar.id === 2 ? (
                    <>
                      Proprietary 4-tier domain graph mapping physical &amp; spatial vectors (<span className="text-cyan-400 font-medium">Nano</span>), individual skater mechanics (<span className="text-indigo-400 font-medium">Micro</span>), team tactics (<span className="text-fuchsia-400 font-medium">Meso</span>), and game states (<span className="text-emerald-400 font-medium">Macro</span>).
                    </>
                  ) : currentPillar.desc.includes("Multi-Agent Sports Cognition Engine") ? (
                    <>
                      <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">
                        Multi-Agent Sports Cognition Engine
                      </span>
                      {currentPillar.desc.replace("Multi-Agent Sports Cognition Engine", "")}
                    </>
                  ) : (
                    currentPillar.desc
                  )}
                </p>

                {/* SIMULATED HIGH-TECH AI TERMINAL METRICS */}
                <div className="mt-6 p-4 rounded-xl bg-zinc-950 border border-white/10 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 border-b border-white/5 pb-2 text-[11px]">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Terminal className="w-3.5 h-3.5" /> Engine Telemetry Stream
                    </span>
                    <span className="text-emerald-400">SYNC OK</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">&gt; Substrate:</span>
                      <span className="text-white font-semibold">Transcend Core (DGX / MinIO / PostgreSQL)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">&gt; Domain Graph:</span>
                      <span>
                        <span className="text-zinc-400">4-Tier Ontology (</span>
                        <span className="text-cyan-400 font-medium">Nano</span>
                        <span className="text-zinc-500">/</span>
                        <span className="text-indigo-400 font-medium">Micro</span>
                        <span className="text-zinc-500">/</span>
                        <span className="text-fuchsia-400 font-medium">Meso</span>
                        <span className="text-zinc-500">/</span>
                        <span className="text-emerald-400 font-medium">Macro</span>
                        <span className="text-zinc-400">)</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">&gt; Ingest Rate:</span>
                      <span className="text-cyan-400">41 seconds / shift</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM PLATFORM FOOTNOTE */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400 relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Decision-Grade Sports Intelligence · Enterprise Security</span>
          </div>
          <div className="text-zinc-500">
            Powered by Transcendental Sports AI LLC
          </div>
        </div>
      </div>
    </div>
  );
}
