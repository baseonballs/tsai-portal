import {
  forwardHockeyApi,
  getCallerAccessToken,
  jsonNoStore,
  unauthorizedResponse,
} from "@/lib/hockey-api";
import { mapTeamOption } from "@/lib/tournament/b8-mappers";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return unauthorizedResponse();

  const accessToken = await getCallerAccessToken(supabase);
  if (!accessToken) return unauthorizedResponse();

  const res = await forwardHockeyApi({ path: "/teams/mine", accessToken });
  if (!res.ok) return res.response;

  const list = Array.isArray(res.data) ? res.data.map(mapTeamOption) : [];
  return jsonNoStore({ teams: list });
}
