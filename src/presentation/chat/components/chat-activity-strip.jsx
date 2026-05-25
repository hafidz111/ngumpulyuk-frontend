import { CalendarCheck, Users } from 'lucide-react';

import { SHELL_COPY } from '@/shared/copy/shell-copy';

/**
 * @param {{ stats: { eventsFollowed: number; communities: number; loading: boolean } }} props
 */
export function ChatActivityStrip({ stats }) {
  return (
    <div className='shrink-0 border-b border-[#FF8000]/20 bg-gradient-to-br from-[#FFF1E5] via-white to-white px-4 py-3'>
      <p className='mb-2 text-[10px] font-bold uppercase tracking-wider text-[#D97706]'>
        {SHELL_COPY.sidebar.activityTitle}
      </p>
      <div className='grid grid-cols-2 gap-2'>
        <div className='rounded-xl border border-[#FF8000]/15 bg-white/90 px-3 py-2.5 shadow-sm'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <CalendarCheck className='size-4 shrink-0 text-[#FF8000]' aria-hidden />
            <span className='text-[11px] font-medium leading-tight'>
              {SHELL_COPY.sidebar.eventFollowed}
            </span>
          </div>
          <p className='mt-1 font-display text-2xl font-black tabular-nums text-foreground'>
            {stats.loading ? '—' : stats.eventsFollowed}
          </p>
        </div>
        <div className='rounded-xl border border-[#FF8000]/15 bg-white/90 px-3 py-2.5 shadow-sm'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Users className='size-4 shrink-0 text-[#FF8000]' aria-hidden />
            <span className='text-[11px] font-medium leading-tight'>
              {SHELL_COPY.sidebar.communities}
            </span>
          </div>
          <p className='mt-1 font-display text-2xl font-black tabular-nums text-foreground'>
            {stats.loading ? '—' : stats.communities}
          </p>
        </div>
      </div>
    </div>
  );
}
