/**
 * Normalizes login/register payloads: supports flat DRF responses and `{ data: { ... } }` wrappers.
 * @param {Record<string, unknown>} data
 * @returns {{
 *   access: string | null;
 *   refresh: string | null;
 *   userId: string;
 *   username: string;
 *   email: string;
 *   fullName: string;
 *   onboardingCompleted: boolean | null;
 * }}
 */
export function mapLoginResponse(data) {
  const root =
    data &&
    typeof data === 'object' &&
    'data' in data &&
    data.data &&
    typeof data.data === 'object'
      ? /** @type {Record<string, unknown>} */ (data.data)
      : data;

  const access =
    /** @type {string | undefined} */ (root.access) ??
    /** @type {string | undefined} */ (root.token) ??
    /** @type {string | undefined} */ (root.access_token) ??
    null;

  const refresh =
    /** @type {string | undefined} */ (root.refresh) ??
    /** @type {string | undefined} */ (root.refresh_token) ??
    null;

  const userObj =
    root.user && typeof root.user === 'object'
      ? /** @type {Record<string, unknown>} */ (root.user)
      : null;

  const userId = String(userObj?.id ?? root.user_id ?? root.id ?? '').trim();
  const username = String(userObj?.username ?? root.username ?? '').trim();
  const email = String(userObj?.email ?? root.email ?? '').trim();

  const fullName = String(userObj?.full_name ?? root.full_name ?? '').trim();

  let onboardingCompleted = null;
  if (typeof userObj?.onboarding_completed === 'boolean') {
    onboardingCompleted = userObj.onboarding_completed;
  } else if (typeof root.onboarding_completed === 'boolean') {
    onboardingCompleted = root.onboarding_completed;
  }

  return {
    access,
    refresh,
    userId,
    username,
    email,
    fullName,
    onboardingCompleted,
  };
}
