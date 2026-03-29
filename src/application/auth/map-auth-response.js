/**
 * @param {Record<string, unknown>} data
 * @returns {{ access: string | null; refresh: string | null; email: string; fullName: string }}
 */
export function mapLoginResponse(data) {
  const access =
    /** @type {string | undefined} */ (data.access) ??
    /** @type {string | undefined} */ (data.token) ??
    /** @type {string | undefined} */ (data.access_token) ??
    null;

  const refresh =
    /** @type {string | undefined} */ (data.refresh) ??
    /** @type {string | undefined} */ (data.refresh_token) ??
    null;

  const userObj =
    data.user && typeof data.user === 'object'
      ? /** @type {Record<string, unknown>} */ (data.user)
      : null;

  const email = String(userObj?.email ?? data.email ?? '').trim();

  const fullName = String(userObj?.full_name ?? data.full_name ?? '').trim();

  return { access, refresh, email, fullName };
}
