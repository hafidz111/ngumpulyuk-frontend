import { Calendar, MapPin, Sparkles, Users } from 'lucide-react';

import { MotionDiv } from '../../lib/motion-primitives';

const iconMap = {
  users: Users,
  calendar: Calendar,
  'map-pin': MapPin,
  sparkles: Sparkles,
};

export function LandingStatsSection({ stats }) {
  return (
    <section className='border-y border-transparent bg-surface-low/80 py-12 md:py-16'>
      <div className='mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 md:grid-cols-4 md:gap-12 md:px-8'>
        {stats.map((item, index) => {
          const Icon = iconMap[item.icon] ?? Users;
          return (
            <MotionDiv
              key={item.label}
              className='flex flex-col items-center text-center'
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.05 }}
            >
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <Icon className='h-6 w-6' aria-hidden />
              </div>
              <p className='font-display text-2xl font-extrabold text-foreground md:text-3xl'>{item.value}</p>
              <p className='mt-1 text-sm text-muted-foreground'>{item.label}</p>
            </MotionDiv>
          );
        })}
      </div>
    </section>
  );
}
