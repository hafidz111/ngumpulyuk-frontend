import { cn } from '@/lib/utils';
import {
  APP_SHELL_HEADER_SUBTITLE_CLASS,
  APP_SHELL_HEADER_TITLE_CLASS,
} from '@/presentation/layout/app-shell-chrome';

/**
 * Blok judul + deskripsi (tinggi subteks tetap walau kosong).
 * @param {{
 *   title: React.ReactNode;
 *   subtitle?: React.ReactNode;
 *   titleClassName?: string;
 *   subtitleClassName?: string;
 * }} props
 */
export function AppShellHeaderBlock({
  title,
  subtitle = '',
  titleClassName,
  subtitleClassName,
}) {
  return (
    <div className='flex min-w-0 flex-col justify-center gap-0.5 leading-tight'>
      {typeof title === 'string' ? (
        <h1 className={cn(APP_SHELL_HEADER_TITLE_CLASS, titleClassName)}>{title}</h1>
      ) : (
        <div className={cn(APP_SHELL_HEADER_TITLE_CLASS, titleClassName)}>{title}</div>
      )}
      <p className={cn(APP_SHELL_HEADER_SUBTITLE_CLASS, subtitleClassName)}>
        {subtitle || '\u00A0'}
      </p>
    </div>
  );
}
