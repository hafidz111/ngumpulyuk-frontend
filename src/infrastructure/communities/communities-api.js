import { apiClient } from '@/infrastructure/http/api-client';

export const communitiesApi = {
  /**
   * List communities
   * @param {Record<string, string | number>} [params] — search, category, verified, limit, offset
   */
  list(params) {
    return apiClient.get('/v1/communities/', { params });
  },

  /**
   * Create a new community
   * @param {Record<string, unknown>} body — name, description, category, cover_image, logo
   */
  create(body) {
    return apiClient.post('/v1/communities/', body);
  },

  /**
   * Get community detail
   * @param {string} id
   */
  getById(id) {
    return apiClient.get(`/v1/communities/${id}/`);
  },

  /**
   * Join a community
   * @param {string} id
   */
  join(id) {
    return apiClient.post(`/v1/communities/${id}/join/`);
  },

  /**
   * Leave a community
   * @param {string} id
   */
  leave(id) {
    return apiClient.delete(`/v1/communities/${id}/leave/`);
  },

  /**
   * List community members
   * @param {string} id
   * @param {Record<string, string | number>} [params] — limit, offset, role
   */
  members(id, params) {
    return apiClient.get(`/v1/communities/${id}/members/`, { params });
  },

  /**
   * List community threads
   * @param {string} id
   * @param {Record<string, string | number>} [params] — limit, offset, sort
   */
  threads(id, params) {
    return apiClient.get(`/v1/communities/${id}/threads/`, { params });
  },

  /**
   * Create a thread in a community
   * @param {string} id
   * @param {Record<string, unknown>} body — content, related_event_id?
   */
  createThread(id, body) {
    return apiClient.post(`/v1/communities/${id}/threads/`, body);
  },

  /**
   * Promote member (stub — endpoint TBD on backend)
   * @param {string} communityId
   * @param {string} memberId
   * @param {string} role
   */
  promoteMember(communityId, memberId, role = 'admin') {
    return apiClient.patch(`/v1/communities/${communityId}/members/${memberId}/`, { role });
  },
};
