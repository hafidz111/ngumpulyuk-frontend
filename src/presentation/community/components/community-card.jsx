import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { Card, CardContent } from '@/presentation/components/ui/card';

/**
 * @param {{ community: Record<string, unknown> }} props
 */
export function CommunityCard({ community }) {
  const memberCount = community.member_count ?? community.members_count ?? 0;
  const isJoined = community.is_joined ?? community.is_member ?? false;
  const upcomingCount =
    community.upcoming_events_count ??
    community.upcomingEventsCount ??
    community.total_events ??
    community.events_count ??
    0;

  const upcomingLabel = SHELL_COPY.threadComposer.upcomingEventsOnCard(Number(upcomingCount) || 0);

  return (
    <Link to={`/community/${community.id}`} className='group block'>
      <Card
        className={cn(
          'overflow-hidden border border-border/60 bg-card shadow-sm transition',
          'hover:border-[#FF8000]/25 hover:shadow-md',
        )}
      >
        <div className='relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[#FFF1E5] via-white to-primary-container/10'>
          {community.cover_image ? (
            <img
              src={community.cover_image}
              alt=''
              className='h-full w-full object-cover transition duration-300 group-hover:scale-[1.01]'
            />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <Users className='size-10 text-[#FF8000]/30' />
            </div>
          )}

          {isJoined ? (
            <span className='absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[0.65rem] font-bold text-white shadow-sm'>
              <CheckCircle className='size-3' />
              Udah join
            </span>
          ) : null}

          <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-2.5 pt-8'>
            <h3 className='font-display text-base font-bold text-white line-clamp-2 md:text-lg'>
              {community.name}
            </h3>
          </div>
        </div>

        <CardContent className='space-y-2 p-3.5 md:p-4'>
          {community.description ? (
            <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
              {community.description}
            </p>
          ) : null}
          <div className='flex flex-wrap items-center gap-2 text-xs font-medium'>
            <span className='inline-flex items-center gap-1 text-muted-foreground'>
              <Users className='size-3.5 text-[#FF8000]' aria-hidden />
              {memberCount} anggota
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1',
                Number(upcomingCount) > 0 ? 'text-sky-700' : 'text-muted-foreground',
              )}
            >
              <Calendar className='size-3.5 shrink-0' aria-hidden />
              {upcomingLabel}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
