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

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className='flex min-h-svh items-center justify-center bg-surface px-4 py-12'>
      <Card className='w-full max-w-md rounded-2xl border-0 shadow-ambient'>
        <CardHeader className='text-center'>
          <p className='font-display text-6xl font-black text-primary'>404</p>
          <CardTitle className='text-xl'>Halaman tidak ditemukan</CardTitle>
          <CardDescription>
            URL yang kamu buka tidak ada atau sudah dipindahkan. Periksa alamatnya atau kembali ke
            beranda.
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center text-sm text-muted-foreground'>NgumpulYuk</CardContent>
        <CardFooter className='flex justify-center pb-8'>
          <Button type='button' onClick={() => navigate(ROUTES.home)}>
            Kembali ke beranda
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
