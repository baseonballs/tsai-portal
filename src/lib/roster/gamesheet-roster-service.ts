//
//  gamesheet-roster-service.ts
//  tsai-portal
//
//  Author / Inventor: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 (Claim 8) & COPPA Child Safety Architecture
//

import { createHmac } from "node:crypto";
import { calculateAthleteAge } from "../legal/coppa-scout-consent-bridge";

export interface PortalGuardianRecord {
  firstName: string;
  lastName: string;
  relationship: string;
  email?: string;
  phone?: string;
}

export interface PortalEnrichedAthlete {
  firstName: string;
  lastName: string;
  jerseyNumber?: string;
  birthDate?: string;
  position?: string;
  shoots?: string;
  usahNumber?: string;
  guardians: PortalGuardianRecord[];
  coppaStatus: "pending_parent_consent" | "consented_or_exempt" | "blocked_missing_guardian";
  parentConsentRequired: boolean;
  vpcInvitationUrl?: string;
  calculatedAge?: number;
}

export interface PortalGameSheetImportResult {
  team: {
    name: string;
    season: string;
    levelOfPlay: string;
  };
  athletes: PortalEnrichedAthlete[];
  totalAthletes: number;
  athletesUnder13: number;
  consentLinksGenerated: number;
  warnings: string[];
  success: boolean;
}

export interface PortalImportOptions {
  teamName?: string;
  season?: string;
  levelOfPlay?: string;
  signingSecret?: string;
  portalBaseUrl?: string;
  referenceDate?: Date;
}

const DEFAULT_SECRET = "tsai-vpc-secret-production-key-2026";
const DEFAULT_PORTAL_URL = "https://portal.transcend.internal";

export function parseCSVRows(csvContent: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  const content = csvContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if (char === "\n" && !insideQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function importGameSheetRoster(
  rawCSV: string,
  options: PortalImportOptions = {}
): PortalGameSheetImportResult {
  const rows = parseCSVRows(rawCSV);
  const warnings: string[] = [];

  if (rows.length < 2) {
    return {
      team: {
        name: options.teamName || "Imported Team",
        season: options.season || "2026-2027",
        levelOfPlay: options.levelOfPlay || "12U AAA",
      },
      athletes: [],
      totalAthletes: 0,
      athletesUnder13: 0,
      consentLinksGenerated: 0,
      warnings: ["CSV contains insufficient data (header or athlete rows missing)."],
      success: false,
    };
  }

  const rawHeaders = rows[0];
  const headers = rawHeaders.map(normalizeHeader);

  const findCol = (patterns: string[]): number => {
    return headers.findIndex((h) => patterns.some((p) => h.includes(normalizeHeader(p))));
  };

  const jerseyIdx = findCol(["jersey", "number", "num", "#"]);
  const fullNameIdx = findCol(["playername", "fullname", "athlete", "skatername", "skater", "name"]);
  const firstNameIdx = findCol(["firstname", "first"]);
  const lastNameIdx = findCol(["lastname", "last"]);
  const dobIdx = findCol(["dob", "birthdate", "dateofbirth", "birth"]);
  const posIdx = findCol(["position", "pos"]);
  const shootsIdx = findCol(["shoots", "hand", "catches"]);
  const usahIdx = findCol(["usah", "usahockey", "memberid"]);
  const guardianNameIdx = findCol(["guardianname", "parentname", "guardian", "parent"]);
  const guardianEmailIdx = findCol(["guardianemail", "parentemail", "email"]);
  const guardianPhoneIdx = findCol(["guardianphone", "parentphone", "phone"]);

  const athletes: PortalEnrichedAthlete[] = [];
  const secret = options.signingSecret || DEFAULT_SECRET;
  const baseUrl = options.portalBaseUrl || DEFAULT_PORTAL_URL;
  const refDate = options.referenceDate || new Date();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 0 || row.every((c) => !c)) continue;

    let firstName = "";
    let lastName = "";

    if (firstNameIdx !== -1 && lastNameIdx !== -1 && row[firstNameIdx] && row[lastNameIdx]) {
      firstName = row[firstNameIdx].trim();
      lastName = row[lastNameIdx].trim();
    } else if (fullNameIdx !== -1 && row[fullNameIdx]) {
      const parts = row[fullNameIdx].trim().split(/\s+/);
      firstName = parts[0] || "Unknown";
      lastName = parts.slice(1).join(" ") || "Athlete";
    } else {
      firstName = `Athlete-${r}`;
      lastName = "Roster";
      warnings.push(`Row ${r}: Missing player name, defaulted to ${firstName} ${lastName}`);
    }

    const jersey = jerseyIdx !== -1 && row[jerseyIdx] ? row[jerseyIdx].trim() : undefined;
    const dobRaw = dobIdx !== -1 && row[dobIdx] ? row[dobIdx].trim() : undefined;
    const position = posIdx !== -1 && row[posIdx] ? row[posIdx].trim().toUpperCase() : undefined;
    const shoots = shootsIdx !== -1 && row[shootsIdx] ? row[shootsIdx].trim().toUpperCase() : undefined;
    const usah = usahIdx !== -1 && row[usahIdx] ? row[usahIdx].trim() : undefined;

    const guardianEmail = guardianEmailIdx !== -1 && row[guardianEmailIdx] ? row[guardianEmailIdx].trim() : undefined;
    const guardianName = guardianNameIdx !== -1 && row[guardianNameIdx] ? row[guardianNameIdx].trim() : undefined;
    const guardianPhone = guardianPhoneIdx !== -1 && row[guardianPhoneIdx] ? row[guardianPhoneIdx].trim() : undefined;

    const guardians: PortalGuardianRecord[] = [];
    if (guardianEmail || guardianName || guardianPhone) {
      const gParts = (guardianName || "Parent Guardian").split(/\s+/);
      guardians.push({
        firstName: gParts[0] || "Parent",
        lastName: gParts.slice(1).join(" ") || "Guardian",
        relationship: "guardian",
        email: guardianEmail,
        phone: guardianPhone,
      });
    }

    let age: number | undefined = undefined;
    let under13 = false;

    if (dobRaw) {
      age = calculateAthleteAge(dobRaw, refDate);
      under13 = age < 13;
    } else {
      // Fallback: Check level of play if DOB absent
      const level = options.levelOfPlay || "";
      under13 = /\b(6U|8U|10U|12U)\b/i.test(level);
    }

    let coppaStatus: PortalEnrichedAthlete["coppaStatus"] = "consented_or_exempt";
    let vpcUrl: string | undefined = undefined;
    const parentConsentRequired = under13;

    if (under13) {
      if (guardianEmail) {
        coppaStatus = "pending_parent_consent";
        const rawToken = `${firstName}:${lastName}:${dobRaw || "nodob"}:${guardianEmail}:${refDate.toISOString().slice(0, 10)}`;
        const tokenHash = createHmac("sha256", secret).update(rawToken).digest("hex").slice(0, 32);
        vpcUrl = `${baseUrl}/auth/parent-consent?token=${tokenHash}&athlete=${encodeURIComponent(firstName + " " + lastName)}&guardian=${encodeURIComponent(guardianEmail)}`;
      } else {
        coppaStatus = "blocked_missing_guardian";
        warnings.push(`Athlete ${firstName} ${lastName} is under 13 but lacks a guardian email. Direct communications blocked under COPPA.`);
      }
    }

    athletes.push({
      firstName,
      lastName,
      jerseyNumber: jersey,
      birthDate: dobRaw,
      position,
      shoots,
      usahNumber: usah,
      guardians,
      coppaStatus,
      parentConsentRequired,
      vpcInvitationUrl: vpcUrl,
      calculatedAge: age,
    });
  }

  const under13Count = athletes.filter((a) => a.parentConsentRequired).length;
  const consentLinksCount = athletes.filter((a) => a.vpcInvitationUrl !== undefined).length;

  return {
    team: {
      name: options.teamName || "Valley Jr. Warriors",
      season: options.season || "2026-2027",
      levelOfPlay: options.levelOfPlay || "12U AAA",
    },
    athletes,
    totalAthletes: athletes.length,
    athletesUnder13: under13Count,
    consentLinksGenerated: consentLinksCount,
    warnings,
    success: true,
  };
}
