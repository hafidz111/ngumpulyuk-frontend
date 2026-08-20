import { useEffect, useState } from 'react';

import {
  createDummyLandingContent,
  mapLandingPublicResponse,
} from '@/application/landing/map-landing-public-response';
import { landingApi } from '@/infrastructure/landing/landing-api';

/**
 * @returns {{
 *   content: ReturnType<typeof mapLandingPublicResponse>;
 *   isRefreshing: boolean;
 * }}
 */
export function useLandingContent() {
  const [content, setContent] = useState(() => createDummyLandingContent());
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsRefreshing(true);
      try {
        const res = await landingApi.getPublic();
        if (cancelled) return;
        setContent(mapLandingPublicResponse(res.data));
      } catch {
        if (cancelled) return;
        setContent(createDummyLandingContent());
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { content, isRefreshing };
}
