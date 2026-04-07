import { cn } from '@/lib/utils';

export function Tabs({ value, onChange, items, className }) {
  return (
    <div className={cn('flex rounded-full bg-muted/60 p-1', className)}>
      {items.map(({ id, label, icon: Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type='button'
            onClick={() => onChange(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {Icon ? <Icon className='size-4' aria-hidden /> : null}
            {label}
          </button>
        );
      })}
    </div>
  );
}
