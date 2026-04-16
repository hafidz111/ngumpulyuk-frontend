import { Link, NavLink } from 'react-router-dom';
import {
  Bell,
  Compass,
  Home,
  LogOut,
  Map,
  Search,
  User,
  Users,
} from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/lib/utils';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { useNotificationUnreadCount } from '@/presentation/notifications/hooks/use-notification-unread-count';

const navItems = [
  { to: ROUTES.home, label: 'Home', icon: Home, end: true },
  { to: ROUTES.events, label: 'Explore', icon: Compass, end: false },
  { to: ROUTES.community, label: 'Community', icon: Users, end: false },
  { to: ROUTES.map, label: 'Map', icon: Map, end: false },
  { to: ROUTES.profile, label: 'Profile', icon: User, end: false },
];

export function HomeAppHeader() {
  const { logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotificationUnreadCount(isAuthenticated);

  return (
    <header className='sticky top-0 z-40 border-b border-border/60 bg-surface-bright/95 backdrop-blur-md'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6'>
        <Link
          to={ROUTES.home}
          className='font-display text-lg font-bold tracking-tight text-foreground md:text-xl'
        >
          NgumpulYuk
        </Link>

        <nav className='hidden flex-1 items-center justify-center gap-1 md:flex'>
          {navItems.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-[#FF8000] text-white'
                    : 'text-muted-foreground hover:bg-[#FFF1E5] hover:text-[#FF8000]',
                )
              }
            >
              <Icon className='size-5' aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className='flex items-center gap-1 sm:gap-2'>
          <Link
            to={ROUTES.notifications}
            className='relative inline-flex rounded-full p-2.5 text-foreground hover:bg-muted'
            aria-label={
              unreadCount > 0
                ? `Notifikasi, ${unreadCount} belum dibaca`
                : 'Notifikasi'
            }
          >
            <Bell className='size-5' />
            {unreadCount > 0 ? (
              <span className='absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary-container px-1 text-[0.65rem] font-bold leading-none text-primary-foreground ring-2 ring-surface-bright'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </Link>
          <button
            type='button'
            className='rounded-full p-2.5 text-foreground hover:bg-muted'
            aria-label='Cari'
          >
            <Search className='size-5' />
          </button>
          <button
            type='button'
            className='rounded-full p-2.5 text-foreground hover:bg-muted'
            aria-label='Keluar'
            onClick={() => void logout()}
          >
            <LogOut className='size-5' />
          </button>
        </div>
      </div>

      <nav
        className='flex gap-1 overflow-x-auto border-t border-border/50 px-4 pb-3 pt-2 md:hidden'
        aria-label='Navigasi utama'
      >
        {navItems.map(({ to, label, end, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-[#FF8000] text-white'
                  : 'bg-transparent text-muted-foreground hover:bg-[#FFF1E5] hover:text-[#FF8000]',
              )
            }
          >
            <Icon className='size-4' aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
