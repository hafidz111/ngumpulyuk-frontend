import * as React from 'react';

import { cn } from '../../../shared/lib/utils';

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-surface',
      className,
    )}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef(({ className, alt = '', ...props }, ref) => (
  <img ref={ref} alt={alt} className={cn('aspect-square h-full w-full object-cover', className)} {...props} />
));
AvatarImage.displayName = 'AvatarImage';

export { Avatar, AvatarImage };
