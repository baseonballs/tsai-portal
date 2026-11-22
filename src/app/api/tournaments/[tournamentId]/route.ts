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
import { mapTournamentDetail, toUpstreamPayload } from "@/lib/tournament/b8-mappers";
import { createClient } from "@/utils/supabase/server";

type Params = { params: Promise<{ tournamentId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return unauthorizedResponse();

  const accessToken = await getCallerAccessToken(supabase);
  if (!accessToken) return unauthorizedResponse();

  const { tournamentId } = await params;
  if (!isValidUuid(tournamentId)) return jsonNoStore({ error: "Invalid tournamentId." }, 400);

  const teamCheck = extractValidatedTeamId(req);
  if (!teamCheck.ok) return teamCheck.response;

  const res = await forwardHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/tournaments/${encodeURIComponent(tournamentId.trim())}`,
    accessToken,
  });
  if (!res.ok) return res.response;

  const mapped = mapUpstreamResponse(() => mapTournamentDetail(res.data));
  if (!mapped.ok) return mapped.response;

  return jsonNoStore(mapped.data);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return unauthorizedResponse();

  const accessToken = await getCallerAccessToken(supabase);
  if (!accessToken) return unauthorizedResponse();

  const { tournamentId } = await params;
  if (!isValidUuid(tournamentId)) return jsonNoStore({ error: "Invalid tournamentId." }, 400);

  const parsed = await readJsonObject(req);
  if (!parsed.ok) return parsed.response;

  const teamCheck = extractValidatedTeamId(req, parsed.data);
  if (!teamCheck.ok) return teamCheck.response;

  const res = await forwardHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/tournaments/${encodeURIComponent(tournamentId.trim())}`,
    method: "PATCH",
    body: toUpstreamPayload(parsed.data),
    accessToken,
  });
  if (!res.ok) return res.response;

  const mapped = mapUpstreamResponse(() => mapTournamentDetail(res.data));
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

  const { tournamentId } = await params;
  if (!isValidUuid(tournamentId)) return jsonNoStore({ error: "Invalid tournamentId." }, 400);

  const teamCheck = extractValidatedTeamId(req);
  if (!teamCheck.ok) return teamCheck.response;

  const res = await forwardHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/tournaments/${encodeURIComponent(tournamentId.trim())}`,
    method: "DELETE",
    accessToken,
  });
  if (!res.ok) return res.response;

  return new NextResponse(null, { status: 204, headers: NO_STORE });
}
