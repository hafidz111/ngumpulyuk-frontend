import { cn } from '@/lib/utils';

/**
 * @param {React.ComponentProps<'div'>} props
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/60', className)}
      aria-hidden
      {...props}
    />
  );
}

export function ButtonBusySkeleton({ className }) {
  return <Skeleton className={cn('size-4 shrink-0 rounded-full', className)} />;
}
