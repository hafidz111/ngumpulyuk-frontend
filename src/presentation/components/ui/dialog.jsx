import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

export function Dialog({ open, onClose, children }) {
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
    <div className='fixed inset-0 z-[10050] isolate flex items-end justify-center sm:items-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0'
        onClick={() => onClose(false)}
        aria-hidden
      />
      <div className='relative z-10 w-full max-w-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200 sm:mx-0'>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogContent({ className, children, onClose, ...props }) {
  return (
    <div
      className={cn(
        'mx-4 max-h-[85vh] overflow-y-auto rounded-2xl border border-border/60 bg-surface-bright p-6 shadow-xl',
        className,
      )}
      {...props}
    >
      {onClose ? (
        <button
          type='button'
          onClick={() => onClose(false)}
          className='absolute right-5 top-5 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
          aria-label='Tutup'
        >
          <X className='size-5' />
        </button>
      ) : null}
      {children}
    </div>
  );
}
