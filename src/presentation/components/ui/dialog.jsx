import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

export function Dialog({ open, onClose, children }) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0'
        onClick={() => onClose(false)}
      />
      {/* content wrapper */}
      <div className='relative z-10 w-full max-w-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200'>
        {children}
      </div>
    </div>
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
