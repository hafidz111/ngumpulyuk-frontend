import { apiClient } from '@/infrastructure/http/api-client';

export const usersApi = {
  /**
   * @param {Record<string, unknown>} body
   */
  completeOnboarding(body) {
    return apiClient.post('/v1/users/onboarding/', body);
  },
};
