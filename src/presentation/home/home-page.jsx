import { useEffect, useState } from 'react';

import { usersApi } from '@/infrastructure/users/users-api';
import { useAuth } from '../auth/hooks/use-auth';
import { HomeAppHeader } from './components/home-app-header';
import { HomeRecommendedSection } from './components/home-recommended-section';
import { HomeUpcomingSection } from './components/home-upcoming-section';
import { HomeWelcomeSection } from './components/home-welcome-section';

function extractActiveEventIds(payload) {
  const data = payload?.data ?? payload;
  const activeEvents = Array.isArray(data?.active_events) ? data.active_events : [];
  return new Set(activeEvents.map((item) => String(item?.id ?? '')).filter(Boolean));
}

export default function HomePage() {
  const { user } = useAuth();
  const [activeEventIds, setActiveEventIds] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    async function loadParticipationSummary() {
      try {
        const res = await usersApi.participationSummary();
        const ids = extractActiveEventIds(res.data);
        if (!cancelled) setActiveEventIds(ids);
      } catch {
        if (!cancelled) setActiveEventIds(new Set());
      }
    }
    loadParticipationSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />
      <main className='mx-auto max-w-6xl space-y-8 px-4 py-8 md:space-y-10 md:px-6 md:py-10'>
        <HomeWelcomeSection displayName={user?.displayName} />
        <HomeRecommendedSection activeEventIds={activeEventIds} />
        <HomeUpcomingSection activeEventIds={activeEventIds} />
      </main>
    </div>
  );
}
