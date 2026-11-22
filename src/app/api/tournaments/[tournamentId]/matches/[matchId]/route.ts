import { NextRequest, NextResponse } from "next/server";

import {
  extractValidatedTeamId,
  forwardHockeyApi,
  getCallerAccessToken,
  isValidUuid,
  jsonNoStore,
  mapUpstreamResponse,
  NO_STORE,
  readJsonObject,
  unauthorizedResponse,
} from "@/lib/hockey-api";
import { mapBracketMatch, toUpstreamPayload } from "@/lib/tournament/b8-mappers";
import { createClient } from "@/utils/supabase/server";

type Params = { params: Promise<{ tournamentId: string; matchId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return unauthorizedResponse();

  const accessToken = await getCallerAccessToken(supabase);
  if (!accessToken) return unauthorizedResponse();

  const { tournamentId, matchId } = await params;
  if (!isValidUuid(tournamentId) || !isValidUuid(matchId)) {
    return jsonNoStore({ error: "Invalid tournamentId or matchId." }, 400);
  }

  const parsed = await readJsonObject(req);
  if (!parsed.ok) return parsed.response;

  const teamCheck = extractValidatedTeamId(req, parsed.data);
  if (!teamCheck.ok) return teamCheck.response;

  const res = await forwardHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/tournaments/${encodeURIComponent(tournamentId.trim())}/matches/${encodeURIComponent(matchId.trim())}`,
    method: "PATCH",
    body: toUpstreamPayload(parsed.data),
    accessToken,
  });
  if (!res.ok) return res.response;

  const mapped = mapUpstreamResponse(() => mapBracketMatch(res.data));
  if (!mapped.ok) return mapped.response;

  return jsonNoStore(mapped.data);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return unauthorizedResponse();

  const accessToken = await getCallerAccessToken(supabase);
  if (!accessToken) return unauthorizedResponse();

  const { tournamentId, matchId } = await params;
  if (!isValidUuid(tournamentId) || !isValidUuid(matchId)) {
    return jsonNoStore({ error: "Invalid tournamentId or matchId." }, 400);
  }

  const teamCheck = extractValidatedTeamId(req);
  if (!teamCheck.ok) return teamCheck.response;

  const res = await forwardHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/tournaments/${encodeURIComponent(tournamentId.trim())}/matches/${encodeURIComponent(matchId.trim())}`,
    method: "DELETE",
    accessToken,
  });
  if (!res.ok) return res.response;

  return new NextResponse(null, { status: 204, headers: NO_STORE });
}
