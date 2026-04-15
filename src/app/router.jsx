import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { ROUTES } from '../shared/config/routes';

const LandingPage = lazy(
  () => import('../presentation/landing/landing-page.jsx'),
);
const LoginPage = lazy(
  () => import('../presentation/auth/pages/login-page.jsx'),
);
const RegisterPage = lazy(
  () => import('../presentation/auth/pages/register-page.jsx'),
);
const VerifyEmailPage = lazy(
  () => import('../presentation/auth/pages/verify-email-page.jsx'),
);
const ForgotPasswordPage = lazy(
  () => import('../presentation/auth/pages/forgot-password-page.jsx'),
);
const ResetPasswordPage = lazy(
  () => import('../presentation/auth/pages/reset-password-page.jsx'),
);
const OnboardingPage = lazy(
  () => import('../presentation/onboarding/onboarding-page.jsx'),
);
const EventsListPage = lazy(
  () => import('../presentation/events/pages/events-list-page.jsx'),
);
const EventCreatePage = lazy(
  () => import('../presentation/events/pages/event-create-page.jsx'),
);
const EventDetailPage = lazy(
  () => import('../presentation/events/pages/event-detail-page.jsx'),
);
const EventEditPage = lazy(
  () => import('../presentation/events/pages/event-edit-page.jsx'),
);
const CommunityPage = lazy(
  () => import('../presentation/community/pages/community-page.jsx'),
);
const CommunityCreatePage = lazy(
  () => import('../presentation/community/pages/community-create-page.jsx'),
);
const CommunityDetailPage = lazy(
  () => import('../presentation/community/pages/community-detail-page.jsx'),
);
const ThreadDetailPage = lazy(
  () => import('../presentation/community/pages/thread-detail-page.jsx'),
);
const ComingSoonPage = lazy(
  () => import('../presentation/coming-soon/coming-soon-page.jsx'),
);
const ProfilePage = lazy(
  () => import('../presentation/profile/pages/profile-page.jsx'),
);
const EventMapPage = lazy(
  () => import('../presentation/map/event-map-page.jsx'),
);
const NotFoundPage = lazy(
  () => import('../presentation/error-pages/not-found-page.jsx'),
);
const HttpErrorPage = lazy(
  () => import('../presentation/error-pages/http-error-page.jsx'),
);

function RouteFallback() {
  return (
    <div className='flex min-h-svh items-center justify-center bg-surface font-display text-sm text-muted-foreground'>
      Memuat…
    </div>
  );
}

const suspense = (node) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
);

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
    path: ROUTES.verifyEmail,
    element: suspense(<VerifyEmailPage />),
  },
  {
    path: ROUTES.forgotPassword,
    element: suspense(<ForgotPasswordPage />),
  },
  {
    path: ROUTES.passwordResetConfirm,
    element: suspense(<ResetPasswordPage />),
  },
  {
    path: ROUTES.onboarding,
    element: suspense(<OnboardingPage />),
  },
  // Explore redirects to Events
  {
    path: ROUTES.explore,
    element: <Navigate to={ROUTES.events} replace />,
  },
  // Events
  {
    path: ROUTES.events,
    element: suspense(<EventsListPage />),
  },
  {
    path: ROUTES.eventCreate,
    element: suspense(<EventCreatePage />),
  },
  {
    path: ROUTES.eventEdit,
    element: suspense(<EventEditPage />),
  },
  {
    path: ROUTES.eventDetail,
    element: suspense(<EventDetailPage />),
  },
  {
    path: ROUTES.community,
    element: suspense(<CommunityPage />),
  },
  {
    path: ROUTES.communityCreate,
    element: suspense(<CommunityCreatePage />),
  },
  {
    path: ROUTES.communityDetail,
    element: suspense(<CommunityDetailPage />),
  },
  {
    path: ROUTES.threadDetail,
    element: suspense(<ThreadDetailPage />),
  },
  {
    path: ROUTES.map,
    element: suspense(<EventMapPage />),
  },
  {
    path: ROUTES.profile,
    element: suspense(<ProfilePage />),
  },
  {
    path: ROUTES.profileByUsername,
    element: suspense(<ProfilePage />),
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
