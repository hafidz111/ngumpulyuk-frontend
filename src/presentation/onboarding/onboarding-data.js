/** Minat olahraga & aktivitas (step 2). */
export const ONBOARDING_ACTIVITIES = [
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
];

/** Area untuk dropdown Lokasi Pilihan (preferensi / step form). */
export const AREA_OPTIONS = [
  { id: 'jakarta-selatan', label: 'Jakarta Selatan' },
  { id: 'jakarta-pusat', label: 'Jakarta Pusat' },
  { id: 'jakarta-barat', label: 'Jakarta Barat' },
  { id: 'jakarta-timur', label: 'Jakarta Timur' },
  { id: 'jakarta-utara', label: 'Jakarta Utara' },
  { id: 'bandung', label: 'Bandung' },
  { id: 'surabaya', label: 'Surabaya' },
  { id: 'yogyakarta', label: 'Yogyakarta' },
  { id: 'bali', label: 'Bali' },
  { id: 'lainnya', label: 'Lainnya' },
];

/**
 * Waktu favorit — grid 2×2, multi-select (preferensi / step form).
 * Rentang jam mengikuti referensi UI.
 */
export const EVENT_TIME_OPTIONS = [
  { id: 'morning', label: 'Pagi (06:00 - 10:00)' },
  { id: 'midday', label: 'Siang (10:00 - 15:00)' },
  { id: 'afternoon', label: 'Sore (15:00 - 18:00)' },
  { id: 'evening', label: 'Malam (18:00 - 22:00)' },
];

/** Level aktivitas — opsi untuk Select. */
export const ACTIVITY_LEVEL_OPTIONS = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'Baru mulai',
  },
  {
    id: 'casual',
    title: 'Casual',
    description: 'Santai aja',
  },
  {
    id: 'active',
    title: 'Active',
    description: 'Rutin ikut event',
  },
  {
    id: 'enthusiast',
    title: 'Enthusiast',
    description: 'Semangat banget!',
  },
];

export const MIN_INTEREST_SELECTIONS = 3;
