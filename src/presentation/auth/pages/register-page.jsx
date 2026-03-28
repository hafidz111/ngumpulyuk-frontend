import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SignupForm } from '../../components/signup-form';
import { ROUTES } from '../../../shared/config/routes';
import { useAuth } from '../hooks/use-auth';
import { AuthSplitLayout } from '../components/auth-split-layout';

export default function RegisterPage() {
  const [passwordError, setPasswordError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const password = form.password?.value ?? '';
    const confirmPassword = form.confirmPassword?.value ?? '';
    if (password !== confirmPassword) {
      setPasswordError('Kata sandi tidak cocok.');
      return;
    }
    setPasswordError('');
    const email = String(form.email?.value ?? '').trim();
    const { isOnboarded } = login({ email });
    navigate(isOnboarded ? ROUTES.home : ROUTES.onboarding, { replace: true });
  }

  return (
    <AuthSplitLayout>
      <SignupForm passwordError={passwordError} onSubmit={handleSubmit} />
    </AuthSplitLayout>
  );
}
