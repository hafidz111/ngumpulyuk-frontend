import { ROUTES } from '@/shared/config/routes';

/**
 * @param {string | null | undefined} linkUrl
 * @returns {string | null}
 */
export function resolveNotificationLink(linkUrl) {
  const trimmed = String(linkUrl ?? '').trim();
  if (!trimmed) return null;

  const communitiesMatch = trimmed.match(/^\/communities\/([^/?#]+)/);
  if (communitiesMatch) {
    return ROUTES.communityDetail.replace(':id', communitiesMatch[1]);
  }

  return trimmed;
}
