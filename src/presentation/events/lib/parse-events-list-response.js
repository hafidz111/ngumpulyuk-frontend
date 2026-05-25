/**
 * @param {unknown} data
 * @returns {{ events: Record<string, unknown>[]; total: number }}
 */
export function parseEventsListResponse(data) {
  const payload = data && typeof data === 'object' && 'data' in data ? data.data : data;

  if (Array.isArray(payload)) {
    return { events: payload, total: payload.length };
  }

  if (!payload || typeof payload !== 'object') {
    return { events: [], total: 0 };
  }

  const root = /** @type {Record<string, unknown>} */ (payload);
  let events = [];
  let total = 0;

  if (Array.isArray(root.events)) {
    events = root.events;
    total = Number(root.total ?? root.count ?? events.length);
  } else if (Array.isArray(root.results)) {
    events = root.results;
    total = Number(root.count ?? root.total ?? events.length);
  }

  return { events, total: Number.isFinite(total) ? total : events.length };
}
