import { notificationsApi } from '@/infrastructure/notifications/notifications-api';

const FCM_TOKEN_KEY = 'ngumpulyuk.fcmRegistrationToken';

export function getStoredPushDeviceToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(FCM_TOKEN_KEY);
}

export function setStoredPushDeviceToken(token) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(FCM_TOKEN_KEY, token);
  else localStorage.removeItem(FCM_TOKEN_KEY);
}

/**
 * Call after obtaining an FCM registration token (Firebase Web/Android/iOS SDK).
 *
 * @param {string} token
 * @param {'android' | 'ios' | 'web'} [platform]
 */
export async function registerPushDeviceToken(token, platform = 'web') {
  await notificationsApi.registerDevice({ token, platform });
  setStoredPushDeviceToken(token);
}

/**
 * DELETE on backend then clear local token. Safe to call on logout.
 */
export async function unregisterPushDeviceIfAny() {
  const token = getStoredPushDeviceToken();
  if (!token) return;
  try {
    await notificationsApi.unregisterDevice({ token });
  } catch {
    /* still clear local token */
  } finally {
    setStoredPushDeviceToken(null);
  }
}
