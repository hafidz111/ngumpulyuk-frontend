const ACCESS = 'ngumpulyuk.accessToken';
const REFRESH = 'ngumpulyuk.refreshToken';
const USER = 'ngumpulyuk.user';

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS);
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH);
}

export function setAccessToken(token) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(ACCESS, token);
  else localStorage.removeItem(ACCESS);
}

export function setRefreshToken(token) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(REFRESH, token);
  else localStorage.removeItem(REFRESH);
}

export function clearTokenStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}

export function clearUserRecord() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER);
}

export function clearAllAuthStorage() {
  clearTokenStorage();
  clearUserRecord();
}
