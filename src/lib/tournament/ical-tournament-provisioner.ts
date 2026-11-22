/**
 * ical-tournament-provisioner.ts
 * TsaiPortal / Tournament Administration
 *
 * Assignee: Transcendental Sports AI LLC
 * Patent Track 16: TSAI-PATENT-VISION-01 (Docket P229, Claims 9 & 10)
 *
 * Automated tournament schedule ingestion, RFC 5545 iCalendar parsing,
 * sheet location reconciliation, and multi-sheet schedule preparation.
 */

import { type TournamentSheet } from "@/components/tournaments/multi-sheet-types";

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
  activeSheetNumbers: number[];
  unmappedEventsCount: number;
}

/**
 * Extracts sheet number (1-8) and canonical rink name from event location text.
 */
export function mapLocationToSheetNumber(location: string): { sheetNumber: number; rinkName: string } {
  const locLower = location.toLowerCase();

  const sheetMatch = locLower.match(/(?:sheet|rink)\s*(?:#|no\.?)?\s*(\d+)/);
  if (sheetMatch) {
    const num = parseInt(sheetMatch[1], 10);
    if (num >= 1 && num <= 8) {
      return { sheetNumber: num, rinkName: `Sheet ${num} (${location.trim()})` };
    }
  }

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

  return { sheetNumber: 1, rinkName: location.trim() || "Sheet 1 (Main Arena)" };
}

/**
 * Parses Home vs Away team names, round, and division from summary text.
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

  const vsSplit = cleanSummary.split(/\s+(?:vs\.?|VS\.?|@)\s+/i);
  if (vsSplit.length >= 2) {
    return { homeTeam: vsSplit[0].trim(), awayTeam: vsSplit[1].trim(), division, round };
  }

  return {
    homeTeam: cleanSummary || "Home Team",
    awayTeam: "Away Team",
    division,
    round,
  };
}

/**
 * Parses RFC 5545 timestamp string into a JavaScript Date.
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
  const parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Parses an iCalendar (.ics) feed into structured ICalEvents.
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
 * Prepares tournament sheet definitions from parsed iCal events without inventing stream
 * secrets, playback URLs, scores, clocks, or hardware telemetry.
 */
export function provisionTournamentSheetsFromICal(
  events: ICalEvent[],
  options?: {
    currentTime?: Date;
  },
): ProvisioningReport {
  const now = options?.currentTime || new Date();
  const conflicts = detectSheetScheduleConflicts(events);

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
  const activeSheetNumbers: number[] = [];

  for (let sheetNum = 1; sheetNum <= 8; sheetNum++) {
    const sheetEvents = sheetEventsMap.get(sheetNum)!;
    sheetEvents.sort((a, b) => a.dtStart.getTime() - b.dtStart.getTime());
    if (sheetEvents.length > 0) {
      activeSheetNumbers.push(sheetNum);
    }

    const nowTime = now.getTime();
    let activeEvent = sheetEvents.find((e) => e.dtStart.getTime() <= nowTime && nowTime <= e.dtEnd.getTime());

    if (!activeEvent) {
      const upcoming = sheetEvents.find((e) => e.dtStart.getTime() > nowTime);
      if (upcoming) {
        activeEvent = upcoming;
      } else if (sheetEvents.length > 0) {
        activeEvent = sheetEvents[sheetEvents.length - 1];
      }
    }

    const rinkName = activeEvent?.rinkName || defaultRinkNames[sheetNum];
    const matchId = activeEvent?.uid || `sheet-${sheetNum}-idle`;

    sheets.push({
      sheetId: `sheet-0${sheetNum}`,
      sheetNumber: sheetNum,
      rinkName,
      streamState: "UNINITIALIZED",
      youtubeBroadcastId: null,
      playbackUrl: null,
      bitrateKbps: null,
      fps: null,
      activeAngle: "TACTICAL_PRIMARY",
      isPublicShowcase: false,
      hardwareHealth: null,
      acousticShieldMuted: false,
      matchInfo: {
        matchId,
        homeTeam: activeEvent?.homeTeam ?? null,
        awayTeam: activeEvent?.awayTeam ?? null,
        period: null,
        gameClockSeconds: null,
        scoreHome: null,
        scoreAway: null,
        isOvertime: false,
      },
    });
  }

  return {
    totalEventsParsed: events.length,
    sheetsProvisionedCount: sheets.length,
    conflictsDetected: conflicts,
    sheets,
    activeSheetNumbers,
    unmappedEventsCount: unmappedEvents,
  };
}
