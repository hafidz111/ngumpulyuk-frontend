import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/lib/utils';
import { Button } from '../../components/ui/button';

const GHOST_EVENTS = [
  { category: 'Workshop', title: 'Ngopi & ngobrol', location: 'Jakarta' },
  { category: 'Meetup', title: 'Circle hangout', location: 'Bandung' },
  { category: 'Kelas', title: 'Skill share bareng', location: 'Surabaya' },
];

/**
 * @param {{ className?: string }} props
 */
function EventGhostCards({ className }) {
  return (
    <div
      className={cn('grid grid-cols-3 gap-3 opacity-[0.45] grayscale', className)}
      aria-hidden
    >
      {GHOST_EVENTS.map((item) => (
        <div
          key={item.title}
          className='overflow-hidden rounded-2xl border border-border/50 bg-white p-3 shadow-sm'
        >
          <div className='mb-2 aspect-[4/3] rounded-xl bg-gradient-to-br from-muted/60 to-muted/30' />
          <p className='text-[9px] font-bold uppercase tracking-widest text-[#FF8000]/80'>
            {item.category}
          </p>
          <p className='mt-1 font-display text-xs font-bold leading-snug text-foreground/80 line-clamp-2'>
            {item.title}
          </p>
          <div className='mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground'>
            <MapPin className='size-2.5 shrink-0' />
            <span className='truncate'>{item.location}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * @param {{
 *   title: string;
 *   description: string;
 *   ctaLabel: string;
 *   ctaTo?: string;
 *   icon?: import('lucide-react').LucideIcon;
 *   showEventPreviews?: boolean;
 *   className?: string;
 * }} props
 */
export function LandingSectionEmpty({
  title,
  description,
  ctaLabel,
  ctaTo = ROUTES.register,
  icon: EmptyIcon = CalendarDays,
  showEventPreviews = false,
  className,
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-border/50 bg-white shadow-sm',
        className,
      )}
    >
      <div className='pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-container/15 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-secondary-container/10 blur-3xl' />

      <div
        className={cn(
          'relative p-8 md:p-10',
          showEventPreviews &&
            'flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-14',
        )}
      >
        {showEventPreviews ? (
          <EventGhostCards className='w-full max-w-md shrink-0 lg:max-w-none lg:flex-1' />
        ) : null}

        <div
          className={cn(
            'flex flex-col items-center text-center',
            showEventPreviews && 'lg:max-w-sm lg:items-start lg:text-left',
          )}
        >
          <div className='mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <EmptyIcon className='size-7' strokeWidth={1.75} aria-hidden />
          </div>
          <h3 className='font-display text-xl font-extrabold tracking-tight text-foreground md:text-2xl'>
            {title}
          </h3>
          <p className='mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base'>
            {description}
          </p>
          <Button size='lg' className='mt-6 gap-2' asChild>
            <Link to={ctaTo}>
              {ctaLabel}
              <ArrowRight className='size-4' aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export { Users as LandingEmptyUsersIcon, CalendarDays as LandingEmptyCalendarIcon };
