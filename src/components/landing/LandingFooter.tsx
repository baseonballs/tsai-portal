"use client";

import React from "react";

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-zinc-950/60 py-12 text-center text-xs text-zinc-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
        <div className="flex items-center gap-2.5">
          <img src="/logos/tsai-emblem-full.png" alt="TSAI Logo" className="h-5 w-5 object-contain" />
          <p>© 2026 Transcendental Sports AI LLC. All rights reserved.</p>
        </div>
        <div className="flex gap-6">
          <a href="/legal/privacy" className="transition-colors hover:text-white">
            Privacy
          </a>
          <a href="/legal/terms" className="transition-colors hover:text-white">
            Terms of Service
          </a>
          <span className="text-zinc-700">|</span>
          <span className="font-mono">v0.1.72.beta</span>
        </div>
      </div>
    </footer>
  );
}
