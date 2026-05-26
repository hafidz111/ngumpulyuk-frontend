import { useEffect, useState } from 'react';

import {
  createEmptyLandingContent,
  mapLandingPublicResponse,
} from '@/application/landing/map-landing-public-response';
import { landingApi } from '@/infrastructure/landing/landing-api';

/**
 * @returns {{
 *   content: ReturnType<typeof mapLandingPublicResponse>;
 *   isRefreshing: boolean;
 *   hasLiveData: boolean;
 *   error: string | null;
 * }}
 */
export function useLandingContent() {
  const [content, setContent] = useState(() => createEmptyLandingContent());
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [hasLiveData, setHasLiveData] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsRefreshing(true);
      setError(null);
      try {
        const res = await landingApi.getPublic();
        if (cancelled) return;
        setContent(mapLandingPublicResponse(res.data));
        setHasLiveData(true);
      } catch (err) {
        if (cancelled) return;
        setContent(createEmptyLandingContent());
        setHasLiveData(false);
        setError(
          err?.response?.data?.error?.message ||
            err?.message ||
            'Gagal memuat data landing',
        );
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { content, isRefreshing, hasLiveData, error };
}
