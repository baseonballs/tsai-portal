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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/40 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-lg shadow-cyan-500/10">
            <span className="font-mono text-sm font-extrabold text-zinc-950">T</span>
          </div>
          <Link href="/" className="font-serif text-lg font-semibold tracking-wider hover:opacity-90 transition-opacity">
            <span className="text-white">Transcendental Sports</span> <span className="text-cyan-400">AI</span>
          </Link>
        </div>

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

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-xs text-zinc-400 max-w-[120px] truncate">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-md border border-white/10 bg-zinc-900/50 px-4 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:border-white/20 hover:text-white cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              disabled
              className="rounded-md border border-white/10 bg-zinc-900/30 px-4 py-1.5 text-xs font-semibold text-zinc-500 cursor-not-allowed opacity-50"
              title="Sign In disabled"
            >
              Sign In
            </button>
          )}
          <button
            disabled
            className="rounded-md border border-white/10 bg-zinc-900/30 px-4 py-1.5 text-xs font-semibold text-zinc-500 cursor-not-allowed opacity-50"
            title="Beta Program disabled"
          >
            Beta Program
          </button>
        </div>
      </div>
    </header>
  );
}

