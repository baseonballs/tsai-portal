export interface AppTier {
  id: string;
  name: string;
  tagline: string;
  description: string;
  keyFeatures: string[];
}

export interface PricingPlan {
  name: string;
  price: string;
  billing: string;
  tagline: string;
  features: string[];
  ctaText: string;
  popular?: boolean;
}

export interface DocCategory {
  title: string;
  description: string;
  bullets: string[];
  link: string;
}

export interface TechModule {
  id: string;
  title: string;
  subtitle: string;
  features: string[];
  icon: string;
}

export interface LockerRoomStall {
  id: "athlete" | "coach" | "scout" | "trainer";
  role: string;
  title: string;
  persona: string;
  badge: string;
  hue: "cyan" | "amber" | "emerald" | "violet";
  icon: string;
  focus: string;
  quote: string;
  features: string[];
}

export const landingPageCopy = {
  hero: {
    badge: "Spotlight Beta Program",
    title: "Pro teams have a film room. Everyone else has a phone full of footage.",
    subtitle: "Spotlight is the mordern, high-fidelity player development platform bringing decision-grade video intelligence and captive AI to grassroots youth hockey—transforming raw recordings into an interactive playground.",
    primaryCta: "Apply for Beta Access",
    secondaryCta: "Explore the Platform"
  },
  lockerRoom: {
    eyebrow: "The Sanctuary of Intentional Development",
    title: "Development doesn't start on the ice. It starts in the Locker Room.",
    subtitle: "The unified space where pre-skate intent meets post-skate video intelligence, connecting coaches, players, scouts, and trainers in one shared developmental rhythm.",
    primaryCta: "Step Into The Locker Room",
    secondaryCta: "Explore Player Journals",
    stalls: [
      {
        id: "athlete" as const,
        role: "Athlete Stall",
        title: "Micro-Loops & Daily Reflections",
        persona: "Skater",
        badge: "Periodical Journal",
        hue: "cyan" as const,
        icon: "User",
        focus: "Pre-skate focus briefing and post-skate micro-loop reflections",
        quote: '"Set 3 focus goals before stepping onto the ice. Review 15s micro-loop debriefs after."',
        features: [
          "Personalized 15-second micro-loop clips delivered directly to player mobile devices",
          "Pre-skate intent briefing for key skills (Explode, Own Puck, Threat, Quick Feet)",
          "Daily reflection journal with self-scoring and coach annotation feedback loops"
        ]
      },
      {
        id: "coach" as const,
        role: "Coach Workbench",
        title: "Tactical Curation & Whiteboards",
        persona: "Head Coach",
        badge: "Encore Studio",
        hue: "amber" as const,
        icon: "ShieldCheck",
        focus: "Tactical curation, split-screen benchmarks, and sub-second clip tagging",
        quote: '"Whiteboard annotations tied directly to video timestamps. Bench talk translated instantly."',
        features: [
          "Interactive Coach Workbench wrapped in deep-slate frosted glass",
          "Dual-Playback Split-Screen side-by-side analysis (NHL benchmark vs Skater)",
          "Instant broadcast engine pushing tagged clips directly to player Periodical journals"
        ]
      },
      {
        id: "scout" as const,
        role: "Scout Observatory",
        title: "Possession & Threat Topology",
        persona: "Evaluator",
        badge: "EdgeIQ & Tempest",
        hue: "emerald" as const,
        icon: "BarChart2",
        focus: "Possession flow lines, threat mapping, and developmental delta tracking",
        quote: '"Scout player progression over time—track zone residence, danger creation, and tilt."',
        features: [
          "Layered danger topology indexing how spatial risk is created or denied",
          "Tempest possession console tracking zone entry success and momentum shifts",
          "Dossier-style scouting reports built for placement meetings and progress reviews"
        ]
      },
      {
        id: "trainer" as const,
        role: "Skill Scientist",
        title: "Kinetic Surfaces & Skill Arcs",
        persona: "Development Lead",
        badge: "Stratus Lab",
        hue: "violet" as const,
        icon: "Zap",
        focus: "Micro-skill sequencing, 3D rink twins, and season-long development blueprints",
        quote: '"Sequences what we drill this week, how we know it stuck, and what unlocks next."',
        features: [
          "Holographic 3D rink twins mapping skater kinetic pathways and acceleration vectors",
          "Neural coaching lab providing plain-language developmental roadmaps",
          "Progress barometers easily recognized by coaches, players, and parents"
        ]
      }
    ] as LockerRoomStall[]
  },
  ecosystem: {
    eyebrow: "AI-Powered Cloud Architecture for Sports Intelligence",
    title: "Two synergistic applications, and four sub-stack programs. One unified tape.",
    subtitle: "Spotlight reconstructs raw game files through four distinct analytical lenses, then distributes tailored learning loops directly to your athletes.",
    tiers: [
      {
        id: "encore",
        name: "Encore",
        tagline: "The Coach Workbench",
        description: "The media-forward coaching studio built to capture and command athlete attention. Features our SOTA Coach Workbench, dual-playback split-screen, and strict sub-second timestamp locking.",
        keyFeatures: [
          "Interactive Coach Workbench wrapping tactical curation in deep-slate frosted glass",
          "Dual-Playback Split-Screen side-by-side analysis (NHL benchmark vs Skater)",
          "Strict timestamp locking to scrub, pause, and sync reference clips instantly"
        ]
      },
      {
        id: "tempest",
        name: "Tempest",
        tagline: "The Possession Analogue",
        description: "Translates team structure into plain bench language. Flow lines, zone grids, tactics lab, possession console, and storm decks.",
        keyFeatures: [
          "Narrates how your team earns space, zone residence, and pressure cycles",
          "Identifies who tilted the ice and when momentum flipped",
          "Situational analysis for special teams and overtime rhythms"
        ]
      },
      {
        id: "edgeiq",
        name: "EdgeIQ",
        tagline: "The Evaluator",
        description: "For the scout who lives between telemetry and video. Threat maps, benchmark observatory, projection vaults, signals, and biomechanics-inspired panels.",
        keyFeatures: [
          "Scout the development delta and player progression, not just the leaderboard",
          "Dossier-style scouting reports and comparison tools built for placement meetings",
          "Layered danger topology indexing how risk is created or denied on the ice"
        ]
      },
      {
        id: "stratus",
        name: "Stratus",
        tagline: "The Skills Scientist",
        description: "Sequences micro-skills into season-long developmental arcs. Neural coaching lab, rink twins, kinetic surfaces, and apex arenas.",
        keyFeatures: [
          "Sequences what we drill this week, how we know it stuck, and what unlocks next",
          "Holographic 3D rink twins and kinetic surfaces mapping skater pathways",
          "Provides a plain-language development blueprint parents easily recognize"
        ]
      }
    ] as AppTier[],
    periodical: {
      eyebrow: "Accountability Through Collaboration",
      title: "Periodical: Personalized journals and micro-loops delivered to the palm of their hand.",
      description: "Feedback is only valuable if it is lived. Periodical is the collaborative bridge connecting coach intent with player execution. It packages whiteboard sketches, tagged clips, and coaching annotations into personalized journals and micro-loops. With daily athlete journaling and interactive planners (macro, meso, micro cycles), players reflect on their decisions and take ownership of their development.",
      cta: "See Periodical in Action"
    }
  },
  technology: {
    eyebrow: "The AI Edge · MASCE Engine",
    title: "Software margins on a hybrid-cloud foundation.",
    subtitle: "Most AI guesses. Ours is auditable. By running our Multi-Agent Sports Cognition Engine (MASCE) on our owned hybrid GPU fabric and hybrid cloud, we collapsed the economics of automated video analysis.",
    modules: [
      {
        id: "detect",
        title: "Captive AI Engine",
        subtitle: ">92% Deterministic Prediction",
        features: [
          "Stop scrubbing through hours of footage manually: query plays semantically in plain language",
          "A pipeline of specialized agents builds a provenance-tagged event ledger",
          "Every run self-checks against 14 physics and hockey rules to prevent drift"
        ],
        icon: "Camera"
      },
      {
        id: "track",
        title: "Semantic Chronology",
        subtitle: "L1 → L4 Architecture",
        features: [
          "Atomic facts (Nano) roll deterministically up to shifts (Meso) and game stats (Macro)",
          "YOLO tracking stabilized into consistent identities, grounded by OCR scoreboards",
          "Timeline never drifts: reproducible, auditable, and not summarized"
        ],
        icon: "Network"
      },
      {
        id: "deploy",
        title: "The Cost Unlock",
        subtitle: "From $30 to $2.87 per game",
        features: [
          "Optimized cloud GPU architecture eliminates traditional compute overhead",
          "Processes a full 90-minute 1080p game in under 60 minutes for pennies",
          "Scale-to-zero cloud keeps fixed overhead near zero, producing 94% margins"
        ],
        icon: "Server"
      }
    ] as TechModule[]
  },
  pricing: {
    eyebrow: "Plans & Seasons",
    title: "Transparent pricing for every tier of development.",
    subtitle: "From single-athlete tracking to elite academy rosters, choose the plan that matches your development scale.",
    plans: [
      {
        name: "Hobby",
        price: "$0",
        billing: "Free Trial",
        tagline: "Discover the development delta.",
        features: [
          "Basic video uploading & storage",
          "Zero-hardware capture integration",
          "Trial intelligence passes",
          "Core dashboard access"
        ],
        ctaText: "Start Trial",
        popular: false
      },
      {
        name: "Family",
        price: "$29",
        billing: "per month",
        tagline: "Own the skater's journey.",
        features: [
          "Dedicated skater dossier & progress benchmarks",
          "Personalized Periodical journals & daily skater journals",
          "Telemetry feeds & highlight exports",
          "Parent-safe feedback panels"
        ],
        ctaText: "Get Started",
        popular: false
      },
      {
        name: "Pro",
        price: "$49",
        billing: "per month",
        tagline: "Cinematic coaching for independent analysts.",
        features: [
          "All Family tier features",
          "Custom playlist lanes & sandbox curation",
          "Advanced drawing, Coach Clipboard & caption studio",
          "Interactive report vaults",
          "Strict micro-loop window controls"
        ],
        ctaText: "Upgrade to Pro",
        popular: true
      },
      {
        name: "Team",
        price: "$2,600",
        billing: "per season",
        tagline: "Unified intelligence for the entire bench.",
        features: [
          "25+ Player & Coach accounts",
          "Full Tempest possession indexing & flow lines",
          "Collaborative video review workspaces",
          "Periodical roster-wide broadcast engine",
          "Real-time Watch Telemetry Board dashboard",
          "Standard support & setup"
        ],
        ctaText: "Onboard Team",
        popular: false
      },
      {
        name: "Elite Prospects",
        price: "$4,500",
        billing: "per season",
        tagline: "The professional standard for academy rosters.",
        features: [
          "Priority GPU encoding queue (NVENC-accelerated)",
          "Automated rink game stitching & reconstruction",
          "EdgeIQ advanced biomechanics panels",
          "Watch Telemetry with loop-frequency diagnostics",
          "Developer API access & webhook triggers"
        ],
        ctaText: "Contact Sales",
        popular: false
      }
    ] as PricingPlan[]
  },
  docs: {
    eyebrow: "Documentation Hub",
    title: "The technical blueprints.",
    subtitle: "Explore the technical framework, roadmap, and integration guides powering the Spotlight platform.",
    categories: [
      {
        title: "Platform & Ingest",
        description: "Under the hood of raw game capture and rendering.",
        bullets: [
          "Temporal Job Orchestration & state handoffs",
          "MinIO S3 storage integration & retention settings",
          "GPU-accelerated NVENC transcoding rules",
          "Multi-angle rink video stitching engine"
        ],
        link: "/dashboard/docs/ecosystem"
      },
      {
        title: "Development Roadmap",
        description: "Tracking the next wave of sports intelligence.",
        bullets: [
          "Active sprint statuses & preview lanes",
          "EdgeIQ projection vault releases",
          "Stratus 3D rink twin roadmap updates",
          "Custom telemetry import configurations"
        ],
        link: "/dashboard/docs/roadmap"
      },
      {
        title: "User Guides",
        description: "Operational playbooks for coaches, players, and families.",
        bullets: [
          "Interactive sidebar and workspace orientations",
          "Roster creation & season scheduling",
          "Event tagging protocols & Video Sandbox reviews",
          "Encore presentation stage workflows"
        ],
        link: "/dashboard/docs/user-guide"
      },
      {
        title: "Developer API",
        description: "Custom integrations for data-first hockey operations.",
        bullets: [
          "Custom JSON ingest pipeline definitions",
          "Telemetry CSV payload exports",
          "Webhook event triggers for automated stitching",
          "Athlete dossier API integrations"
        ],
        link: "/dashboard/docs/knowledge-base"
      }
    ] as DocCategory[]
  }
};
