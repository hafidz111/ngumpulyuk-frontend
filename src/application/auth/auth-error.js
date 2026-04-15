/**
 * @param {unknown} error
 * @param {string} [fallback]
 * @returns {string}
 */
export function getAuthErrorMessage(
  error,
  fallback = 'Terjadi kesalahan. Coba lagi.',
) {
  const err = /** @type {{ response?: { data?: unknown } } | null} */ (error);
  const data = err?.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object') {
    const d = /** @type {Record<string, unknown>} */ (data);

    if (d.success === false && d.error && typeof d.error === 'object') {
      const nested = /** @type {Record<string, unknown>} */ (d.error);
      if (typeof nested.message === 'string' && nested.message.trim()) {
        return nested.message;
      }
    }

    if (d.detail != null) {
      const detail = d.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail) && detail[0] != null) {
        const first = detail[0];
        if (typeof first === 'string') return first;
        if (first && typeof first === 'object' && 'msg' in first) {
          return String(
            /** @type {{ msg?: string }} */ (first).msg ?? fallback,
          );
        }
      }
    }

    if (typeof d.message === 'string') return d.message;

    for (const value of Object.values(d)) {
      if (typeof value === 'string') return value;
      if (Array.isArray(value) && value.length > 0) {
        const v = value[0];
        if (typeof v === 'string') return v;
      }
    }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const m = /** @type {{ message?: string }} */ (error).message;
    if (typeof m === 'string' && m !== 'Network Error') return m;
  }

  return fallback;
}

/**
 * @param {unknown} error
 * @returns {number | null}
 */
export function getApiErrorStatus(error) {
  const err = /** @type {{ response?: { status?: number } } | null} */ (error);
  return typeof err?.response?.status === 'number' ? err.response.status : null;
}

/**
 * @param {unknown} error
 * @returns {string | null}
 */
export function getApiErrorCode(error) {
  const err = /** @type {{ response?: { data?: unknown } } | null} */ (error);
  const data = err?.response?.data;
  if (data && typeof data === 'object') {
    const d = /** @type {Record<string, unknown>} */ (data);
    if (d.error && typeof d.error === 'object') {
      const nested = /** @type {Record<string, unknown>} */ (d.error);
      if (typeof nested.code === 'string' && nested.code.trim()) {
        return nested.code.trim();
      }
    }
    if (typeof d.code === 'string' && d.code.trim()) {
      return d.code.trim();
    }
  }
  return null;
}

/**
 * @param {unknown} error
 * @param {string[]} codes
 * @returns {boolean}
 */
export function isApiErrorCode(error, codes) {
  const code = getApiErrorCode(error);
  if (!code) return false;
  return codes.includes(code);
}
