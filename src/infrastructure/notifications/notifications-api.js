import { apiClient } from '@/infrastructure/http/api-client';
import { buildNotificationBlastBody } from '@/application/notifications/build-notification-blast-body';

/**
 * In-app notifications + device tokens (FCM).
 * Auth: Bearer access token (api-client); refresh via POST /v1/auth/refresh/ on 401.
 */
export const notificationsApi = {
  /**
   * @param {Record<string, string | number | boolean | undefined>} [params] is_read, type, limit, offset
   */
  list(params) {
    return apiClient.get('/v1/notifications/', { params });
  },

  /**
   * @param {string} id Notification UUID
   */
  markRead(id) {
    return apiClient.put(`/v1/notifications/${id}/read/`);
  },

  readAll() {
    return apiClient.put('/v1/notifications/read-all/');
  },

  /**
   * @param {{ token: string; platform: 'android' | 'ios' | 'web' }} body
   */
  registerDevice(body) {
    return apiClient.post('/v1/notifications/devices/', body);
  },

  /**
   * @param {{ token: string }} body
   */
  unregisterDevice(body) {
    return apiClient.delete('/v1/notifications/devices/', { data: body });
  },

  /**
   * Admin/staff-only endpoint.
   * - Specific users: { title, message, link_url?, user_ids: string[] }
   * - All active users: { title, message, link_url?, all_users: true, confirm: 'BLAST_ALL_USERS' }
   *
   * @param {{
   *   title: string;
   *   message: string;
   *   link_url?: string;
   *   user_ids?: string[];
   *   all_users?: boolean;
   *   confirm?: string;
   * }} payload
   */
  blast(payload) {
    return apiClient.post('/v1/notifications/blast/', buildNotificationBlastBody(payload));
  },
};
