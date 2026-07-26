"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export function LandingHeader() {
  const [user, setUser] = useState<any>(null);

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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Official Brand Emblem Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img
              src="/logos/tsai-emblem-full.png"
              alt="Transcendental Sports AI Emblem"
              className="h-9 w-9 object-contain rounded-full bg-zinc-900/80 p-0.5 border border-white/10 shadow-lg shadow-cyan-500/10 shrink-0"
            />
            <span className="font-serif text-base sm:text-lg font-semibold tracking-wider truncate">
              <span className="text-white">Transcendental Sports</span> <span className="text-cyan-400">AI</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-400 lg:flex">
          <Link href="/coachs-corner" className="transition-colors hover:text-white">
            Coach's Corner
          </Link>
          <Link href="/players-development" className="transition-colors hover:text-white">
            Player's Development
          </Link>
          <Link href="/spotlight-and-periodical" className="transition-colors hover:text-white">
            Spotlight & Periodical
          </Link>
          <Link href="/technology-solutions" className="transition-colors hover:text-white">
            Tech Solutions
          </Link>
          <span className="text-zinc-700 select-none font-light">|</span>
          <Link href="/pricing" className="transition-colors hover:text-white">
            Pricing
          </Link>
          {user && (
            <Link href="/docs" className="text-cyan-400 font-semibold transition-colors hover:text-cyan-300">
              Docs
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-xs text-zinc-400 max-w-[120px] truncate">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-md border border-white/10 bg-zinc-900/50 px-3 sm:px-4 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:border-white/20 hover:text-white cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              disabled
              className="hidden sm:inline-block rounded-md border border-white/10 bg-zinc-900/30 px-3 sm:px-4 py-1.5 text-xs font-semibold text-zinc-500 cursor-not-allowed opacity-50"
              title="Sign In disabled"
            >
              Sign In
            </button>
          )}
          <button
            disabled
            className="hidden sm:inline-block rounded-md border border-white/10 bg-zinc-900/30 px-3 sm:px-4 py-1.5 text-xs font-semibold text-zinc-500 cursor-not-allowed opacity-50"
            title="Beta Program disabled"
          >
            Beta Program
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-zinc-950/95 backdrop-blur-xl px-6 py-6 space-y-4">
          <nav className="flex flex-col gap-4 text-base font-medium text-zinc-300">
            <Link 
              href="/coachs-corner" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors py-1 border-b border-white/5"
            >
              Coach's Corner
            </Link>
            <Link 
              href="/players-development" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors py-1 border-b border-white/5"
            >
              Player's Development
            </Link>
            <Link 
              href="/spotlight-and-periodical" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors py-1 border-b border-white/5"
            >
              Spotlight &amp; Periodical
            </Link>
            <Link 
              href="/technology-solutions" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors py-1 border-b border-white/5"
            >
              Tech Solutions
            </Link>
            <Link 
              href="/pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white transition-colors py-1 border-b border-white/5"
            >
              Pricing
            </Link>
            {user && (
              <Link 
                href="/docs" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-cyan-400 font-semibold py-1"
              >
                Docs
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

