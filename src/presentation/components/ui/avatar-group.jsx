import { cn } from '@/lib/utils';

export function AvatarGroup({ className, children }) {
  return (
    <div className={cn('flex items-center -space-x-2 [&_.avatar-group-item]:ring-2 [&_.avatar-group-item]:ring-card', className)}>
      {children}
    </div>
  );
}

export function AvatarGroupCount({ className, children }) {
  return (
    <span
      className={cn(
        'avatar-group-item inline-flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}
