import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { getAuthErrorMessage, isApiErrorCode } from '@/application/auth/auth-error';
import { authApi } from '@/infrastructure/auth/auth-api';
import { SignupForm } from '../../components/signup-form';
import { ROUTES } from '../../../shared/config/routes';
import { PENDING_VERIFICATION_EMAIL_KEY } from '@/shared/config/storage-keys';
import { useGoogleAuthSubmit } from '../hooks/use-google-auth-submit';
import { AuthSplitLayout } from '../components/auth-split-layout';

export default function RegisterPage() {
  const { signInWithGoogleCredential, isGoogleLoading } = useGoogleAuthSubmit();
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setPasswordError('');
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
      sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
      toast.success(
        'Pendaftaran berhasil. Masukkan kode OTP yang dikirim ke email kamu.',
        { duration: 4000 },
      );
      navigate(ROUTES.verifyEmail, { replace: true });
    } catch (err) {
      if (isApiErrorCode(err, ['CONFLICT', 'EMAIL_ALREADY_EXISTS'])) {
        toast.error(
          'Email sudah terdaftar. Silakan login atau gunakan email lain.',
          { duration: 4000 },
        );
        return;
      }
      toast.error(getAuthErrorMessage(err, 'Pendaftaran gagal.'), {
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout>
      <SignupForm
        passwordError={passwordError}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onGoogleCredential={(cred) => void signInWithGoogleCredential(cred)}
        isGoogleLoading={isGoogleLoading}
      />
    </AuthSplitLayout>
  );
}
