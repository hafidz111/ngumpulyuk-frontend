/**
 * @param {unknown} error
 * @returns {boolean}
 */
export function isEmailNotVerifiedLoginError(error) {
  const err = /** @type {{ response?: { data?: unknown } } | null} */ (error);
  const data = err?.response?.data;
  if (!data || typeof data !== 'object') return false;
  const d = /** @type {Record<string, unknown>} */ (data);
  if (d.success !== false || !d.error || typeof d.error !== 'object') {
    return false;
  }
  const e = /** @type {Record<string, unknown>} */ (d.error);
  if (e.code !== 'UNAUTHORIZED') return false;
  const msg = String(e.message ?? '').toLowerCase();
  const details = e.details;
  const detailStr =
    details &&
    typeof details === 'object' &&
    'detail' in /** @type {Record<string, unknown>} */ (details)
      ? String(
          /** @type {Record<string, unknown>} */ (details).detail ?? '',
        ).toLowerCase()
      : '';
  return (
    msg.includes('not verified') ||
    detailStr.includes('not verified') ||
    msg.includes('email is not verified')
  );
}
