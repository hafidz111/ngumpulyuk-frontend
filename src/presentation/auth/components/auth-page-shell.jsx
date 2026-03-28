import { Link } from 'react-router-dom';

import { ROUTES } from '../../../shared/config/routes';

export function AuthPageShell({ children }) {
  return (
    <div className='min-h-svh bg-surface px-4 py-10'>
      <div className='mx-auto flex w-full max-w-sm flex-col gap-8'>
        <Link
          to={ROUTES.home}
          className='font-display text-center text-sm font-semibold text-primary hover:underline'
        >
          ← Kembali ke beranda
        </Link>
        {children}
      </div>
    </div>
  );
}
