import axios from 'axios';

import { API_BASE_URL } from '@/shared/config/env';
import {
  clearAllAuthStorage,
  getAccessToken,
} from '@/infrastructure/http/token-storage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const hadAuth = Boolean(error.config?.headers?.Authorization);
    const url = String(error.config?.url ?? '');
    const isLogoutRequest = url.includes('/auth/logout');
    if (status === 401 && hadAuth && !isLogoutRequest) {
      clearAllAuthStorage();
      const loginPath = '/login';
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith(loginPath)
      ) {
        window.location.assign(
          `${window.location.origin}${loginPath}?session=expired`,
        );
      }
    }
    return Promise.reject(error);
  },
);
