import { CalendarPlus, Hand, Plus } from 'lucide-react';

import { Button } from '@/presentation/components/ui/button';

export function HomeWelcomeSection({ displayName }) {
  const name = displayName?.trim() || 'Pengguna';

  return (
    <section className='flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between'>
      <div className='space-y-1'>
        <h1 className='font-display flex flex-wrap items-center gap-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
          <span>Halo, {name}!</span>
          <Hand className='size-8 shrink-0 text-primary-container md:size-9' strokeWidth={2} aria-hidden />
        </h1>
        <p className='text-base text-muted-foreground md:text-lg'>Siap ngumpul hari ini?</p>
      </div>
      <div className='flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center'>
        <Button
          type='button'
          className='h-11 rounded-full bg-primary-container px-5 font-semibold text-primary-foreground shadow-lg shadow-primary-container/30 hover:bg-primary-container/90'
        >
          <CalendarPlus className='size-4' />
          Join Event
        </Button>
        <Button
          type='button'
          variant='outline'
          className='h-11 rounded-full border-border px-5 font-semibold'
        >
          <Plus className='size-4' />
          Create Event
        </Button>
      </div>
    </section>
  );
}
