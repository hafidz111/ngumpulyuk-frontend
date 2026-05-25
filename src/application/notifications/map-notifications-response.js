import { resolveNotificationLink } from './resolve-notification-link';

/**
 * Normalizes list response from GET /v1/notifications/ (DRF-style or custom envelope).
 *
 * @param {unknown} raw Axios response.data or nested .data
 * @returns {{
 *   items: Array<Record<string, unknown>>;
 *   unreadCount: number;
 *   meta: Record<string, unknown>;
 * }}
 */
export function mapNotificationsListResponse(raw) {
  const root = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
  const envelope = root && typeof root === 'object' ? root : {};

  let items = [];
  if (Array.isArray(envelope)) {
    items = envelope;
  } else if (Array.isArray(envelope.notifications)) {
    items = envelope.notifications;
  } else if (Array.isArray(envelope.results)) {
    items = envelope.results;
  } else if (Array.isArray(envelope.data)) {
    items = envelope.data;
  }

  const unreadRaw =
    envelope.unread_count ?? envelope.unreadCount ?? envelope.unread ?? 0;
  const unreadCount =
    typeof unreadRaw === 'number' && Number.isFinite(unreadRaw)
      ? unreadRaw
      : Number.parseInt(String(unreadRaw), 10) || 0;

  const meta =
    envelope.meta && typeof envelope.meta === 'object'
      ? envelope.meta
      : envelope.pagination && typeof envelope.pagination === 'object'
        ? envelope.pagination
        : {};

  return { items, unreadCount, meta };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {import('@/domain/notifications/entities/notification').Notification | null}
 */
export function mapNotificationRow(row) {
  if (!row || typeof row !== 'object') return null;
  const id = row.id != null ? String(row.id) : '';
  if (!id) return null;
  return {
    id,
    type: String(row.type ?? ''),
    title: String(row.title ?? ''),
    message: String(row.message ?? ''),
    linkUrl: resolveNotificationLink(
      row.link_url != null && row.link_url !== ''
        ? String(row.link_url)
        : row.linkUrl != null && row.linkUrl !== ''
          ? String(row.linkUrl)
          : null,
    ),
    relatedId:
      row.related_id != null && row.related_id !== ''
        ? String(row.related_id)
        : row.relatedId != null && row.relatedId !== ''
          ? String(row.relatedId)
          : null,
    isRead: Boolean(row.is_read ?? row.isRead),
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
  };
}
