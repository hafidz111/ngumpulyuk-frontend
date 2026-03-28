import { Link } from 'react-router-dom';
import { Calendar, MapPin, Sparkles, Users } from 'lucide-react';

import { Badge } from '@/presentation/components/ui/badge';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Progress } from '@/presentation/components/ui/progress';

import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/lib/utils';

export function HomeRecommendedSection({ title, seeAllLabel, items }) {
  return (
    <section className='space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <h2 className='font-display flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl'>
          <Sparkles className='size-6 shrink-0 text-primary-container md:size-7' strokeWidth={2} aria-hidden />
          {title}
        </h2>
        <Link
          to={ROUTES.explore}
          className='text-sm font-semibold text-primary-container hover:underline'
        >
          {seeAllLabel} <span aria-hidden>&gt;</span>
        </Link>
      </div>
      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {items.map((event) => {
          const pct = Math.min(
            100,
            Math.round((event.participantsCurrent / event.participantsMax) * 100),
          );
          return (
            <Card
              key={event.id}
              className='overflow-hidden border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md'
            >
              <div className='relative aspect-[16/10] w-full overflow-hidden'>
                <img
                  src={event.imageUrl}
                  alt=''
                  className='h-full w-full object-cover'
                />
                <Badge
                  variant='muted'
                  className='absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[0.65rem] font-semibold normal-case text-foreground shadow-sm'
                >
                  {event.categoryLabel}
                </Badge>
                {event.matchPercent != null ? (
                  <span className='absolute bottom-3 left-3 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground shadow'>
                    {event.matchPercent}% match
                  </span>
                ) : null}
              </div>
              <CardContent className='space-y-3 p-4'>
                <h3 className='font-display text-base font-bold leading-snug text-foreground'>
                  {event.title}
                </h3>
                <div className='space-y-1.5 text-xs text-muted-foreground'>
                  <p className='flex items-center gap-2'>
                    <Calendar className='size-3.5 shrink-0' aria-hidden />
                    {event.datetimeLabel}
                  </p>
                  <p className='flex items-center gap-2'>
                    <MapPin className='size-3.5 shrink-0' aria-hidden />
                    {event.locationLabel}
                  </p>
                  <p className='flex items-center gap-2'>
                    <Users className='size-3.5 shrink-0' aria-hidden />
                    {event.participantsCurrent}/{event.participantsMax} peserta
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
          );
        })}
      </div>
    </section>
  );
}
