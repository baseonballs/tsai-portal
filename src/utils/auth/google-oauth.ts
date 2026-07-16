export function googleOAuthQueryParams(origin?: string): Record<string, string> {
  const params: Record<string, string> = { prompt: "select_account" };

  if (!origin) {
    return params;
  }

  try {
    const url = new URL(origin);
    const host =
      url.hostname === "0.0.0.0" || url.hostname === "127.0.0.1" ? "localhost" : url.hostname;
    const port = url.port || (url.protocol === "https:" ? "443" : "80");
    const portSuffix =
      (url.protocol === "http" && port === "80") || (url.protocol === "https" && port === "443")
        ? ""
        : `:${port}`;
    params.redirect_uri = `${url.protocol}//${host}${portSuffix}/supabase/auth/v1/callback`;
  } catch {
    /* ignore malformed origin */
  }

  return params;
}
