"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  ChevronDown, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Cpu, 
  Layers, 
  ArrowRight,
  Menu,
  X
} from "lucide-react";

export function LandingHeader() {
  const [user, setUser] = useState<any>(null);
  const [devHubOpen, setDevHubOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const devHubRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (devHubRef.current && !devHubRef.current.contains(event.target as Node)) {
        setDevHubOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Emblem Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img
              src="/logos/tsai-emblem-full.png"
              alt="Transcendental Sports AI Emblem"
              className="h-9 w-9 object-contain rounded-full bg-zinc-900/90 p-0.5 border border-cyan-500/30 shadow-[0_0_16px_rgba(0,240,255,0.25)] shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white leading-none whitespace-nowrap">
                  Transcend
                </span>
                <span className="text-cyan-400 font-sans font-semibold text-[10px] uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/25 px-1.5 py-0.5 rounded-full shadow-sm">
                  Beta
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 tracking-wider font-sans hidden sm:inline-block mt-0.5">
                Sports Intelligence Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Structured Grouped Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-zinc-300">
          
          {/* GROUP 1: Player & Coach Dropdown (Coach's Corner, The Locker Room, Player's Development) */}
          <div className="relative" ref={devHubRef}>
            <button
              onClick={() => setDevHubOpen(!devHubOpen)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                devHubOpen
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
              aria-expanded={devHubOpen}
            >
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>Player & Coach</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${devHubOpen ? "rotate-180 text-cyan-400" : "text-zinc-500"}`} />
            </button>

            {/* Dropdown Menu Panel */}
            {devHubOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 px-3 py-1 font-semibold">
                  Player & Coach Destinations
                </div>

                <div className="mt-1 space-y-1">
                  {/* Coach's Corner Link */}
                  <Link
                    href="/coachs-corner"
                    onClick={() => setDevHubOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-amber-500/10 hover:border-amber-500/20 border border-transparent group"
                  >
                    <div className="rounded-lg p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1">
                        Coach&apos;s Corner
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">Workbench</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">
                        The media-forward coaching studio & video curation workbench.
                      </p>
                    </div>
                  </Link>

                  {/* The Locker Room Link */}
                  <Link
                    href="/locker-room"
                    onClick={() => setDevHubOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-cyan-500/10 hover:border-cyan-500/20 border border-transparent group"
                  >
                    <div className="rounded-lg p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center gap-1">
                        The Locker Room
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono">Sanctuary</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">
                        Where pre-skate intent meets post-skate video intelligence.
                      </p>
                    </div>
                  </Link>

                  {/* Player's Development Link */}
                  <Link
                    href="/players-development"
                    onClick={() => setDevHubOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-indigo-500/10 hover:border-indigo-500/20 border border-transparent group"
                  >
                    <div className="rounded-lg p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 flex items-center gap-1">
                        Player&apos;s Development
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">Growth</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">
                        Personalized micro-loops & daily reflection journals.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* GROUP 2: Spotlight & Periodical (Product Ecosystem) */}
          <Link
            href="/spotlight-and-periodical"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all hover:bg-white/5 hover:text-white border border-transparent text-zinc-300"
          >
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Spotlight & Periodical</span>
          </Link>

          {/* GROUP 3: The Platform */}
          <Link
            href="/technology-solutions"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all hover:bg-white/5 hover:text-white border border-transparent text-zinc-300"
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>The Platform</span>
          </Link>

          <span className="text-zinc-800 select-none px-1">|</span>

          {/* GROUP 4: Pricing */}
          <Link
            href="/pricing"
            className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all hover:bg-white/5 hover:text-white text-zinc-300"
          >
            Pricing
          </Link>

          {user && (
            <Link
              href="/docs"
              className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all"
            >
              Docs
            </Link>
          )}
        </nav>

        {/* User Account & Action Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-zinc-400 max-w-[120px] truncate font-mono">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-full border border-white/10 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:border-white/20 hover:text-white cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center rounded-full border border-white/10 bg-zinc-900/60 px-4 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:border-white/20 hover:text-white active:scale-95"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/beta"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 shadow-md shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Beta Access</span>
          </Link>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Structured Groupings) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-zinc-950/98 backdrop-blur-2xl px-6 py-6 space-y-6">
          
          {/* Section 1: Player & Coach */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-3">
              Player & Coach Destinations
            </div>
            <div className="flex flex-col gap-2">
              <Link 
                href="/coachs-corner" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-sm font-semibold text-amber-300"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <div className="flex flex-col">
                  <span>Coach&apos;s Corner</span>
                  <span className="text-[11px] text-zinc-400 font-normal">The Coach Workbench & Studio</span>
                </div>
              </Link>

              <Link 
                href="/locker-room" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-sm font-semibold text-cyan-300"
              >
                <Users className="h-4 w-4 shrink-0" />
                <div className="flex flex-col">
                  <span>The Locker Room</span>
                  <span className="text-[11px] text-zinc-400 font-normal">Sanctuary of Intentionality</span>
                </div>
              </Link>

              <Link 
                href="/players-development" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3 text-sm font-semibold text-indigo-300"
              >
                <TrendingUp className="h-4 w-4 shrink-0" />
                <div className="flex flex-col">
                  <span>Player&apos;s Development</span>
                  <span className="text-[11px] text-zinc-400 font-normal">Personalized Micro-Loops & Growth</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Section 2: Platform & Products */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
              Products & Architecture
            </div>
            <nav className="flex flex-col gap-2 text-sm font-medium text-zinc-300">
              <Link 
                href="/spotlight-and-periodical" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-2 border-b border-white/5 flex items-center justify-between"
              >
                <span>Spotlight &amp; Periodical</span>
                <ChevronDown className="-rotate-90 h-4 w-4 text-zinc-500" />
              </Link>
              <Link 
                href="/technology-solutions" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-2 border-b border-white/5 flex items-center justify-between"
              >
                <span>The Platform</span>
                <ChevronDown className="-rotate-90 h-4 w-4 text-zinc-500" />
              </Link>
              <Link 
                href="/pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-2 border-b border-white/5 flex items-center justify-between"
              >
                <span>Pricing</span>
                <ChevronDown className="-rotate-90 h-4 w-4 text-zinc-500" />
              </Link>
              {user && (
                <Link 
                  href="/docs" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-cyan-400 font-semibold py-2"
                >
                  Docs
                </Link>
              )}
            </nav>
          </div>

          {/* Section 3: Action Button */}
          <div className="pt-2">
            <Link
              href="/beta"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Apply for Beta Access</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
