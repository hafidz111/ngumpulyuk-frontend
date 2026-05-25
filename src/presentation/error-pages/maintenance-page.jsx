import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { OutageRecoveryActions } from './outage-recovery-actions';

export default function MaintenancePage() {
  return (
    <div className='flex min-h-svh items-center justify-center bg-surface px-4 py-12'>
      <Card className='w-full max-w-md rounded-2xl border-0 shadow-ambient'>
        <CardHeader className='text-center'>
          <p className='font-display text-5xl font-black text-primary'>503</p>
          <CardTitle className='text-xl'>Sedang maintenance</CardTitle>
          <CardDescription>
            Sedang dalam pemeliharaan. Tekan &quot;Coba lagi&quot; untuk memeriksa
            apakah layanan sudah kembali normal.
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center text-xs text-muted-foreground'>
          Terima kasih atas kesabarannya.
        </CardContent>
        <OutageRecoveryActions />
      </Card>
    </div>
  );
}
