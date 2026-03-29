import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { GoogleSignInButton } from '@/presentation/auth/components/google-sign-in-button';

export function LoginForm({
  className,
  submitError,
  isSubmitting,
  notice,
  onGoogleCredential,
  googleError,
  isGoogleLoading,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn('w-full', className)}>
      <Card className='border-0 bg-card shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.08)] rounded-[1.75rem]'>
        <form className='flex flex-col gap-6 p-8 md:p-9' {...props}>
          <div className='text-center'>
            <h1 className='font-display text-2xl font-bold tracking-tight text-foreground'>
              Masuk ke akun NgumpulYuk kamu
            </h1>
          </div>

          {notice ? (
            <p
              className='rounded-2xl border border-primary-container/30 bg-primary-container/10 px-4 py-3 text-center text-sm text-foreground'
              role='status'
            >
              {notice}
            </p>
          ) : null}

          <div className='space-y-5'>
            <div className='space-y-2'>
              <Label
                htmlFor='login-email'
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
                  id='login-email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  placeholder='Masukkan email kamu'
                  required
                  className='h-12 rounded-full border-border bg-background pl-11 pr-4 text-sm shadow-none'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='login-password'
                className='text-sm font-semibold text-foreground'
              >
                Kata Sandi
              </Label>
              <div className='relative'>
                <Lock
                  className='pointer-events-none absolute left-4 top-1/2 size-[1.125rem] -translate-y-1/2 text-muted-foreground'
                  aria-hidden
                />
                <Input
                  id='login-password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  placeholder='Masukkan kata sandi kamu'
                  required
                  className='h-12 rounded-full border-border bg-background pl-11 pr-12 text-sm shadow-none'
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword
                      ? 'Sembunyikan kata sandi'
                      : 'Tampilkan kata sandi'
                  }
                >
                  {showPassword ? (
                    <EyeOff className='size-[1.125rem]' />
                  ) : (
                    <Eye className='size-[1.125rem]' />
                  )}
                </button>
              </div>
              <div className='flex justify-end pt-0.5'>
                <Link
                  to={ROUTES.forgotPassword}
                  className='text-sm font-medium text-primary-container hover:underline'
                >
                  Lupa Password?
                </Link>
              </div>
            </div>
          </div>

          {submitError ? (
            <p className='text-center text-sm text-destructive' role='alert'>
              {submitError}
            </p>
          ) : null}

          <Button
            type='submit'
            disabled={isSubmitting}
            className='h-12 w-full rounded-full bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/35 transition hover:bg-primary-container/90 disabled:opacity-70'
          >
            {isSubmitting ? 'Memproses…' : 'Masuk'}
          </Button>

          <div className='relative flex items-center gap-3 py-0.5'>
            <span className='h-px flex-1 bg-border' aria-hidden />
            <span className='shrink-0 text-xs text-muted-foreground'>
              atau lanjutkan dengan
            </span>
            <span className='h-px flex-1 bg-border' aria-hidden />
          </div>

          {googleError ? (
            <p className='text-center text-sm text-destructive' role='alert'>
              {googleError}
            </p>
          ) : null}

          <GoogleSignInButton
            text='signin_with'
            onCredential={onGoogleCredential}
            disabled={Boolean(isGoogleLoading) || Boolean(isSubmitting)}
          />
          {isGoogleLoading ? (
            <p
              className='text-center text-xs text-muted-foreground'
              role='status'
            >
              Memverifikasi akun…
            </p>
          ) : null}
        </form>
      </Card>

      <p className='mt-8 text-center text-sm text-muted-foreground'>
        Belum punya akun?{' '}
        <Link
          to={ROUTES.register}
          className='font-bold text-primary-container hover:underline'
        >
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
}
