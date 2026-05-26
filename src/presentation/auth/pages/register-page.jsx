import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { getAuthErrorMessage } from '@/application/auth/auth-error';
import { authApi } from '@/infrastructure/auth/auth-api';
import { ROUTES } from '@/shared/config/routes';
import { PENDING_VERIFICATION_EMAIL_KEY } from '@/shared/config/storage-keys';
import { AuthSplitLayout } from '../components/auth-split-layout';
import { useGoogleAuthSubmit } from '../hooks/use-google-auth-submit';
import { SignupForm } from '../../components/signup-form';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signInWithGoogleCredential, isGoogleLoading } = useGoogleAuthSubmit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setPasswordError('');

    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get('full_name') ?? '').trim();
    const email = String(fd.get('email') ?? '').trim();
    const password = String(fd.get('password') ?? '');
    const confirmPassword = String(fd.get('confirmPassword') ?? '');

    if (password !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.register({
        email,
        full_name,
        password,
        password_confirm: confirmPassword,
      });
      sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
      toast.success('Daftar berhasil. Cek email untuk kode verifikasi OTP.', {
        duration: 5000,
      });
      navigate(ROUTES.verifyEmail, { replace: true, state: { email } });
    } catch (err) {
      toast.error(getAuthErrorMessage(err, 'Pendaftaran gagal.'), {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout>
      <SignupForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        passwordError={passwordError}
        onGoogleCredential={(cred) => void signInWithGoogleCredential(cred)}
        isGoogleLoading={isGoogleLoading}
      />
    </AuthSplitLayout>
  );
}
