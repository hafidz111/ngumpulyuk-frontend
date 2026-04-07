import { AREA_OPTIONS } from '../onboarding/onboarding-data';

export const EVENT_CATEGORIES = [
  { id: 'running', label: 'Running' },
  { id: 'padel', label: 'Padel' },
  { id: 'cycling', label: 'Cycling' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'pokemon', label: 'Pokémon TCG' },
  { id: 'boardgames', label: 'Board Games' },
  { id: 'hiking', label: 'Hiking' },
  { id: 'swimming', label: 'Swimming' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'photography', label: 'Photography' },
  { id: 'cooking', label: 'Cooking' },
  { id: 'futsal', label: 'Futsal' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'gym', label: 'Gym / Fitness' },
  { id: 'other', label: 'Lainnya' },
];

/** @type {{ id: string; label: string }[]} */
export { AREA_OPTIONS };

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
  { id: 'date_asc', label: 'Tanggal (Terdekat)' },
  { id: 'date_desc', label: 'Tanggal (Terjauh)' },
  { id: 'newest', label: 'Terbaru' },
  { id: 'popular', label: 'Populer' },
];

export const DEFAULT_MAP_CENTER = [-6.2088, 106.8456];
export const DEFAULT_MAP_ZOOM = 13;
