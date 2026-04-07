import { useAuth } from '../auth/hooks/use-auth';
import { HomeAppHeader } from './components/home-app-header';
import { HomeRecommendedSection } from './components/home-recommended-section';
import { HomeUpcomingSection } from './components/home-upcoming-section';
import { HomeWelcomeSection } from './components/home-welcome-section';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />
      <main className='mx-auto max-w-6xl space-y-8 px-4 py-8 md:space-y-10 md:px-6 md:py-10'>
        <HomeWelcomeSection displayName={user?.displayName} />
        <HomeRecommendedSection />
        <HomeUpcomingSection />
      </main>
    </div>
  );
}
