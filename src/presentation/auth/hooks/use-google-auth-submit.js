import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAuthErrorMessage } from '@/application/auth/auth-error';
import { mapLoginResponse } from '@/application/auth/map-auth-response';
import { authApi } from '@/infrastructure/auth/auth-api';
import { ROUTES } from '@/shared/config/routes';
import { useAuth } from './use-auth';

export function useGoogleAuthSubmit() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [googleError, setGoogleError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const signInWithGoogleCredential = useCallback(
    async (credentialJwt) => {
      const token =
        typeof credentialJwt === 'string' ? credentialJwt.trim() : '';
      if (!token) {
        setGoogleError('Credential Google tidak diterima.');
        return;
      }
      setGoogleError('');
      setIsGoogleLoading(true);
      try {
        const { data } = await authApi.google({ access_token: token });
        const mapped = mapLoginResponse(
          data && typeof data === 'object'
            ? /** @type {Record<string, unknown>} */ (data)
            : {},
        );
        if (!mapped.access) {
          setGoogleError('Respons server tidak berisi token.');
          return;
        }
        setSession({
          access: mapped.access,
          refresh: mapped.refresh,
          email: mapped.email,
          fullName: mapped.fullName,
        });
        const resolvedEmail = mapped.email;
        const onboarded =
          resolvedEmail &&
          localStorage.getItem(
            `ngumpulyuk.onboarded.${resolvedEmail.toLowerCase()}`,
          ) === '1';
        navigate(onboarded ? ROUTES.home : ROUTES.onboarding, {
          replace: true,
        });
      } catch (err) {
        setGoogleError(getAuthErrorMessage(err, 'Google Sign-In gagal.'));
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [navigate, setSession],
  );

  return { signInWithGoogleCredential, googleError, isGoogleLoading };
}
