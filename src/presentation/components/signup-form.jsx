import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { GoogleSignInButton } from '@/presentation/auth/components/google-sign-in-button';

export function SignupForm({
  className,
  passwordError,
  submitError,
  isSubmitting,
  onSubmit,
  onGoogleCredential,
  googleError,
  isGoogleLoading,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldError, setFieldError] = useState('');

  function handleFormSubmit(e) {
    setFieldError('');
    onSubmit?.(e);
  }

  return (
    <div className={cn('w-full', className)}>
      <Card className='border-0 bg-card shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.08)] rounded-[1.75rem]'>
        <form
          className='flex flex-col gap-5 p-8 md:p-9'
          onSubmit={handleFormSubmit}
          {...props}
        >
          <div className='text-center'>
            <h1 className='font-display text-2xl font-bold tracking-tight text-foreground'>
              Buat akun NgumpulYuk
            </h1>
          </div>

          <div className='space-y-5'>
            <div className='space-y-2'>
              <Label
                htmlFor='register-name'
                className='text-sm font-semibold text-foreground'
              >
                Nama Lengkap
              </Label>
              <div className='relative'>
                <User
                  className='pointer-events-none absolute left-4 top-1/2 size-[1.125rem] -translate-y-1/2 text-muted-foreground'
                  aria-hidden
                />
                <Input
                  id='register-name'
                  name='full_name'
                  type='text'
                  autoComplete='name'
                  placeholder='Masukkan nama lengkap kamu'
                  required
                  className='h-12 rounded-full border-border bg-background pl-11 pr-4 text-sm shadow-none'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='register-email'
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
                  id='register-email'
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
                htmlFor='register-password'
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
                  id='register-password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  placeholder='Masukkan kata sandi kamu'
                  minLength={8}
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
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='register-confirm-password'
                className='text-sm font-semibold text-foreground'
              >
                Konfirmasi Kata Sandi
              </Label>
              <div className='relative'>
                <Lock
                  className='pointer-events-none absolute left-4 top-1/2 size-[1.125rem] -translate-y-1/2 text-muted-foreground'
                  aria-hidden
                />
                <Input
                  id='register-confirm-password'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  placeholder='Masukkan konfirmasi kata sandi kamu'
                  required
                  className='h-12 rounded-full border-border bg-background pl-11 pr-12 text-sm shadow-none'
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword
                      ? 'Sembunyikan konfirmasi kata sandi'
                      : 'Tampilkan konfirmasi kata sandi'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className='size-[1.125rem]' />
                  ) : (
                    <Eye className='size-[1.125rem]' />
                  )}
                </button>
              </div>
              {passwordError ? (
                <p className='text-sm text-destructive'>{passwordError}</p>
              ) : null}
            </div>
          </div>

          <p className='text-center text-xs leading-relaxed text-muted-foreground'>
            Dengan mendaftar, kamu menyetujui{' '}
            <Link
              to='#'
              className='font-medium text-primary-container hover:underline'
              onClick={(e) => e.preventDefault()}
            >
              Syarat & Ketentuan
            </Link>{' '}
            serta{' '}
            <Link
              to='#'
              className='font-medium text-primary-container hover:underline'
              onClick={(e) => e.preventDefault()}
            >
              Kebijakan Privasi
            </Link>{' '}
            kami.
          </p>

          {fieldError ? (
            <p className='text-center text-sm text-destructive'>{fieldError}</p>
          ) : null}

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
            {isSubmitting ? 'Mendaftar…' : 'Daftar Sekarang'}
          </Button>

          <div className='relative flex items-center gap-3 py-0.5'>
            <span className='h-px flex-1 bg-border' aria-hidden />
            <span className='shrink-0 text-xs text-muted-foreground'>
              atau daftar dengan
            </span>
            <span className='h-px flex-1 bg-border' aria-hidden />
          </div>

          {googleError ? (
            <p className='text-center text-sm text-destructive' role='alert'>
              {googleError}
            </p>
          ) : null}

          <GoogleSignInButton
            text='signup_with'
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

      <p className='mt-4 text-center text-sm text-muted-foreground'>
        Sudah punya akun?{' '}
        <Link
          to={ROUTES.login}
          className='font-bold text-primary-container hover:underline'
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
