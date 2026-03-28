import { Link, NavLink } from 'react-router-dom';
import { Bell, Compass, Home, Map, Search, User, Users } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/lib/utils';

const navItems = [
  { to: ROUTES.home, label: 'Home', icon: Home, end: true },
  { to: ROUTES.explore, label: 'Explore', icon: Compass, end: false },
  { to: ROUTES.community, label: 'Community', icon: Users, end: false },
  { to: ROUTES.map, label: 'Map', icon: Map, end: false },
  { to: ROUTES.profile, label: 'Profile', icon: User, end: false },
];

export function HomeAppHeader() {
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
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-container text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className='size-4 opacity-90' aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className='flex items-center gap-1 sm:gap-2'>
          <button
            type='button'
            className='relative rounded-full p-2.5 text-foreground hover:bg-muted'
            aria-label='Notifikasi'
          >
            <Bell className='size-5' />
            <span className='absolute right-1.5 top-1.5 size-2 rounded-full bg-primary-container ring-2 ring-surface-bright' />
          </button>
          <button
            type='button'
            className='rounded-full p-2.5 text-foreground hover:bg-muted'
            aria-label='Cari'
          >
            <Search className='size-5' />
          </button>
        </div>
      </div>

      <nav
        className='flex gap-1 overflow-x-auto border-t border-border/50 px-4 pb-3 pt-2 md:hidden'
        aria-label='Navigasi utama'
      >
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium',
                isActive
                  ? 'bg-primary-container text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground',
              )
            }
          >
            <Icon className='size-3.5' aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
