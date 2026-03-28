import { Search, UserPlus, Users } from 'lucide-react';

import { MotionDiv } from '../../lib/motion-primitives';
import { Card, CardContent } from '../../components/ui/card';

const iconMap = {
  search: Search,
  'user-plus': UserPlus,
  users: Users,
};

export function LandingHowItWorksSection({ steps }) {
  return (
    <section id='fitur' className='bg-surface-low py-20 md:py-28'>
      <div className='mx-auto max-w-7xl px-6 md:px-8'>
        <div className='mb-12 text-center md:mb-16'>
          <h2 className='font-display text-3xl font-extrabold text-foreground md:text-4xl'>Cara Kerjanya</h2>
          <p className='mt-3 max-w-xl mx-auto text-muted-foreground'>
            Mulai perjalanan komunitasmu hanya dengan tiga langkah mudah.
          </p>
        </div>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon] ?? Search;
            return (
              <MotionDiv
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className='h-full rounded-2xl border-0 bg-muted/60 shadow-none'>
                  <CardContent className='flex flex-col items-center p-8 text-center'>
                    <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-container/40 text-primary'>
                      <Icon className='h-8 w-8' strokeWidth={2} />
                    </div>
                    <h3 className='font-display text-xl font-bold text-foreground'>{step.title}</h3>
                    <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>{step.description}</p>
                  </CardContent>
                </Card>
              </MotionDiv>
            );
          })}
        </div>
      </div>
    </section>
  );
}
