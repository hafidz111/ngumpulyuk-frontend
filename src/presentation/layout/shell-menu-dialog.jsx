import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

/**
 * Full-viewport mobile shell menu (sidebar). Hides Leaflet GPU layers reliably on iOS.
 */
export function ShellMenuDialog({ open, onClose, children, className }) {
  React.useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') onClose(false);
    };
    document.addEventListener('keydown', handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('shell-menu-open');
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove('shell-menu-open');
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className='fixed inset-0 z-[10050] isolate lg:hidden'
      role='dialog'
      aria-modal='true'
      aria-label='Menu'
    >
      <button
        type='button'
        className='absolute inset-0 bg-[#1a1612]/55 backdrop-blur-[2px]'
        onClick={() => onClose(false)}
        aria-label='Tutup menu'
      />
      <div
        className={cn(
          'relative z-10 flex h-full w-full max-w-[min(100%,20rem)] flex-col bg-surface-bright shadow-2xl',
          'animate-in slide-in-from-left-4 fade-in-0 duration-200',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
