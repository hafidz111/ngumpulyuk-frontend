/**
 * @param {unknown} raw
 * @returns {Array<Record<string, unknown>>}
 */
export function mapRecommendedEventsResponse(raw) {
  const root = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
  if (Array.isArray(root)) return root;
  if (!root || typeof root !== 'object') return [];
  if (Array.isArray(root.results)) return root.results;
  if (Array.isArray(root.events)) return root.events;
  if (Array.isArray(root.recommendations)) return root.recommendations;
  if (Array.isArray(root.items)) return root.items;
  return [];
}
