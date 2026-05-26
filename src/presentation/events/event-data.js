export { AREA_OPTIONS } from '@/shared/lib/indonesia-locations';

/**
 * @param {Array<Record<string, unknown>>} events
 */
export function extractEventCategories(events = []) {
  const seen = new Map();

  events.forEach((event) => {
    const raw =
      typeof event?.category === 'string' ? event.category.trim() : '';
    if (!raw) return;
    const key = raw.toLowerCase();
    if (!seen.has(key)) seen.set(key, raw);
  });

  return Array.from(seen.values())
    .sort((a, b) => a.localeCompare(b))
    .map((label) => ({ id: label, label }));
}

export const DIFFICULTY_LABELS = {
  beginner: 'Pemula',
  intermediate: 'Menengah',
  advanced: 'Lanjutan',
};

export const DIFFICULTY_LEVELS = [
  { id: 'beginner', label: DIFFICULTY_LABELS.beginner },
  { id: 'intermediate', label: DIFFICULTY_LABELS.intermediate },
  { id: 'advanced', label: DIFFICULTY_LABELS.advanced },
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
