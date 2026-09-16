/** Hidden admin gate – secrets from env in production */

export const ADMIN_SEARCH_KEY =
  process.env.ADMIN_SEARCH_KEY?.trim() || "13/4/2024";

export const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD?.trim() || "27/12/2006";

export const ADMIN_COOKIE = "bm_admin_session";

export function isAdminSearchQuery(q: string): boolean {
  return q.trim() === ADMIN_SEARCH_KEY;
}
