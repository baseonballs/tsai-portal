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
import { mapTournamentSheet, toUpstreamPayload } from "@/lib/tournament/b8-mappers";
import { createClient } from "@/utils/supabase/server";

type Params = { params: Promise<{ tournamentId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
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
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/tournaments/${encodeURIComponent(tournamentId.trim())}/sheets`,
    method: "POST",
    body: toUpstreamPayload(parsed.data),
    accessToken,
  });
  if (!res.ok) return res.response;

  const mapped = mapUpstreamResponse(() => mapTournamentSheet(res.data));
  if (!mapped.ok) return mapped.response;

  return jsonNoStore(mapped.data, res.status === 201 ? 201 : 200);
}
