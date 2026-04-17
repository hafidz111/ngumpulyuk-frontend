/**
 * @param {unknown} raw
 * @returns {Array<Record<string, unknown>>}
 */
export function mapRecommendedEventsResponse(raw) {
  const firstLayer = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
  const root = firstLayer && typeof firstLayer === 'object' && 'data' in firstLayer
    ? firstLayer.data
    : firstLayer;

  if (Array.isArray(root)) return root;
  if (!root || typeof root !== 'object') return [];

  if (Array.isArray(root.results)) return root.results;
  if (Array.isArray(root.events)) return root.events;
  if (Array.isArray(root.items)) return root.items;

  if (Array.isArray(root.recommendations)) {
    return root.recommendations
      .map((item) => (item && typeof item === 'object' && item.event ? item.event : item))
      .filter((item) => item && typeof item === 'object');
  }

  return [];
}
