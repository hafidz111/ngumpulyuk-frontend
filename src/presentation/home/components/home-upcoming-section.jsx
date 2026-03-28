import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Clock, MapPin, Users } from 'lucide-react';

import { Card } from '@/presentation/components/ui/card';

import { ROUTES } from '@/shared/config/routes';

export function HomeUpcomingSection({ title, items }) {
  return (
    <section className='space-y-4'>
      <h2 className='font-display flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl'>
        <Clock className='size-6 shrink-0 text-primary-container md:size-7' strokeWidth={2} aria-hidden />
        {title}
      </h2>
      <div className='flex flex-col gap-3'>
        {items.map((event) => (
          <Link key={event.id} to={ROUTES.explore} className='block'>
            <Card className='border border-border/80 bg-card transition-colors hover:bg-muted/30'>
              <div className='flex gap-4 p-4'>
                <img
                  src={event.imageUrl}
                  alt=''
                  className='size-20 shrink-0 rounded-xl object-cover md:size-24'
                />
                <div className='min-w-0 flex-1 space-y-1'>
                  <h3 className='font-display font-bold text-foreground'>{event.title}</h3>
                  <p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                    <Calendar className='size-3.5 shrink-0' aria-hidden />
                    {event.datetimeLabel}
                  </p>
                  <p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                    <MapPin className='size-3.5 shrink-0' aria-hidden />
                    {event.locationLabel}
                  </p>
                </div>
                <div className='flex shrink-0 flex-col items-end justify-center gap-1'>
                  <span className='flex items-center gap-1 text-sm font-medium text-muted-foreground'>
                    <Users className='size-3.5' aria-hidden />
                    {event.participantsCurrent}/{event.participantsMax}
                  </span>
                  <ChevronRight className='size-5 text-muted-foreground' aria-hidden />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
