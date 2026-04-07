import { apiClient } from '@/infrastructure/http/api-client';

export const eventsApi = {
  /**
   * @param {Record<string, unknown>} body
   */
  create(body) {
    return apiClient.post('/v1/events/', body);
  },

  /**
   * @param {Record<string, string | number>} [params]
   */
  list(params) {
    return apiClient.get('/v1/events/', { params });
  },

  /**
   * @param {string | number} id
   */
  getById(id) {
    return apiClient.get(`/v1/events/${id}/`);
  },

  /**
   * @param {string | number} id
   * @param {Record<string, unknown>} body
   */
  update(id, body) {
    return apiClient.put(`/v1/events/${id}/`, body);
  },

  /**
   * @param {string | number} id
   */
  remove(id) {
    return apiClient.delete(`/v1/events/${id}/`);
  },

  /**
   * @param {string | number} id
   */
  join(id) {
    return apiClient.post(`/v1/events/${id}/join/`);
  },

  /**
   * @param {string | number} id
   */
  leave(id) {
    return apiClient.delete(`/v1/events/${id}/leave/`);
  },

  /**
   * @param {string | number} id
   */
  participants(id) {
    return apiClient.get(`/v1/events/${id}/participants/`);
  },

  /**
   * Fetch categories, e.g. for searching/recommendations
   * @param {Record<string, string | number>} [params]
   */
  categories(params) {
    return apiClient.get('/v1/categories/', { params });
  },
};
