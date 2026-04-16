/**
 * Interest taxonomy: GET /api/v1/users/interests/
 *
 * @param {unknown} raw Axios response.data or nested .data
 * @returns {{
 *   rows: Array<{ interest: string; count: number | null }>;
 * }}
 */
export function mapInterestsTaxonomyResponse(raw) {
  const root = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
  if (!root || typeof root !== 'object') {
    return { rows: [] };
  }

  const rankedRaw = Array.isArray(root.ranked_interests)
    ? root.ranked_interests
    : [];
  const ranked = rankedRaw
    .map((row) => {
      const interest =
        typeof row?.interest === 'string'
          ? row.interest.trim()
          : String(row?.interest ?? '').trim();
      const countRaw = row?.count;
      const count =
        typeof countRaw === 'number' && Number.isFinite(countRaw)
          ? countRaw
          : Number.parseInt(String(countRaw), 10);
      const countNum = Number.isFinite(count) ? count : null;
      return { interest, count: countNum };
    })
    .filter((r) => r.interest);

  if (ranked.length > 0) {
    ranked.sort((a, b) => {
      const ca = typeof a.count === 'number' ? a.count : -Infinity;
      const cb = typeof b.count === 'number' ? b.count : -Infinity;
      return cb - ca;
    });
    return { rows: ranked };
  }

  const fallback = Array.isArray(root.interests)
    ? root.interests
        .map((v) => (typeof v === 'string' ? v.trim() : String(v ?? '').trim()))
        .filter(Boolean)
    : [];

  return {
    rows: fallback.map((interest) => ({ interest, count: null })),
  };
}
