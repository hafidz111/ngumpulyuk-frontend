/** @type {Record<string, string>} */
const AUTH_MESSAGE_ID = {
  'invalid credentials': 'Email atau kata sandi salah.',
  'email is not verified': 'Email belum diverifikasi. Cek kotak masuk atau kirim ulang kode OTP.',
  'email already verified': 'Email sudah terverifikasi.',
  'user not found': 'Akun tidak ditemukan.',
  'passcode not provided': 'Kode OTP tidak ditemukan atau sudah kedaluwarsa.',
  'reset link is invalid or has expired': 'Link reset kata sandi tidak valid atau sudah kedaluwarsa.',
  'link is invalid or has expired': 'Link tidak valid atau sudah kedaluwarsa.',
  'passwords do not match': 'Konfirmasi kata sandi tidak cocok.',
  'token is invalid or has expired': 'Sesi tidak valid atau sudah berakhir. Silakan masuk lagi.',
  'credentials is valid': 'Sesi masih aktif.',
  'could not verify user': 'Gagal verifikasi akun Google. Coba lagi.',
  'validation error': 'Data tidak valid. Periksa isian kamu.',
  'network error': 'Koneksi bermasalah. Periksa internet lalu coba lagi.',
  'no active account found with the given credentials': 'Email atau kata sandi salah.',
};

/** @type {Record<string, string>} */
const AUTH_CODE_ID = {
  UNAUTHORIZED: 'Akses ditolak. Silakan masuk lagi.',
  FORBIDDEN: 'Kamu tidak punya izin untuk aksi ini.',
  NOT_FOUND: 'Data tidak ditemukan.',
  CONFLICT: 'Permintaan bentrok dengan data yang ada.',
  VALIDATION_ERROR: 'Data tidak valid. Periksa isian kamu.',
};

/**
 * @param {string} message
 * @returns {string}
 */
export function translateAuthMessage(message) {
  const raw = String(message ?? '').trim();
  if (!raw) return raw;

  const lower = raw.toLowerCase();
  if (AUTH_MESSAGE_ID[lower]) return AUTH_MESSAGE_ID[lower];

  if (lower.includes('invalid credentials') || lower.includes('no active account')) {
    return AUTH_MESSAGE_ID['invalid credentials'];
  }
  if (lower.includes('not verified')) {
    return AUTH_MESSAGE_ID['email is not verified'];
  }
  if (lower.includes('invalid') && lower.includes('token')) {
    return AUTH_MESSAGE_ID['token is invalid or has expired'];
  }
  if (lower.includes('continue your login with')) {
    return `Lanjutkan login dengan akun yang sama (${raw.replace(/^please continue your login with\s*/i, '')}).`;
  }

  return raw;
}

/**
 * @param {unknown} data
 * @returns {string | null}
 */
function extractMessageFromData(data) {
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (!data || typeof data !== 'object') return null;

  const d = /** @type {Record<string, unknown>} */ (data);

  if (d.success === false && d.error && typeof d.error === 'object') {
    const nested = /** @type {Record<string, unknown>} */ (d.error);
    if (typeof nested.message === 'string' && nested.message.trim()) {
      return nested.message.trim();
    }
  }

  if (d.detail != null) {
    const detail = d.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0] != null) {
      const first = detail[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object' && 'msg' in first) {
        return String(/** @type {{ msg?: string }} */ (first).msg ?? '');
      }
    }
  }

  if (typeof d.message === 'string' && d.message.trim()) return d.message.trim();

  for (const value of Object.values(d)) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (Array.isArray(value) && value.length > 0) {
      const v = value[0];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
  }

  return null;
}

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
  const code = getApiErrorCode(error);

  const fromData = extractMessageFromData(data);
  if (fromData) {
    return translateAuthMessage(fromData);
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const m = /** @type {{ message?: string }} */ (error).message;
    if (typeof m === 'string' && m.trim() && m !== 'Network Error') {
      return translateAuthMessage(m);
    }
    if (m === 'Network Error') {
      return AUTH_MESSAGE_ID['network error'];
    }
  }

  if (code && AUTH_CODE_ID[code]) {
    return AUTH_CODE_ID[code];
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
