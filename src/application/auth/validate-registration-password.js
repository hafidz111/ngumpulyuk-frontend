const MIN_LENGTH = 8;
const HAS_UPPER = /[A-Z]/;
const HAS_LOWER = /[a-z]/;
const HAS_DIGIT = /\d/;

/**
 * @param {string} password
 * @returns {{ valid: boolean; message: string | null }}
 */
export function validateRegistrationPassword(password) {
  if (!password || password.length < MIN_LENGTH) {
    return {
      valid: false,
      message: 'Kata sandi minimal 8 karakter.',
    };
  }
  if (!HAS_UPPER.test(password)) {
    return {
      valid: false,
      message: 'Kata sandi harus mengandung huruf kapital.',
    };
  }
  if (!HAS_LOWER.test(password)) {
    return {
      valid: false,
      message: 'Kata sandi harus mengandung huruf kecil.',
    };
  }
  if (!HAS_DIGIT.test(password)) {
    return {
      valid: false,
      message: 'Kata sandi harus mengandung angka.',
    };
  }
  return { valid: true, message: null };
}
