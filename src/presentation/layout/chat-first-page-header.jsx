import { Link } from 'react-router-dom';
import { Bell, Menu, Plus } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { cn } from '@/lib/utils';
import { Button } from '@/presentation/components/ui/button';
import {
  APP_SHELL_HEADER_CLASS,
  APP_SHELL_HEADER_X,
} from '@/presentation/layout/app-shell-chrome';
import { AppShellHeaderBlock } from '@/presentation/layout/app-shell-header-block';
import { useNotificationUnreadCount } from '@/presentation/notifications/hooks/use-notification-unread-count';

/**
 * @param {{
 *   title: string;
 *   subtitle?: string;
 *   onOpenMenu?: () => void;
 *   showMenuButton?: boolean;
 *   showCreateEvent?: boolean;
 *   actions?: React.ReactNode;
 * }} props
 */
export function ChatFirstPageHeader({
  title,
  subtitle = '',
  onOpenMenu,
  showMenuButton = true,
  showCreateEvent = true,
  actions,
}) {
  const { unreadCount } = useNotificationUnreadCount(true);

  return (
    <header
      className={cn(
        APP_SHELL_HEADER_CLASS,
        APP_SHELL_HEADER_X,
        'z-10 justify-between gap-3',
      )}
    >
      <div className='flex h-full min-w-0 flex-1 items-center gap-3'>
        {showMenuButton && onOpenMenu ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-9 shrink-0 lg:hidden'
            aria-label='Menu'
            onClick={onOpenMenu}
          >
            <Menu className='size-5' />
          </Button>
        ) : null}
        <AppShellHeaderBlock title={title} subtitle={subtitle} />
      </div>

      <div className='flex shrink-0 items-center gap-1 sm:gap-2'>
        {actions}
        <Link
          to={ROUTES.notifications}
          className='relative inline-flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted'
          aria-label={
            unreadCount > 0
              ? `Notifikasi, ${unreadCount} belum dibaca`
              : 'Notifikasi'
          }
        >
          <Bell className='size-5' />
          {unreadCount > 0 ? (
            <span className='absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#FF8000] px-1 text-[0.65rem] font-bold leading-none text-white ring-2 ring-white'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Link>
        {showCreateEvent ? (
          <Button
            asChild
            className='h-9 rounded-full bg-[#FF8000] px-3 text-sm font-semibold text-white hover:bg-[#FF8000]/90'
          >
            <Link to={ROUTES.eventCreate}>
              <Plus className='size-4' />
              <span className='hidden sm:inline'>{SHELL_COPY.chat.createEvent}</span>
              <span className='sm:hidden'>{SHELL_COPY.chat.createEventShort}</span>
            </Link>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
