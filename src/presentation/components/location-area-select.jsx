import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  AREA_OPTIONS,
  filterLocations,
  resolveLocationLabel,
} from '@/shared/lib/indonesia-locations';
import { ThemedSearchField } from '@/presentation/components/themed-search-field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/presentation/components/ui/popover';
import { APP_SHELL_FORM_SELECT_CLASS } from '@/presentation/layout/app-shell-chrome';

/**
 * @param {{
 *   value: string;
 *   onValueChange: (id: string) => void;
 *   placeholder?: string;
 *   className?: string;
 *   disabled?: boolean;
 * }} props
 */
export function LocationAreaSelect({
  value,
  onValueChange,
  placeholder = 'Cari kabupaten/kota…',
  className,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedLabel = useMemo(() => resolveLocationLabel(value), [value]);

  const options = useMemo(() => {
    if (query.trim()) return filterLocations(query, 80);
    return AREA_OPTIONS.slice(0, 80).map((o) => ({
      id: o.id,
      label: o.label,
      province: o.province,
    }));
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          disabled={disabled}
          className={cn(
            APP_SHELL_FORM_SELECT_CLASS,
            'flex w-full items-center justify-between gap-2 text-left font-normal',
            !selectedLabel && 'text-muted-foreground',
            className,
          )}
        >
          <span className='truncate'>{selectedLabel || placeholder}</span>
          <ChevronDown className='size-4 shrink-0 opacity-60' aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] max-w-[min(100vw-2rem,24rem)] p-3'
        align='start'
      >
        <ThemedSearchField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Ketik nama kota/kabupaten atau provinsi…'
          inputClassName='h-10 rounded-xl pl-10 text-sm'
        />
        <p className='mt-2 text-[11px] text-muted-foreground'>
          {AREA_OPTIONS.length} kabupaten/kota di Indonesia
        </p>
        <div
          className='mt-2 max-h-56 space-y-0.5 overflow-y-auto overscroll-contain rounded-xl border border-border/50 bg-muted/20 p-1 [scrollbar-width:thin]'
          role='listbox'
        >
          {options.length === 0 ? (
            <p className='px-3 py-4 text-center text-xs text-muted-foreground'>
              Tidak ketemu. Coba kata kunci lain.
            </p>
          ) : (
            options.map((opt) => (
              <button
                key={opt.id}
                type='button'
                role='option'
                aria-selected={value === opt.id}
                className={cn(
                  'flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white',
                  value === opt.id &&
                    'bg-white font-semibold text-[#FF8000] shadow-sm',
                )}
                onClick={() => {
                  onValueChange(opt.id);
                  setOpen(false);
                  setQuery('');
                }}
              >
                <span>{opt.label}</span>
                <span className='text-[11px] text-muted-foreground'>
                  {opt.province}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
