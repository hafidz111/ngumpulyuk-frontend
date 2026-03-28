import { ArrowRight, Sparkles, Star } from 'lucide-react';

import { MotionDiv } from '../../lib/motion-primitives';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage } from '../../components/ui/avatar';

const floatTransition = { duration: 5, repeat: Infinity, ease: 'easeInOut' };

export function LandingHeroSection({ hero }) {
  return (
    <section className='relative overflow-hidden pt-28 pb-16 md:pb-24'>
      <div className='pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-primary-container/25 blur-3xl' />
      <div className='pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-secondary-container/20 blur-3xl' />

      <div className='relative mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8'>
        <div className='w-full space-y-8 lg:w-1/2'>
          <Badge className='inline-flex items-center gap-1.5 font-display normal-case tracking-normal'>
            <Sparkles className='size-3.5 shrink-0' strokeWidth={2} aria-hidden />
            {hero.badge}
          </Badge>
          <h1 className='font-display text-5xl font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground md:text-6xl lg:text-7xl'>
            {hero.titleLine1}
            <br />
            <span className='bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent'>
              {hero.titleLine2}
            </span>
          </h1>
          <p className='max-w-lg text-lg leading-relaxed text-muted-foreground'>{hero.description}</p>
          <div className='flex flex-wrap gap-4'>
            <Button size='lg' type='button' className='gap-2'>
              {hero.primaryCta}
              <ArrowRight className='h-5 w-5' />
            </Button>
            <Button size='lg' variant='outline' type='button' className='border-outline-variant/30 bg-surface-lowest'>
              {hero.secondaryCta}
            </Button>
          </div>
          <div className='flex flex-wrap items-center gap-4 pt-2'>
            <div className='flex -space-x-3'>
              {hero.socialProof.avatars.map((src, i) => (
                <Avatar key={src} className='z-[1] ring-2 ring-surface' style={{ zIndex: 3 - i }}>
                  <AvatarImage src={src} alt={`Anggota ${i + 1}`} />
                </Avatar>
              ))}
            </div>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <div className='flex text-primary-container'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className='h-4 w-4 fill-primary-container text-primary-container' />
                ))}
              </div>
              <span>
                <span className='font-bold text-foreground'>{hero.socialProof.rating}</span>{' '}
                {hero.socialProof.reviewsLabel}
              </span>
            </div>
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
              alt='Komunitas berkumpul'
              className='aspect-[4/3] w-full rounded-[1.35rem] object-cover md:aspect-auto md:h-[min(440px,55vh)]'
            />
          </MotionDiv>

          <MotionDiv
            className='absolute -left-2 top-8 z-20 max-w-[200px] md:left-4'
            animate={{ y: [0, -8, 0] }}
            transition={floatTransition}
          >
            <Card className='shadow-ambient'>
              <CardContent className='space-y-1 p-4'>
                <p className='font-display text-sm font-bold text-foreground'>{hero.floatingCards[0].title}</p>
                <p className='text-xs text-muted-foreground'>{hero.floatingCards[0].subtitle}</p>
              </CardContent>
            </Card>
          </MotionDiv>

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
                    {hero.floatingCards[1].title}
                  </p>
                  <p className='text-xs text-muted-foreground'>{hero.floatingCards[1].subtitle}</p>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
