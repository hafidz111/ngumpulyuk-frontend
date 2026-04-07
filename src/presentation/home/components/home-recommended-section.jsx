import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Loader2, MapPin, Sparkles, Users, Zap } from 'lucide-react';

import { Badge } from '@/presentation/components/ui/badge';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Progress } from '@/presentation/components/ui/progress';

import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/lib/utils';
import { eventsApi } from '@/infrastructure/events/events-api';
import { formatTimeId, formatLocation, formatEventDateRange } from '@/shared/lib/formatters';

export function HomeRecommendedSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await eventsApi.list({ limit: 6, sort: 'popular', status: 'upcoming' });
        const data = res.data;
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (data?.results) items = data.results;
        else if (data?.data) {
          const inner = data.data;
          items = Array.isArray(inner) ? inner : (inner?.results || inner?.events || []);
        }
        if (!cancelled) setEvents(items.slice(0, 6));
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
          <Sparkles className='size-6 shrink-0 text-primary-container md:size-7' strokeWidth={2} aria-hidden />
          Recommended for You
        </h2>
        <Link
          to={ROUTES.events}
          className='text-sm font-semibold text-primary-container hover:underline'
        >
          Lihat Semua <span aria-hidden>&gt;</span>
        </Link>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='size-6 animate-spin text-primary-container' />
        </div>
      ) : events.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-2xl bg-card py-12 text-center'>
          <Zap className='size-8 text-muted-foreground/30' />
          <p className='text-sm text-muted-foreground'>Belum ada event rekomendasi</p>
        </div>
      ) : (
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {events.map((event) => {
            const current = event.participant_count ?? event.participants_count ?? event.current_participants ?? 0;
            const max = event.max_participants ?? 1;
            const pct = Math.min(100, Math.round((current / max) * 100));
            return (
              <Link key={event.id} to={`/events/${event.id}`} className='block'>
                <Card className='overflow-hidden border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md'>
                  <div className='relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary-container/20 to-secondary/20'>
                    {event.cover_image ? (
                      <img
                        src={event.cover_image}
                        alt=''
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='flex h-full items-center justify-center'>
                        <Zap className='size-8 text-primary-container/25' />
                      </div>
                    )}
                    <Badge
                      variant='muted'
                      className='absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[0.65rem] font-semibold normal-case text-foreground shadow-sm'
                    >
                      {event.category}
                    </Badge>
                  </div>
                  <CardContent className='space-y-3 p-4'>
                    <h3 className='font-display text-base font-bold leading-snug text-foreground line-clamp-2'>
                      {event.title}
                    </h3>
                    <div className='space-y-1.5 text-xs text-muted-foreground'>
                      {event.event_date ? (
                        <p className='flex items-center gap-2'>
                          <Calendar className='size-3.5 shrink-0' aria-hidden />
                          <span className='truncate'>{formatEventDateRange(event.event_date, event.end_date)}
                          {event.event_time ? ` · ${formatTimeId(event.event_time)}` : ''}
                          {event.end_time && event.end_time !== event.event_time ? ` - ${formatTimeId(event.end_time)}` : ''}</span>
                        </p>
                      ) : null}
                      <p className='flex items-center gap-2'>
                        <MapPin className='size-3.5 shrink-0' aria-hidden />
                        <span className='truncate'>{formatLocation(event.location_address, event.location_area)}</span>
                      </p>
                      <p className='flex items-center gap-2'>
                        <Users className='size-3.5 shrink-0' aria-hidden />
                        {current}/{max} peserta
                      </p>
                    </div>
                    <div
                      className={cn(
                        'pt-1',
                        '[&_[data-slot=progress]]:bg-muted/90 [&_[data-slot=progress-indicator]]:bg-primary-container',
                      )}
                    >
                      <Progress value={pct} className='h-1.5' />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
