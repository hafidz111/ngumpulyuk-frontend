import { cn } from '@/lib/utils';
import { Skeleton } from '@/presentation/components/ui/skeleton';

/**
 * @param {{ count?: number; className?: string }} props
 */
export function LandingCardSkeleton({ count = 4, className }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4',
        className,
      )}
      aria-busy='true'
      aria-label='Memuat konten'
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className='overflow-hidden rounded-2xl border border-border/40 bg-white p-3 shadow-sm'
        >
          <Skeleton className='mb-3 aspect-[3/2] w-full rounded-xl' />
          <div className='space-y-1.5'>
            <Skeleton className='h-2.5 w-14' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-3 w-3/4' />
          </div>
        </div>
      ))}
    </div>
  );
}
