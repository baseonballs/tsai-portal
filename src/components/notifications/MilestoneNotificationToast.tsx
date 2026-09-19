"use client";

//
//  MilestoneNotificationToast.tsx
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 (Docket P229, Claim 10)
//  Rule: Strictly Zero-Purple (zinc/slate/emerald/amber/rose/cyan only)
//  Rule: Component < 300 lines
//

import React, { useState, useEffect } from "react";
import {
  Play,
  X,
  Flame,
  ShieldCheck,
  Target,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  FamilyMilestoneItem,
  MilestoneNotificationToastProps,
} from "./family-milestone-types";

export const MilestoneNotificationToast: React.FC<MilestoneNotificationToastProps> = ({
  milestone,
  onInstantSeek,
  onDismiss,
  autoDismissMs = 8000,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismissMs <= 0) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.(milestone.id);
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, milestone.id, onDismiss]);

  if (!isVisible) return null;

  const handleSeek = () => {
    if (onInstantSeek) {
      onInstantSeek(milestone.seekOffsetSeconds, milestone.gameId);
    } else if (typeof window !== "undefined" && milestone.deepLinkUrl) {
      window.location.href = milestone.deepLinkUrl;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onDismiss?.(milestone.id);
  };

  // Determine category badge icon and styling
  const renderCategoryBadge = () => {
    switch (milestone.category) {
      case "goal":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
            <Flame className="h-3.5 w-3.5 text-emerald-400" /> GOAL
          </span>
        );
      case "assist":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-700/60">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> ASSIST
          </span>
        );
      case "high_danger_chance":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-700/60">
            <Target className="h-3.5 w-3.5 text-amber-400" /> CHANCE
          </span>
        );
      case "certified_rvh_save":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-blue-950/80 text-blue-400 border border-blue-700/60">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> RVH SAVE
          </span>
        );
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-200 text-zinc-100 ${className}`}
    >
      {/* Top row: Badges, Game Clock, and Close */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          {renderCategoryBadge()}
          <span className="font-mono text-xs font-medium text-zinc-400 flex items-center gap-1">
            <Clock className="h-3 w-3 text-zinc-500" /> {milestone.gameClock}
          </span>
        </div>

        <button
          onClick={handleClose}
          aria-label="Dismiss notification"
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Athlete and Event Info */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            <span className="font-mono text-emerald-400">#{milestone.jerseyNumber}</span>
            <span>{milestone.athleteName}</span>
          </h4>
          <p className="text-xs font-semibold text-zinc-200 mt-0.5">
            {milestone.headline}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
            {milestone.description}
          </p>
        </div>

        {/* Metric Chip (e.g. xG 0.42 or 82 mph) */}
        {milestone.metricValue && (
          <div className="shrink-0 text-right rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1">
            <div className="text-[10px] uppercase font-semibold text-zinc-400">
              {milestone.metricLabel ?? "Metric"}
            </div>
            <div className="font-mono text-xs font-bold text-cyan-400">
              {milestone.metricValue}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer: 1-Tap Replay */}
      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
        <span className="text-[11px] text-zinc-500 font-mono">
          DVR Seek: {milestone.seekOffsetSeconds}s
        </span>

        <button
          onClick={handleSeek}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition active:scale-95"
        >
          <Play className="h-3.5 w-3.5 fill-current" /> Instant Replay
        </button>
      </div>
    </div>
  );
};
