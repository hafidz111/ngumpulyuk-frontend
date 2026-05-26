import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Users, Zap } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/lib/utils';
import { Card } from '../../components/ui/card';
import { LandingCardSkeleton } from './landing-section-placeholder';
import {
  LandingEmptyCalendarIcon,
  LandingSectionEmpty,
} from './landing-section-empty';
import { MotionDiv } from '../../lib/motion-primitives';

/**
 * @param {{ trending: Record<string, unknown>; isRefreshing?: boolean }} props
 */
export function LandingTrendingActivitiesSection({ trending, isRefreshing = false }) {
  const items = /** @type {Array<Record<string, unknown>>} */ (trending.items ?? []);
  const isEmpty = Boolean(trending.isEmpty) || items.length === 0;
  const emptyCopy = /** @type {{ title?: string; description?: string; cta?: string }} */ (
    trending.empty ?? {}
  );

  return (
    <section id='kegiatan' className='bg-surface-low py-20 md:py-28'>
      <div className='mx-auto max-w-7xl px-6 md:px-8'>
        <div className='mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end md:mb-14'>
          <h2 className='font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl'>
            {trending.title}
          </h2>
          <Link
            to={ROUTES.register}
            className='group flex shrink-0 items-center gap-2 font-display text-sm font-bold text-primary'
          >
            {trending.seeAllLabel}
            <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
          </Link>
        </div>

        {isRefreshing && isEmpty ? (
          <LandingCardSkeleton count={4} />
        ) : isEmpty ? (
          <LandingSectionEmpty
            title={emptyCopy.title ?? 'Belum ada event'}
            description={
              emptyCopy.description ??
              'Setelah daftar kamu bisa jelajahi map, join event, atau ngadain sendiri.'
            }
            ctaLabel={emptyCopy.cta ?? String(trending.seeAllLabel ?? 'Mulai ngumpul')}
            icon={LandingEmptyCalendarIcon}
            showEventPreviews
          />
        ) : (
          <div
            className={cn(
              items.length > 1 &&
                '-mx-1 flex gap-4 overflow-x-auto overscroll-x-contain px-1 pb-2 snap-x snap-mandatory [scrollbar-width:thin] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4',
              items.length === 1 && 'max-w-sm',
            )}
          >
            {items.map((item, index) => (
              <MotionDiv
                key={item.id || item.title}
                className={cn(
                  'shrink-0 snap-start',
                  items.length > 1 ? 'w-[min(72vw,13.5rem)] sm:w-auto' : 'w-full',
                )}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-48px' }}
                transition={{
                  delay: index * 0.06,
                  type: 'spring',
                  stiffness: 120,
                  damping: 20,
                }}
                whileHover={{ y: -4 }}
              >
                <Link to={ROUTES.register} className='block h-full'>
                  <Card className='flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-white p-3 shadow-sm transition-shadow hover:shadow-md'>
                    <div className='relative mb-3 w-full overflow-hidden rounded-xl aspect-[3/2] bg-muted/30'>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=''
                          className='absolute inset-0 h-full w-full object-cover'
                        />
                      ) : (
                        <div className='flex h-full items-center justify-center'>
                          <Zap className='size-8 text-[#FF8000]/30' aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className='flex flex-1 flex-col space-y-1.5'>
                      <p className='text-[9px] font-bold uppercase tracking-widest text-[#FF8000]'>
                        {item.categoryLabel}
                      </p>
                      <h3 className='font-display text-sm font-bold leading-snug text-foreground line-clamp-2'>
                        {item.title}
                      </h3>
                      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                        <MapPin className='size-3.5 shrink-0' aria-hidden />
                        <span className='line-clamp-1'>{item.location}</span>
                      </div>
                      {item.participantCount != null ? (
                        <div className='mt-auto flex items-center gap-1 pt-1.5 text-[11px] font-medium text-muted-foreground'>
                          <Users className='size-3' aria-hidden />
                          {item.participantCount}
                          {item.maxParticipants ? ` / ${item.maxParticipants}` : ''} peserta
                        </div>
                      ) : null}
                    </div>
                  </Card>
                </Link>
              </MotionDiv>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
