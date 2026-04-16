import { toTitleCase } from '@/shared/lib/text-format';

/**
 * Blast targeting should use the same human-readable interest strings as onboarding
 * (e.g. "Board Games"), while GET /users/interests/ may return snake_case slugs.
 *
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeInterestForBlastPayload(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  if (s.includes('_')) {
    return s
      .split('_')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  return toTitleCase(s);
}
