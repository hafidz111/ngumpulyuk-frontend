import { ArrowRight, MapPin } from 'lucide-react';

import { Card } from '../../components/ui/card';
import { MotionDiv } from '../../lib/motion-primitives';

export function LandingTrendingActivitiesSection({ trending }) {
  return (
    <section id='kegiatan' className='bg-surface py-20 md:py-28'>
      <div className='mx-auto max-w-7xl px-6 md:px-8'>
        <div className='mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end md:mb-14'>
          <h2 className='font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl'>
            {trending.title}
          </h2>
          <a
            href='#'
            className='group flex shrink-0 items-center gap-2 font-display text-sm font-bold text-primary'
          >
            {trending.seeAllLabel}
            <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
          </a>
        </div>

        <div className='grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {trending.items.map((item, index) => (
            <MotionDiv
              key={item.title}
              className={index % 2 === 1 ? 'md:mt-8' : ''}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-48px' }}
              transition={{
                delay: index * 0.06,
                type: 'spring',
                stiffness: 120,
                damping: 20,
              }}
              whileHover={{ y: -8 }}
            >
              <Card className='flex w-full flex-col overflow-hidden rounded-3xl border-0 bg-surface-lowest p-4 shadow-ambient'>
                <div className='relative mb-6 w-full overflow-hidden rounded-2xl aspect-[4/3]'>
                  <img
                    src={item.image}
                    alt={item.title}
                    className='absolute inset-0 h-full w-full object-cover'
                  />
                </div>
                <div className='flex flex-col space-y-3'>
                  <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-90'>
                    {item.categoryLabel}
                  </p>
                  <h3 className='font-display text-xl font-bold leading-snug text-foreground'>
                    {item.title}
                  </h3>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <MapPin className='h-4 w-4 shrink-0' aria-hidden />
                    <span>{item.location}</span>
                  </div>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
