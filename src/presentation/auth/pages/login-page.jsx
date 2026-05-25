import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { getAuthErrorMessage } from '@/application/auth/auth-error';
import { isEmailNotVerifiedLoginError } from '@/application/auth/is-email-not-verified-error';
import { mapLoginResponse } from '@/application/auth/map-auth-response';
import { authApi } from '@/infrastructure/auth/auth-api';
import { LoginForm } from '../../components/login-form';
import { ROUTES } from '../../../shared/config/routes';
import { PENDING_VERIFICATION_EMAIL_KEY } from '@/shared/config/storage-keys';
import { useAuth } from '../hooks/use-auth';
import { useGoogleAuthSubmit } from '../hooks/use-google-auth-submit';
import { AuthSplitLayout } from '../components/auth-split-layout';

export default function LoginPage() {
  const { setSession } = useAuth();
  const { signInWithGoogleCredential, isGoogleLoading } = useGoogleAuthSubmit();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notice = useMemo(() => {
    const fromVerify = location.state?.message;
    if (typeof fromVerify === 'string' && fromVerify) return fromVerify;
    if (searchParams.get('session') === 'expired') {
      return 'Sesi berakhir. Silakan masuk lagi.';
    }
    return null;
  }, [location.state, searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '').trim();
    const password = String(fd.get('password') ?? '');
    setIsSubmitting(true);
    try {
      const { data } = await authApi.login({ email, password });
      const mapped = mapLoginResponse(
        data && typeof data === 'object'
          ? /** @type {Record<string, unknown>} */ (data)
          : {},
      );
      if (!mapped.access) {
        toast.error('Respons server tidak berisi token. Hubungi admin.', {
          duration: 4000,
        });
        return;
      }
      const resolvedEmail = mapped.email || email;
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
      toast.success('Berhasil masuk.', { duration: 4000 });
      navigate(nextPath, { replace: true });
    } catch (err) {
      if (isEmailNotVerifiedLoginError(err)) {
        sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
        toast.info(
          'Email belum diverifikasi. Masukkan kode OTP atau kirim ulang kode.',
          { duration: 4000 },
        );
        navigate(ROUTES.verifyEmail, {
          replace: true,
          state: { fromLogin: true, email },
        });
        return;
      }
      toast.error(getAuthErrorMessage(err, 'Login gagal.'), { duration: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout>
      <LoginForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        notice={notice}
        onGoogleCredential={(cred) => void signInWithGoogleCredential(cred)}
        isGoogleLoading={isGoogleLoading}
      />
    </AuthSplitLayout>
  );
}
