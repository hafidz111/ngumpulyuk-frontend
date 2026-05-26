/**
 * @see https://developers.google.com/identity/gsi/web/guides/display-button
 */

let gsiLoadPromise = null;

/** @type {string | null} */
let idInitializedFor = null;

/** @type {((jwt: string) => void) | null} */
let idCredentialHandler = null;

/**
 * @param {(jwt: string) => void} handler
 */
export function setGoogleIdCredentialHandler(handler) {
  idCredentialHandler = handler;
}

async function waitForGoogleAccountsId(timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (window.google?.accounts?.id) return true;
    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });
  }
  return false;
}

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
      const done = async () => {
        if (await waitForGoogleAccountsId()) resolve();
        else reject(new Error('Gagal memuat Google Sign-In'));
      };
      if (window.google?.accounts?.id) {
        void done();
        return;
      }
      existing.addEventListener('load', () => void done(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Gagal memuat Google Sign-In')),
        { once: true },
      );
      return;
    }

    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.setAttribute('data-use_fedcm_for_button', 'false');
    s.setAttribute('data-use_fedcm_for_prompt', 'false');
    s.onload = () => {
      void (async () => {
        if (await waitForGoogleAccountsId()) resolve();
        else reject(new Error('Gagal memuat Google Sign-In'));
      })();
    };
    s.onerror = () => reject(new Error('Gagal memuat Google Sign-In'));
    document.head.appendChild(s);
  });

  return gsiLoadPromise;
}

/**
 * @param {'signin_with' | 'signup_with' | 'continue_with'} text
 */
function contextFromButtonText(text) {
  if (text === 'signup_with') return 'signup';
  if (text === 'continue_with') return 'signin';
  return 'signin';
}

/**
 * @param {string} clientId
 * @param {'signin_with' | 'signup_with' | 'continue_with'} [buttonText]
 * @returns {boolean}
 */
export function ensureGoogleIdClientInitialized(
  clientId,
  buttonText = 'signin_with',
) {
  const trimmed = clientId?.trim() ?? '';
  if (!trimmed.endsWith('.apps.googleusercontent.com')) {
    return false;
  }

  const google = window.google?.accounts?.id;
  if (!google) return false;

  const initKey = `${trimmed}:${buttonText}`;
  if (idInitializedFor !== initKey) {
    if (idInitializedFor) {
      try {
        google.cancel();
      } catch {
        /* ignore */
      }
    }
    google.initialize({
      client_id: trimmed,
      callback: (response) => {
        if (response?.credential) {
          idCredentialHandler?.(response.credential);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
      use_fedcm_for_button: false,
      use_fedcm_for_prompt: false,
      ux_mode: 'popup',
      context: contextFromButtonText(buttonText),
    });
    idInitializedFor = initKey;
  }

  return true;
}

/**
 * @param {HTMLElement} el
 * @param {string} clientId
 * @param {{ text?: 'signin_with' | 'signup_with' | 'continue_with'; locale?: string }} [opts]
 * @returns {boolean}
 */
export function renderGoogleSignInButton(el, clientId, opts = {}) {
  if (!el || !clientId?.trim() || !window.google?.accounts?.id) {
    return false;
  }

  const rect = el.getBoundingClientRect();
  const width = Math.min(400, Math.max(240, Math.floor(rect.width) || 320));

  el.innerHTML = '';
  window.google.accounts.id.renderButton(el, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: opts.text ?? 'signin_with',
    shape: 'pill',
    logo_alignment: 'left',
    width,
    locale: opts.locale ?? 'id',
  });

  return true;
}
