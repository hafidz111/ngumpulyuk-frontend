import { apiClient } from '@/infrastructure/http/api-client';

export const landingApi = {
  getPublic() {
    return apiClient.get('/v1/public/landing/');
  },
};
