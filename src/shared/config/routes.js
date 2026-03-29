export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  passwordResetConfirm: '/password-reset-confirm/:uidb64/:token',
  onboarding: '/onboarding',
  explore: '/explore',
  community: '/community',
  map: '/map',
  profile: '/profile',
  notFound: '/404',
  errorPattern: '/error/:code',
};

/**
 * @param {500 | 502 | 503} code
 * @returns {string}
 */
export function errorPath(code) {
  return `/error/${code}`;
}
