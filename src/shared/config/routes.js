export const ROUTES = {
  home: '/',
  chat: '/chat',
  feed: '/home',
  maintenance: '/maintenance',
  login: '/login',
  register: '/register',
  terms: '/syarat-ketentuan',
  privacy: '/kebijakan-privasi',
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
  threadDetail: '/threads/:id',
  map: '/map',
  profile: '/profile',
  profileByUsername: '/profile/:username',
  notifications: '/notifications',
  notificationsBlast: '/notifications/blast',
  adminChatMonitoring: '/admin/chat-monitoring',
  adminChatCorrections: '/admin/chat-corrections',
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
