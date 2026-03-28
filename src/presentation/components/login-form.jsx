import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';

function GoogleMark({ className }) {
  return (
    <svg
      className={cn('size-5 shrink-0', className)}
      viewBox='0 0 24 24'
      aria-hidden
    >
      <path
        fill='#4285F4'
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
      />
      <path
        fill='#34A853'
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
      />
      <path
        fill='#FBBC05'
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
      />
      <path
        fill='#EA4335'
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
      />
    </svg>
  );
}

export function LoginForm({ className, ...props }) {
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
                  to='#'
                  className='text-sm font-medium text-primary-container hover:underline'
                  onClick={(e) => e.preventDefault()}
                >
                  Lupa Password?
                </Link>
              </div>
            </div>
          </div>

          <Button
            type='submit'
            className='h-12 w-full rounded-full bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/35 transition hover:bg-primary-container/90'
          >
            Masuk
          </Button>

          <div className='relative flex items-center gap-3 py-0.5'>
            <span className='h-px flex-1 bg-border' aria-hidden />
            <span className='shrink-0 text-xs text-muted-foreground'>
              atau lanjutkan dengan
            </span>
            <span className='h-px flex-1 bg-border' aria-hidden />
          </div>

          <Button
            type='button'
            variant='outline'
            className='h-12 w-full rounded-full border-border bg-background font-medium shadow-none hover:bg-muted/60'
          >
            <GoogleMark />
            Google
          </Button>
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
