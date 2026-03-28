/**
 * @param {string} [email]
 * @returns {string}
 */
export function displayNameFromEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Pengguna';
  }
  const local = email.split('@')[0]?.trim() ?? '';
  if (!local) return 'Pengguna';
  return local.charAt(0).toUpperCase() + local.slice(1);
}
