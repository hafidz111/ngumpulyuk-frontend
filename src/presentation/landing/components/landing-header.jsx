import { Link } from 'react-router-dom';

import { ROUTES } from '../../../shared/config/routes';

export function LandingHeader({ brand, navigation }) {
  return (
    <header className='fixed inset-x-0 top-0 z-50 border-b border-outline-variant/15 bg-surface-bright/85 backdrop-blur-citrus'>
      <div className='mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-8'>
        <Link
          to={ROUTES.home}
          className='font-display text-2xl font-black tracking-tight text-primary'
        >
          {brand}
        </Link>
        <nav className='hidden items-center gap-10 md:flex'>
          {navigation.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className='font-display text-sm font-medium text-muted-foreground transition-colors hover:text-primary'
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className='flex items-center gap-3'>
          <Link
            to={ROUTES.login}
            className='hidden rounded-full px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-high sm:inline-flex'
          >
            Masuk
          </Link>
          <Link
            to={ROUTES.register}
            className='inline-flex rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-ambient transition-transform hover:scale-[1.02]'
          >
            {navigation.ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
