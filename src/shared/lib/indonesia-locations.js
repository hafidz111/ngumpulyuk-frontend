import locationsData from '@/shared/data/indonesia-locations.json';

/** @typedef {{ id: string; slug: string; label: string; provinceId: string; province: string; latitude?: number; longitude?: number }} IndonesiaLocation */

/** @type {IndonesiaLocation[]} */
export const INDONESIA_LOCATIONS = locationsData;

const LEGACY_SLUG_TO_ID = {
  'jakarta-selatan': '3171',
  'jakarta-pusat': '3173',
  'jakarta-barat': '3174',
  'jakarta-timur': '3172',
  'jakarta-utara': '3175',
  bandung: '3273',
  surabaya: '3578',
  yogyakarta: '3471',
  bali: '5171',
  depok: '3276',
  tangerang: '3671',
  bekasi: '3275',
};

/** @type {Map<string, IndonesiaLocation>} */
const byId = new Map(INDONESIA_LOCATIONS.map((r) => [r.id, r]));

/** @type {Map<string, IndonesiaLocation>} */
const bySlug = new Map(INDONESIA_LOCATIONS.map((r) => [r.slug, r]));

/** @type {Map<string, IndonesiaLocation>} */
const byLabelLower = new Map();
for (const row of INDONESIA_LOCATIONS) {
  byLabelLower.set(row.label.toLowerCase(), row);
  byLabelLower.set(row.label.replace(/^Kab\.\s*/i, '').toLowerCase(), row);
}

export const AREA_OPTIONS = INDONESIA_LOCATIONS.map((r) => ({
  id: r.id,
  label: r.label,
  province: r.province,
}));

/**
 * @param {string | null | undefined} key
 * @returns {IndonesiaLocation | undefined}
 */
export function resolveLocation(key) {
  if (!key || !String(key).trim()) return undefined;
  const raw = String(key).trim();
  const legacyId = LEGACY_SLUG_TO_ID[raw.toLowerCase()];
  const id = legacyId || raw;
  return (
    byId.get(id) ||
    bySlug.get(raw.toLowerCase()) ||
    byLabelLower.get(raw.toLowerCase())
  );
}

/**
 * @param {string | null | undefined} key
 * @returns {string}
 */
export function resolveLocationLabel(key) {
  const row = resolveLocation(key);
  return row?.label || (key ? String(key) : '');
}

/**
 * @param {string} [query]
 * @param {number} [limit]
 * @returns {IndonesiaLocation[]}
 */
export function filterLocations(query = '', limit = 50) {
  const q = query.trim().toLowerCase();
  if (!q) return INDONESIA_LOCATIONS.slice(0, limit);
  const out = [];
  for (const row of INDONESIA_LOCATIONS) {
    const hay = `${row.label} ${row.province} ${row.id}`.toLowerCase();
    if (hay.includes(q)) {
      out.push(row);
      if (out.length >= limit) break;
    }
  }
  return out;
}
