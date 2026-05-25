import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  APP_SHELL_SEARCH_ICON_CLASS,
  APP_SHELL_SEARCH_INPUT_CLASS,
} from '@/presentation/layout/app-shell-chrome';

/**
 * @param {{
 *   value: string;
 *   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
 *   placeholder?: string;
 *   className?: string;
 *   inputClassName?: string;
 *   name?: string;
 *   id?: string;
 *   onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
 * }} props
 */
export function ThemedSearchField({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  name,
  id,
  onKeyDown,
}) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className={cn(
          'pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2',
          APP_SHELL_SEARCH_ICON_CLASS,
        )}
        aria-hidden
      />
      <input
        id={id}
        name={name}
        type='search'
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn(APP_SHELL_SEARCH_INPUT_CLASS, inputClassName)}
      />
    </div>
  );
}
