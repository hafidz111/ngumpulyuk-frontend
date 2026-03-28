import { getHomeDashboard } from '../../application/home/use-cases/get-home-dashboard';
import { InMemoryHomeDashboardRepository } from '../../infrastructure/home/repositories/in-memory-home-dashboard-repository';
import { useAuth } from '../auth/hooks/use-auth';
import { HomeAppHeader } from './components/home-app-header';
import { HomeNotificationBanner } from './components/home-notification-banner';
import { HomeRecommendedSection } from './components/home-recommended-section';
import { HomeUpcomingSection } from './components/home-upcoming-section';
import { HomeWelcomeSection } from './components/home-welcome-section';

const repository = new InMemoryHomeDashboardRepository();

export default function HomePage() {
  const { user } = useAuth();
  const content = getHomeDashboard(repository);

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />
      <main className='mx-auto max-w-6xl space-y-8 px-4 py-8 md:space-y-10 md:px-6 md:py-10'>
        <HomeWelcomeSection displayName={user?.displayName} />
        <HomeNotificationBanner
          message={content.notification.message}
          actionLabel={content.notification.actionLabel}
        />
        <HomeRecommendedSection
          title={content.recommended.title}
          seeAllLabel={content.recommended.seeAllLabel}
          items={content.recommended.items}
        />
        <HomeUpcomingSection title={content.upcoming.title} items={content.upcoming.items} />
      </main>
    </div>
  );
}
