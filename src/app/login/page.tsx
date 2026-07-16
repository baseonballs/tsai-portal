"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { googleOAuthQueryParams } from "@/utils/auth/google-oauth";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const urlError = searchParams?.get("error");
  const oauthCallbackFailed = urlError === "auth-callback-failed";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const supabase = createClient();

    try {
      if (origin.startsWith("http://") && !origin.includes("localhost")) {
        setErrorMsg(
          "Open the app at localhost for Google sign-in — OAuth redirect hosts must be localhost (or https). A LAN IP will not work.",
        );
        setIsLoading(false);
        return;
      }

      let settingsReachable = false;
      let googleEnabled = false;
      try {
        const settingsRes = await fetch(`${origin}/supabase/auth/v1/settings`);
        if (settingsRes.ok) {
          settingsReachable = true;
          const settings = await settingsRes.json();
          googleEnabled = Boolean(settings.external?.google);
        }
      } catch {
        // handled below
      }

      if (!settingsReachable) {
        setErrorMsg("The sign-in service is not reachable right now. Try again in a moment.");
        setIsLoading(false);
        return;
      }
      if (!googleEnabled) {
        setErrorMsg("Google sign-in is not enabled on the auth server.");
        setIsLoading(false);
        return;
      }

      const nextAfterAuth = searchParams?.get("next") ?? "/";

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextAfterAuth)}`,
          queryParams: googleOAuthQueryParams(origin),
          skipBrowserRedirect: true,
        }
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setErrorMsg("OAuth did not return a redirect URL.");
      setIsLoading(false);
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred during Google sign-in");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/50 p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-lg shadow-cyan-500/20">
            <span className="font-mono text-xl font-extrabold text-zinc-950">T</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Sign in to access your Transcendental Sports AI account
          </p>
        </div>

        {(errorMsg || oauthCallbackFailed) && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
            {oauthCallbackFailed ? "Google sign-in could not complete. Please try again." : errorMsg}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          {isLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="relative my-6 flex items-center">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="mx-4 shrink text-xs font-semibold uppercase tracking-wider text-zinc-500">
            or
          </span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@tsai.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-100 shadow-inner transition-all focus-within:border-cyan-500/70 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-100 shadow-inner transition-all focus-within:border-cyan-500/70 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4"><div className="text-zinc-500">Loading...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}
