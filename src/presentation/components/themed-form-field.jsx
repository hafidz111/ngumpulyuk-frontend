import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  APP_SHELL_FORM_INPUT_CLASS,
  APP_SHELL_FORM_TEXTAREA_CLASS,
} from '@/presentation/layout/app-shell-chrome';

export const ThemedInput = React.forwardRef(function ThemedInput(
  { className, type = 'text', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(APP_SHELL_FORM_INPUT_CLASS, className)}
      {...props}
    />
  );
});

export const ThemedTextarea = React.forwardRef(function ThemedTextarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(APP_SHELL_FORM_TEXTAREA_CLASS, className)}
      {...props}
    />
  );
});
