/**
 * @param {unknown} payload
 */
export function mapParticipationStats(payload) {
  const data = payload?.data ?? payload;
  const active = Number(data?.active_events_count ?? 0);
  const past = Number(data?.past_events_count ?? 0);
  const communities = Number(data?.joined_communities_count ?? 0);

  return {
    eventsFollowed: active + past,
    activeEvents: active,
    communities,
  };
}

/**
 * @param {unknown} raw
 */
export function averageRecommendationMatchPercent(raw) {
  const firstLayer = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
  const root =
    firstLayer && typeof firstLayer === 'object' && 'data' in firstLayer
      ? firstLayer.data
      : firstLayer;
  const recs = Array.isArray(root?.recommendations) ? root.recommendations : [];
  const scores = recs
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const score = item.score ?? item.match_score ?? item.match_percent;
      const n = Number(score);
      return Number.isFinite(n) ? n : null;
    })
    .filter((n) => n !== null);
  if (!scores.length) return null;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(Math.min(100, Math.max(0, avg)));
}
