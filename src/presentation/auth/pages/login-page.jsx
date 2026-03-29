import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { getAuthErrorMessage } from '@/application/auth/auth-error';
import { mapLoginResponse } from '@/application/auth/map-auth-response';
import { authApi } from '@/infrastructure/auth/auth-api';
import { LoginForm } from '../../components/login-form';
import { ROUTES } from '../../../shared/config/routes';
import { useAuth } from '../hooks/use-auth';
import { useGoogleAuthSubmit } from '../hooks/use-google-auth-submit';
import { AuthSplitLayout } from '../components/auth-split-layout';

export default function LoginPage() {
  const { setSession } = useAuth();
  const { signInWithGoogleCredential, googleError, isGoogleLoading } =
    useGoogleAuthSubmit();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [submitError, setSubmitError] = useState('');
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
    setSubmitError('');
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
        setSubmitError('Respons server tidak berisi token. Hubungi admin.');
        return;
      }
      setSession({
        access: mapped.access,
        refresh: mapped.refresh,
        email: mapped.email || email,
        fullName: mapped.fullName,
      });
      const resolvedEmail = mapped.email || email;
      const onboarded =
        resolvedEmail &&
        localStorage.getItem(
          `ngumpulyuk.onboarded.${resolvedEmail.toLowerCase()}`,
        ) === '1';
      navigate(onboarded ? ROUTES.home : ROUTES.onboarding, { replace: true });
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err, 'Login gagal.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout>
      <LoginForm
        onSubmit={handleSubmit}
        submitError={submitError}
        isSubmitting={isSubmitting}
        notice={notice}
        onGoogleCredential={(cred) => void signInWithGoogleCredential(cred)}
        googleError={googleError}
        isGoogleLoading={isGoogleLoading}
      />
    </AuthSplitLayout>
  );
}
