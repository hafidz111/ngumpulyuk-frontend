import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Clock, Loader2, MapPin, Users, Zap } from 'lucide-react';

import { Card } from '@/presentation/components/ui/card';
import { ROUTES } from '@/shared/config/routes';
import { formatTimeId, formatLocation } from '@/shared/lib/formatters';
import { eventsApi } from '@/infrastructure/events/events-api';

export function HomeUpcomingSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await eventsApi.list({ limit: 5, sort: 'date_asc', status: 'upcoming' });
        const data = res.data;
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (data?.results) items = data.results;
        else if (data?.data) {
          const inner = data.data;
          items = Array.isArray(inner) ? inner : (inner?.results || inner?.events || []);
        }
        if (!cancelled) setEvents(items.slice(0, 5));
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
          <Calendar className='size-6 shrink-0 text-[#FF8000] md:size-7' strokeWidth={2} aria-hidden />
          Event Mendatang
        </h2>
        <Link
          to={ROUTES.events}
          className='text-sm font-semibold text-[#FF8000] hover:underline'
        >
          Lihat Semua <span aria-hidden>→</span>
        </Link>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-10'>
          <Loader2 className='size-6 animate-spin text-[#FF8000]' />
        </div>
      ) : events.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-2xl bg-card py-10 text-center'>
          <Zap className='size-8 text-muted-foreground/30' />
          <p className='text-sm text-muted-foreground'>Belum ada event mendatang</p>
          <Link to={ROUTES.eventCreate} className='text-sm font-semibold text-[#FF8000] hover:underline'>
            Buat event pertama →
          </Link>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {events.map((event, idx) => {
            const current = event.participant_count ?? event.participants_count ?? event.current_participants ?? 0;
            const max = event.max_participants ?? '-';
            const dateBoxColors = idx % 2 === 1
              ? 'bg-[#FFF1E5] text-[#FF8000]'
              : 'bg-muted text-foreground';

            const pastelPalettes = [
              { bg: 'bg-[#FFB3BA]', text: 'text-[#9A1F2A]' },
              { bg: 'bg-[#FFDFBA]', text: 'text-[#9A4A0F]' },
              { bg: 'bg-[#FFFFBA]', text: 'text-[#9A9A0F]' },
              { bg: 'bg-[#BAFFC9]', text: 'text-[#0F9A2A]' },
              { bg: 'bg-[#BAE1FF]', text: 'text-[#0F4A9A]' },
              { bg: 'bg-[#E8BAFF]', text: 'text-[#4A0F9A]' },
            ];
            const palette = pastelPalettes[idx % pastelPalettes.length];
            const tagColor = `${palette.bg} ${palette.text}`;

            return (
              <Link key={event.id} to={`/events/${event.id}`} className='group block'>
                <Card className='rounded-2xl border border-border bg-card pr-4 pl-3 py-3 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md hover:bg-muted/30'>
                  <div className='flex items-center gap-3 md:gap-4'>

                    {/* Date Box */}
                    <div className={`flex h-[60px] min-w-[60px] shrink-0 flex-col items-center justify-center rounded-xl md:h-[68px] md:min-w-[68px] ${dateBoxColors}`}>
                      {event.event_date ? (
                        <>
                          <span className='font-display text-lg font-bold leading-tight'>
                            {new Date(event.event_date).getDate()}
                            {event.end_date && event.end_date !== event.event_date && ` - ${new Date(event.end_date).getDate()}`}
                          </span>
                          <span className='text-[10px] font-bold uppercase tracking-wider opacity-80'>
                            {new Date(event.event_date).toLocaleString('id-ID', { month: 'short' })}
                          </span>
                        </>
                      ) : (
                        <Calendar className='size-5 opacity-60' />
                      )}
                    </div>

                    {/* Image */}
                    {event.cover_image ? (
                      <div className='size-14 shrink-0 overflow-hidden rounded-2xl md:size-16'>
                        <img
                          src={event.cover_image}
                          alt=''
                          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                        />
                      </div>
                    ) : (
                      <div className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8000]/10 to-secondary/10 md:size-16'>
                        <Zap className='size-5 text-[#FF8000]/30 transition-colors group-hover:text-[#FF8000]' />
                      </div>
                    )}

                    {/* Main Info */}
                    <div className='min-w-0 flex-1 space-y-1.5 py-0.5'>
                      <h3 className='font-display font-bold text-foreground line-clamp-1 transition-colors group-hover:text-[#FF8000]'>
                        {event.title}
                      </h3>

                      <div className='flex items-center gap-1.5 text-[13px] text-muted-foreground'>
                        <MapPin className='size-3.5 shrink-0' />
                        <span className='truncate'>{formatLocation(event.location_address, event.location_area)}</span>
                      </div>

                      <div className='flex items-center gap-2 text-[12px]'>
                        <div className={`inline-flex items-center rounded-md px-2 py-0.5 font-semibold ${tagColor}`}>
                          <span>
                            {event.category || 'Event'}
                          </span>
                        </div>

                        {/* Time Info */}
                        {event.event_time && (
                          <div className='flex items-center gap-1 text-muted-foreground'>
                            <Clock className='size-3 shrink-0' />
                            <span>
                              {formatTimeId(event.event_time)}
                              {event.end_time && event.end_time !== event.event_time ? ` - ${formatTimeId(event.end_time)}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side Actions */}
                    <div className='flex shrink-0 items-center gap-3 pl-2 md:pl-4'>
                      <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground'>
                        <Users className='size-3.5' />
                        <span>{current}/{max}</span>
                      </div>
                      <ChevronRight className='size-4 text-muted-foreground transition-transform group-hover:translate-x-1' />
                    </div>

                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
