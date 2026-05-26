import { apiClient } from '@/infrastructure/http/api-client';

export const communitiesApi = {
  /**
   * @param {Record<string, string | number>} [params]
   */
  list(params) {
    return apiClient.get('/v1/communities/', { params });
  },

  /**
   * @param {Record<string, unknown>} body
   */
  create(body) {
    return apiClient.post('/v1/communities/', body);
  },

  /**
   * @param {string} id
   */
  getById(id) {
    return apiClient.get(`/v1/communities/${id}/`);
  },

  /**
   * @param {string} id
   */
  remove(id) {
    return apiClient.delete(`/v1/communities/${id}/`);
  },

  /**
   * @param {string} id
   */
  join(id) {
    return apiClient.post(`/v1/communities/${id}/join/`);
  },

  /**
   * @param {string} id
   */
  leave(id) {
    return apiClient.delete(`/v1/communities/${id}/leave/`);
  },

  /**
   * @param {string} id
   * @param {Record<string, string | number>} [params]
   */
  members(id, params) {
    return apiClient.get(`/v1/communities/${id}/members/`, { params });
  },

  /**
   * @param {string} id
   * @param {Record<string, string | number>} [params]
   */
  threads(id, params) {
    return apiClient.get(`/v1/communities/${id}/threads/`, { params });
  },

  /**
   * @param {string} id
   * @param {Record<string, unknown>} body
   */
  createThread(id, body) {
    return apiClient.post(`/v1/communities/${id}/threads/`, body);
  },

  /**
   * @param {Record<string, unknown>} body
   */
  createGlobalThread(body) {
    return apiClient.post('/v1/threads/', body);
  },

  /**
   * @param {string | number} communityId
   * @param {string | number} userId
   * @param {string} role
   */
  updateMemberRole(communityId, userId, role = 'admin') {
    return apiClient.patch(
      `/v1/communities/${communityId}/members/${userId}/role/`,
      { role },
    );
  },

  /**
   * @param {string | number} communityId
   * @param {string | number} userId
   * @param {string} role
   */
  promoteMember(communityId, userId, role = 'admin') {
    return this.updateMemberRole(communityId, userId, role);
  },

  /**
   * @param {string | number} threadId
   */
  removeThread(threadId) {
    return apiClient.delete(`/v1/threads/${threadId}/`);
  },

  /**
   * @param {Record<string, string | number>} [params]
   */
  threadFeed(params) {
    return apiClient.get('/v1/threads/feed/', { params });
  },

  /**
   * @param {string | number} threadId
   */
  getThreadById(threadId) {
    return apiClient.get(`/v1/threads/${threadId}/`);
  },

  /**
   * @param {string | number} threadId
   */
  likeThread(threadId) {
    return apiClient.post(`/v1/threads/${threadId}/like/`);
  },

  /**
   * @param {string | number} threadId
   */
  unlikeThread(threadId) {
    return apiClient.delete(`/v1/threads/${threadId}/like/`);
  },

  /**
   * @param {string | number} threadId
   * @param {Record<string, string | number>} [params]
   */
  threadComments(threadId, params) {
    return apiClient.get(`/v1/threads/${threadId}/comments/`, { params });
  },

  /**
   * @param {string | number} threadId
   * @param {Record<string, unknown>} body
   */
  createThreadComment(threadId, body) {
    return apiClient.post(`/v1/threads/${threadId}/comments/`, body);
  },

  /**
   * @param {string | number} commentId
   */
  likeComment(commentId) {
    return apiClient.post(`/v1/comments/${commentId}/like/`);
  },
};
