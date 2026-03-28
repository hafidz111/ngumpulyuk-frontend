import { Bell } from 'lucide-react';

import { Button } from '@/presentation/components/ui/button';

export function HomeNotificationBanner({ message, actionLabel }) {
  return (
    <div className='flex flex-col gap-4 rounded-2xl bg-primary-container px-4 py-4 text-primary-foreground shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-6'>
      <div className='flex gap-3 sm:items-center sm:gap-4'>
        <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20'>
          <Bell className='size-5 text-white' aria-hidden />
        </span>
        <p className='text-sm font-medium leading-relaxed sm:text-base'>{message}</p>
      </div>
      <Button
        type='button'
        className='shrink-0 rounded-full border-0 bg-secondary/90 font-semibold text-foreground hover:bg-secondary'
      >
        {actionLabel}
      </Button>
    </div>
  );
}
