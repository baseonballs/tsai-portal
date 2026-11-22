import { NextRequest, NextResponse } from "next/server";

import {
  extractValidatedTeamId,
  forwardHockeyApi,
  getCallerAccessToken,
  isValidUuid,
  jsonNoStore,
  NO_STORE,
  readJsonObject,
  unauthorizedResponse,
} from "@/lib/hockey-api";
import { mapTournamentSheet, toUpstreamPayload } from "@/lib/tournament/b8-mappers";
import { createClient } from "@/utils/supabase/server";

type Params = { params: Promise<{ tournamentId: string; sheetId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return unauthorizedResponse();

  const accessToken = await getCallerAccessToken(supabase);
  if (!accessToken) return unauthorizedResponse();

  const { tournamentId, sheetId } = await params;
  if (!isValidUuid(tournamentId) || !isValidUuid(sheetId)) {
    return jsonNoStore({ error: "Invalid tournamentId or sheetId." }, 422);
  }

  const parsed = await readJsonObject(req);
  if (!parsed.ok) return parsed.response;

  const teamCheck = extractValidatedTeamId(req, parsed.data);
  if (!teamCheck.ok) return teamCheck.response;

  const res = await forwardHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/tournaments/${encodeURIComponent(tournamentId.trim())}/sheets/${encodeURIComponent(sheetId.trim())}`,
    method: "PATCH",
    body: toUpstreamPayload(parsed.data),
    accessToken,
  });
  if (!res.ok) return res.response;

  return jsonNoStore(mapTournamentSheet(res.data));
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

  const { tournamentId, sheetId } = await params;
  if (!isValidUuid(tournamentId) || !isValidUuid(sheetId)) {
    return jsonNoStore({ error: "Invalid tournamentId or sheetId." }, 422);
  }

  const teamCheck = extractValidatedTeamId(req);
  if (!teamCheck.ok) return teamCheck.response;

  const res = await forwardHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/tournaments/${encodeURIComponent(tournamentId.trim())}/sheets/${encodeURIComponent(sheetId.trim())}`,
    method: "DELETE",
    accessToken,
  });
  if (!res.ok) return res.response;

  return new NextResponse(null, { status: 204, headers: NO_STORE });
}
