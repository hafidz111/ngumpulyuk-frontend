import { useCallback, useMemo, useState } from 'react';

import { displayNameFromEmail } from '../../../shared/lib/user-display-name';
import { AuthContext } from '../context/auth-context';

function onboardingKeyForEmail(email) {
  if (!email) return null;
  return `ngumpulyuk.onboarded.${email.toLowerCase()}`;
}

function readOnboardedForEmail(email) {
  if (typeof window === 'undefined' || !email) return false;
  const key = onboardingKeyForEmail(email);
  return key ? localStorage.getItem(key) === '1' : false;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = useCallback((payload = {}) => {
    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    const isOnboarded = readOnboardedForEmail(email);
    setIsAuthenticated(true);
    setUser({
      email,
      displayName: displayNameFromEmail(email),
      isOnboarded,
    });
    return { isOnboarded };
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser((current) => {
      if (!current) return current;
      if (current.email) {
        const key = onboardingKeyForEmail(current.email);
        if (key) {
          localStorage.setItem(key, '1');
        }
      }
      return { ...current, isOnboarded: true };
    });
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
      completeOnboarding,
    }),
    [isAuthenticated, user, login, logout, completeOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
