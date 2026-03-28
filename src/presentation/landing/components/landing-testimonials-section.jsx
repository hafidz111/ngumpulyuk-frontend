import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

import { Avatar, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { MotionDiv } from '../../lib/motion-primitives';

const GAP_PX = 24;

export function LandingTestimonialsSection({ heading, testimonials }) {
  const [index, setIndex] = useState(0);
  const [stepPx, setStepPx] = useState(0);
  const measureCardRef = useRef(null);

  const len = testimonials.length;

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
    <section id='komunitas' className='overflow-hidden bg-surface-low py-20 md:py-28'>
      <div className='mx-auto max-w-7xl px-6 md:px-8'>
        <div className='flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16'>
          <div className='shrink-0 space-y-6 lg:max-w-sm lg:pt-2'>
            <h2 className='font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl'>
              {heading.title}
            </h2>
            <p className='text-base leading-relaxed text-muted-foreground'>{heading.description}</p>
            <div className='flex gap-3'>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='rounded-full border-outline-variant/40 bg-transparent'
                onClick={goPrev}
                aria-label='Testimoni sebelumnya'
              >
                <ChevronLeft className='h-5 w-5' />
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='rounded-full border-outline-variant/40 bg-transparent'
                onClick={goNext}
                aria-label='Testimoni berikutnya'
              >
                <ChevronRight className='h-5 w-5' />
              </Button>
            </div>
          </div>

          <div className='min-w-0 flex-1 lg:pt-0'>
            <div className='-mr-6 overflow-hidden pr-6 md:-mr-8 md:pr-8 lg:mr-0 lg:pr-0'>
              <MotionDiv
                className='flex gap-6'
                animate={{ x }}
                transition={{ type: 'spring', stiffness: 280, damping: 32 }}
              >
                {testimonials.map((item, i) => (
                  <Card
                    key={item.name}
                    ref={i === 0 ? measureCardRef : undefined}
                    data-testimonial-card
                    className='relative w-[min(100%,400px)] shrink-0 rounded-3xl border-0 bg-surface-lowest shadow-ambient'
                  >
                    <CardContent className='p-8'>
                      <Quote
                        className='pointer-events-none absolute right-8 top-8 h-14 w-14 text-primary-container/25'
                        strokeWidth={1}
                        aria-hidden
                      />
                      <div className='flex items-start gap-4 pr-12'>
                        <Avatar className='h-12 w-12 shrink-0 border-0'>
                          <AvatarImage src={item.avatar} alt={item.name} />
                        </Avatar>
                        <div className='min-w-0 space-y-0.5'>
                          <p className='font-display font-bold text-foreground'>{item.name}</p>
                          <p className='text-sm text-muted-foreground'>{item.role}</p>
                        </div>
                      </div>
                      <p className='mt-8 text-base italic leading-relaxed text-foreground/90'>
                        &ldquo;{item.quote}&rdquo;
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </MotionDiv>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
