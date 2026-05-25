/**
 * @param {unknown} raw
 * @returns {Array<{ type: string; recommendation_reason?: string; image_url?: string; payload: Record<string, unknown> }>}
 */
export function mapRecommendationsToChatCards(raw) {
  const firstLayer = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
  const root =
    firstLayer && typeof firstLayer === 'object' && 'data' in firstLayer
      ? firstLayer.data
      : firstLayer;

  const recs = Array.isArray(
    /** @type {{ recommendations?: unknown[] }} */ (root)?.recommendations,
  )
    ? /** @type {{ recommendations: unknown[] }} */ (root).recommendations
    : [];

  return recs
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = /** @type {{ event?: unknown; reason?: unknown }} */ (item);
      const event =
        row.event && typeof row.event === 'object'
          ? /** @type {Record<string, unknown>} */ (row.event)
          : null;
      if (!event || !event.id) return null;
      const reason =
        typeof row.reason === 'string' ? row.reason.trim() : '';
      return {
        type: 'event',
        recommendation_reason: reason,
        image_url: String(event.cover_image ?? ''),
        payload: { ...event, recommendation_reason: reason },
      };
    })
    .filter(Boolean);
}
