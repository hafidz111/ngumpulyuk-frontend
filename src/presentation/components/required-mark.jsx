import { cn } from '@/lib/utils';

export function RequiredMark({ className }) {
  return (
    <span className={cn('text-red-600', className)} aria-hidden='true'>
      *
    </span>
  );
}
