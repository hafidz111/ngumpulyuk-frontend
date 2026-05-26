import { API_BASE_URL } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';

const DEFAULT_TIMEOUT_MS = 12_000;

export function getApiOrigin() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
}

export function getHealthLivenessUrl() {
  return `${getApiOrigin()}/health/`;
}

export function getHealthReadinessUrl() {
  return `${getApiOrigin()}/health/ready/`;
}

export async function checkBackendReady({
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const url = getHealthReadinessUrl();
  if (!url || url === '/health/ready/') return false;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

export const RETURN_AFTER_OUTAGE_KEY = 'ngumpulyuk.returnAfterOutage';

export function saveReturnPathBeforeOutage() {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  const search = window.location.search || '';
  if (path === ROUTES.maintenance || path.startsWith('/error/')) return;
  sessionStorage.setItem(RETURN_AFTER_OUTAGE_KEY, `${path}${search}`);
}

export function consumeReturnPathAfterOutage() {
  if (typeof window === 'undefined') return ROUTES.home;
  const stored = sessionStorage.getItem(RETURN_AFTER_OUTAGE_KEY);
  sessionStorage.removeItem(RETURN_AFTER_OUTAGE_KEY);
  if (
    !stored ||
    stored === ROUTES.maintenance ||
    stored.startsWith('/error/')
  ) {
    return ROUTES.home;
  }
  return stored;
}
