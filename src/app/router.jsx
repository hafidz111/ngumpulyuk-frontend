import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ROUTES } from '../shared/config/routes';

const LandingPage = lazy(() => import('../presentation/landing/landing-page.jsx'));
const LoginPage = lazy(() => import('../presentation/auth/pages/login-page.jsx'));
const RegisterPage = lazy(() => import('../presentation/auth/pages/register-page.jsx'));
const OnboardingPage = lazy(() => import('../presentation/onboarding/onboarding-page.jsx'));
const ComingSoonPage = lazy(() => import('../presentation/coming-soon/coming-soon-page.jsx'));
const NotFoundPage = lazy(() => import('../presentation/error-pages/not-found-page.jsx'));
const HttpErrorPage = lazy(() => import('../presentation/error-pages/http-error-page.jsx'));

function RouteFallback() {
  return (
    <div className='flex min-h-svh items-center justify-center bg-surface font-display text-sm text-muted-foreground'>
      Memuat…
    </div>
  );
}

const suspense = (node) => <Suspense fallback={<RouteFallback />}>{node}</Suspense>;

const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: suspense(<LandingPage />),
  },
  {
    path: ROUTES.login,
    element: suspense(<LoginPage />),
  },
  {
    path: ROUTES.register,
    element: suspense(<RegisterPage />),
  },
  {
    path: ROUTES.onboarding,
    element: suspense(<OnboardingPage />),
  },
  {
    path: ROUTES.explore,
    element: suspense(<ComingSoonPage />),
  },
  {
    path: ROUTES.community,
    element: suspense(<ComingSoonPage />),
  },
  {
    path: ROUTES.map,
    element: suspense(<ComingSoonPage />),
  },
  {
    path: ROUTES.profile,
    element: suspense(<ComingSoonPage />),
  },
  {
    path: ROUTES.notFound,
    element: suspense(<NotFoundPage />),
  },
  {
    path: '/error/:code',
    element: suspense(<HttpErrorPage />),
  },
  {
    path: '*',
    element: suspense(<NotFoundPage />),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
