import { ArrowRight } from 'lucide-react';

import { MotionDiv, MotionH2, MotionP } from '../../lib/motion-primitives';
import { Button } from '../../components/ui/button';

export function LandingFinalCtaSection({ finalCta }) {
  return (
    <section className='py-20 md:py-28'>
      <div className='mx-auto max-w-7xl px-6 md:px-8'>
        <div className='text-center'>
          <MotionH2
            className='font-display text-3xl font-extrabold leading-tight text-foreground md:text-4xl lg:text-5xl'
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {finalCta.title}
          </MotionH2>
          <MotionP
            className='mx-auto mt-4 max-w-2xl text-muted-foreground'
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            {finalCta.subtitle}
          </MotionP>
          <MotionDiv
            className='mt-10 flex justify-center'
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Button size='lg' type='button' className='gap-2 px-10 py-5 text-lg'>
              {finalCta.cta}
              <ArrowRight className='h-5 w-5' />
            </Button>
          </MotionDiv>
        </div>
        <MotionDiv
          className='mt-14 overflow-hidden rounded-3xl shadow-ambient'
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <img
            src={finalCta.image}
            alt='Komunitas bersama'
            className='h-auto max-h-[420px] w-full object-cover md:max-h-[480px]'
          />
        </MotionDiv>
      </div>
    </section>
  );
}
