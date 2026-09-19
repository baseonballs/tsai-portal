"use client";

import React from "react";

import { ArrowRight } from "lucide-react";

interface LandingHeroProps {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
}

export function LandingHero({ hero }: LandingHeroProps) {
  return (
    <section className="relative z-10 border-b border-white/5 px-6 py-20 sm:py-28 md:py-36 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          {/* Spotlight Beta Program Badge */}
          <span className="mb-8 inline-flex items-center gap-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-1 text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            {hero.badge}
          </span>

          <h1 className="font-serif text-4xl leading-tight font-normal tracking-tight text-white sm:text-5xl md:text-6xl">
            Zero-hardware capture.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
              Clinical-grade analytics.
            </span>
          </h1>

          <p className="mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg">{hero.subtitle}</p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#beta-access"
              className="rounded-md bg-cyan-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-950/25 transition-all hover:bg-cyan-500 active:scale-98"
            >
              {hero.primaryCta}
            </a>
            <a
              href="#docs"
              className="flex items-center gap-2 rounded-md border border-white/5 bg-zinc-900/10 px-6 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-900/20 hover:text-white"
            >
              {hero.secondaryCta} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
