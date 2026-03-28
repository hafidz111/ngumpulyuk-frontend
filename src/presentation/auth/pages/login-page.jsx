import { useNavigate } from 'react-router-dom';

import { LoginForm } from '../../components/login-form';
import { ROUTES } from '../../../shared/config/routes';
import { useAuth } from '../hooks/use-auth';
import { AuthSplitLayout } from '../components/auth-split-layout';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '').trim();
    const { isOnboarded } = login({ email });
    navigate(isOnboarded ? ROUTES.home : ROUTES.onboarding, { replace: true });
  }

  return (
    <AuthSplitLayout>
      <LoginForm onSubmit={handleSubmit} />
    </AuthSplitLayout>
  );
}
