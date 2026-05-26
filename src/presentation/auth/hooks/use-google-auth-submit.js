import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { getAuthErrorMessage } from '@/application/auth/auth-error';
import { isEmailNotVerifiedLoginError } from '@/application/auth/is-email-not-verified-error';
import { mapLoginResponse } from '@/application/auth/map-auth-response';
import { authApi } from '@/infrastructure/auth/auth-api';
import { clearAllAuthStorage } from '@/infrastructure/http/token-storage';
import { ROUTES } from '@/shared/config/routes';
import { PENDING_VERIFICATION_EMAIL_KEY } from '@/shared/config/storage-keys';
import { useAuth } from './use-auth';

function emailFromGoogleJwt(jwt) {
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return '';
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json);
    return typeof payload.email === 'string' ? payload.email : '';
  } catch {
    return '';
  }
}

export function useGoogleAuthSubmit() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const signInWithGoogleCredential = useCallback(
    async (credentialJwt) => {
      const token =
        typeof credentialJwt === 'string' ? credentialJwt.trim() : '';
      if (!token) {
        toast.error('Credential Google tidak diterima.', { duration: 4000 });
        return;
      }
      setIsGoogleLoading(true);
      clearAllAuthStorage();
      try {
        const { data } = await authApi.google({ access_token: token });
        const mapped = mapLoginResponse(
          data && typeof data === 'object'
            ? /** @type {Record<string, unknown>} */ (data)
            : {},
        );
        if (!mapped.access) {
          toast.error('Respons server tidak berisi token.', { duration: 4000 });
          return;
        }
        const resolvedEmail = mapped.email;
        setSession({
          access: mapped.access,
          refresh: mapped.refresh,
          userId: mapped.userId,
          username: mapped.username,
          email: resolvedEmail,
          fullName: mapped.fullName,
          onboardingCompleted: mapped.onboardingCompleted,
        });
        const isOnboarded =
          typeof mapped.onboardingCompleted === 'boolean'
            ? mapped.onboardingCompleted
            : Boolean(
                resolvedEmail &&
                localStorage.getItem(
                  `ngumpulyuk.onboarded.${resolvedEmail.toLowerCase()}`,
                ) === '1',
              );
        const nextPath = isOnboarded ? ROUTES.chat : ROUTES.onboarding;
        toast.success('Berhasil masuk dengan Google.', { duration: 4000 });
        navigate(nextPath, { replace: true });
      } catch (err) {
        if (isEmailNotVerifiedLoginError(err)) {
          const googleEmail = emailFromGoogleJwt(token);
          if (googleEmail) {
            sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, googleEmail);
          }
          toast.info(
            'Email belum diverifikasi. Masukkan kode OTP atau kirim ulang kode.',
            { duration: 4000 },
          );
          navigate(ROUTES.verifyEmail, {
            replace: true,
            state: { fromLogin: true, email: googleEmail },
          });
          return;
        }
        toast.error(getAuthErrorMessage(err, 'Google Sign-In gagal.'), {
          duration: 4000,
        });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [navigate, setSession],
  );

  return { signInWithGoogleCredential, isGoogleLoading };
}
