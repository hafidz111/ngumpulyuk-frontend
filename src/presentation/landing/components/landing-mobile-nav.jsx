import { Home, Search, User, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { ROUTES } from '../../../shared/config/routes';

export function LandingMobileNav() {
  const { pathname } = useLocation();
  const isHome = pathname === ROUTES.home;

  return (
    <nav
      className='fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-outline-variant/15 bg-surface-lowest/95 backdrop-blur-md md:hidden'
      aria-label='Navigasi mobile'
    >
      <Link
        to={ROUTES.home}
        className={`flex flex-col items-center gap-1 ${isHome ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Home className='h-5 w-5' />
        <span className='text-[10px] font-bold'>Home</span>
      </Link>
      <a href='#kegiatan' className='flex flex-col items-center gap-1 text-muted-foreground'>
        <Search className='h-5 w-5' />
        <span className='text-[10px] font-medium'>Explore</span>
      </a>
      <a href='#komunitas' className='flex flex-col items-center gap-1 text-muted-foreground'>
        <Users className='h-5 w-5' />
        <span className='text-[10px] font-medium'>Community</span>
      </a>
      <Link
        to={ROUTES.login}
        className={`flex flex-col items-center gap-1 ${pathname === ROUTES.login ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <User className='h-5 w-5' />
        <span className='text-[10px] font-medium'>Profile</span>
      </Link>
    </nav>
  );
}
