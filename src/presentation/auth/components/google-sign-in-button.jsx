import { useEffect, useRef } from 'react';

import {
  ensureGoogleIdClientInitialized,
  loadGoogleIdentityScript,
  renderGoogleSignInButton,
  setGoogleIdCredentialHandler,
} from '@/infrastructure/auth/google-gsi';
import { GOOGLE_CLIENT_ID } from '@/shared/config/env';

/**
 * @param {{ text?: 'signin_with' | 'signup_with' | 'continue_with'; onCredential: (idTokenJwt: string) => void; disabled?: boolean }} props
 */
export function GoogleSignInButton({
  text = 'signin_with',
  onCredential,
  disabled = false,
}) {
  const containerRef = useRef(null);
  const onCredentialRef = useRef(onCredential);

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const clientId = GOOGLE_CLIENT_ID?.trim() ?? '';
    if (!clientId) return undefined;

    let cancelled = false;

    (async () => {
      try {
        await loadGoogleIdentityScript();
        if (cancelled) return;
        setGoogleIdCredentialHandler((jwt) => {
          onCredentialRef.current?.(jwt);
        });
        if (!ensureGoogleIdClientInitialized(clientId)) return;
        const el = containerRef.current;
        if (!el || cancelled) return;
        el.innerHTML = '';
        renderGoogleSignInButton(el, clientId, { text });
      } catch {
        /* error */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [text]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.opacity = disabled ? '0.5' : '1';
    el.style.pointerEvents = disabled ? 'none' : 'auto';
  }, [disabled]);

  if (!GOOGLE_CLIENT_ID?.trim()) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className='flex min-h-[40px] w-full justify-center [&_.gsi-material-button]:mx-auto'
    />
  );
}
