import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getAuthErrorMessage } from '@/application/auth/auth-error';
import { AUTH_FORM_INPUT_CLASS } from '@/presentation/layout/app-shell-chrome';
import { authApi } from '@/infrastructure/auth/auth-api';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { AuthSplitLayout } from '../components/auth-split-layout';

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '').trim();
    if (!email) {
      setError('Email wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.requestPasswordReset({ email });
      setDone(true);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Permintaan gagal.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthSplitLayout>
        <Card className='border-0 bg-card p-8 shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.08)] rounded-[1.75rem] md:p-9'>
          <h1 className='font-display text-center text-2xl font-bold text-foreground'>
            Cek email kamu
          </h1>
          <p className='mt-3 text-center text-sm leading-relaxed text-muted-foreground'>
            Jika alamat terdaftar, kamu akan menerima link untuk mengatur ulang
            kata sandi.
          </p>
          <Button
            asChild
            className='mt-8 h-12 w-full rounded-full bg-primary-container font-semibold'
          >
            <Link to={ROUTES.login}>Kembali ke masuk</Link>
          </Button>
        </Card>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout>
      <div className='w-full'>
        <Card className='border-0 bg-card shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.08)] rounded-[1.75rem]'>
          <form
            className='flex flex-col gap-6 p-8 md:p-9'
            onSubmit={handleSubmit}
          >
            <div className='text-center'>
              <h1 className='font-display text-2xl font-bold tracking-tight text-foreground'>
                Lupa kata sandi
              </h1>
              <p className='mt-2 text-sm text-muted-foreground'>
                Kami akan mengirim link reset ke email kamu.
              </p>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='forgot-email'
                className='text-sm font-semibold text-foreground'
              >
                Email
              </Label>
              <div className='relative'>
                <Mail
                  className='pointer-events-none absolute left-4 top-1/2 size-[1.125rem] -translate-y-1/2 text-muted-foreground'
                  aria-hidden
                />
                <Input
                  id='forgot-email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  placeholder='email@contoh.com'
                  className={cn(
                    AUTH_FORM_INPUT_CLASS,
                    'h-12 rounded-full pl-11 pr-4 text-sm',
                  )}
                />
              </div>
            </div>

            {error ? (
              <p className='text-sm text-destructive' role='alert'>
                {error}
              </p>
            ) : null}

            <Button
              type='submit'
              disabled={isSubmitting}
              className='h-12 w-full rounded-full bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/35'
            >
              {isSubmitting ? 'Mengirim…' : 'Kirim link reset'}
            </Button>
          </form>
        </Card>

        <p className='mt-8 text-center text-sm text-muted-foreground'>
          <Link
            to={ROUTES.login}
            className='font-bold text-primary-container hover:underline'
          >
            Kembali ke masuk
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
