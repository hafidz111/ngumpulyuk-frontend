import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Clock, Loader2, MapPin, Users, Zap } from 'lucide-react';

import { Card } from '@/presentation/components/ui/card';
import { ROUTES } from '@/shared/config/routes';
import { formatTimeId, formatLocation, formatEventDateRange } from '@/shared/lib/formatters';
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
      <h2 className='font-display flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl'>
        <Clock className='size-6 shrink-0 text-primary-container md:size-7' strokeWidth={2} aria-hidden />
        Event Mendatang
      </h2>

      {loading ? (
        <div className='flex items-center justify-center py-10'>
          <Loader2 className='size-6 animate-spin text-primary-container' />
        </div>
      ) : events.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-2xl bg-card py-10 text-center'>
          <Zap className='size-8 text-muted-foreground/30' />
          <p className='text-sm text-muted-foreground'>Belum ada event mendatang</p>
          <Link to={ROUTES.eventCreate} className='text-sm font-semibold text-primary-container hover:underline'>
            Buat event pertama →
          </Link>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {events.map((event) => {
            const current = event.participant_count ?? event.participants_count ?? event.current_participants ?? 0;
            const max = event.max_participants ?? '∞';
            return (
              <Link key={event.id} to={`/events/${event.id}`} className='block'>
                <Card className='border border-border/80 bg-card transition-colors hover:bg-muted/30'>
                  <div className='flex gap-4 p-4'>
                    {event.cover_image ? (
                      <img
                        src={event.cover_image}
                        alt=''
                        className='size-20 shrink-0 rounded-xl object-cover md:size-24'
                      />
                    ) : (
                      <div className='flex size-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-container/15 to-secondary/15 md:size-24'>
                        <Zap className='size-7 text-primary-container/30' />
                      </div>
                    )}
                    <div className='min-w-0 flex-1 space-y-1'>
                      <h3 className='font-display font-bold text-foreground line-clamp-1'>{event.title}</h3>
                      {event.event_date ? (
                        <p className='flex items-center gap-1.5 text-sm text-muted-foreground truncate'>
                          <Calendar className='size-3.5 shrink-0' aria-hidden />
                          <span className='truncate'>{formatEventDateRange(event.event_date, event.end_date)}
                          {event.event_time ? ` · ${formatTimeId(event.event_time)}` : ''}
                          {event.end_time && event.end_time !== event.event_time ? ` - ${formatTimeId(event.end_time)}` : ''}</span>
                        </p>
                      ) : null}
                      <p className='flex items-center gap-1.5 text-sm text-muted-foreground truncate'>
                        <MapPin className='size-3.5 shrink-0' aria-hidden />
                        {formatLocation(event.location_address, event.location_area)}
                      </p>
                    </div>
                    <div className='flex shrink-0 items-center gap-3'>
                      <span className='flex items-center gap-1 text-sm font-medium text-muted-foreground'>
                        <Users className='size-3.5' aria-hidden />
                        {current}/{max}
                      </span>
                      <ChevronRight className='size-5 text-muted-foreground' aria-hidden />
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
