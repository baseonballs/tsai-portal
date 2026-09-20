import React, { useState } from 'react';
import {
  ClubStripeConnectProfile,
  DEFAULT_CLUB_STRIPE_PROFILE,
  KycStatus,
} from '../../types/club-stripe-connect-types';

export const ClubStripeConnectOnboarding: React.FC = () => {
  const [profile, setProfile] = useState<ClubStripeConnectProfile>(DEFAULT_CLUB_STRIPE_PROFILE);
  const [isConnectingStripe, setIsConnectingStripe] = useState<boolean>(false);

  // Revenue projection calculation
  const grossMonthlyUsd = profile.estimatedEnrolledFamilies * profile.monthlyPerFamilyFeeUsd;
  const clubMonthlyShareUsd = grossMonthlyUsd * profile.revenueShareRatio;
  const annualClubPayoutUsd = clubMonthlyShareUsd * 12.0;

  const triggerStripeOnboarding = () => {
    setIsConnectingStripe(true);
    setTimeout(() => {
      setIsConnectingStripe(false);
      setProfile((prev) => ({
        ...prev,
        kycStatus: 'VERIFIED',
        stripeConnectAccountId: 'acct_1TSAI_PLYMOUTH_01',
      }));
    }, 800);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 font-sans shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Club Stripe Connect 50/50 Revenue Share Onboarding
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Turnkey Direct ACH Payouts for Youth Associations & Arena Operators (Horizon D)
          </p>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 rounded-lg">
          REV SHARE: 50% DIRECT CLUB PAYOUT
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left: Organization & KYC Status Card */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Club Legal Entity
            </h3>
            <div>
              <p className="text-sm font-bold text-white">{profile.clubName}</p>
              <p className="text-xs text-slate-400 mt-0.5">Tax ID / EIN: {profile.einOrTaxId}</p>
              <p className="text-xs text-slate-400">Entity: 501(c)(3) Amateur Athletic Association</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Stripe KYC:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  profile.kycStatus === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {profile.kycStatus}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Payout Schedule:</span>
              <span className="font-semibold text-white">{profile.payoutFrequency}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={triggerStripeOnboarding}
            disabled={isConnectingStripe}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
          >
            {isConnectingStripe
              ? 'LAUNCHING STRIPE EXPRESS...'
              : profile.kycStatus === 'VERIFIED'
              ? 'UPDATE BANK ACCOUNT'
              : 'CONNECT BANK ACCOUNT'}
          </button>
        </div>

        {/* Center & Right: 50/50 Revenue Calculator */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">50/50 Revenue Split Projection</h4>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                $15.00/mo Family Plan ($7.50 Club / $7.50 Transcend)
              </span>
            </div>

            {/* Slider / Enrolled Families */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Participating Association Families:</span>
                <span className="font-bold text-white font-mono">
                  {profile.estimatedEnrolledFamilies} Athletes
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1200"
                step="25"
                value={profile.estimatedEnrolledFamilies}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    estimatedEnrolledFamilies: parseInt(e.target.value, 10),
                  })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Financial Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="bg-slate-900/80 p-3.5 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  Gross Platform Volume
                </span>
                <p className="text-lg font-mono font-bold text-slate-200 mt-1">
                  ${grossMonthlyUsd.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded border border-emerald-800/40">
                <span className="text-[10px] uppercase font-semibold text-emerald-400">
                  Direct Club Payout (50%)
                </span>
                <p className="text-xl font-mono font-bold text-emerald-400 mt-1">
                  ${clubMonthlyShareUsd.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded border border-cyan-800/40">
                <span className="text-[10px] uppercase font-semibold text-cyan-400">
                  Annual Club Endowment
                </span>
                <p className="text-xl font-mono font-bold text-cyan-400 mt-1">
                  ${annualClubPayoutUsd.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">/yr</span>
                </p>
              </div>
            </div>

            {/* Invariant & Terms Banner */}
            <div className="mt-5 p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Automated Stripe ACH Transfer on the 1st of every month</span>
              <span className="font-mono text-slate-300">0% Club Infrastructure Overhead</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
