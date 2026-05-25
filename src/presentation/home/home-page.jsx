import { useEffect, useState } from 'react';

import { usersApi } from '@/infrastructure/users/users-api';
import { useAuth } from '../auth/hooks/use-auth';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
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
  const { onOpenMenu } = useChatPageShell();
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
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title='Beranda'
        subtitle='Rekomendasi dan event yang akan datang'
        onOpenMenu={onOpenMenu}
        showCreateEvent
      />
      <ChatFirstPageBody>
        <div className='space-y-8 md:space-y-10'>
          <HomeWelcomeSection displayName={user?.displayName} />
          <HomeRecommendedSection activeEventIds={activeEventIds} />
          <HomeUpcomingSection activeEventIds={activeEventIds} />
        </div>
      </ChatFirstPageBody>
    </div>
  );
}
