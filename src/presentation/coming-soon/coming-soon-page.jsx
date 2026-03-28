import { Link, useLocation } from 'react-router-dom';

import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/presentation/components/ui/button';

const TITLES = {
  [ROUTES.explore]: 'Explore',
  [ROUTES.community]: 'Community',
  [ROUTES.map]: 'Map',
  [ROUTES.profile]: 'Profile',
};

export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Halaman';

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-4 bg-surface px-6 text-center'>
      <h1 className='font-display text-2xl font-bold text-foreground'>{title}</h1>
      <p className='max-w-sm text-muted-foreground'>Fitur ini sedang disiapkan. Nantikan ya!</p>
      <Button asChild className='rounded-full'>
        <Link to={ROUTES.home}>Kembali ke beranda</Link>
      </Button>
    </div>
  );
}
