import { cn } from '@/lib/utils';

/** Bintang field wajib — selalu merah. */
export function RequiredMark({ className }) {
  return (
    <span className={cn('text-red-600', className)} aria-hidden='true'>
      *
    </span>
  );
}
