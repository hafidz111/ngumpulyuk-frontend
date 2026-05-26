import { toTitleCase } from '@/shared/lib/text-format';

/**
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
