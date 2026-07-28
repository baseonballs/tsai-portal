"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Target, 
  Sparkles, 
  BrainCircuit, 
  Activity, 
  Eye, 
  Film, 
  BookOpen, 
  Zap, 
  ShieldCheck,
  Crosshair,
  Lock
} from "lucide-react";

const BACKGROUNDS = [
  { 
    url: "/images/bg_youth_hockey_ai_hero_1.png", 
    animation: "gallery-ken-zoom-in",
    tag: "SPOTLIGHT AI INFERENCE",
    title: "Real-time Video Intelligence"
  },
  { 
    url: "/images/bg_youth_hockey_ai_hero_2.png", 
    animation: "gallery-ken-drift-up",
    tag: "PERIODICAL JOURNAL DROP",
    title: "Youth Athlete Reflection"
  },
];

export function YouthHockeyCinematicBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), 0);

    const slideDuration = 6000;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BACKGROUNDS.length);
    }, slideDuration);

    return () => {
      clearTimeout(mountTimer);
      clearInterval(interval);
    };
  }, []);

  // Particle & Telemetry Canvas Animation
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Create ice crystal particles
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI,
    }));

    // Scanning laser beam state
    let scanY = 0;
    let scanSpeed = 1.2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw horizontal HUD grid lines
      ctx.strokeStyle = "rgba(6, 182, 212, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Ice Crystal Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.03;

        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.2;
        ctx.fillStyle = `rgba(165, 243, 252, ${Math.max(0.1, Math.min(0.8, currentOpacity))})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(6, 182, 212, 0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // FLAG: Set to true to re-enable moving up & down laser sweep line animation
      const ENABLE_SCAN_LINE_ANIMATION = false;

      if (ENABLE_SCAN_LINE_ANIMATION) {
        scanY += scanSpeed;
        if (scanY > height || scanY < 0) scanSpeed = -scanSpeed;

        const grad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15);
        grad.addColorStop(0, "rgba(6, 182, 212, 0)");
        grad.addColorStop(0.5, "rgba(6, 182, 212, 0.25)");
        grad.addColorStop(1, "rgba(6, 182, 212, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 15, width, 30);

        ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="gallery-slideshow relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-white/10 bg-zinc-950 px-6 py-20 lg:px-8"
      data-framing="immersive"
    >
      {/* 1. CINEMATIC BACKGROUND SLIDESHOW LAYER */}
      {BACKGROUNDS.map((bg, index) => (
        <div
          key={bg.url}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-45" : "opacity-0"
          }`}
        >
          {index === activeIndex && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={bg.url}
              alt="Youth Hockey Video Intelligence & Reflection"
              className={`h-full w-full object-cover object-center ${bg.animation}`}
            />
          )}
        </div>
      ))}

      {/* 2. ATMOSPHERIC SHADING & VIGNETTE */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_10%,_#09090b_90%)]" />
      
      {/* Spotlight Overhead Cone Beam */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/20 via-indigo-500/10 to-transparent blur-3xl opacity-60 rounded-full" />

      {/* 3. DYNAMIC CANVAS PARTICLES & HUD SCANNER */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 opacity-70" />

      {/* Film Grain Texture Overlay */}
      <div className="gallery-slideshow-grain pointer-events-none absolute inset-0 opacity-25" />

      {/* 4. CEREBRAL VISION BADGE (OPTION A: TRANSCENDENTAL SPORTS AI) */}
      <div className="absolute top-3 sm:top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[95%] sm:max-w-none">
        <div className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/30 bg-black/85 px-3.5 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold tracking-wider text-zinc-200 backdrop-blur-xl shadow-xl shadow-cyan-500/10 hover:border-cyan-400/50 transition-all">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
          <span className="text-cyan-400 font-bold tracking-widest uppercase">Transcendental Sports AI</span>
          <span className="text-zinc-600 font-normal">·</span>
          <span className="text-zinc-300 font-medium tracking-wide uppercase">Spatial Telemetry × Athlete Intent</span>
        </div>
      </div>

      {/* 5. TACTICAL HUD RETICLES & CORNER BRACKETS */}
      <div className="pointer-events-none absolute left-3 right-3 sm:left-12 sm:right-12 top-14 sm:top-18 bottom-3 sm:bottom-10 border border-white/10 rounded-2xl sm:rounded-3xl z-10 flex flex-col justify-between p-2.5 sm:p-4">
        {/* Top Corners */}
        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-cyan-400/70 tracking-wider">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md px-2 sm:px-3 py-1 rounded border border-white/10">
            <Crosshair className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: "10s" }} />
            <span>AI RINK TRACKING • 60 FPS</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE TELEMETRY: YOUTH ICE HOCKEY LOOP</span>
          </div>
        </div>

        {/* Bottom Corners */}
        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-cyan-400">POS: [{Math.round(mousePos.x)}, {Math.round(mousePos.y)}]</span>
            <span className="hidden md:inline text-zinc-600">|</span>
            <span className="hidden md:inline">SUPERPOWER MATRIX v2.4</span>
          </div>
          <div className="text-right text-indigo-400 font-semibold truncate max-w-[120px] sm:max-w-none">
            {BACKGROUNDS[activeIndex].tag}
          </div>
        </div>
      </div>

      {/* 6. MAIN HERO CONTENT CONTAINER */}
      <div className="relative z-20 max-w-5xl mx-auto text-center pt-10 sm:pt-12 px-4">

        {/* MAIN HEADLINE WITH DUAL-THEME GLOW */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-white mb-4 sm:mb-6 leading-[1.15] sm:leading-[1.08] drop-shadow-2xl">
          Where{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-amber-400 font-medium">
            video intelligence
          </span>{" "}
          meets<br className="hidden sm:inline" />{" "}
          <span className="relative inline-block sm:mt-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-amber-300 font-medium">
              player reflection
            </span>
            <span className="text-white">.</span>
            {/* Underline reflection glow */}
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 rounded-full blur-xs opacity-80" />
          </span>
        </h1>

        {/* SUBTITLE */}
        <p className="text-base sm:text-xl md:text-2xl font-light text-zinc-300 max-w-3xl mx-auto leading-relaxed mt-6 sm:mt-8 mb-10 sm:mb-12 drop-shadow px-2">
          Unlocking sports intelligence to guide, measure, and accelerate youth athlete growth on the path to their full potential.
        </p>

        {/* HIGH-CONVERSION CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16">
          <Link 
            href="#beta-access"
            className="w-full sm:w-auto rounded-full border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 backdrop-blur-xl px-8 sm:px-9 py-4 text-xs sm:text-sm font-semibold text-cyan-300 hover:text-white hover:border-cyan-400/70 shadow-lg shadow-cyan-500/10 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Join the Team Beta Program</span>
          </Link>

          <a 
            href="#beta-access" 
            className="w-full sm:w-auto rounded-full border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-xl px-7 sm:px-8 py-4 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2"
          >
            <span>See The Loop In Action</span>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
          </a>
        </div>

        {/* QUICK STATS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left border-t border-white/15 pt-6 sm:pt-8 bg-black/40 p-4 sm:p-6 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="text-xl sm:text-3xl font-serif text-white font-bold flex items-center gap-1.5">
              <span>41s</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xs text-zinc-400 mt-1">Natural Language Discovery &amp; Semantic Searches</div>
          </div>
          <div>
            <div className="text-xl sm:text-3xl font-serif font-bold text-cyan-400 flex items-baseline gap-1.5">
              <span>8</span>
              <span className="text-base sm:text-lg text-cyan-300 font-sans font-semibold">Superpowers</span>
            </div>
            <div className="text-xs text-zinc-400 mt-1">Explode, Own Puck, Threat, Read the Play, Wall Master &amp; more</div>
          </div>
          <div>
            <div className="text-xl sm:text-3xl font-serif font-bold text-indigo-400">The Loop</div>
            <div className="text-xs text-zinc-400 mt-1">Cut Rooms × Journal Loops, Continuous Feedback</div>
          </div>
          <div>
            <div className="text-xl sm:text-3xl font-serif font-bold text-amber-400">5 Voices</div>
            <div className="text-xs text-zinc-400 mt-1">Player, Coach, Trainer, Parent &amp; Scout</div>
          </div>
        </div>

      </div>

      {/* Slideshow Progress Bar */}
      <div className="absolute bottom-0 left-0 z-20 h-[3px] w-full bg-white/10">
        <div key={activeIndex} className="gallery-slideshow-progress-bar h-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
      </div>
    </section>
  );
}
