import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { CommunityCard } from '@/presentation/community/components/community-card';
import { Button } from '../../components/ui/button';
import { LandingCardSkeleton } from './landing-section-placeholder';
import { LandingEmptyUsersIcon, LandingSectionEmpty } from './landing-section-empty';
import { MotionDiv } from '../../lib/motion-primitives';

const GAP_PX = 24;

/**
 * @param {{
 *   title: string;
 *   description: string;
 *   items: Array<Record<string, unknown>>;
 * }} props
 */
function LandingCommunitiesCarousel({ title, description, items }) {
  const [index, setIndex] = useState(0);
  const [stepPx, setStepPx] = useState(0);
  const measureCardRef = useRef(null);
  const len = items.length;

  useEffect(() => {
    const el = measureCardRef.current;
    if (!el) return undefined;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      setStepPx(w + GAP_PX);
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [len]);

  const goPrev = () => setIndex((i) => (i - 1 + len) % len);
  const goNext = () => setIndex((i) => (i + 1) % len);
  const x = stepPx > 0 ? -index * stepPx : 0;

  return (
    <div className='flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16'>
      <div className='shrink-0 space-y-6 lg:max-w-sm lg:pt-2'>
        <h2 className='font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl'>
          {title}
        </h2>
        <p className='text-base leading-relaxed text-muted-foreground'>
          {description}
        </p>
        {len > 1 ? (
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='rounded-full border-outline-variant/40 bg-transparent'
              onClick={goPrev}
              aria-label='Circle sebelumnya'
            >
              <ChevronLeft className='h-5 w-5' />
            </Button>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='rounded-full border-outline-variant/40 bg-transparent'
              onClick={goNext}
              aria-label='Circle berikutnya'
            >
              <ChevronRight className='h-5 w-5' />
            </Button>
          </div>
        ) : null}
        <Link
          to={ROUTES.register}
          className='group inline-flex items-center gap-2 font-display text-sm font-bold text-primary'
        >
          Gabung circle
          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
        </Link>
      </div>

      <div className='min-w-0 flex-1 lg:pt-0'>
        <div className='-mr-6 overflow-hidden pr-6 md:-mr-8 md:pr-8 lg:mr-0 lg:pr-0'>
          <MotionDiv
            className='flex gap-6'
            animate={{ x }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
          >
            {items.map((community, i) => (
              <div
                key={community.id || community.name}
                ref={i === 0 ? measureCardRef : undefined}
                className='w-[min(100%,400px)] shrink-0'
              >
                <CommunityCard community={community} to={ROUTES.register} size='compact' />
              </div>
            ))}
          </MotionDiv>
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{ communities: Record<string, unknown>; isRefreshing?: boolean }} props
 */
export function LandingCommunitiesSection({ communities, isRefreshing = false }) {
  const items = /** @type {Array<Record<string, unknown>>} */ (communities.items ?? []);
  const isEmpty = Boolean(communities.isEmpty) || items.length === 0;
  const emptyCopy = /** @type {{ title?: string; description?: string; cta?: string }} */ (
    communities.empty ?? {}
  );
  const len = items.length;

  return (
    <section id='circle' className='overflow-hidden bg-surface py-20 md:py-28'>
      <div className='mx-auto max-w-7xl px-6 md:px-8'>
        {isRefreshing && isEmpty ? (
          <LandingCardSkeleton count={3} className='max-w-4xl sm:grid-cols-2 lg:grid-cols-3' />
        ) : isEmpty ? (
          <>
            <div className='mb-10 max-w-2xl space-y-3'>
              <h2 className='font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl'>
                {communities.title}
              </h2>
              <p className='text-base leading-relaxed text-muted-foreground'>
                {communities.description}
              </p>
            </div>
            <LandingSectionEmpty
              title={emptyCopy.title ?? 'Belum ada circle'}
              description={
                emptyCopy.description ??
                'Jadi yang pertama bikin komunitas setelah daftar.'
              }
              ctaLabel={emptyCopy.cta ?? 'Daftar'}
              icon={LandingEmptyUsersIcon}
            />
          </>
        ) : (
          <LandingCommunitiesCarousel
            key={len}
            title={String(communities.title ?? '')}
            description={String(communities.description ?? '')}
            items={items}
          />
        )}
      </div>
    </section>
  );
}
