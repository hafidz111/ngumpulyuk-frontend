import { apiClient } from '@/infrastructure/http/api-client';

export const recommendationsApi = {
  /**
   * @param {{ limit?: number }} [params]
   */
  events(params) {
    return apiClient.get('/v1/recommendations/events/', { params });
  },

  refresh() {
    return apiClient.post('/v1/recommendations/refresh/');
  },

  /**
   * @param {{
   *   event_id: string;
   *   signal_type: 'view' | 'like' | 'join' | 'save' | 'share' | 'dislike';
   *   dwell_ms?: number;
   *   platform?: 'web' | 'android' | 'ios';
   *   source?: string;
   * }} body
   */
  signal(body) {
    return apiClient.post('/v1/recommendations/signals/', body);
  },
};
