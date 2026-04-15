import * as React from 'react';

import { cn } from '../../../shared/lib/utils';

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-surface',
      className,
    )}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef(({ className, alt = '', onError, ...props }, ref) => (
  <img
    ref={ref}
    alt={alt}
    className={cn('absolute inset-0 aspect-square h-full w-full object-cover', className)}
    onError={(event) => {
      event.currentTarget.style.display = 'none';
      onError?.(event);
    }}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('absolute inset-0 flex h-full w-full items-center justify-center text-xs font-semibold', className)}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
