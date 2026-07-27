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
import { landingPageCopy } from "@/data/landingPageCopy";

function DynamicRinkLoopCanvas({ 
  activeStallId, 
  mode, 
  isPlaying 
}: { 
  activeStallId: string; 
  mode: "pre" | "post"; 
  isPlaying: boolean 
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      t += isPlaying ? 0.025 : 0.008;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background rink ice grid
      ctx.fillStyle = "#080c14";
      ctx.fillRect(0, 0, w, h);

      // Grid mesh pattern
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Rink outline
      ctx.strokeStyle = activeStallId === "coach" 
        ? "rgba(245, 158, 11, 0.25)" 
        : activeStallId === "scout" 
        ? "rgba(16, 185, 129, 0.25)" 
        : activeStallId === "trainer" 
        ? "rgba(99, 102, 241, 0.25)" 
        : "rgba(0, 240, 255, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(w * 0.06, h * 0.08, w * 0.88, h * 0.84, [24]);
      } else {
        ctx.rect(w * 0.06, h * 0.08, w * 0.88, h * 0.84);
      }
      ctx.stroke();

      // Blue lines & Red line
      ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
      ctx.beginPath();
      ctx.moveTo(w / 2, h * 0.08);
      ctx.lineTo(w / 2, h * 0.92);
      ctx.stroke();

      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.beginPath();
      ctx.moveTo(w * 0.32, h * 0.08);
      ctx.lineTo(w * 0.32, h * 0.92);
      ctx.moveTo(w * 0.68, h * 0.08);
      ctx.lineTo(w * 0.68, h * 0.92);
      ctx.stroke();

      // Persona Specific Rendering Modes
      if (activeStallId === "scout") {
        // Scout Heatmap Zones
        ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
        ctx.beginPath();
        ctx.arc(w * 0.72, h * 0.5, 60, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
        ctx.beginPath();
        ctx.arc(w * 0.68, h * 0.5, 35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Skater position calculation
      const speedMult = mode === "pre" ? 1.0 : 1.4;
      const pathX = w * 0.5 + Math.sin(t * 1.5 * speedMult) * (w * 0.32);
      const pathY = h * 0.5 + Math.cos(t * 2.2 * speedMult) * (h * 0.28);

      // Motion Trail
      ctx.beginPath();
      for (let i = 0; i < 30; i++) {
        const tx = w * 0.5 + Math.sin((t - i * 0.03) * 1.5 * speedMult) * (w * 0.32);
        const ty = h * 0.5 + Math.cos((t - i * 0.03) * 2.2 * speedMult) * (h * 0.28);
        if (i === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.strokeStyle = activeStallId === "coach" 
        ? "rgba(245, 158, 11, 0.8)" 
        : activeStallId === "scout" 
        ? "rgba(16, 185, 129, 0.8)" 
        : activeStallId === "trainer" 
        ? "rgba(99, 102, 241, 0.8)" 
        : "rgba(0, 240, 255, 0.8)";
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Coach 4-Panel Cut Room Bounding Box or Skater Box
      ctx.strokeStyle = activeStallId === "coach" ? "#F59E0B" : activeStallId === "scout" ? "#10B981" : activeStallId === "trainer" ? "#6366F1" : "#00F0FF";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pathX - 22, pathY - 22, 44, 44);

      // Node dot
      ctx.fillStyle = activeStallId === "coach" ? "#F59E0B" : activeStallId === "scout" ? "#10B981" : activeStallId === "trainer" ? "#6366F1" : "#00F0FF";
      ctx.beginPath();
      ctx.arc(pathX, pathY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Puck Position
      const puckX = pathX + Math.sin(t * 3.5) * 38;
      const puckY = pathY + Math.cos(t * 3.5) * 22;
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.arc(puckX, puckY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Vector line
      ctx.strokeStyle = "#6366F1";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pathX, pathY);
      ctx.lineTo(puckX, puckY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Telemetry HUD text overlays on Canvas
      ctx.font = "11px monospace";
      ctx.fillStyle = activeStallId === "coach" ? "#F59E0B" : activeStallId === "scout" ? "#10B981" : activeStallId === "trainer" ? "#6366F1" : "#00F0FF";
      
      const hudLabel = activeStallId === "coach" 
        ? `BENCHMARK MATCHUP [SPLIT-SCREEN]`
        : activeStallId === "scout"
        ? `HIGH-DANGER ZONE RESIDENCE [68%]`
        : activeStallId === "trainer"
        ? `KINETIC POSTURE ARC [TWIN #3D]`
        : `SKATER #19 [SPEED: ${(22.4 + Math.sin(t * 2) * 3.8).toFixed(1)} MPH]`;

      ctx.fillText(hudLabel, pathX + 28, pathY - 10);
      ctx.fillStyle = "#A1A1AA";
      ctx.fillText(`MODE: ${mode.toUpperCase()} · ${activeStallId.toUpperCase()}`, pathX + 28, pathY + 6);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [activeStallId, mode, isPlaying]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />;
}

const PERSONA_MODE_MAP = {
  athlete: {
    pre: {
      hudCode: "TSAI :: INTENT-BRIEF-019",
      tag: "Target: Inside Edge Posture",
      tagHue: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      headerTitle: "Pre-Skate Intent Briefing",
      skaterInfo: "Skater #19 | Target Goal: First 3 Steps Burst",
      timer: "00:00 / 00:15",
      journalTitle: "Periodical Athlete Mobile Journal",
      journalType: "PRE-SKATE INTENT",
      journalText: '"Pre-Game Brief: Drive hard through the neutral zone, lock inside edge posture, and track puck retrieval speed."',
    },
    post: {
      hudCode: "TSAI :: MASCE-VPR-002",
      tag: "Tag: rExplode · Shift #4",
      tagHue: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      headerTitle: "Post-Skate Micro-Loop Debrief",
      skaterInfo: "Skater #19 | First 3 Steps Acceleration",
      timer: "00:14.2 / 00:15.0",
      journalTitle: "Periodical Athlete Mobile Journal",
      journalType: "POST-SKATE REFLECTION",
      journalText: '"Post-Game Reflection: Executed 3 high-danger corner retrievals as briefed in Coach Workbench clip #4. Self-Score: 9/10."',
    }
  },
  coach: {
    pre: {
      hudCode: "ENCORE :: WHITEBOARD-PLAN-404",
      tag: "Tactical Cue: Neutral Zone Trap",
      tagHue: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      headerTitle: "Pre-Game Coach Whiteboard & Drill Intent",
      skaterInfo: "Coach Workbench | Pre-Game Neutral Zone Blueprint",
      timer: "00:00 / 00:45",
      journalTitle: "Encore Workbench Broadcast Engine",
      journalType: "COACHING CUE BROADCAST",
      journalText: '"Bench Briefing: Target F1 pressure on left-wing lock; force turnover inside blue line before 2nd pass."',
    },
    post: {
      hudCode: "ENCORE :: CUT-ROOM-SCRUB-104",
      tag: "Workbench: 4-Panel Split View",
      tagHue: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      headerTitle: "Post-Game Cut Room Workbench Scrub",
      skaterInfo: "Natural Language Scrub: 'Show all Shift #4 neutral zone retrievals'",
      timer: "01:28.0 / 02:00.0",
      journalTitle: "Encore Workbench Broadcast Engine",
      journalType: "ANNOTATED CLIP SENT TO ATHLETE",
      journalText: '"Cut Room Note to #19: Look at your hips at 00:04. Perfect entry angle. Bound directly to your weekly journal goal."',
    }
  },
  scout: {
    pre: {
      hudCode: "EDGEIQ :: THREAT-MAP-902",
      tag: "Zone Focus: High-Danger Slot",
      tagHue: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      headerTitle: "Pre-Game Threat Topology & Matchup Assessment",
      skaterInfo: "Scout Observatory | Slot Residence & Defensive Delta",
      timer: "00:00 / 01:00",
      journalTitle: "EdgeIQ Scouting Observatory",
      journalType: "SCOUTING BRIEFING",
      journalText: '"Pre-Game Opponent Brief: Opponent D-pair vacates left corner on puck retrieval. High-danger slot open for F2."',
    },
    post: {
      hudCode: "TEMPEST :: TELEMETRY-DWELL-880",
      tag: "Metrics: 24.2 MPH · 68% Poss",
      tagHue: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      headerTitle: "Post-Game Possession & Spatial Dwell Telemetry",
      skaterInfo: "Tempest Telemetry Console | 68% Offensive Zone Residence",
      timer: "00:54.0 / 01:00.0",
      journalTitle: "EdgeIQ Scouting Observatory",
      journalType: "SCOUT DOSSIER GENERATED",
      journalText: '"Post-Game Scout Report: #19 recorded top-speed burst of 24.2 MPH with +18% increase in high-danger pass completions."',
    }
  },
  trainer: {
    pre: {
      hudCode: "STRATUS :: SKILL-BLUEPRINT-303",
      tag: "Blueprint: 3-Step Burst Arc",
      tagHue: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      headerTitle: "Pre-Skate Micro-Skill Sequence & Target Twins",
      skaterInfo: "Stratus Lab | Holographic 3D Rink Twin Blueprint",
      timer: "00:00 / 00:30",
      journalTitle: "Stratus Development Lab",
      journalType: "SKILL SCIENCE PLAN",
      journalText: '"Skill Arc Prescribed: Week 6 focus on explosive 1st step knee drive and trunk rotation during turn accelerations."',
    },
    post: {
      hudCode: "STRATUS :: KINETIC-TWIN-3D",
      tag: "Twin Delta: +14% Acceleration",
      tagHue: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      headerTitle: "Post-Skate Kinetic Twin & Posture Progression",
      skaterInfo: "3D Posture Model | Season-Long Development Blueprint",
      timer: "00:28.5 / 00:30.0",
      journalTitle: "Stratus Development Lab",
      journalType: "DEVELOPMENT PROGRESSION",
      journalText: '"Lab Analysis: Skater #19 unlocked Tier-3 Acceleration Arc (+14% posture efficiency). Target achieved!"',
    }
  }
};

export function LockerRoomHub() {
  const copy = landingPageCopy.lockerRoom;
  const [activeStallId, setActiveStallId] = useState<"athlete" | "coach" | "scout" | "trainer">("athlete");
  const [mode, setMode] = useState<"pre" | "post">("pre");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const activeStall = copy.stalls.find((s) => s.id === activeStallId) || copy.stalls[0];
  const activeMedia = PERSONA_MODE_MAP[activeStallId][mode];

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
      case "indigo":
      default:
        return {
          border: "border-indigo-500/40 hover:border-indigo-400/60",
          activeBg: "bg-indigo-500/15",
          activeBorder: "border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]",
          text: "text-indigo-400",
          badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
          gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
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
        return <Zap className={className} />;
      default:
        return <User className={className} />;
    }
  };

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 border-t border-white/10 bg-zinc-950">
      {/* Background radial ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-zinc-950 to-zinc-950" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 mb-4 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Interactive Locker Room Hub</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight">
            One Loop. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-indigo-400">Four Perspectives.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-light">
            Select a stall to experience how Spotlight video intelligence binds directly into Periodical athlete journals.
          </p>
        </div>

        {/* 4 Stall Selector Tabs */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {copy.stalls.map((stall) => {
            const isActive = stall.id === activeStallId;
            const hue = getHueClasses(stall.hue);
            return (
              <button
                key={stall.id}
                onClick={() => setActiveStallId(stall.id as any)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer min-h-[72px] ${
                  isActive
                    ? `${hue.activeBg} ${hue.activeBorder} text-white`
                    : "bg-zinc-900/60 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={isActive ? hue.text : "text-zinc-400"}>
                    {renderIcon(stall.icon, "h-4 w-4")}
                  </div>
                  <span className="text-sm font-semibold">{stall.role}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">{stall.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Pre-Skate vs Post-Skate Toggle */}
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

          {/* Right Column: Dynamic Live Animated Video Micro-Loop Showcase (16:9 Responsive) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 sm:p-7 backdrop-blur-xl shadow-2xl">
              {/* Media Player Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    {activeMedia.headerTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>15s Cinematic Loop Live</span>
                </div>
              </div>

              {/* Video Player Display Screen (16:9 Aspect Ratio with Dynamic Live Canvas) */}
              <div className="mt-5 relative aspect-video w-full overflow-hidden rounded-xl border border-white/15 bg-zinc-950 shadow-inner group">
                
                {/* LIVE ANIMATED CANVAS LOOP */}
                <DynamicRinkLoopCanvas activeStallId={activeStallId} mode={mode} isPlaying={isPlaying} />

                {/* Simulated Tactical HUD Overlay */}
                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                    <span className="rounded-md bg-zinc-900/90 border border-white/10 px-2.5 py-1 text-[11px] font-mono text-cyan-300 backdrop-blur-md">
                      {activeMedia.hudCode}
                    </span>
                    <span className={`rounded-md px-2.5 py-1 text-[11px] font-semibold border backdrop-blur-md ${activeMedia.tagHue}`}>
                      {activeMedia.tag}
                    </span>
                  </div>

                  {/* Center Interactive Play / Pause Toggle Button */}
                  <div className="flex flex-col items-center justify-center pointer-events-auto">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="group/btn flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/90 text-zinc-950 shadow-2xl shadow-cyan-500/40 transition-all hover:scale-110 hover:bg-cyan-400 active:scale-95 cursor-pointer min-h-[48px] min-w-[48px]"
                      aria-label={isPlaying ? "Pause Live Micro-Loop" : "Play Live Micro-Loop"}
                    >
                      <Play className={`h-7 w-7 fill-current ml-1 transition-transform ${isPlaying ? "scale-90 opacity-80" : ""}`} />
                    </button>
                    <span className="mt-3 text-xs font-semibold text-zinc-300 bg-zinc-900/90 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                      {isPlaying ? "⚡ Live Telemetry Simulation Loop Active" : "Paused — Tap to Resume Loop"}
                    </span>
                  </div>

                  {/* Lower Overlay Data Bar */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono bg-zinc-950/90 p-2.5 rounded-lg border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{activeMedia.skaterInfo}</span>
                    </div>
                    <span>{activeMedia.timer}</span>
                  </div>
                </div>
              </div>

              {/* Periodical Daily Reflection Bridge Preview */}
              <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-cyan-400" />
                    <h4 className="text-xs sm:text-sm font-semibold text-white">{activeMedia.journalTitle}</h4>
                  </div>
                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {activeMedia.journalType}
                  </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-zinc-300 italic">
                  {activeMedia.journalText}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs font-medium text-cyan-400">
                  <span>Synced directly across TSAI ecosystem</span>
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
