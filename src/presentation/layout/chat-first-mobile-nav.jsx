import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { cn } from '@/lib/utils';
import { userAvatarColorClass, userInitialFromName } from '@/shared/lib/user-avatar';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { APP_NAV_ITEMS } from '@/presentation/layout/app-nav-items';
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar';

const ICON_SLOT = 'flex size-4 shrink-0 items-center justify-center';

const navTabClass = ({ isActive }) =>
  cn(
    'inline-flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold leading-none transition',
    isActive
      ? 'bg-[#FF8000] text-white'
      : 'text-muted-foreground hover:bg-[#FFF1E5] hover:text-[#FF8000]',
  );

export function ChatFirstMobileNav() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.username || 'Profil';
  const identity = user?.id || user?.username || user?.email || displayName;

  return (
    <nav
      className='flex shrink-0 items-stretch justify-around gap-0.5 border-t border-border/60 bg-white px-1 py-1.5 lg:hidden'
      aria-label='Navigasi utama'
    >
      {APP_NAV_ITEMS.map(({ to, label, end, icon: Icon }) => (
        <NavLink key={to} to={to} end={end} className={navTabClass}>
          <span className={ICON_SLOT}>
            <Icon className='size-4' aria-hidden />
          </span>
          <span className='max-w-full truncate px-0.5'>{label}</span>
        </NavLink>
      ))}
      <NavLink to={ROUTES.profile} className={navTabClass}>
        {({ isActive }) => (
          <>
            <span className={ICON_SLOT}>
              <Avatar className={cn('size-4', isActive && 'ring-1 ring-white')}>
                <AvatarFallback
                  className={cn(
                    userAvatarColorClass(identity),
                    'text-[0.5rem] font-bold leading-none',
                    isActive && 'text-white',
                  )}
                >
                  {userInitialFromName(displayName)}
                </AvatarFallback>
              </Avatar>
            </span>
            <span className='max-w-full truncate px-0.5'>{SHELL_COPY.nav.profile}</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}
