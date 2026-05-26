import { useEffect, useState } from 'react';

import { mapParticipationStats } from '@/application/users/map-participation-stats';
import { usersApi } from '@/infrastructure/users/users-api';

const DEFAULT_STATS = {
  eventsFollowed: 0,
  communities: 0,
  loading: true,
};

/**
 * @param {boolean} enabled
 */
export function useChatActivityStats(enabled) {
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function load() {
      try {
        const partRes = await usersApi.participationSummary();
        const participation = mapParticipationStats(partRes.data);

        if (!cancelled) {
          setStats({
            eventsFollowed: participation.eventsFollowed,
            communities: participation.communities,
            loading: false,
          });
        }
      } catch {
        if (!cancelled) {
          setStats({ ...DEFAULT_STATS, loading: false });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled) {
    return { ...DEFAULT_STATS, loading: false };
  }

  return stats;
}
