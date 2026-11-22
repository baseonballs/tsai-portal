/**
 * ical-tournament-provisioner.ts
 * TsaiPortal / Tournament Administration
 *
 * Assignee: Transcendental Sports AI LLC
 * Patent Track 16: TSAI-PATENT-VISION-01 (Docket P229, Claims 9 & 10)
 *
 * Automated tournament schedule ingestion, RFC 5545 iCalendar parsing,
 * explicit location-to-sheet parsing, and multi-sheet schedule preparation.
 */

import { type TournamentSheet } from "@/components/tournaments/multi-sheet-types";

export const MIN_SHEET_NUMBER = 1;
export const MAX_SHEET_NUMBER = 16;

export interface ICalEvent {
  uid: string;
  summary: string;
  description?: string;
  location: string;
  dtStart: Date;
  dtEnd: Date;
  homeTeam: string | null;
  awayTeam: string | null;
  sheetNumber: number | null;
  rinkName: string | null;
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
  unmappedEvents: ICalEvent[];
}

/**
 * Extracts an explicit sheet/rink number (1-16) and preserves LOCATION verbatim.
 * Events without an explicit, unambiguous sheet number remain unmapped (sheetNumber: null).
 */
export function mapLocationToSheetNumber(location: string): { sheetNumber: number | null; rinkName: string | null } {
  const trimmed = location.trim();
  const rinkName = trimmed.length > 0 ? trimmed : null;
  if (!trimmed) {
    return { sheetNumber: null, rinkName: null };
  }

  const matches = [...trimmed.matchAll(/\b(?:sheet|rink)\s*(?:#|no\.?)?\s*(\d+)\b/gi)];
  const validNumbers = Array.from(
    new Set(
      matches
        .map((m) => Number.parseInt(m[1], 10))
        .filter((num) => Number.isInteger(num) && num >= MIN_SHEET_NUMBER && num <= MAX_SHEET_NUMBER),
    ),
  );

  if (validNumbers.length === 1) {
    return { sheetNumber: validNumbers[0], rinkName };
  }

  return { sheetNumber: null, rinkName };
}

/**
 * Parses Home vs Away team names, round, and division from summary text without inventing defaults.
 */
export function parseTeamsFromSummary(summary: string): {
  homeTeam: string | null;
  awayTeam: string | null;
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
    return {
      homeTeam: vsSplit[0].trim() || null,
      awayTeam: vsSplit[1].trim() || null,
      division,
      round,
    };
  }

  return {
    homeTeam: cleanSummary || null,
    awayTeam: null,
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
          uid: currentUid || `event-${events.length + 1}`,
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
 * Detects scheduling conflicts where two mapped matches overlap on the same sheet.
 */
export function detectSheetScheduleConflicts(events: ICalEvent[]): SheetScheduleConflict[] {
  const conflicts: SheetScheduleConflict[] = [];

  for (let i = 0; i < events.length; i++) {
    const a = events[i];
    if (a.sheetNumber === null) continue;

    for (let j = i + 1; j < events.length; j++) {
      const b = events[j];
      if (b.sheetNumber === null || a.sheetNumber !== b.sheetNumber) continue;

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

  return conflicts;
}

/**
 * Prepares tournament sheet definitions ONLY from events with explicit sheet numbers.
 * Preserves LOCATION verbatim without inventing rink names, stream secrets, playback URLs,
 * scores, clocks, or hardware telemetry.
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
  const unmappedEvents: ICalEvent[] = [];

  for (const ev of events) {
    if (ev.sheetNumber !== null && ev.sheetNumber >= MIN_SHEET_NUMBER && ev.sheetNumber <= MAX_SHEET_NUMBER) {
      const list = sheetEventsMap.get(ev.sheetNumber) ?? [];
      list.push(ev);
      sheetEventsMap.set(ev.sheetNumber, list);
    } else {
      unmappedEvents.push(ev);
    }
  }

  const activeSheetNumbers = Array.from(sheetEventsMap.keys()).sort((a, b) => a - b);
  const sheets: TournamentSheet[] = [];
  const nowTime = now.getTime();

  for (const sheetNum of activeSheetNumbers) {
    const sheetEvents = sheetEventsMap.get(sheetNum)!;
    sheetEvents.sort((a, b) => a.dtStart.getTime() - b.dtStart.getTime());

    let activeEvent = sheetEvents.find((e) => e.dtStart.getTime() <= nowTime && nowTime <= e.dtEnd.getTime());
    if (!activeEvent) {
      activeEvent = sheetEvents.find((e) => e.dtStart.getTime() > nowTime) ?? sheetEvents[sheetEvents.length - 1];
    }

    const verbatimRinkName = activeEvent?.rinkName ?? sheetEvents.find((e) => e.rinkName)?.rinkName ?? "";

    sheets.push({
      sheetId: `sheet-${String(sheetNum).padStart(2, "0")}`,
      sheetNumber: sheetNum,
      rinkName: verbatimRinkName,
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
        matchId: activeEvent.uid,
        homeTeam: activeEvent.homeTeam,
        awayTeam: activeEvent.awayTeam,
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
    unmappedEventsCount: unmappedEvents.length,
    unmappedEvents,
  };
}
