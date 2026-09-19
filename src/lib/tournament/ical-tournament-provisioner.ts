/**
 * ical-tournament-provisioner.ts
 * TsaiPortal / Tournament Administration
 *
 * Author / Inventor: Jeffrey T. Lucas
 * Assignee: Transcendental Sports AI LLC
 * Patent Track 16: TSAI-PATENT-VISION-01 (Docket P229, Claims 9 & 10)
 *
 * Automated tournament schedule ingestion, RFC 5545 iCalendar parsing,
 * sheet location reconciliation, and multi-sheet streaming pipeline provisioning.
 */

import { type TournamentSheet, type BroadcastAngle, type SheetStreamState } from "@/components/tournaments/MultiSheetCommandCenter";

export interface ICalEvent {
  uid: string;
  summary: string;
  description?: string;
  location: string;
  dtStart: Date;
  dtEnd: Date;
  homeTeam: string;
  awayTeam: string;
  sheetNumber: number;
  rinkName: string;
  division?: string;
  round?: string;
}

export interface SheetScheduleConflict {
  sheetNumber: number;
  eventA: ICalEvent;
  eventB: ICalEvent;
  conflictOverlapSeconds: number;
}

export interface ProvisioningReport {
  totalEventsParsed: number;
  sheetsProvisionedCount: number;
  conflictsDetected: SheetScheduleConflict[];
  sheets: TournamentSheet[];
  unmappedEventsCount: number;
}

/**
 * Extracts sheet number (1-8) and canonical rink name from event location text.
 */
export function mapLocationToSheetNumber(location: string): { sheetNumber: number; rinkName: string } {
  const locLower = location.toLowerCase();

  // Look for direct sheet patterns: "sheet 1", "rink 1", "sheet #1", "rink a", "center arena"
  const sheetMatch = locLower.match(/(?:sheet|rink)\s*(?:#|no\.?)?\s*(\d+)/);
  if (sheetMatch) {
    const num = parseInt(sheetMatch[1], 10);
    if (num >= 1 && num <= 8) {
      return { sheetNumber: num, rinkName: `Sheet ${num} (${location.trim()})` };
    }
  }

  // Named rinks fallback
  if (locLower.includes("center") || locLower.includes("main") || locLower.includes("arena a")) {
    return { sheetNumber: 1, rinkName: "Main Center Arena (Sheet 1)" };
  }
  if (locLower.includes("south") || locLower.includes("olympic") || locLower.includes("arena b")) {
    return { sheetNumber: 2, rinkName: "Olympic South Sheet (Sheet 2)" };
  }
  if (locLower.includes("north") || locLower.includes("east") || locLower.includes("arena c")) {
    return { sheetNumber: 3, rinkName: "North Rink 3 (Sheet 3)" };
  }
  if (locLower.includes("west") || locLower.includes("arena d")) {
    return { sheetNumber: 4, rinkName: "West Rink 4 (Sheet 4)" };
  }

  // Default to sheet 1
  return { sheetNumber: 1, rinkName: location.trim() || "Sheet 1 (Main Arena)" };
}

/**
 * Parses Home vs Away team names, round, and division from summary text.
 * Handles formats like:
 * "Jr Sharks AAA vs Chicago Mission (16U AAA Quarterfinal 1)"
 * "Toronto Marlboros @ Detroit HoneyBaked - Semifinal"
 */
export function parseTeamsFromSummary(summary: string): {
  homeTeam: string;
  awayTeam: string;
  division?: string;
  round?: string;
} {
  let cleanSummary = summary.trim();
  let round: string | undefined;
  let division: string | undefined;

  // Extract parentheses or dash annotations
  const parenMatch = cleanSummary.match(/\((.*?)\)/);
  if (parenMatch) {
    const annotation = parenMatch[1];
    cleanSummary = cleanSummary.replace(/\(.*?\)/, "").trim();
    if (annotation.includes("AAA") || annotation.includes("14U") || annotation.includes("16U") || annotation.includes("18U")) {
      division = annotation;
    } else {
      round = annotation;
    }
  }

  const dashParts = cleanSummary.split(/\s+-\s+/);
  if (dashParts.length > 1) {
    cleanSummary = dashParts[0].trim();
    round = round || dashParts[1].trim();
  }

  // Split by "vs.", "vs", "VS", or "@"
  const vsSplit = cleanSummary.split(/\s+(?:vs\.?|VS\.?|@)\s+/i);
  if (vsSplit.length >= 2) {
    const homeTeam = vsSplit[0].trim();
    const awayTeam = vsSplit[1].trim();
    return { homeTeam, awayTeam, division, round };
  }

  return {
    homeTeam: cleanSummary || "Home Team",
    awayTeam: "Away Team",
    division,
    round,
  };
}

/**
 * Parses RFC 5545 timestamp string (e.g. "20260918T180000Z" or "20260918T180000") into a JavaScript Date.
 */
export function parseICalDate(dateStr: string): Date {
  const clean = dateStr.trim();
  const match = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (match) {
    const [, y, m, d, h, min, s, isUtc] = match;
    if (isUtc) {
      return new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), parseInt(h, 10), parseInt(min, 10), parseInt(s, 10)));
    }
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), parseInt(h, 10), parseInt(min, 10), parseInt(s, 10));
  }
  // Fallback to ISO string parse
  const parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Parses an entire iCalendar (.ics) feed into structured ICalEvents.
 */
export function parseICalFeed(icsContent: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = icsContent.split(/\r?\n/);
  let inEvent = false;
  let currentUid = "";
  let currentSummary = "";
  let currentDescription = "";
  let currentLocation = "";
  let currentDtStart = "";
  let currentDtEnd = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Handle RFC 5545 line unfolding (continuation lines starting with space or tab)
    while (i + 1 < lines.length && (lines[i + 1].startsWith(" ") || lines[i + 1].startsWith("\t"))) {
      line += lines[i + 1].slice(1);
      i++;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const rawKey = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    const key = rawKey.split(";")[0].toUpperCase();

    if (key === "BEGIN" && value === "VEVENT") {
      inEvent = true;
      currentUid = "";
      currentSummary = "";
      currentDescription = "";
      currentLocation = "";
      currentDtStart = "";
      currentDtEnd = "";
    } else if (key === "END" && value === "VEVENT") {
      if (inEvent && currentSummary) {
        const { homeTeam, awayTeam, division, round } = parseTeamsFromSummary(currentSummary);
        const { sheetNumber, rinkName } = mapLocationToSheetNumber(currentLocation);
        const dtStart = parseICalDate(currentDtStart);
        const dtEnd = parseICalDate(currentDtEnd);

        events.push({
          uid: currentUid || `match-${events.length + 1}-${Date.now()}`,
          summary: currentSummary,
          description: currentDescription,
          location: currentLocation,
          dtStart,
          dtEnd,
          homeTeam,
          awayTeam,
          sheetNumber,
          rinkName,
          division,
          round,
        });
      }
      inEvent = false;
    } else if (inEvent) {
      if (key === "UID") currentUid = value;
      else if (key === "SUMMARY") currentSummary = value;
      else if (key === "DESCRIPTION") currentDescription = value;
      else if (key === "LOCATION") currentLocation = value;
      else if (key === "DTSTART") currentDtStart = value;
      else if (key === "DTEND") currentDtEnd = value;
    }
  }

  return events;
}

/**
 * Detects scheduling conflicts where two matches overlap on the same sheet.
 */
export function detectSheetScheduleConflicts(events: ICalEvent[]): SheetScheduleConflict[] {
  const conflicts: SheetScheduleConflict[] = [];

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];

      if (a.sheetNumber === b.sheetNumber) {
        const startA = a.dtStart.getTime();
        const endA = a.dtEnd.getTime();
        const startB = b.dtStart.getTime();
        const endB = b.dtEnd.getTime();

        // Check for temporal intersection
        if (startA < endB && startB < endA) {
          const overlapMillis = Math.min(endA, endB) - Math.max(startA, startB);
          conflicts.push({
            sheetNumber: a.sheetNumber,
            eventA: a,
            eventB: b,
            conflictOverlapSeconds: Math.round(overlapMillis / 1000),
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Provisions the full 8-sheet tournament grid from parsed iCal events.
 */
export function provisionTournamentSheetsFromICal(
  events: ICalEvent[],
  options?: {
    currentTime?: Date;
    venueName?: string;
  },
): ProvisioningReport {
  const now = options?.currentTime || new Date();
  const venue = options?.venueName || "Transcend Sports Complex (8-Sheet Facility)";
  const conflicts = detectSheetScheduleConflicts(events);

  // Group events by sheet (1 through 8)
  const sheetEventsMap = new Map<number, ICalEvent[]>();
  for (let s = 1; s <= 8; s++) {
    sheetEventsMap.set(s, []);
  }

  let unmappedEvents = 0;
  for (const ev of events) {
    if (ev.sheetNumber >= 1 && ev.sheetNumber <= 8) {
      sheetEventsMap.get(ev.sheetNumber)!.push(ev);
    } else {
      unmappedEvents++;
    }
  }

  const defaultRinkNames: Record<number, string> = {
    1: "Main Center Arena (NHL Standard)",
    2: "Olympic South Sheet",
    3: "North Rink 3",
    4: "West Rink 4",
    5: "East Rink 5",
    6: "Training Sheet 6",
    7: "Community Rink 7",
    8: "Studio Pond 8",
  };

  const sheets: TournamentSheet[] = [];

  for (let sheetNum = 1; sheetNum <= 8; sheetNum++) {
    const sheetEvents = sheetEventsMap.get(sheetNum)!;
    // Sort chronologically
    sheetEvents.sort((a, b) => a.dtStart.getTime() - b.dtStart.getTime());

    // Find current active game or next upcoming game
    const nowTime = now.getTime();
    let activeEvent = sheetEvents.find((e) => e.dtStart.getTime() <= nowTime && nowTime <= e.dtEnd.getTime());
    let streamState: SheetStreamState = "LIVE";

    if (!activeEvent) {
      // Find next upcoming
      const upcoming = sheetEvents.find((e) => e.dtStart.getTime() > nowTime);
      if (upcoming) {
        activeEvent = upcoming;
        streamState = "TESTING";
      } else if (sheetEvents.length > 0) {
        // Last finished
        activeEvent = sheetEvents[sheetEvents.length - 1];
        streamState = "COMPLETED";
      }
    }

    const rinkName = activeEvent?.rinkName || defaultRinkNames[sheetNum];
    const matchId = activeEvent?.uid || `sheet-${sheetNum}-idle`;
    const homeTeam = activeEvent?.homeTeam || `Team Sheet ${sheetNum} Home`;
    const awayTeam = activeEvent?.awayTeam || `Team Sheet ${sheetNum} Away`;

    sheets.push({
      sheetId: `sheet-0${sheetNum}`,
      sheetNumber: sheetNum,
      rinkName,
      streamState,
      youtubeBroadcastId: `yt_bc_prov_s${sheetNum}_${matchId.slice(-6)}`,
      youtubeStreamKey: `live_tsai_s${sheetNum}_auto_${matchId.slice(-4)}`,
      rtmpsIngestUrl: `rtmps://a.rtmps.youtube.com/live2/live_tsai_s${sheetNum}_auto_${matchId.slice(-4)}`,
      playbackUrl: `https://youtube.com/watch?v=live_tsai_s0${sheetNum}`,
      bitrateKbps: streamState === "COMPLETED" ? 0 : 8500,
      fps: streamState === "COMPLETED" ? 0 : 60,
      activeAngle: "TACTICAL_PRIMARY",
      isPublicShowcase: sheetNum === 1,
      matchInfo: {
        matchId,
        homeTeam,
        awayTeam,
        period: streamState === "COMPLETED" ? 3 : 2,
        gameClockSeconds: streamState === "COMPLETED" ? 0 : 420,
        scoreHome: streamState === "COMPLETED" ? 4 : 2,
        scoreAway: streamState === "COMPLETED" ? 2 : 1,
        isOvertime: false,
      },
      hardwareHealth: {
        temperatureCelsius: 40.0 + sheetNum * 0.5,
        droppedFramesCount: 0,
        ispLoadPercentage: 42.0,
        thermalThrottled: false,
      },
      acousticShieldMuted: false,
    });
  }

  return {
    totalEventsParsed: events.length,
    sheetsProvisionedCount: sheets.length,
    conflictsDetected: conflicts,
    sheets,
    unmappedEventsCount: unmappedEvents,
  };
}

/**
 * Generates canonical 8-sheet Silver Stick AAA tournament sample .ics data for testing and demonstrations.
 */
export function generateSampleTournamentICal(): string {
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Transcendental Sports AI//Tournament Provisioner 2.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:International Silver Stick AAA Finals 2026
BEGIN:VEVENT
UID:ss-2026-qf1-sheet1
DTSTART:20260918T180000Z
DTEND:20260918T193000Z
SUMMARY:Jr Sharks AAA vs Chicago Mission (16U AAA Quarterfinal 1)
LOCATION:Sheet 1 - Main Center Arena
DESCRIPTION:Silver Stick Championship Bracket Game 1. Stream ingest YouTube CDN.
END:VEVENT
BEGIN:VEVENT
UID:ss-2026-qf2-sheet2
DTSTART:20260918T181500Z
DTEND:20260918T194500Z
SUMMARY:Toronto Marlboros vs Detroit HoneyBaked (16U AAA Quarterfinal 2)
LOCATION:Olympic South Sheet (Sheet 2)
DESCRIPTION:Silver Stick Championship Bracket Game 2.
END:VEVENT
BEGIN:VEVENT
UID:ss-2026-qf3-sheet3
DTSTART:20260918T180000Z
DTEND:20260918T193000Z
SUMMARY:Shattuck St. Mary's vs Boston Jr. Eagles (16U AAA Quarterfinal 3)
LOCATION:North Rink 3 (Sheet 3)
DESCRIPTION:Silver Stick Championship Bracket Game 3.
END:VEVENT
BEGIN:VEVENT
UID:ss-2026-qf4-sheet4
DTSTART:20260918T183000Z
DTEND:20260918T200000Z
SUMMARY:Minnesota Blades vs Little Caesars (16U AAA Quarterfinal 4)
LOCATION:West Rink 4 (Sheet 4)
DESCRIPTION:Silver Stick Championship Bracket Game 4.
END:VEVENT
BEGIN:VEVENT
UID:ss-2026-cons1-sheet5
DTSTART:20260918T180000Z
DTEND:20260918T193000Z
SUMMARY:Pittsburgh Pens Elite vs Buffalo Jr. Sabres (Consolation 1)
LOCATION:Sheet 5 (East Rink 5)
DESCRIPTION:Consolation round game 1.
END:VEVENT
BEGIN:VEVENT
UID:ss-2026-cons2-sheet6
DTSTART:20260918T181500Z
DTEND:20260918T194500Z
SUMMARY:Team Illinois vs Oakland Jr. Grizzlies (Consolation 2)
LOCATION:Sheet 6 (Training Sheet)
DESCRIPTION:Consolation round game 2.
END:VEVENT
BEGIN:VEVENT
UID:ss-2026-dev1-sheet7
DTSTART:20260918T183000Z
DTEND:20260918T200000Z
SUMMARY:Colorado Thunderbirds vs Dallas Stars Elite (Showcase)
LOCATION:Sheet 7 (Community Rink)
DESCRIPTION:Showcase exhibition.
END:VEVENT
BEGIN:VEVENT
UID:ss-2026-skills-sheet8
DTSTART:20260918T180000Z
DTEND:20260918T193000Z
SUMMARY:Goalie Skills & Breakaway Showcase (Special Event)
LOCATION:Sheet 8 (Studio Pond)
DESCRIPTION:Skills competition and shootout challenge.
END:VEVENT
END:VCALENDAR`;
}
