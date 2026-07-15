"use client";

import React from "react";

import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/40 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-lg shadow-cyan-500/10">
            <span className="font-mono text-sm font-extrabold text-zinc-950">T</span>
          </div>
          <span className="font-serif text-lg font-semibold tracking-wider text-white">
            Transcendental Sports <span className="text-cyan-400">AI</span>
          </span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-400 md:flex">
          <a href="#ecosystem" className="transition-colors hover:text-white">
            Spotlight & Periodical
          </a>
          <a href="#pricing" className="transition-colors hover:text-white">
            Pricing
          </a>
          <a href="#docs" className="transition-colors hover:text-white">
            Docs
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/default"
            className="rounded-md border border-white/10 bg-zinc-900/50 px-4 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:border-white/20 hover:text-white"
          >
            Sign In
          </Link>
          <a
            href="#beta-access"
            className="rounded-md bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-950/20 transition-all hover:bg-cyan-500 active:scale-98"
          >
            Beta Program
          </a>
        </div>
      </div>
    </header>
  );
}
