import { AREA_OPTIONS } from '../onboarding/onboarding-data';



/** @type {{ id: string; label: string }[]} */
export { AREA_OPTIONS };

/**
 * Build unique category options from event list payload.
 * @param {Array<Record<string, unknown>>} events
 */
export function extractEventCategories(events = []) {
  const seen = new Map();

  events.forEach((event) => {
    const raw = typeof event?.category === 'string' ? event.category.trim() : '';
    if (!raw) return;
    const key = raw.toLowerCase();
    if (!seen.has(key)) seen.set(key, raw);
  });

  return Array.from(seen.values())
    .sort((a, b) => a.localeCompare(b))
    .map((label) => ({ id: label, label }));
}

export const DIFFICULTY_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export const EVENT_STATUS_OPTIONS = [
  { id: '', label: 'Semua' },
  { id: 'upcoming', label: 'Akan Datang' },
  { id: 'ongoing', label: 'Berlangsung' },
  { id: 'completed', label: 'Selesai' },
  { id: 'cancelled', label: 'Dibatalkan' },
];

export const SORT_OPTIONS = [
  { id: 'date_asc', label: 'Tanggal terdekat' },
  { id: 'date_desc', label: 'Tanggal terjauh' },
  { id: 'newest', label: 'Terbaru' },
  { id: 'popular', label: 'Populer' },
];

export const DEFAULT_MAP_CENTER = [-6.2088, 106.8456];
export const DEFAULT_MAP_ZOOM = 13;
