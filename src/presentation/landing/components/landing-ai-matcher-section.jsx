import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { MotionDiv } from '../../lib/motion-primitives';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

/**
 * @param {unknown} match
 */
function normalizeMatch(match) {
  if (typeof match === 'string') {
    return { title: match, body: '' };
  }
  const row = /** @type {Record<string, string>} */ (match ?? {});
  return {
    title: row.title ?? '',
    body: row.body ?? row.detail ?? row.hint ?? '',
  };
}

/**
 * @param {{ aiMatcher: Record<string, unknown> }} props
 */
export function LandingAiMatcherSection({ aiMatcher }) {
  const rawMatches = Array.isArray(aiMatcher.matches) ? aiMatcher.matches : [];
  const displayMatches = rawMatches.map(normalizeMatch).filter((m) => m.title);

  return (
    <section id='ngumpsky' className='bg-surface py-20 md:py-28'>
      <div className='mx-auto max-w-7xl px-6 md:px-8'>
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-container p-10 text-primary-foreground shadow-ambient md:p-14 lg:p-16'>
          <div className='pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-surface-lowest/20 blur-3xl' />
          <div className='pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-secondary-container/30 blur-3xl' />

          <div className='relative grid gap-12 lg:grid-cols-2 lg:items-center'>
            <div className='space-y-6'>
              <Badge className='border-0 bg-surface-lowest/20 text-primary-foreground'>
                {aiMatcher.badge}
              </Badge>
              <h2 className='font-display text-3xl font-extrabold leading-tight md:text-4xl lg:text-5xl'>
                {aiMatcher.title}
              </h2>
              <p className='max-w-md text-lg text-primary-foreground/90'>
                {aiMatcher.description}
              </p>
              <Button
                size='lg'
                className='gap-2 border-2 border-white/25 bg-white font-display font-bold text-primary shadow-lg hover:bg-white/95'
                asChild
              >
                <Link to={ROUTES.register}>
                  {aiMatcher.cta}
                  <ArrowRight className='size-5' aria-hidden />
                </Link>
              </Button>
            </div>
            <div className='space-y-4'>
              {displayMatches.map((match, index) => (
                <MotionDiv
                  key={`${match.title}-${index}`}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                >
                  <Card className='border-0 bg-surface-lowest/15 shadow-none backdrop-blur-sm'>
                    <CardContent className='flex items-start gap-4 p-4 md:p-5'>
                      <span className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-lowest/25'>
                        <Check
                          className='h-4 w-4 text-primary-foreground'
                          strokeWidth={3}
                        />
                      </span>
                      <div className='min-w-0 space-y-1'>
                        <p className='font-display text-base font-bold leading-snug text-primary-foreground'>
                          {match.title}
                        </p>
                        {match.body ? (
                          <p className='text-sm leading-relaxed text-primary-foreground/85'>
                            {match.body}
                          </p>
                        ) : null}
                      </div>
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
