import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Zap,
} from 'lucide-react';
import { Badge } from '@/presentation/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatTimeId, formatLocation, formatEventDateRange } from '@/shared/lib/formatters';

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

/**
 * @param {{
 *   event: Record<string, unknown>;
 *   className?: string;
 * }} props
 */
export function EventCard({ event, className }) {
  const participantCount = event.participant_count ?? event.participants_count ?? event.current_participants ?? 0;
  const maxP = event.max_participants ?? '∞';
  const diffClass = DIFFICULTY_COLORS[event.difficulty_level] || DIFFICULTY_COLORS.beginner;

  const dateDisplay = formatEventDateRange(event.event_date, event.end_date);
  const formattedTime = formatTimeId(event.event_time);
  const locationDisplay = formatLocation(event.location_address, event.location_area);

  let timeDisplay = formattedTime;
  if (event.end_time && event.end_time !== event.event_time) {
    timeDisplay += ` - ${formatTimeId(event.end_time)}`;
  }

  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:shadow-[0_12px_40px_-8px_hsl(var(--foreground)/0.1)] hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Cover image */}
      <div className='relative h-40 bg-gradient-to-br from-primary-container/20 to-secondary/20 overflow-hidden sm:h-44'>
        {event.cover_image ? (
          <img
            src={event.cover_image}
            alt={event.title}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <Zap className='size-10 text-primary-container/30' />
          </div>
        )}
        {/* Category badge */}
        <div className='absolute left-3 top-3'>
          <Badge className='bg-white/90 text-foreground shadow-sm backdrop-blur-sm text-[0.6rem] uppercase tracking-wider'>
            {event.category}
          </Badge>
        </div>
        {/* Competition badge */}
        {event.is_competition ? (
          <div className='absolute right-3 top-3'>
            <span className='inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-1 text-[0.6rem] font-bold uppercase text-amber-900 shadow-sm backdrop-blur-sm'>
              <Trophy className='size-3' />
              Kompetisi
            </span>
          </div>
        ) : null}
        {/* Status overlay for non-upcoming */}
        {event.status && event.status !== 'upcoming' ? (
          <div className='absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent'>
            <span className='mb-3 ml-3 rounded-full bg-white/90 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-foreground'>
              {event.status === 'ongoing'
                ? 'Berlangsung'
                : event.status === 'completed'
                  ? 'Selesai'
                  : event.status === 'cancelled'
                    ? 'Dibatalkan'
                    : event.status}
            </span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col gap-3 p-4'>
        <h3 className='line-clamp-2 font-display text-base font-bold leading-snug text-foreground group-hover:text-primary-container transition-colors'>
          {event.title}
        </h3>

        <div className='flex flex-col gap-1.5 text-xs text-muted-foreground'>
          {event.event_date ? (
            <span className='inline-flex items-center gap-1.5'>
              <Calendar className='size-3.5 text-primary-container/70 shrink-0' />
              <span className='truncate'>{dateDisplay}{timeDisplay ? ` · ${timeDisplay}` : ''}</span>
            </span>
          ) : null}
          {locationDisplay ? (
            <span className='inline-flex items-center gap-1.5'>
              <MapPin className='size-3.5 text-primary-container/70 shrink-0' />
              <span className='truncate'>{locationDisplay}</span>
            </span>
          ) : null}
        </div>

        <div className='mt-auto flex items-center justify-between pt-2 border-t border-border/40'>
          <span className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
            <Users className='size-3.5' />
            {participantCount}/{maxP}
          </span>
          <span className={cn('rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase', diffClass)}>
            {event.difficulty_level}
          </span>
        </div>
      </div>
    </Link>
  );
}
