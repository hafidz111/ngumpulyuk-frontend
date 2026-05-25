import { Sparkles } from 'lucide-react';

import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { cn } from '@/lib/utils';
import { APP_SHELL_HEADER_CLASS } from '@/presentation/layout/app-shell-chrome';
import { AppShellHeaderBlock } from '@/presentation/layout/app-shell-header-block';

export { APP_SHELL_HEADER_CLASS as CHAT_BRAND_BAR_CLASS };

/**
 * @param {{ className?: string; as?: 'div' | 'span'; description?: string }} props
 */
export function ChatNgumpulYukBrand({
  className,
  as: Tag = 'div',
  description = SHELL_COPY.brand.ngumpulyukDesc,
}) {
  return (
    <Tag className={cn('min-w-0', className)}>
      <AppShellHeaderBlock
        title={
          <span className='text-[#FF8000] md:text-lg'>NgumpulYuk</span>
        }
        subtitle={description}
        titleClassName='!text-lg md:!text-xl'
      />
    </Tag>
  );
}

/**
 * @param {{ className?: string; as?: 'div' | 'span'; description?: string }} props
 */
export function ChatNgumpskyBrand({
  className,
  as: Tag = 'div',
  description = SHELL_COPY.brand.ngumpskyDesc,
}) {
  return (
    <Tag className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF1E5] text-[#FF8000]'>
        <Sparkles className='size-4' aria-hidden />
      </div>
      <AppShellHeaderBlock
        title='Ngumpsky'
        subtitle={
          <span className='flex items-center gap-1'>
            <span className='size-1.5 shrink-0 rounded-full bg-emerald-500' aria-hidden />
            {description}
          </span>
        }
      />
    </Tag>
  );
}
