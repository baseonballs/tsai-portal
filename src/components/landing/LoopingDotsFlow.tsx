"use client";

import React, { useState, useEffect } from "react";
import { Search, Scissors, Send, BookmarkCheck, MessageSquareQuote, TrendingUp, RefreshCw } from "lucide-react";

interface Stage {
  num: string;
  name: string;
  sub: string;
  color: string;
  glow: string;
  border: string;
  text: string;
  dotColor: string;
  icon: any;
}

const stages: Stage[] = [
  {
    num: "01",
    name: "Spot it",
    sub: "AI Ingest",
    color: "from-cyan-500/20 via-cyan-500/10 to-transparent",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
    border: "border-cyan-500/40",
    text: "text-cyan-400",
    dotColor: "bg-cyan-400",
    icon: Search,
  },
  {
    num: "02",
    name: "Cut it",
    sub: "Coach Cut",
    color: "from-indigo-500/20 via-indigo-500/10 to-transparent",
    glow: "shadow-[0_0_20px_rgba(99,102,241,0.3)]",
    border: "border-indigo-500/40",
    text: "text-indigo-400",
    dotColor: "bg-indigo-400",
    icon: Scissors,
  },
  {
    num: "03",
    name: "Send it",
    sub: "Dispatch",
    color: "from-purple-500/20 via-purple-500/10 to-transparent",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    border: "border-purple-500/40",
    text: "text-purple-400",
    dotColor: "bg-purple-400",
    icon: Send,
  },
  {
    num: "04",
    name: "The Drop",
    sub: "Mobile Drop",
    color: "from-fuchsia-500/20 via-fuchsia-500/10 to-transparent",
    glow: "shadow-[0_0_20px_rgba(217,70,239,0.3)]",
    border: "border-fuchsia-500/40",
    text: "text-fuchsia-400",
    dotColor: "bg-fuchsia-400",
    icon: BookmarkCheck,
  },
  {
    num: "05",
    name: "Read-back",
    sub: "Voice Read",
    color: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    dotColor: "bg-emerald-400",
    icon: MessageSquareQuote,
  },
  {
    num: "06",
    name: "The Rip",
    sub: "Level Up",
    color: "from-amber-500/20 via-amber-500/10 to-transparent",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    border: "border-amber-500/40",
    text: "text-amber-400",
    dotColor: "bg-amber-400",
    icon: TrendingUp,
  },
];

export function LoopingDotsFlow() {
  const [activeDot, setActiveDot] = useState(0);

  // Smooth continuous looping through the 6 stages
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % stages.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto my-6 px-4 py-8 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
      {/* BACKGROUND CONTINUOUS GLOW BEAM */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-purple-950/20 to-amber-950/30 pointer-events-none" />

      {/* CONTINUOUS LOOPING TRACK HEADER */}
      <div className="flex items-center justify-between gap-4 mb-10 px-4 font-mono text-xs border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-2 text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold tracking-wider text-white">SPOTLIGHT</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-sans">
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="tracking-wide">Continuous Closed-Loop Cycle</span>
        </div>

        <div className="flex items-center gap-2 text-fuchsia-400">
          <span className="font-bold tracking-wider text-white">PERIODICAL</span>
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
        </div>
      </div>

      {/* STAGE DOTS & FLOW TRACK */}
      <div className="relative z-10 px-2 py-4">
        {/* CONNECTING TRACK LINE */}
        <div className="absolute top-[28px] left-8 right-8 h-[2px] bg-white/10 z-0 pointer-events-none" />
        
        {/* TRAVELING PULSE LINE */}
        <div
          className="absolute top-[28px] h-[2px] bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 transition-all duration-700 z-0 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
          style={{
            left: `${(activeDot / (stages.length - 1)) * 80 + 5}%`,
            width: "15%",
          }}
        />

        {/* 6 STAGE NODES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-2 relative z-10">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            const isActive = activeDot === idx;

            return (
              <div
                key={idx}
                onClick={() => setActiveDot(idx)}
                className="flex flex-col items-center cursor-pointer group"
              >
                {/* LOOPING DOT NODE */}
                <div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center border backdrop-blur-xl transition-all duration-500 mb-3 ${
                    isActive
                      ? `bg-zinc-900 ${stg.border} ${stg.glow} scale-115 text-white ring-2 ring-white/30`
                      : "bg-black/60 border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-300"
                  }`}
                >
                  {/* PULSE RINGS ON ACTIVE */}
                  {isActive && (
                    <>
                      <span className={`absolute inset-0 rounded-full ${stg.dotColor} opacity-25 animate-ping`} />
                      <span className={`absolute -inset-1 rounded-full border ${stg.border} opacity-50 animate-pulse`} />
                    </>
                  )}

                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? stg.text : "text-zinc-400"}`} />
                </div>

                {/* STAGE NUMBER & NAME */}
                <div className="text-center">
                  <div className={`text-[10px] font-mono font-bold tracking-widest ${isActive ? stg.text : "text-zinc-500"}`}>
                    {stg.num}
                  </div>
                  <div className={`text-xs font-serif font-bold transition-colors ${isActive ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
                    {stg.name}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 tracking-tight mt-0.5">
                    {stg.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
