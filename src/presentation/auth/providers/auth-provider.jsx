import { useCallback, useEffect, useMemo, useState } from 'react';

import { displayNameFromEmail } from '@/shared/lib/user-display-name';
import { authApi } from '@/infrastructure/auth/auth-api';
import { usersApi } from '@/infrastructure/users/users-api';
import {
  clearAllAuthStorage,
  setAccessToken,
  setRefreshToken,
  getAccessToken,
  getRefreshToken,
} from '@/infrastructure/http/token-storage';
import { clearAllChatStorage } from '@/infrastructure/chat/chat-session-storage';
import { unregisterPushDeviceIfAny } from '@/infrastructure/notifications/push-device';
import { AuthContext } from '../context/auth-context';

const USER_KEY = 'ngumpulyuk.user';

function onboardingKeyForEmail(email) {
  if (!email) return null;
  return `ngumpulyuk.onboarded.${email.toLowerCase()}`;
}

function readOnboardedForEmail(email) {
  if (typeof window === 'undefined' || !email) return false;
  const key = onboardingKeyForEmail(email);
  return key ? localStorage.getItem(key) === '1' : false;
}

function loadStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function persistUser(user) {
  if (typeof window === 'undefined' || !user) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function buildUserState({
  userId,
  username,
  email,
  fullName,
  onboardingCompleted,
  isStaff,
}) {
  const id = String(userId ?? '').trim();
  const un = String(username ?? '').trim();
  const e = String(email ?? '').trim();
  const fn = String(fullName ?? '').trim();
  const displayName = fn || displayNameFromEmail(e);
  const isOnboarded =
    typeof onboardingCompleted === 'boolean'
      ? onboardingCompleted
      : readOnboardedForEmail(e);
  return {
    id,
    username: un,
    email: e,
    fullName: fn,
    displayName,
    isOnboarded,
    isStaff: Boolean(isStaff),
  };
}

function extractPayload(payload) {
  return payload?.data ?? payload;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getAccessToken()),
  );
  const [user, setUser] = useState(() => {
    const token = getAccessToken();
    if (!token) return null;
    return (
      loadStoredUser() ?? {
        id: '',
        username: '',
        email: '',
        fullName: '',
        displayName: 'Pengguna',
        isOnboarded: false,
        isStaff: false,
      }
    );
  });

  const hydrateUserProfile = useCallback(async () => {
    try {
      const res = await usersApi.getMe();
      const data = extractPayload(res.data);
      if (!data || typeof data !== 'object') return;
      setUser((current) => {
        if (!current) return current;
        const next = {
          ...current,
          id: String(data.id ?? current.id ?? '').trim(),
          username: String(data.username ?? current.username ?? '').trim(),
          email: String(data.email ?? current.email ?? '').trim(),
          fullName: String(data.full_name ?? current.fullName ?? '').trim(),
          displayName:
            String(data.full_name ?? '').trim() ||
            current.displayName ||
            displayNameFromEmail(String(data.email ?? current.email ?? '').trim()),
          isOnboarded:
            typeof data.onboarding_completed === 'boolean'
              ? data.onboarding_completed
              : current.isOnboarded,
          isStaff:
            typeof data.is_staff === 'boolean'
              ? data.is_staff
              : typeof data.is_superuser === 'boolean'
                ? data.is_superuser
                : current.isStaff,
        };
        persistUser(next);
        return next;
      });
    } catch {
      // Ignore hydration errors, auth session still valid.
    }
  }, []);

  /**
   * Sets session after successful login (or verify-email if API returns tokens).
   * @param {{
   *   access: string | null;
   *   refresh?: string | null;
   *   userId?: string;
   *   username?: string;
   *   email: string;
   *   fullName?: string;
   *   onboardingCompleted?: boolean | null;
   *   isStaff?: boolean | null;
   * }} payload
   */
  const setSession = useCallback((payload) => {
    const {
      access,
      refresh,
      userId,
      username,
      email,
      fullName,
      onboardingCompleted,
      isStaff,
    } = payload;
    if (access) setAccessToken(access);
    if (refresh !== undefined && refresh !== null) setRefreshToken(refresh);
    const e = String(email ?? '').trim();
    const key = onboardingKeyForEmail(e);
    if (typeof onboardingCompleted === 'boolean' && key) {
      if (onboardingCompleted) {
        localStorage.setItem(key, '1');
      } else {
        localStorage.removeItem(key);
      }
    }
    const next = buildUserState({
      userId,
      username,
      email,
      fullName,
      onboardingCompleted,
      isStaff,
    });
    persistUser(next);
    setUser(next);
    setIsAuthenticated(true);
    void hydrateUserProfile();
  }, [hydrateUserProfile]);

  const completeOnboarding = useCallback(() => {
    setUser((current) => {
      if (!current) return current;
      if (current.email) {
        const key = onboardingKeyForEmail(current.email);
        if (key) localStorage.setItem(key, '1');
      }
      const updated = { ...current, isOnboarded: true };
      persistUser(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.id && user.username) return;
    void hydrateUserProfile();
  }, [isAuthenticated, user, hydrateUserProfile]);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout({ refresh_token: refreshToken });
      }
    } catch {
      /* tetap bersihkan sesi lokal */
    } finally {
      try {
        await unregisterPushDeviceIfAny();
      } catch {
        /* ignore */
      }
      clearAllAuthStorage();
      clearAllChatStorage();
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      setSession,
      logout,
      completeOnboarding,
    }),
    [isAuthenticated, user, setSession, logout, completeOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
