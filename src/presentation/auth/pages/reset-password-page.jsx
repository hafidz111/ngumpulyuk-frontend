import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getAuthErrorMessage } from '@/application/auth/auth-error';
import { validateRegistrationPassword } from '@/application/auth/validate-registration-password';
import { AUTH_FORM_INPUT_CLASS } from '@/presentation/layout/app-shell-chrome';
import { authApi } from '@/infrastructure/auth/auth-api';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { AuthSplitLayout } from '../components/auth-split-layout';

export default function ResetPasswordPage() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validParams = Boolean(uidb64 && token);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validParams) {
      setError('Link tidak valid atau sudah kedaluwarsa.');
      return;
    }
    const form = e.currentTarget;
    const password = String(form.password?.value ?? '');
    const confirmPassword = String(form.confirmPassword?.value ?? '');

    const passwordValidation = validateRegistrationPassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message ?? 'Kata sandi tidak valid.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.setNewPassword({
        password,
        confirm_password: confirmPassword,
        uidb64,
        token,
      });
      navigate(ROUTES.login, {
        replace: true,
        state: {
          message:
            'Kata sandi berhasil diatur. Silakan masuk dengan kata sandi baru.',
        },
      });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Gagal mengatur kata sandi baru.'));
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
                Kata sandi baru
              </h1>
              <p className='mt-2 text-sm text-muted-foreground'>
                Buat kata sandi baru untuk akun kamu.
              </p>
            </div>

            {!validParams ? (
              <p className='text-center text-sm text-destructive' role='alert'>
                Link reset tidak valid. Minta link baru dari halaman lupa kata
                sandi.
              </p>
            ) : null}

            <div className='space-y-2'>
              <Label
                htmlFor='reset-password'
                className='text-sm font-semibold text-foreground'
              >
                Kata sandi baru
              </Label>
              <div className='relative'>
                <Lock
                  className='pointer-events-none absolute left-4 top-1/2 size-[1.125rem] -translate-y-1/2 text-muted-foreground'
                  aria-hidden
                />
                <Input
                  id='reset-password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  required
                  minLength={8}
                  className={cn(
                    AUTH_FORM_INPUT_CLASS,
                    'h-12 rounded-full pl-11 pr-12 text-sm',
                  )}
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted'
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
              <p className='text-xs text-muted-foreground'>
                Minimal 8 karakter, huruf kapital, huruf kecil, dan angka.
              </p>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='reset-confirm-password'
                className='text-sm font-semibold text-foreground'
              >
                Konfirmasi kata sandi
              </Label>
              <div className='relative'>
                <Lock
                  className='pointer-events-none absolute left-4 top-1/2 size-[1.125rem] -translate-y-1/2 text-muted-foreground'
                  aria-hidden
                />
                <Input
                  id='reset-confirm-password'
                  name='confirmPassword'
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete='new-password'
                  required
                  minLength={8}
                  className={cn(
                    AUTH_FORM_INPUT_CLASS,
                    'h-12 rounded-full pl-11 pr-12 text-sm',
                  )}
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted'
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={
                    showConfirm
                      ? 'Sembunyikan konfirmasi'
                      : 'Tampilkan konfirmasi'
                  }
                >
                  {showConfirm ? (
                    <EyeOff className='size-[1.125rem]' />
                  ) : (
                    <Eye className='size-[1.125rem]' />
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <p className='text-sm text-destructive' role='alert'>
                {error}
              </p>
            ) : null}

            <Button
              type='submit'
              disabled={isSubmitting || !validParams}
              className='h-12 w-full rounded-full bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/35'
            >
              {isSubmitting ? 'Menyimpan…' : 'Simpan kata sandi'}
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
