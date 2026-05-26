import { Link, NavLink } from 'react-router-dom';

import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/lib/utils';
import { CHAT_SIDEBAR_ACTIONS } from '@/presentation/chat/chat-sidebar-actions';
import { ChatActivityStrip } from '@/presentation/chat/components/chat-activity-strip';
import { ChatNgumpulYukBrand } from '@/presentation/chat/components/chat-ngumpsky-brand';
import { ChatProfileMenu } from '@/presentation/chat/components/chat-profile-menu';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import {
  APP_SHELL_FOOTER_CLASS,
  APP_SHELL_HEADER_CLASS,
  APP_SHELL_NAV_ROW_CLASS,
} from '@/presentation/layout/app-shell-chrome';
import { APP_NAV_ITEMS } from '@/presentation/layout/app-nav-items';

/**
 * @param {{
 *   stats: { eventsFollowed: number; communities: number; loading: boolean };
 *   onQuickPrompt: (text: string) => void;
 *   onNavigate?: () => void;
 *   className?: string;
 *   showFooterProfile?: boolean;
 * }} props
 */
export function ChatSidebar({
  stats,
  onQuickPrompt,
  onNavigate,
  className,
  showFooterProfile = true,
}) {
  return (
    <aside
      className={cn(
        'flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden border-r border-border/60 bg-white lg:w-[280px] xl:w-[300px]',
        className,
      )}
    >
      <div className={cn(APP_SHELL_HEADER_CLASS, 'px-4')}>
        <Link to={ROUTES.chat} className='block min-w-0 transition hover:opacity-90'>
          <ChatNgumpulYukBrand />
        </Link>
      </div>

      <ChatActivityStrip stats={stats} />

      <div className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-6 pt-4 [scrollbar-gutter:stable]'>
        <p className='mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground'>
          {SHELL_COPY.sidebar.quickSection}
        </p>
        <ul className='space-y-1'>
          {CHAT_SIDEBAR_ACTIONS.map(({ label, icon, prompt, to, iconClassName }) => {
            const ActionIcon = icon;
            const content = (
              <>
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl',
                    iconClassName,
                  )}
                >
                  <ActionIcon className='size-4' aria-hidden />
                </span>
                <span className='font-semibold text-foreground'>{label}</span>
              </>
            );

            if (to && !prompt) {
              return (
                <li key={label}>
                  <Link
                    to={to}
                    className={cn(APP_SHELL_NAV_ROW_CLASS, 'hover:bg-[#FFF1E5]/80')}
                    onClick={onNavigate}
                  >
                    {content}
                  </Link>
                </li>
              );
            }

            return (
              <li key={label}>
                <button
                  type='button'
                  className={cn(
                    APP_SHELL_NAV_ROW_CLASS,
                    'w-full text-left hover:bg-[#FFF1E5]/80',
                  )}
                  onClick={() => {
                    if (prompt) onQuickPrompt(prompt);
                  }}
                >
                  {content}
                </button>
              </li>
            );
          })}
        </ul>

        <p className='mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground'>
          {SHELL_COPY.sidebar.navSection}
        </p>
        <ul className='space-y-0.5'>
          {APP_NAV_ITEMS.map(({ to, label, end, icon }) => {
            const NavIcon = icon;
            return (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    APP_SHELL_NAV_ROW_CLASS,
                    isActive
                      ? 'bg-[#FF8000] text-white'
                      : 'text-foreground hover:bg-[#FFF1E5]/80',
                  )
                }
              >
                <NavIcon className='size-4 shrink-0' aria-hidden />
                {label}
              </NavLink>
            </li>
            );
          })}
        </ul>
      </div>

      {showFooterProfile ? (
        <div className={cn(APP_SHELL_FOOTER_CLASS, 'hidden px-4 lg:flex')}>
          <ChatProfileMenu variant='sidebar' onNavigate={onNavigate} />
        </div>
      ) : null}
    </aside>
  );
}
