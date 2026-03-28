import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '../../../shared/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.05em]',
  {
    variants: {
      variant: {
        default: 'bg-secondary-container text-secondary-foreground',
        muted: 'bg-surface-high text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
