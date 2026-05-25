import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useParams,
} from 'react-router-dom';

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
const NotificationsPage = lazy(
  () => import('../presentation/notifications/pages/notifications-page.jsx'),
);
const NotificationsBlastPage = lazy(
  () => import('../presentation/notifications/pages/notifications-blast-page.jsx'),
);
const AdminChatMonitoringPage = lazy(
  () => import('../presentation/chat/pages/admin-chat-monitoring-page.jsx'),
);
const AdminChatCorrectionsPage = lazy(
  () => import('../presentation/chat/pages/admin-chat-corrections-page.jsx'),
);
const EventMapPage = lazy(
  () => import('../presentation/map/event-map-page.jsx'),
);
const ChatMainView = lazy(
  () => import('../presentation/chat/pages/chat-main-view.jsx'),
);
const ChatFirstLayout = lazy(
  () => import('../presentation/layout/chat-first-layout.jsx'),
);
const NotFoundPage = lazy(
  () => import('../presentation/error-pages/not-found-page.jsx'),
);
const HttpErrorPage = lazy(
  () => import('../presentation/error-pages/http-error-page.jsx'),
);
const MaintenancePage = lazy(
  () => import('../presentation/error-pages/maintenance-page.jsx'),
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

/** Legacy notification URLs used API-style `/communities/:id`. */
function LegacyCommunityRedirect() {
  const { id } = useParams();
  return <Navigate to={ROUTES.communityDetail.replace(':id', id ?? '')} replace />;
}

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
  {
    element: suspense(<ChatFirstLayout />),
    children: [
      { path: ROUTES.chat, element: suspense(<ChatMainView />) },
      { path: ROUTES.feed, element: <Navigate to={ROUTES.chat} replace /> },
      { path: ROUTES.explore, element: <Navigate to={ROUTES.events} replace /> },
      { path: ROUTES.events, element: suspense(<EventsListPage />) },
      { path: ROUTES.eventCreate, element: suspense(<EventCreatePage />) },
      { path: ROUTES.eventEdit, element: suspense(<EventEditPage />) },
      { path: ROUTES.eventDetail, element: suspense(<EventDetailPage />) },
      { path: ROUTES.community, element: suspense(<CommunityPage />) },
      { path: ROUTES.communityCreate, element: suspense(<CommunityCreatePage />) },
      { path: ROUTES.communityDetail, element: suspense(<CommunityDetailPage />) },
      { path: '/communities/:id', element: <LegacyCommunityRedirect /> },
      { path: ROUTES.threadDetail, element: suspense(<ThreadDetailPage />) },
      { path: ROUTES.map, element: suspense(<EventMapPage />) },
      { path: ROUTES.profile, element: suspense(<ProfilePage />) },
      { path: ROUTES.profileByUsername, element: suspense(<ProfilePage />) },
      { path: ROUTES.notifications, element: suspense(<NotificationsPage />) },
      { path: ROUTES.notificationsBlast, element: suspense(<NotificationsBlastPage />) },
      { path: ROUTES.adminChatMonitoring, element: suspense(<AdminChatMonitoringPage />) },
      { path: ROUTES.adminChatCorrections, element: suspense(<AdminChatCorrectionsPage />) },
    ],
  },
  {
    path: ROUTES.notFound,
    element: suspense(<NotFoundPage />),
  },
  {
    path: ROUTES.maintenance,
    element: suspense(<MaintenancePage />),
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
