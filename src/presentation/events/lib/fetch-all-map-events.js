import { eventsApi } from '@/infrastructure/events/events-api';
import { parseEventsListResponse } from './parse-events-list-response';

const MAP_FETCH_LIMIT = 100;

/**
s * @param {string} status
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function fetchAllMapEvents(status = 'upcoming') {
  const merged = [];
  let offset = 0;

  while (true) {
    const res = await eventsApi.list({
      limit: MAP_FETCH_LIMIT,
      offset,
      status,
      sort: 'date_asc',
    });
    const { events, total } = parseEventsListResponse(res.data);
    if (!events.length) break;
    merged.push(...events);
    offset += MAP_FETCH_LIMIT;
    if (offset >= total) break;
  }

  return merged;
}
