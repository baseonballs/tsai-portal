"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BetaSignupForm() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/30 p-8 shadow-2xl backdrop-blur-xl">
      {/* Background glow overlay */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs font-semibold text-amber-400">
          <Lock className="w-3.5 h-3.5" />
          <span>Access Requests Currently Inactive</span>
        </div>

        <h3 className="mb-2 font-serif text-2xl font-normal text-white">Apply for Beta Access</h3>
        <p className="mb-6 text-sm text-zinc-400">
          TSAI Portal is currently in private preview. Applications for workspace licensing seats are temporarily closed.
        </p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-500 uppercase">
              Contact Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Coach Anderson"
              disabled
              className="border-white/5 bg-zinc-950/20 text-zinc-500 cursor-not-allowed opacity-50 placeholder:text-zinc-600"
            />
          </div>

          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-500 uppercase">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="e.g. coach@lions-hockey.org"
              disabled
              className="border-white/5 bg-zinc-950/20 text-zinc-500 cursor-not-allowed opacity-50 placeholder:text-zinc-600"
            />
          </div>

          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-500 uppercase">
              Program / Organization
            </label>
            <Input
              type="text"
              placeholder="e.g. LA Lions 14U AAA"
              disabled
              className="border-white/5 bg-zinc-950/20 text-zinc-500 cursor-not-allowed opacity-50 placeholder:text-zinc-600"
            />
          </div>

          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-500 uppercase">
              Primary Role
            </label>
            <select
              disabled
              className="h-9 w-full rounded-md border border-white/5 bg-zinc-950/20 px-3 text-sm text-zinc-500 shadow-xs outline-none cursor-not-allowed opacity-50"
            >
              <option value="coach">Head Coach / Team Analyst</option>
              <option value="player">Elite Prospect / Skater</option>
              <option value="parent">Invested Parent</option>
              <option value="scout">Professional Scout / Recruiter</option>
            </select>
          </div>

          <Button
            type="button"
            disabled
            className="mt-6 w-full bg-zinc-800 border border-white/10 font-medium text-zinc-500 cursor-not-allowed opacity-60 hover:bg-zinc-800 shadow-none"
          >
            Request Workspace Access (Inactive)
          </Button>
        </form>
      </div>
    </div>
  );
}
