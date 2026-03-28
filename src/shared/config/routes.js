/** Central route paths — import from here to avoid magic strings. */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  onboarding: '/onboarding',
  explore: '/explore',
  community: '/community',
  map: '/map',
  profile: '/profile',
  /** Halaman 404 eksplisit (bisa dipakai dari redirect). */
  notFound: '/404',
  /** Halaman error server (500, 502, 503) — gunakan `errorPath(code)`. */
  errorPattern: '/error/:code',
};

/**
 * @param {500 | 502 | 503} code
 * @returns {string}
 */
export function errorPath(code) {
  return `/error/${code}`;
}
