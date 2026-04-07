import { useCallback, useEffect, useMemo, useState } from 'react';

import { displayNameFromEmail } from '@/shared/lib/user-display-name';
import { authApi } from '@/infrastructure/auth/auth-api';
import {
  clearAllAuthStorage,
  setAccessToken,
  setRefreshToken,
  getAccessToken,
  getRefreshToken,
} from '@/infrastructure/http/token-storage';
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

function buildUserState({ email, fullName, onboardingCompleted }) {
  const e = String(email ?? '').trim();
  const fn = String(fullName ?? '').trim();
  const displayName = fn || displayNameFromEmail(e);
  const isOnboarded =
    typeof onboardingCompleted === 'boolean'
      ? onboardingCompleted
      : readOnboardedForEmail(e);
  return {
    email: e,
    fullName: fn,
    displayName,
    isOnboarded,
  };
}

function getTokenExpDate(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    if (payload.exp) return payload.exp * 1000;
  } catch {
    // Abaikan jika token tidak valid atau error decoding
  }
  return null;
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
        email: '',
        fullName: '',
        displayName: 'Pengguna',
        isOnboarded: false,
      }
    );
  });

  /**
   * Sets session after successful login (or verify-email if API returns tokens).
   * @param {{
   *   access: string | null;
   *   refresh?: string | null;
   *   email: string;
   *   fullName?: string;
   *   onboardingCompleted?: boolean | null;
   * }} payload
   */
  const setSession = useCallback((payload) => {
    const { access, refresh, email, fullName, onboardingCompleted } = payload;
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
    const next = buildUserState({ email, fullName, onboardingCompleted });
    persistUser(next);
    setUser(next);
    setIsAuthenticated(true);
  }, []);

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

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout({ refresh_token: refreshToken });
      }
    } catch {
      /* tetap bersihkan sesi lokal */
    } finally {
      clearAllAuthStorage();
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
