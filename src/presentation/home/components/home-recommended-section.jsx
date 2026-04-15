import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Loader2, MapPin, Sparkles, Users, Zap } from 'lucide-react';

import { Card, CardContent } from '@/presentation/components/ui/card';

import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/lib/utils';
import { eventsApi } from '@/infrastructure/events/events-api';
import { usersApi } from '@/infrastructure/users/users-api';
import { formatTimeId, formatLocation } from '@/shared/lib/formatters';

export function HomeRecommendedSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const eventsRes = await eventsApi.list({ limit: 6, sort: 'popular', status: 'upcoming' });
        const data = eventsRes.data;
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (data?.results) items = data.results;
        else if (data?.data) {
          const inner = data.data;
          items = Array.isArray(inner) ? inner : (inner?.results || inner?.events || []);
        }
        let joinedIds = new Set();
        try {
          const joinedIdsRes = await usersApi.joinedEventIds();
          const joinedPayload = joinedIdsRes.data?.data ?? joinedIdsRes.data;
          joinedIds = new Set((joinedPayload?.event_ids || []).map((id) => String(id)));
        } catch {
          joinedIds = new Set();
        }
        const merged = items.map((event) => ({
          ...event,
          is_joined: Boolean(event.is_joined || joinedIds.has(String(event.id))),
        }));
        if (!cancelled) setEvents(merged.slice(0, 6));
      } catch {
        // silently ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className='space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <h2 className='font-display flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl'>
          <Sparkles className='size-6 shrink-0 text-[#FF8000] md:size-7' strokeWidth={2} aria-hidden />
          Recommended for You
        </h2>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='size-6 animate-spin text-[#FF8000]' />
        </div>
      ) : events.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-2xl bg-card py-12 text-center'>
          <Zap className='size-8 text-muted-foreground/30' />
          <p className='text-sm text-muted-foreground'>Belum ada event rekomendasi</p>
        </div>
      ) : (
        <div className='flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pt-2 xs:gap-6 md:gap-8'>
          {events.map((event, idx) => {
            const current = event.participant_count ?? event.participants_count ?? event.current_participants ?? 0;
            const max = event.max_participants ?? '∞';
            const isJoined = Boolean(
              event.is_joined ||
              event.is_participant ||
              event.joined ||
              event.is_registered ||
              event.has_joined ||
              event.registration_status === 'joined',
            );
            const maxNum = max === '∞' ? 1 : max;
            const pct = max === '∞' ? 0 : Math.min(100, Math.round((current / maxNum) * 100));

            const pastelPalettes = [
              { bg: 'bg-[#FFB3BA]', text: 'text-[#9A1F2A]' }, // pastel pink
              { bg: 'bg-[#FFDFBA]', text: 'text-[#9A4A0F]' }, // pastel orange
              { bg: 'bg-[#FFFFBA]', text: 'text-[#9A9A0F]' }, // pastel yellow
              { bg: 'bg-[#BAFFC9]', text: 'text-[#0F9A2A]' }, // pastel green
              { bg: 'bg-[#BAE1FF]', text: 'text-[#0F4A9A]' }, // pastel blue
              { bg: 'bg-[#E8BAFF]', text: 'text-[#4A0F9A]' }, // pastel purple
            ];
            const palette = pastelPalettes[idx % pastelPalettes.length];
            const progressColor = palette.bg;

            return (
              <div key={event.id} className='w-[85vw] shrink-0 snap-center xs:w-[280px] sm:w-[320px]'>
                <Link to={`/events/${event.id}`} className='group block h-full'>
                  <Card className='flex h-full flex-col overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md'>
                    
                    {/* Image Header */}
                    <div className='relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted/30'>
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
                      
                      {/* Top Left Badge */}
                      <div className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm ${palette.bg} ${palette.text}`}>
                        {event.category || 'Event'}
                      </div>

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
                    </div>

                    {/* Body Content */}
                    <CardContent className='flex flex-1 flex-col justify-between p-4'>
                      <div className='space-y-3'>
                        <h3 className='font-display text-base font-bold leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-[#FF8000]'>
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
                            <span className='line-clamp-1'>{formatLocation(event.location_address, event.location_area)}</span>
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
                          
                          <span className={cn(
                            'inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                            isJoined
                              ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-100'
                              : 'bg-muted/40 text-muted-foreground group-hover:bg-[#FFF1E5] group-hover:text-[#FF8000]',
                          )}>
                            {isJoined ? 'Lihat Detail' : 'Gabung'} <span aria-hidden>→</span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
