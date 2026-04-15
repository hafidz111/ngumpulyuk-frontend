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
   * Delete community
   * @param {string} id
   */
  remove(id) {
    return apiClient.delete(`/v1/communities/${id}/`);
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
   * @param {Record<string, unknown>} body — title, content, images, related_event_id?
   */
  createThread(id, body) {
    return apiClient.post(`/v1/communities/${id}/threads/`, body);
  },

  /**
   * Update member role in a community
   * @param {string | number} communityId
   * @param {string | number} userId
   * @param {string} role
   */
  updateMemberRole(communityId, userId, role = 'admin') {
    return apiClient.patch(`/v1/communities/${communityId}/members/${userId}/role/`, { role });
  },

  /**
   * Backward-compatible alias for update member role
   * @param {string | number} communityId
   * @param {string | number} userId
   * @param {string} role
   */
  promoteMember(communityId, userId, role = 'admin') {
    return this.updateMemberRole(communityId, userId, role);
  },

  /**
   * Remove thread
   * @param {string | number} threadId
   */
  removeThread(threadId) {
    return apiClient.delete(`/v1/threads/${threadId}/`);
  },

  /**
   * Global thread feed
   * @param {Record<string, string | number>} [params]
   */
  threadFeed(params) {
    return apiClient.get('/v1/threads/feed/', { params });
  },

  /**
   * Like a thread
   * @param {string | number} threadId
   */
  likeThread(threadId) {
    return apiClient.post(`/v1/threads/${threadId}/like/`);
  },

  /**
   * Unlike a thread
   * @param {string | number} threadId
   */
  unlikeThread(threadId) {
    return apiClient.delete(`/v1/threads/${threadId}/like/`);
  },

  /**
   * List comments for a thread
   * @param {string | number} threadId
   * @param {Record<string, string | number>} [params]
   */
  threadComments(threadId, params) {
    return apiClient.get(`/v1/threads/${threadId}/comments/`, { params });
  },

  /**
   * Add comment to a thread
   * @param {string | number} threadId
   * @param {Record<string, unknown>} body
   */
  createThreadComment(threadId, body) {
    return apiClient.post(`/v1/threads/${threadId}/comments/`, body);
  },

  /**
   * Like a comment
   * @param {string | number} commentId
   */
  likeComment(commentId) {
    return apiClient.post(`/v1/comments/${commentId}/like/`);
  },
};
