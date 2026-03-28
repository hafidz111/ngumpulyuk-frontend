import { ArrowRight, Check } from 'lucide-react';

import { MotionDiv } from '../../lib/motion-primitives';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

export function LandingAiMatcherSection({ aiMatcher }) {
  return (
    <section className='py-20 md:py-28'>
      <div className='mx-auto max-w-7xl px-6 md:px-8'>
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-container p-10 text-primary-foreground shadow-ambient md:p-14 lg:p-16'>
          <div className='pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-surface-lowest/20 blur-3xl' />
          <div className='pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-secondary-container/30 blur-3xl' />

          <div className='relative grid gap-12 lg:grid-cols-2 lg:items-center'>
            <div className='space-y-6'>
              <Badge className='border-0 bg-surface-lowest/20 text-primary-foreground'>{aiMatcher.badge}</Badge>
              <h2 className='font-display text-3xl font-extrabold leading-tight md:text-4xl lg:text-5xl'>
                {aiMatcher.title}
              </h2>
              <p className='max-w-md text-lg text-primary-foreground/90'>{aiMatcher.description}</p>
              <Button
                type='button'
                size='lg'
                variant='outline'
                className='border-surface-lowest/40 bg-surface-lowest text-primary hover:bg-surface-lowest/90'
              >
                {aiMatcher.cta}
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
            </div>
            <div className='space-y-4'>
              {aiMatcher.matches.map((line, index) => (
                <MotionDiv
                  key={line}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                >
                  <Card className='border-0 bg-surface-lowest/15 shadow-none backdrop-blur-sm'>
                    <CardContent className='flex items-start gap-4 p-4'>
                      <span className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-lowest/25'>
                        <Check className='h-4 w-4 text-primary-foreground' strokeWidth={3} />
                      </span>
                      <p className='text-sm leading-relaxed text-primary-foreground/95'>{line}</p>
                    </CardContent>
                  </Card>
                </MotionDiv>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
