import { NextRequest } from "next/server";

import {
  extractValidatedTeamId,
  forwardHockeyApi,
  getCallerAccessToken,
  isValidUuid,
  jsonNoStore,
  mapUpstreamResponse,
  readJsonObject,
  unauthorizedResponse,
} from "@/lib/hockey-api";
import {
  mapTournamentDetail,
  mapTournamentSummary,
  toUpstreamPayload,
} from "@/lib/tournament/b8-mappers";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return unauthorizedResponse();

  const accessToken = await getCallerAccessToken(supabase);
  if (!accessToken) return unauthorizedResponse();

  const teamCheck = extractValidatedTeamId(req);
  if (!teamCheck.ok) return teamCheck.response;

  const seasonId = req.nextUrl.searchParams.get("seasonId") ?? req.nextUrl.searchParams.get("season_id");
  const query = new URLSearchParams();
  if (seasonId?.trim()) {
    if (!isValidUuid(seasonId)) return jsonNoStore({ error: "Invalid seasonId." }, 400);
    query.set("season_id", seasonId.trim());
  }

  const res = await forwardHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/tournaments`,
    query,
    accessToken,
  });
  if (!res.ok) return res.response;

  const mapped = mapUpstreamResponse(() => {
    if (!res.data || typeof res.data !== "object" || Array.isArray(res.data)) {
      throw new Error("Expected object from tournaments list endpoint.");
    }
    const obj = res.data as Record<string, unknown>;
    if (!Array.isArray(obj.tournaments)) {
      throw new Error("Missing tournaments array in list response.");
    }
    return obj.tournaments.map(mapTournamentSummary);
  });
  if (!mapped.ok) return mapped.response;

  return jsonNoStore({
    teamId: teamCheck.teamId,
    seasonId: seasonId?.trim() || null,
    tournaments: mapped.data,
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return unauthorizedResponse();

  const accessToken = await getCallerAccessToken(supabase);
  if (!accessToken) return unauthorizedResponse();

  const parsed = await readJsonObject(req);
  if (!parsed.ok) return parsed.response;

  const teamCheck = extractValidatedTeamId(req, parsed.data);
  if (!teamCheck.ok) return teamCheck.response;

  const res = await forwardHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/tournaments`,
    method: "POST",
    body: toUpstreamPayload(parsed.data),
    accessToken,
  });
  if (!res.ok) return res.response;

  const mapped = mapUpstreamResponse(() => mapTournamentDetail(res.data));
  if (!mapped.ok) return mapped.response;

  return jsonNoStore(mapped.data, res.status === 201 ? 201 : 200);
}
