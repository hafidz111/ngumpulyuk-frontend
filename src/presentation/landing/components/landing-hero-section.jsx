import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { MotionDiv } from '../../lib/motion-primitives';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { AvatarGroup, AvatarGroupCount } from '../../components/ui/avatar-group';
import { LandingAnimatedStatValue } from './landing-animated-stat-value';

const floatTransition = { duration: 5, repeat: Infinity, ease: 'easeInOut' };
const DISPLAY_AVATAR_COUNT = 3;

const FALLBACK_COLOR_CLASSES = [
  'bg-rose-200 text-rose-900',
  'bg-sky-200 text-sky-900',
  'bg-emerald-200 text-emerald-900',
  'bg-amber-200 text-amber-900',
  'bg-violet-200 text-violet-900',
  'bg-fuchsia-200 text-fuchsia-900',
  'bg-cyan-200 text-cyan-900',
];

/**
 * @param {string} identity
 */
function colorClassForIdentity(identity) {
  const source = String(identity || 'member');
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_COLOR_CLASSES[Math.abs(hash) % FALLBACK_COLOR_CLASSES.length];
}

/**
 * @param {{ hero: Record<string, unknown>; isRefreshing?: boolean }} props
 */
export function LandingHeroSection({ hero, isRefreshing = false }) {
  const socialProof = /** @type {{
 *   members: { id: string; name: string; image: string }[];
 *   total: number;
 *   memberCount: number;
 *   hasMembers: boolean;
 * }} */ (hero.socialProof);
  const floatingCards = /** @type {Array<Record<string, unknown>>} */ (
    Array.isArray(hero.floatingCards) ? hero.floatingCards : []
  );

  const displayMembers = socialProof.members.slice(0, DISPLAY_AVATAR_COUNT);
  const remaining = Math.max(0, (socialProof.total || 0) - displayMembers.length);

  return (
    <section
      id='home'
      className='relative flex min-h-[100dvh] flex-col justify-center overflow-hidden pt-20'
    >
      <div className='pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-primary-container/25 blur-3xl' />
      <div className='pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-secondary-container/20 blur-3xl' />

      <div className='relative mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-6 py-8 lg:flex-row lg:items-center lg:gap-14 lg:px-8 lg:py-10'>
        <div className='w-full space-y-6 lg:w-1/2 lg:space-y-8'>
          <Badge className='inline-flex items-center gap-1.5 font-display normal-case tracking-normal'>
            <Sparkles className='size-3.5 shrink-0' strokeWidth={2} aria-hidden />
            {hero.badge}
          </Badge>
          <h1 className='font-display text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-5xl md:text-6xl lg:text-[3.25rem] lg:leading-[1.08] xl:text-7xl'>
            {hero.titleLine1}
            <br />
            <span className='bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent'>
              {hero.titleLine2}
            </span>
          </h1>
          <p className='max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg'>
            {hero.description}
          </p>
          <div className='flex flex-wrap gap-4'>
            <Button size='lg' className='gap-2' asChild>
              <Link to={ROUTES.register}>
                {hero.primaryCta}
                <ArrowRight className='h-5 w-5' />
              </Link>
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='border-outline-variant/30 bg-surface-bright'
              asChild
            >
              <a href='#kegiatan'>{hero.secondaryCta}</a>
            </Button>
          </div>
          <div className='flex flex-wrap items-center gap-4 pt-2'>
            {displayMembers.length > 0 ? (
              <AvatarGroup className='grayscale'>
                {displayMembers.map((member) => (
                  <Avatar
                    key={member.id}
                    title={member.name}
                    className='avatar-group-item size-9 border-0'
                  >
                    {member.image ? (
                      <AvatarImage src={member.image} alt={member.name} />
                    ) : null}
                    <AvatarFallback className={colorClassForIdentity(member.id)}>
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {remaining > 0 || isRefreshing ? (
                  <AvatarGroupCount>
                    +
                    <LandingAnimatedStatValue
                      count={remaining}
                      isRefreshing={isRefreshing}
                      staggerIndex={1}
                      format='plain'
                    />
                  </AvatarGroupCount>
                ) : null}
              </AvatarGroup>
            ) : (
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <Users className='size-5' aria-hidden />
              </div>
            )}
            <p className='text-sm font-medium text-muted-foreground'>
              {socialProof.hasMembers || isRefreshing ? (
                <>
                  <LandingAnimatedStatValue
                    count={socialProof.memberCount}
                    isRefreshing={isRefreshing}
                    staggerIndex={0}
                  />{' '}
                  member udah join
                </>
              ) : (
                'Gabung jadi member pertama'
              )}
            </p>
          </div>
        </div>

        <div className='relative w-full lg:w-1/2'>
          <MotionDiv
            className='relative z-10 overflow-hidden rounded-3xl bg-surface-lowest p-2 shadow-ambient'
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={hero.image}
              alt='Event dan komunitas NgumpulYuk'
              className='aspect-[4/3] max-h-[min(280px,38vh)] w-full rounded-[1.35rem] object-cover sm:max-h-[min(320px,40vh)] lg:aspect-auto lg:max-h-[min(400px,52vh)] lg:min-h-[240px]'
            />
          </MotionDiv>

          {floatingCards[0] ? (
            <MotionDiv
              className='absolute -left-2 top-8 z-20 max-w-[200px] md:left-4'
              animate={{ y: [0, -8, 0] }}
              transition={floatTransition}
            >
              <Card className='shadow-ambient'>
                <CardContent className='space-y-1 p-4'>
                  <p className='font-display text-sm font-bold text-foreground'>
                    {floatingCards[0].variant === 'count' ? (
                      <LandingAnimatedStatValue
                        count={Number(floatingCards[0].count ?? 0)}
                        isRefreshing={isRefreshing}
                        staggerIndex={2}
                        suffix={` ${String(floatingCards[0].countSuffix ?? '')}`}
                      />
                    ) : (
                      String(floatingCards[0].title ?? '')
                    )}
                  </p>
                  <p className='text-xs text-muted-foreground'>{floatingCards[0].subtitle}</p>
                </CardContent>
              </Card>
            </MotionDiv>
          ) : null}

          {floatingCards[1] ? (
            <MotionDiv
              className='absolute -right-2 bottom-10 z-20 md:-right-4'
              animate={{ y: [0, -8, 0] }}
              transition={{ ...floatTransition, delay: 0.5 }}
            >
              <Card className='shadow-ambient'>
                <CardContent className='flex items-center gap-3 p-4'>
                  <span className='flex h-2 w-2 rounded-full bg-primary-container' />
                  <div>
                    <p className='font-display text-xs font-bold uppercase tracking-[0.05em] text-primary'>
                      {floatingCards[1].title}
                    </p>
                    <p className='line-clamp-2 text-xs text-muted-foreground'>
                      {floatingCards[1].subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          ) : null}
        </div>
      </div>
    </section>
  );
}
