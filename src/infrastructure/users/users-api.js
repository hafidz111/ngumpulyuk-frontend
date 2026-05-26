import { apiClient } from '@/infrastructure/http/api-client';

export const usersApi = {
  /**
   * @param {Record<string, unknown>} body
   */
  completeOnboarding(body) {
    return apiClient.post('/v1/users/onboarding/', body);
  },

  /**
   * @param {string} username
   */
  getPublicByUsername(username) {
    return apiClient.get(`/v1/users/${username}/`);
  },

  getMe() {
    return apiClient.get('/v1/users/me/');
  },

  /**
   * @param {Record<string, string | number>} [params]
   */
  search(params) {
    return apiClient.get('/v1/users/', { params });
  },

  interests() {
    return apiClient.get('/v1/users/interests/');
  },

  /**
   * @param {Record<string, unknown>} body
   */
  updateMe(body) {
    return apiClient.put('/v1/users/me/', body);
  },

  /**
   * @param {Record<string, string | number>} [params]
   */
  activityHistory(params) {
    return apiClient.get('/v1/users/me/activity-history/', { params });
  },

  joinedEventIds() {
    return apiClient.get('/v1/users/me/joined-events/ids');
  },

  participationSummary() {
    return apiClient.get('/v1/users/me/participation-summary/');
  },
};
