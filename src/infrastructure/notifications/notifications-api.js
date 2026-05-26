import { apiClient } from '@/infrastructure/http/api-client';
import { buildNotificationBlastBody } from '@/application/notifications/build-notification-blast-body';

export const notificationsApi = {
  /**
   * @param {Record<string, string | number | boolean | undefined>} [params]
   */
  list(params) {
    return apiClient.get('/v1/notifications/', { params });
  },

  /**
   * @param {string} id
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
   * @param {{
   *   title: string;
   *   message: string;
   *   link_url?: string;
   *   user_ids?: string[];
   *   interests?: string[];
   *   all_users?: boolean;
   *   confirm?: string;
   * }} payload
   */
  blast(payload) {
    return apiClient.post(
      '/v1/notifications/blast/',
      buildNotificationBlastBody(payload),
    );
  },
};
