import { apiClient } from '@/infrastructure/http/api-client';

/**
 * Ngumpsky — AI assistant chat.
 * Base URL: VITE_API_BASE_URL (e.g. http://host/api) → /v1/chat/
 */
export const chatApi = {
  /**
   * @param {{ message: string; session_id?: string }} body
   */
  sendMessage(body) {
    return apiClient.post('/v1/chat/', body);
  },

  /**
   * @param {{ trace_id: string; helpful: boolean }} body
   */
  sendFeedback(body) {
    return apiClient.post('/v1/chat/feedback/', body);
  },

  /**
   * @param {Record<string, string | number | boolean>} [params]
   */
  adminLogs(params) {
    return apiClient.get('/v1/admin/chat/logs/', { params });
  },

  /**
   * @param {{ delete_all?: boolean; ids?: string[] } | undefined} body
   * @param {Record<string, string | number | boolean> | undefined} params
   */
  deleteAdminLogs(body, params) {
    return apiClient.delete('/v1/admin/chat/logs/', { data: body, params });
  },

  /**
   * @param {Record<string, string | number | boolean>} [params]
   */
  adminCorrections(params) {
    return apiClient.get('/v1/admin/chat/corrections/', { params });
  },

  adminTemplates() {
    return apiClient.get('/v1/admin/chat/templates/');
  },

  /**
   * @param {Record<string, unknown>} body
   */
  createCorrection(body) {
    return apiClient.post('/v1/admin/chat/corrections/', body);
  },

  /**
   * @param {string} correctionId
   * @param {Record<string, unknown>} body
   */
  patchCorrection(correctionId, body) {
    return apiClient.patch(`/v1/admin/chat/corrections/${correctionId}/`, body);
  },
};
