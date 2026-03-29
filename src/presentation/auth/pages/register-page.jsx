import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAuthErrorMessage } from '@/application/auth/auth-error';
import { authApi } from '@/infrastructure/auth/auth-api';
import { SignupForm } from '../../components/signup-form';
import { ROUTES } from '../../../shared/config/routes';
import { useGoogleAuthSubmit } from '../hooks/use-google-auth-submit';
import { AuthSplitLayout } from '../components/auth-split-layout';

const PENDING_EMAIL_KEY = 'ngumpulyuk.pendingVerificationEmail';

export default function RegisterPage() {
  const { signInWithGoogleCredential, googleError, isGoogleLoading } =
    useGoogleAuthSubmit();
  const [passwordError, setPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setPasswordError('');
    setSubmitError('');
    const form = e.currentTarget;
    const password = form.password?.value ?? '';
    const confirmPassword = form.confirmPassword?.value ?? '';
    if (password !== confirmPassword) {
      setPasswordError('Kata sandi tidak cocok.');
      return;
    }
    const email = String(form.email?.value ?? '').trim();
    const full_name = String(form.full_name?.value ?? '').trim();
    setIsSubmitting(true);
    try {
      await authApi.register({
        email,
        full_name,
        password,
        password_confirm: confirmPassword,
      });
      sessionStorage.setItem(PENDING_EMAIL_KEY, email);
      navigate(ROUTES.verifyEmail, { replace: true });
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err, 'Pendaftaran gagal.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout>
      <SignupForm
        passwordError={passwordError}
        submitError={submitError}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onGoogleCredential={(cred) => void signInWithGoogleCredential(cred)}
        googleError={googleError}
        isGoogleLoading={isGoogleLoading}
      />
    </AuthSplitLayout>
  );
}
