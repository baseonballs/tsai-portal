/**
 * Canonical 8 Superpowers dataset and color tokens.
 *
 * PALETTE ALIGNMENT:
 * - Explode: amber (amber-400, amber-500/10)
 * - OwnPuck: cyan (cyan-400, cyan-500/10)
 * - Threat: rose (rose-400, rose-500/10)
 * - QuickFeet: emerald (emerald-400, emerald-500/10)
 * - ReadPlay: teal (teal-400, teal-500/10)
 * - WinBattle: blue (blue-400, blue-500/10)
 * - WallMaster: sky (sky-400, sky-500/10)
 * - DotDominance: orange (orange-400, orange-500/10)
 */

export type SuperpowerId =
  | "Explode"
  | "OwnPuck"
  | "Threat"
  | "QuickFeet"
  | "ReadPlay"
  | "WinBattle"
  | "WallMaster"
  | "DotDominance";

export interface Superpower {
  id: SuperpowerId;
  name: string;
  hue: "amber" | "cyan" | "rose" | "emerald" | "teal" | "blue" | "sky" | "orange";
  border: string;
  bg: string;
  text: string;
  badgeBg: string;
  glow: string;
  cue: string;
  tag: string;
  desc: string;
}

export const SUPERPOWERS: Superpower[] = [
  {
    id: "Explode",
    name: "Explode",
    hue: "amber",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    badgeBg: "bg-amber-500/20",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.15)]",
    cue: '"First three steps. Explode and go."',
    tag: "rExplode",
    desc: "First-step acceleration, gap closing, and explosive breakout drive.",
  },
  {
    id: "OwnPuck",
    name: "Own the Puck",
    hue: "cyan",
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    badgeBg: "bg-cyan-500/20",
    glow: "shadow-[0_0_25px_rgba(6,182,212,0.15)]",
    cue: '"Hold it a beat. Make them come."',
    tag: "rOwnPuck",
    desc: "Puck protection on forehand hip, scanning before retrievals, composure.",
  },
  {
    id: "Threat",
    name: "Be a Threat",
    hue: "rose",
    border: "border-rose-500/40",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    badgeBg: "bg-rose-500/20",
    glow: "shadow-[0_0_25px_rgba(244,63,94,0.15)]",
    cue: '"Shoot first, look second."',
    tag: "rThreat",
    desc: "Shot-first mentality, net-front presence, aggressive slot reads.",
  },
  {
    id: "QuickFeet",
    name: "Quick Feet",
    hue: "emerald",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    badgeBg: "bg-emerald-500/20",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.15)]",
    cue: '"Light feet. Strong edges."',
    tag: "rQuickFeet",
    desc: "Agility, edge control, dynamic speed changes in tight spaces.",
  },
  {
    id: "ReadPlay",
    name: "Read the Play",
    hue: "teal",
    border: "border-teal-500/40",
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    badgeBg: "bg-teal-500/20",
    glow: "shadow-[0_0_25px_rgba(20,184,166,0.15)]",
    cue: '"See two passes ahead."',
    tag: "rReadPlay",
    desc: "Spatial vision, ice scanning, dynamic lane mapping, high-IQ positioning.",
  },
  {
    id: "WinBattle",
    name: "Win the Battle",
    hue: "blue",
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    badgeBg: "bg-blue-500/20",
    glow: "shadow-[0_0_25px_rgba(59,130,246,0.15)]",
    cue: '"Low leverage. Heavy stick."',
    tag: "rWinBattle",
    desc: "Corner grinding, 1v1 battle win rates, net-front leverage, puck recovery.",
  },
  {
    id: "WallMaster",
    name: "Hard Along Walls",
    hue: "sky",
    border: "border-sky-500/40",
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    badgeBg: "bg-sky-500/20",
    glow: "shadow-[0_0_25px_rgba(14,165,233,0.15)]",
    cue: '"Clean wall chips. Seal boards."',
    tag: "rWallMaster",
    desc: "Board battles, wall pins, rim retrievals, chips past pressing defenders.",
  },
  {
    id: "DotDominance",
    name: "Dot Dominance",
    hue: "orange",
    border: "border-orange-500/40",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    badgeBg: "bg-orange-500/20",
    glow: "shadow-[0_0_25px_rgba(249,115,22,0.15)]",
    cue: '"Own the dot. Set the tempo."',
    tag: "rDotDominance",
    desc: "Face-off win technique, quick-stick reaction, tie-up leverage, situational wins.",
  },
];
