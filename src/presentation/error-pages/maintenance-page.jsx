import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../../shared/config/routes';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

export default function MaintenancePage() {
  const navigate = useNavigate();

  return (
    <div className='flex min-h-svh items-center justify-center bg-surface px-4 py-12'>
      <Card className='w-full max-w-md rounded-2xl border-0 shadow-ambient'>
        <CardHeader className='text-center'>
          <p className='font-display text-5xl font-black text-primary'>503</p>
          <CardTitle className='text-xl'>Sedang maintenance</CardTitle>
          <CardDescription>
            Sedang dalam pemeliharaan. Silakan coba lagi dalam beberapa menit.
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center text-xs text-muted-foreground'>
          Terima kasih atas kesabarannya.
        </CardContent>
        <CardFooter className='flex flex-col gap-3 pb-8 sm:flex-row sm:justify-center'>
          <Button
            type='button'
            variant='outline'
            className='w-full sm:w-auto'
            onClick={() => window.location.reload()}
          >
            Coba lagi
          </Button>
          <Button
            type='button'
            className='w-full sm:w-auto'
            onClick={() => navigate(ROUTES.home)}
          >
            Kembali ke beranda
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
