export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  passwordResetConfirm: '/password-reset-confirm/:uidb64/:token',
  onboarding: '/onboarding',
  explore: '/explore',
  events: '/events',
  eventCreate: '/events/create',
  eventDetail: '/events/:id',
  eventEdit: '/events/:id/edit',
  community: '/community',
  communityCreate: '/community/create',
  communityDetail: '/community/:id',
  map: '/map',
  profile: '/profile',
  profileByUsername: '/profile/:username',
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
