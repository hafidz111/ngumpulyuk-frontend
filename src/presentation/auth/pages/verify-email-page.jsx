import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getAuthErrorMessage } from '@/application/auth/auth-error';
import { mapLoginResponse } from '@/application/auth/map-auth-response';
import { authApi } from '@/infrastructure/auth/auth-api';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { useAuth } from '../hooks/use-auth';
import { AuthSplitLayout } from '../components/auth-split-layout';

const PENDING_EMAIL_KEY = 'ngumpulyuk.pendingVerificationEmail';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingEmail =
    typeof window !== 'undefined'
      ? sessionStorage.getItem(PENDING_EMAIL_KEY)
      : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const code = otp.trim();
    if (!code) {
      setError('Masukkan kode OTP.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await authApi.verifyEmail({ otp: code });
      sessionStorage.removeItem(PENDING_EMAIL_KEY);
      const mapped = mapLoginResponse(
        data && typeof data === 'object'
          ? /** @type {Record<string, unknown>} */ (data)
          : {},
      );
      if (mapped.access) {
        setSession({
          access: mapped.access,
          refresh: mapped.refresh,
          email: mapped.email,
          fullName: mapped.fullName,
        });
        const onboarded = mapped.email
          ? localStorage.getItem(
              `ngumpulyuk.onboarded.${mapped.email.toLowerCase()}`,
            ) === '1'
          : false;
        navigate(onboarded ? ROUTES.home : ROUTES.onboarding, {
          replace: true,
        });
        return;
      }
      navigate(ROUTES.login, {
        replace: true,
        state: { message: 'Email berhasil diverifikasi. Silakan masuk.' },
      });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Verifikasi gagal.'));
    } finally {
      setIsSubmitting(false);
    }
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
                Verifikasi email
              </h1>
              <p className='mt-2 text-sm text-muted-foreground'>
                {pendingEmail
                  ? `Masukkan kode OTP yang dikirim ke ${pendingEmail}.`
                  : 'Masukkan kode OTP dari email kamu.'}
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='verify-otp' className='text-sm font-semibold'>
                Kode OTP
              </Label>
              <Input
                id='verify-otp'
                name='otp'
                inputMode='numeric'
                autoComplete='one-time-code'
                placeholder='Kode verifikasi'
                value={otp}
                onChange={(ev) => setOtp(ev.target.value)}
                className='h-12 rounded-full border-border bg-background text-center text-lg tracking-[0.3em] shadow-none'
                maxLength={12}
              />
            </div>

            {error ? (
              <p className='text-center text-sm text-destructive' role='alert'>
                {error}
              </p>
            ) : null}

            <Button
              type='submit'
              disabled={isSubmitting}
              className='h-12 w-full rounded-full bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/35'
            >
              {isSubmitting ? 'Memverifikasi…' : 'Verifikasi'}
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
