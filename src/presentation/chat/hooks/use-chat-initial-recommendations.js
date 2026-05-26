import { useEffect, useState } from 'react';

import { mapRecommendationsToChatCards } from '@/application/recommendations/map-recommendations-to-chat-cards';
import { recommendationsApi } from '@/infrastructure/recommendations/recommendations-api';

const RECOMMENDATION_TIMEOUT_MS = 1500;

/**
 * @param {boolean} enabled
 */
export function useChatInitialRecommendations(enabled) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setCards([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const res = await Promise.race([
          recommendationsApi.events({ limit: 6 }),
          new Promise((_, reject) => {
            window.setTimeout(
              () => reject(new Error('timeout')),
              RECOMMENDATION_TIMEOUT_MS,
            );
          }),
        ]);
        if (cancelled) return;
        setCards(mapRecommendationsToChatCards(res.data));
      } catch {
        if (!cancelled) setCards([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { cards, loading };
}
