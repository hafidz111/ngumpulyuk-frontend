import { normalizeInterestForBlastPayload } from '@/application/users/normalize-interest-for-blast-payload';

const BLAST_CONFIRMATION = 'BLAST_ALL_USERS';

/**
 * @param {unknown} input
 * @returns {Record<string, unknown>}
 */
export function buildNotificationBlastBody(input) {
  const payload = input && typeof input === 'object' ? input : {};
  const title = String(payload.title ?? '').trim();
  const message = String(payload.message ?? '').trim();
  const linkUrl = String(payload.link_url ?? '').trim();
  const allUsers = Boolean(payload.all_users);
  const rawUserIds = Array.isArray(payload.user_ids) ? payload.user_ids : [];
  const userIds = rawUserIds
    .map((id) => String(id ?? '').trim())
    .filter(Boolean);
  const rawInterests = Array.isArray(payload.interests) ? payload.interests : [];
  const interests = [
    ...new Set(
      rawInterests
        .map((id) => normalizeInterestForBlastPayload(id))
        .filter(Boolean),
    ),
  ];

  const body = {
    title,
    message,
  };

  if (linkUrl) {
    body.link_url = linkUrl;
  }

  if (allUsers) {
    body.all_users = true;
    body.confirm =
      String(payload.confirm ?? '').trim() || BLAST_CONFIRMATION;
    return body;
  }

  if (interests.length > 0) {
    body.interests = interests;
    return body;
  }

  body.user_ids = userIds;
  return body;
}

export { BLAST_CONFIRMATION };
