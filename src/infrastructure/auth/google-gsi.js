/**
 * @see https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
 * @see https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
 */

let gsiLoadPromise;

let idInitializedFor = null;

let idCredentialHandler = /** @type {((jwt: string) => void) | null} */ (null);

export function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sign-In hanya di browser.'));
  }
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (gsiLoadPromise) return gsiLoadPromise;
  gsiLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Gagal memuat Google Sign-In')),
      );
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Gagal memuat Google Sign-In'));
    document.head.appendChild(s);
  });
  return gsiLoadPromise;
}

/**
 * @param {(jwt: string) => void} handler
 */
export function setGoogleIdCredentialHandler(handler) {
  idCredentialHandler = handler;
}

/**
 * @param {string} clientId
 * @returns {boolean}
 */
export function ensureGoogleIdClientInitialized(clientId) {
  const trimmed = clientId?.trim() ?? '';
  if (!trimmed.endsWith('.apps.googleusercontent.com')) {
    return false;
  }
  const google = window.google.accounts.id;
  if (idInitializedFor === trimmed) {
    return true;
  }
  if (idInitializedFor) {
    google.cancel();
  }
  google.initialize({
    client_id: trimmed,
    callback: (response) => {
      if (response?.credential) {
        idCredentialHandler?.(response.credential);
      }
    },
    auto_select: false,
    use_fedcm_for_button: true,
  });
  idInitializedFor = trimmed;
  return true;
}

/**
 * @param {HTMLElement} el
 * @param {string} clientId
 * @param {{ text?: 'signin_with' | 'signup_with' | 'continue_with'; locale?: string }} [opts]
 */
export function renderGoogleSignInButton(el, clientId, opts = {}) {
  if (!el || !clientId?.trim()) return;
  const w = Math.max(Math.floor(el.getBoundingClientRect().width) || 0, 280);
  window.google.accounts.id.renderButton(el, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: opts.text ?? 'signin_with',
    shape: 'pill',
    logo_alignment: 'left',
    width: w,
    locale: opts.locale ?? 'id',
  });
}
