"use client";

import React, { useState } from "react";
import { MultiSheetCommandCenter } from "@/components/tournaments/MultiSheetCommandCenter";
import { LiveTournamentBracketView } from "@/components/tournaments/LiveTournamentBracketView";

/**
 * Tournament director — GA-030 O-01 (T0.4 containment).
 *
 * There is no tournament, sheet, score, clock or stream source in the backend yet. This page
 * used to render four built-in rink sheets with club names, scores, clocks and invented YouTube
 * stream keys / RTMPS URLs, plus a built-in bracket. That data was deleted; the page stays and
 * shows "not yet available" until the tournament backend is rebuilt (T6.1).
 */
export default function TournamentDirectorPage() {
  const [selectedSheetId, setSelectedSheetId] = useState<string>("");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-8">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        <MultiSheetCommandCenter
          initialSheets={[]}
          selectedSheetId={selectedSheetId}
          onSelectSheet={setSelectedSheetId}
        />
        <LiveTournamentBracketView matches={[]} onSelectMatchSheet={setSelectedSheetId} />
      </div>
    </div>
  );
}
