import { Navigate, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/shared/config/routes';
import { useAuth } from '../hooks/use-auth';

/**
 * Halaman tamu (login/register): arahkan pengguna yang masih punya sesi ke app.
 */
export function GuestOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();

  if (searchParams.get('session') === 'expired') {
    return children;
  }

  if (!isAuthenticated) {
    return children;
  }

  if (!user?.isOnboarded) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  return <Navigate to={ROUTES.chat} replace />;
}
