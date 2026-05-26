import { cn } from '@/lib/utils';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { Card } from '@/presentation/components/ui/card';

/**
 * @param {{ count?: number; className?: string }} props
 */
export function EventCardSkeleton({ className }) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm',
        className,
      )}
    >
      <Skeleton className='aspect-[16/10] w-full rounded-none sm:h-44' />
      <div className='space-y-3 p-4'>
        <Skeleton className='h-3 w-20' />
        <Skeleton className='h-5 w-full' />
        <Skeleton className='h-4 w-4/5' />
        <div className='flex gap-2 pt-1'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-3 w-20' />
        </div>
        <Skeleton className='h-2 w-full rounded-full' />
      </div>
    </div>
  );
}

/**
 * @param {{ count?: number; className?: string }} props
 */
export function EventGridSkeleton({ count = 6, className }) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}
      aria-busy='true'
      aria-label='Memuat event'
    >
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * @param {{ count?: number; className?: string }} props
 */
export function HomeEventListSkeleton({ count = 3, className }) {
  return (
    <div className={cn('flex flex-col gap-3', className)} aria-busy='true' aria-label='Memuat event'>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className='flex gap-3 border border-border/60 p-3'>
          <Skeleton className='size-14 shrink-0 rounded-xl' />
          <div className='min-w-0 flex-1 space-y-2 py-0.5'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
            <Skeleton className='h-3 w-2/3' />
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * @param {{ className?: string }} props
 */
export function EventDetailSkeleton({ className }) {
  return (
    <div className={cn('space-y-6', className)} aria-busy='true' aria-label='Memuat detail event'>
      <Skeleton className='h-56 w-full rounded-3xl md:h-72' />
      <div className='space-y-3'>
        <Skeleton className='h-8 w-2/3' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-5/6' />
      </div>
      <Card className='space-y-4 border border-border/60 p-5'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-4/5' />
        <Skeleton className='h-10 w-full rounded-full' />
      </Card>
    </div>
  );
}

/**
 * @param {{ className?: string }} props
 */
export function FormPageSkeleton({ className }) {
  return (
    <Card className={cn('space-y-5 border border-border/60 p-6', className)} aria-busy='true'>
      <Skeleton className='h-40 w-full rounded-2xl' />
      <Skeleton className='h-11 w-full rounded-xl' />
      <Skeleton className='h-11 w-full rounded-xl' />
      <Skeleton className='h-28 w-full rounded-xl' />
      <Skeleton className='h-11 w-full rounded-xl' />
      <Skeleton className='h-12 w-full rounded-full' />
    </Card>
  );
}

/**
 * @param {{ className?: string }} props
 */
export function CommunityCardSkeleton({ className }) {
  return (
    <Card className={cn('overflow-hidden border border-border/60', className)}>
      <Skeleton className='aspect-[16/10] w-full rounded-none' />
      <div className='space-y-2 p-4'>
        <Skeleton className='h-5 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
      </div>
    </Card>
  );
}

/**
 * @param {{ count?: number; className?: string }} props
 */
export function CommunityGridSkeleton({ count = 6, className }) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}
      aria-busy='true'
      aria-label='Memuat circle'
    >
      {Array.from({ length: count }, (_, i) => (
        <CommunityCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * @param {{ className?: string }} props
 */
export function CommunityDetailSkeleton({ className }) {
  return (
    <div className={cn('space-y-6', className)} aria-busy='true' aria-label='Memuat circle'>
      <Skeleton className='aspect-[16/8] w-full rounded-3xl sm:aspect-[16/7]' />
      <Card className='space-y-3 border border-border/60 p-5'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-4/5' />
        <Skeleton className='h-10 w-28 rounded-full' />
      </Card>
      <div className='flex gap-2'>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className='size-9 rounded-full' />
        ))}
      </div>
    </div>
  );
}

/**
 * @param {{ className?: string }} props
 */
export function ThreadCardSkeleton({ className }) {
  return (
    <Card className={cn('space-y-3 border border-border/60 p-4', className)}>
      <div className='flex items-center gap-3'>
        <Skeleton className='size-10 rounded-full' />
        <div className='min-w-0 flex-1 space-y-1.5'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-3 w-20' />
        </div>
      </div>
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-5/6' />
      <div className='flex gap-4 pt-1'>
        <Skeleton className='h-3 w-12' />
        <Skeleton className='h-3 w-12' />
      </div>
    </Card>
  );
}

/**
 * @param {{ count?: number; className?: string }} props
 */
export function ThreadFeedSkeleton({ count = 3, className }) {
  return (
    <div className={cn('space-y-4', className)} aria-busy='true' aria-label='Memuat obrolan'>
      {Array.from({ length: count }, (_, i) => (
        <ThreadCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * @param {{ count?: number; className?: string }} props
 */
export function NotificationListSkeleton({ count = 5, className }) {
  return (
    <ul className={cn('space-y-3', className)} aria-busy='true' aria-label='Memuat notifikasi'>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <Card className='space-y-2 rounded-3xl border border-border/60 p-5'>
            <Skeleton className='h-5 w-2/3' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-3 w-24' />
          </Card>
        </li>
      ))}
    </ul>
  );
}

/**
 * @param {{ className?: string }} props
 */
export function ProfilePageSkeleton({ className }) {
  return (
    <div className={cn('space-y-6', className)} aria-busy='true' aria-label='Memuat profil'>
      <Card className='flex items-center gap-4 border border-border/80 p-6'>
        <Skeleton className='size-16 rounded-full' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-7 w-48' />
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-3 w-40' />
        </div>
      </Card>
      <div className='grid gap-4 sm:grid-cols-3'>
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className='space-y-3 border border-border/80 p-4'>
            <Skeleton className='size-9 rounded-full' />
            <Skeleton className='h-8 w-12' />
            <Skeleton className='h-3 w-20' />
          </Card>
        ))}
      </div>
      <div className='grid gap-4 md:grid-cols-2'>
        {Array.from({ length: 2 }, (_, i) => (
          <Card key={i} className='space-y-3 border border-border/80 p-5'>
            <Skeleton className='h-5 w-32' />
            <ListRowsSkeleton rows={3} />
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * @param {{ rows?: number; className?: string }} props
 */
export function ListRowsSkeleton({ rows = 3, className }) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className='h-14 w-full rounded-xl' />
      ))}
    </div>
  );
}

/**
 * @param {{ count?: number; className?: string }} props
 */
export function AdminLogListSkeleton({ count = 4, className }) {
  return (
    <div className={cn('space-y-3', className)} aria-busy='true' aria-label='Memuat data'>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className='h-28 w-full rounded-2xl' />
      ))}
    </div>
  );
}

/**
 * @param {{ count?: number; className?: string }} props
 */
export function AdminTableSkeleton({ count = 6, className }) {
  return (
    <div className={cn('space-y-2', className)} aria-busy='true' aria-label='Memuat tabel'>
      <Skeleton className='h-10 w-full rounded-lg' />
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className='h-12 w-full rounded-lg' />
      ))}
    </div>
  );
}

/**
 * @param {{ className?: string }} props
 */
export function ChatMessageSkeleton({ className }) {
  return (
    <div className={cn('space-y-2', className)} aria-busy='true'>
      <Skeleton className='h-3 max-w-[85%]' />
      <Skeleton className='h-3 w-full' />
      <Skeleton className='h-3 max-w-[70%]' />
    </div>
  );
}

/**
 * @param {{ className?: string }} props
 */
export function ChatRecoSkeleton({ className }) {
  return (
    <div className={cn('mt-3 flex flex-col gap-2', className)} aria-busy='true'>
      <Skeleton className='h-16 w-full rounded-xl' />
      <Skeleton className='h-16 w-full rounded-xl' />
    </div>
  );
}

/**
 * @param {{ className?: string }} props
 */
export function RouteFallbackSkeleton({ className }) {
  return (
    <div
      className={cn(
        'flex min-h-svh flex-col gap-6 bg-surface px-6 py-10 md:px-10',
        className,
      )}
      aria-busy='true'
      aria-label='Memuat halaman'
    >
      <Skeleton className='h-8 w-48' />
      <Skeleton className='h-4 w-full max-w-md' />
      <div className='grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className='min-h-[12rem] rounded-2xl' />
        ))}
      </div>
    </div>
  );
}

/**
 * @param {{ className?: string }} props
 */
export function InlineTextSkeleton({ className }) {
  return <Skeleton className={cn('h-3 w-24', className)} />;
}

/**
 * @param {{ className?: string }} props
 */
export function LoadMoreSkeleton({ className }) {
  return (
    <div className={cn('flex justify-center py-4', className)} aria-hidden>
      <Skeleton className='h-5 w-28 rounded-full' />
    </div>
  );
}
