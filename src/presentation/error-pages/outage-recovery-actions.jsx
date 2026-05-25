import { Loader2 } from 'lucide-react';

import { Button } from '../components/ui/button';
import { CardFooter } from '../components/ui/card';
import { useOutageRecovery } from './use-outage-recovery';

export function OutageRecoveryActions() {
  const { checking, retryAfterOutage, goHome } = useOutageRecovery();

  return (
    <CardFooter className='flex flex-col gap-3 pb-8 sm:flex-row sm:justify-center'>
      <Button
        type='button'
        variant='outline'
        className='w-full sm:w-auto'
        disabled={checking}
        onClick={() => void retryAfterOutage()}
      >
        {checking ? (
          <>
            <Loader2 className='mr-2 size-4 animate-spin' aria-hidden />
            Memeriksa layanan…
          </>
        ) : (
          'Coba lagi'
        )}
      </Button>
      <Button
        type='button'
        className='w-full sm:w-auto'
        disabled={checking}
        onClick={goHome}
      >
        Kembali ke beranda
      </Button>
    </CardFooter>
  );
}
