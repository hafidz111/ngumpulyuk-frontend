import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeId, formatLocation } from '@/shared/lib/formatters';

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
export function EventCard({ event, className, idx = 0 }) {
  const current = event.participant_count ?? event.participants_count ?? event.current_participants ?? 0;
  const max = event.max_participants ?? '∞';
  const maxNum = max === '∞' ? 1 : max;
  const pct = max === '∞' ? 0 : Math.min(100, Math.round((current / maxNum) * 100));

  const diffClass = DIFFICULTY_COLORS[event.difficulty_level] || DIFFICULTY_COLORS.beginner;

  const pastelPalettes = [
    { bg: 'bg-[#FFB3BA]', text: 'text-[#9A1F2A]' }, // pastel pink
    { bg: 'bg-[#FFDFBA]', text: 'text-[#9A4A0F]' }, // pastel orange
    { bg: 'bg-[#FFFFBA]', text: 'text-[#9A9A0F]' }, // pastel yellow
    { bg: 'bg-[#BAFFC9]', text: 'text-[#0F9A2A]' }, // pastel green
    { bg: 'bg-[#BAE1FF]', text: 'text-[#0F4A9A]' }, // pastel blue
    { bg: 'bg-[#E8BAFF]', text: 'text-[#4A0F9A]' }, // pastel purple
  ];
  const progressColor = pastelPalettes[idx % pastelPalettes.length].bg;

  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
        className,
      )}
    >
      {/* Image Header */}
      <div className='relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted/30 sm:h-44'>
        {event.cover_image ? (
          <img
            src={event.cover_image}
            alt=''
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full items-center justify-center p-6'>
            <Zap className='size-10 text-muted-foreground/20 transition-colors group-hover:text-[#FF8000]/40' />
          </div>
        )}
        {/* Top Left Badges */}
        <div className='absolute left-3 top-3 flex items-center gap-2'>
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm ${pastelPalettes[idx % pastelPalettes.length].bg} ${pastelPalettes[idx % pastelPalettes.length].text}`}>
            {event.category || 'Event'}
          </div>
          {event.difficulty_level && (
            <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold shadow-sm backdrop-blur-sm uppercase', diffClass)}>
              {event.difficulty_level}
            </div>
          )}
        </div>

        {/* Top Right Competition Badge */}
        {event.is_competition ? (
          <div className='absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-900 shadow-sm'>
            <Trophy className='size-3' />
            Kompetisi
          </div>
        ) : null}

        {/* Bottom Left Date Over Image */}
        {event.event_date && (
          <div className='absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-black/60 px-3 py-1.5 text-white backdrop-blur-md'>
            <div className='text-center'>
              <span className='block text-lg font-bold leading-none'>
                {new Date(event.event_date).getDate()}
                {event.end_date && event.end_date !== event.event_date && `-${new Date(event.end_date).getDate()}`}
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-[10px] font-medium uppercase leading-tight text-white/90'>
                {new Date(event.event_date).toLocaleString('id-ID', { month: 'short' })}
              </span>
              <span className='text-[10px] leading-tight text-white/80'>
                {new Date(event.event_date).toLocaleString('id-ID', { weekday: 'short' })}
                {event.event_time ? ` • ${event.event_time.slice(0, 5)}` : ''}
              </span>
            </div>
          </div>
        )}

        {/* Status overlay for non-upcoming */}
        {event.status && event.status !== 'upcoming' ? (
          <div className='absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 group-hover:bg-black/50'>
            <span className='rounded-full bg-black/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm'>
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

      {/* Body Content */}
      <div className='flex flex-1 flex-col justify-between p-4'>
        <div className='space-y-3'>
          <h3 className='line-clamp-2 font-display text-base font-bold leading-snug text-foreground transition-colors group-hover:text-[#FF8000]'>
            {event.title}
          </h3>
          
          <div className='space-y-1.5 text-sm text-muted-foreground'>
            {event.event_date && event.event_time ? (
              <div className='flex items-center gap-2'>
                <Clock className='size-[15px] shrink-0 text-[#FF8000]' />
                <span className='truncate'>
                  {formatTimeId(event.event_time)}
                  {event.end_time && event.end_time !== event.event_time ? ` - ${formatTimeId(event.end_time)}` : ''}
                </span>
              </div>
            ) : null}
            <div className='flex items-start gap-2'>
              <MapPin className='mt-0.5 size-[15px] shrink-0 text-[#FF8000]' />
              <span className='line-clamp-1'>
                {formatLocation(event.location_address, event.location_area)}
              </span>
            </div>
          </div>
        </div>

        <div className='mt-4 flex flex-col gap-3'>
          {/* Thick Progress bar */}
          <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
            <div 
              className={`h-full rounded-full ${progressColor}`} 
              style={{ width: `${Math.min(100, Math.max(2, pct))}%` }} 
            />
          </div>

          {/* Footer Actions */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
              <Users className='size-4' />
              <span>{current}/{max} peserta</span>
            </div>
            
            <span className='inline-flex items-center justify-center gap-1.5 rounded-full bg-muted/40 px-4 py-1.5 text-sm font-semibold text-muted-foreground transition-colors group-hover:bg-[#FFF1E5] group-hover:text-[#FF8000]'>
              Gabung <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
