import axios from 'axios';

import { saveReturnPathBeforeOutage } from '@/infrastructure/http/health-check';
import { API_BASE_URL } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import {
  clearAllAuthStorage,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from '@/infrastructure/http/token-storage';

const REQUEST_TIMEOUT_MS = 30_000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

function isAuthRoute(url) {
  return /\/auth\//.test(String(url ?? ''));
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = String(originalRequest.url ?? '');
    const isLogoutRequest = url.includes('/auth/logout');
    const isRefreshRequest = url.includes('/auth/refresh');

    if (!error.response) {
      if (!isAuthRoute(url)) {
        redirectToMaintenance();
      }
      return Promise.reject(error);
    }

    if (status === 502 || status === 503) {
      if (!isAuthRoute(url)) {
        redirectToMaintenance();
      }
      return Promise.reject(error);
    }

    if (status >= 500) {
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/error/')
      ) {
        saveReturnPathBeforeOutage();
        window.location.assign(`/error/${status}`);
      }
      return Promise.reject(error);
    }

    if (status === 401 && isRefreshRequest) {
      clearAllAuthStorage();
      forceLoginRedirect();
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry && !isLogoutRequest) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAllAuthStorage();
        forceLoginRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/v1/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccess = data.access || data.access_token || data.token;
        if (newAccess) {
          setAccessToken(newAccess);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          processQueue(null, newAccess);
          return apiClient(originalRequest);
        } else {
          throw new Error('No access token returned');
        }
      } catch (err) {
        processQueue(err, null);
        clearAllAuthStorage();
        forceLoginRedirect();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

function forceLoginRedirect() {
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

function redirectToMaintenance() {
  if (typeof window === 'undefined') return;

  if (window.location.pathname !== ROUTES.maintenance) {
    saveReturnPathBeforeOutage();
    window.location.assign(`${window.location.origin}${ROUTES.maintenance}`);
  }
}
