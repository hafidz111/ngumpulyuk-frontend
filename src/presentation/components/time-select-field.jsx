import { useMemo } from 'react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import {
  APP_SHELL_FORM_DROPDOWN_CONTENT_CLASS,
  APP_SHELL_FORM_DROPDOWN_ITEM_CLASS,
  APP_SHELL_FORM_SELECT_CLASS,
} from '@/presentation/layout/app-shell-chrome';

/**
 * @param {number} intervalMinutes
 * @returns {string[]}
 */
export function buildTimeOptions(intervalMinutes = 5) {
  const options = [];
  for (let total = 0; total < 24 * 60; total += intervalMinutes) {
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    options.push(
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    );
  }
  return options;
}

const TIME_OPTIONS = buildTimeOptions(5);

/**
 * @param {Date} a
 * @param {Date} b
 */
export function isSameCalendarDay(a, b) {
  if (!a || !b) return false;
  return format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd');
}

/**
 * Dropdown waktu; opsi <= minExclusive di-disable (hari yang sama).
 *
 * @param {{
 *   id?: string;
 *   value: string;
 *   onValueChange: (value: string) => void;
 *   minExclusive?: string;
 *   placeholder?: string;
 *   className?: string;
 *   invalid?: boolean;
 * }} props
 */
export function TimeSelectField({
  id,
  value,
  onValueChange,
  minExclusive,
  placeholder = 'Pilih waktu',
  className,
  invalid,
}) {
  const options = useMemo(() => TIME_OPTIONS, []);

  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger
        id={id}
        className={cn(
          APP_SHELL_FORM_SELECT_CLASS,
          className,
          invalid && 'border-destructive/60',
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={cn(APP_SHELL_FORM_DROPDOWN_CONTENT_CLASS, 'bg-white')}
        position='popper'
      >
        {options.map((time) => {
          const disabled = Boolean(minExclusive && time <= minExclusive);
          return (
            <SelectItem
              key={time}
              value={time}
              disabled={disabled}
              className={cn(
                APP_SHELL_FORM_DROPDOWN_ITEM_CLASS,
                'bg-white data-[disabled]:pointer-events-none data-[disabled]:opacity-35',
              )}
            >
              {time}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
