import { apiClient } from '@/infrastructure/http/api-client';

export const authApi = {
  /**
   * @param {{ email: string; full_name: string; password: string; password_confirm: string }} body
   */
  register(body) {
    return apiClient.post('/v1/auth/register/', body);
  },

  /**
   * @param {{ otp: string }} body
   */
  verifyEmail(body) {
    return apiClient.post('/v1/auth/verify-email/', body);
  },

  /**
   * @param {{ email: string; password: string }} body
   */
  login(body) {
    return apiClient.post('/v1/auth/login/', body);
  },

  /**
   * @param {{ email: string }} body
   */
  requestPasswordReset(body) {
    return apiClient.post('/v1/auth/password-reset/', body);
  },

  /**
   * @param {{ password: string; confirm_password: string; uidb64: string; token: string }} body
   */
  setNewPassword(body) {
    return apiClient.patch('/v1/auth/set-new-password/', body);
  },

  /**
   * @param {{ refresh_token: string }} body
   */
  logout(body) {
    return apiClient.post('/v1/auth/logout/', body);
  },

  /**
   * @param {Record<string, unknown>} body
   */
  google(body) {
    return apiClient.post('/v1/auth/google/', body);
  },

  /**
   * @param {{ email: string }} body
   */
  resendVerification(body) {
    return apiClient.post('/v1/auth/resend-verification/', body);
  },
};
