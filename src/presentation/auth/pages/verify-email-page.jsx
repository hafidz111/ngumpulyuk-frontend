import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { getAuthErrorMessage, isApiErrorCode } from '@/application/auth/auth-error';
import { AUTH_FORM_INPUT_CLASS } from '@/presentation/layout/app-shell-chrome';
import { mapLoginResponse } from '@/application/auth/map-auth-response';
import { authApi } from '@/infrastructure/auth/auth-api';
import { ROUTES } from '@/shared/config/routes';
import { PENDING_VERIFICATION_EMAIL_KEY } from '@/shared/config/storage-keys';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { useAuth } from '../hooks/use-auth';
import { AuthSplitLayout } from '../components/auth-split-layout';

const RESEND_COOLDOWN_SEC = 60;

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);

  const stateEmail =
    location.state && typeof location.state === 'object' && 'email' in location.state
      ? String(/** @type {{ email?: string }} */ (location.state).email ?? '')
      : '';

  const pendingFromStorage =
    typeof window !== 'undefined'
      ? sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY)
      : null;

  const resolvedEmail = useMemo(() => {
    const fromStore = pendingFromStorage?.trim();
    if (fromStore) return fromStore;
    return stateEmail.trim();
  }, [pendingFromStorage, stateEmail]);

  useEffect(() => {
    if (stateEmail && typeof window !== 'undefined') {
      sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, stateEmail.trim());
    }
  }, [stateEmail]);

  useEffect(() => {
    if (cooldownSec <= 0) return undefined;
    const t = setInterval(() => {
      setCooldownSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownSec]);

  async function handleResend() {
    if (cooldownSec > 0 || !resolvedEmail || isResending) return;
    setIsResending(true);
    try {
      await authApi.resendVerification({ email: resolvedEmail });
      toast.success('Kode verifikasi dikirim ke email kamu.', { duration: 4000 });
      setCooldownSec(RESEND_COOLDOWN_SEC);
    } catch (err) {
      if (isApiErrorCode(err, ['CONFLICT', 'EMAIL_ALREADY_VERIFIED'])) {
        toast.info('Email ini sudah terverifikasi. Silakan login.', {
          duration: 4000,
        });
        return;
      }
      toast.error(getAuthErrorMessage(err, 'Gagal mengirim ulang kode.'), {
        duration: 5000,
      });
    } finally {
      setIsResending(false);
    }
  }

  function handleOtpChange(ev) {
    setOtp(ev.target.value.replace(/\s/g, ''));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const code = otp.replace(/\s/g, '');
    if (!code) {
      toast.error('Masukkan kode OTP.', { duration: 4000 });
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await authApi.verifyEmail({ otp: code });
      sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
      const mapped = mapLoginResponse(
        data && typeof data === 'object'
          ? /** @type {Record<string, unknown>} */ (data)
          : {},
      );
      if (mapped.access) {
        setSession({
          access: mapped.access,
          refresh: mapped.refresh,
          userId: mapped.userId,
          username: mapped.username,
          email: mapped.email,
          fullName: mapped.fullName,
          onboardingCompleted: mapped.onboardingCompleted,
        });
        const resolvedEmail = mapped.email;
        const isOnboarded =
          typeof mapped.onboardingCompleted === 'boolean'
            ? mapped.onboardingCompleted
            : Boolean(
                resolvedEmail &&
                  localStorage.getItem(
                    `ngumpulyuk.onboarded.${resolvedEmail.toLowerCase()}`,
                  ) === '1',
              );
        toast.success('Email terverifikasi.', { duration: 4000 });
        navigate(isOnboarded ? ROUTES.chat : ROUTES.onboarding, {
          replace: true,
        });
        return;
      }
      toast.success('Email berhasil diverifikasi. Silakan masuk.', {
        duration: 4000,
      });
      navigate(ROUTES.login, { replace: true });
    } catch (err) {
      if (isApiErrorCode(err, ['CONFLICT', 'EMAIL_ALREADY_VERIFIED'])) {
        sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
        toast.info('Email sudah terverifikasi. Silakan login.', {
          duration: 4000,
        });
        navigate(ROUTES.login, { replace: true });
        return;
      }
      toast.error(getAuthErrorMessage(err, 'Verifikasi gagal.'), {
        duration: 4000,
      });
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
                {resolvedEmail
                  ? `Masukkan kode OTP yang dikirim ke ${resolvedEmail}.`
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
                onChange={handleOtpChange}
                className={cn(
                  AUTH_FORM_INPUT_CLASS,
                  'h-12 rounded-full text-center text-lg tracking-[0.3em]',
                )}
                maxLength={12}
              />
            </div>

            <Button
              type='submit'
              disabled={isSubmitting}
              className='h-12 w-full rounded-full bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/35'
            >
              {isSubmitting ? 'Memverifikasi…' : 'Verifikasi'}
            </Button>

            <div className='flex flex-col items-center gap-2 border-t border-border/60 pt-4'>
              <p className='text-center text-xs text-muted-foreground'>
                Tidak dapat kode?
              </p>
              <Button
                type='button'
                variant='outline'
                disabled={
                  !resolvedEmail ||
                  isResending ||
                  cooldownSec > 0 ||
                  isSubmitting
                }
                onClick={() => void handleResend()}
                className='h-11 rounded-full border-border px-6'
              >
                {isResending
                  ? 'Mengirim…'
                  : cooldownSec > 0
                    ? `Kirim ulang (${cooldownSec}s)`
                    : 'Kirim ulang kode'}
              </Button>
            </div>
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
