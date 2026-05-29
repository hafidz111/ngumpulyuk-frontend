import { useQuery } from '@tanstack/react-query';

import { eventsApi } from '@/infrastructure/events/events-api';
import { eventQueryKeys } from './event-query-keys';

const STALE_MS = 5 * 60 * 1000;
const GC_MS = 30 * 60 * 1000;

/**
 * @param {string | undefined} eventId
 * @param {{ preview?: Record<string, unknown> | null }} [options]
 */
export function useEventDetailQuery(eventId, options = {}) {
  const { preview = null } = options;
  const id = eventId ? String(eventId) : '';
  const previewMatches =
    preview && id && String(preview.id) === id ? preview : undefined;

  return useQuery({
    queryKey: eventQueryKeys.detail(id),
    enabled: Boolean(id),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    placeholderData: previewMatches,
    queryFn: async () => {
      const res = await eventsApi.getById(id);
      return res.data?.data ?? res.data;
    },
  });
}
