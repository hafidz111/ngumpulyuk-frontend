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

/**
 * Pakai endpoint API publik — path `/health/` sering diblokir ad blocker (ERR_BLOCKED_BY_CLIENT).
 */
export function getHealthReadinessUrl() {
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}/v1/public/ping/`;
}

export async function checkBackendReady({
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const url = getHealthReadinessUrl();
  if (!url || !url.includes('/v1/public/ping')) return false;

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

/** Halaman yang tetap bisa diakses saat backend down (landing = marketing statis). */
export function isOutageRedirectExemptPath(pathname) {
  return (
    pathname === ROUTES.home ||
    pathname === ROUTES.maintenance ||
    pathname.startsWith('/error/')
  );
}

export function saveReturnPathBeforeOutage() {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  const search = window.location.search || '';
  if (isOutageRedirectExemptPath(path)) return;
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
