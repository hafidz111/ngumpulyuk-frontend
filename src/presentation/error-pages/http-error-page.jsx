import { Navigate, useParams } from 'react-router-dom';

import { ROUTES } from '../../shared/config/routes';
import { isServiceErrorStatus } from '../../shared/lib/service-error';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { OutageRecoveryActions } from './outage-recovery-actions';

const COPY = {
  500: {
    title: 'Terjadi kesalahan di server',
    description:
      'Kami sedang memperbaiki masalah ini. Coba lagi nanti atau kembali ke beranda.',
  },
  502: {
    title: 'Gateway tidak merespons',
    description:
      'Layanan sementara tidak bisa dijangkau. Periksa koneksi atau coba lagi dalam beberapa saat.',
  },
  503: {
    title: 'Layanan tidak tersedia',
    description:
      'Server sedang sibuk atau dalam pemeliharaan. Silakan coba lagi nanti.',
  },
};

export default function HttpErrorPage() {
  const { code } = useParams();
  const num = Number(code);

  if (!isServiceErrorStatus(num)) {
    return <Navigate to={ROUTES.notFound} replace />;
  }

  const copy = COPY[num];

  return (
    <div className='flex min-h-svh items-center justify-center bg-surface px-4 py-12'>
      <Card className='w-full max-w-md rounded-2xl border-0 shadow-ambient'>
        <CardHeader className='text-center'>
          <p className='font-display text-5xl font-black text-primary'>{num}</p>
          <CardTitle className='text-xl'>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent className='text-center text-xs text-muted-foreground'>
          Jika masalah berlanjut, hubungi tim dukungan.
        </CardContent>
        <OutageRecoveryActions />
      </Card>
    </div>
  );
}
