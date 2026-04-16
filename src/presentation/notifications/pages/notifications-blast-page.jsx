import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

import { notificationsApi } from '@/infrastructure/notifications/notifications-api';
import { ROUTES } from '@/shared/config/routes';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import { Textarea } from '@/presentation/components/ui/textarea';

const BLAST_ALL_CONFIRM = 'BLAST_ALL_USERS';

function parseUserIds(value) {
  return String(value)
    .split(/[\n,]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function NotificationsBlastPage() {
  const { isAuthenticated, user } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [allUsers, setAllUsers] = useState(false);
  const [userIdsText, setUserIdsText] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userIds = useMemo(() => parseUserIds(userIdsText), [userIdsText]);
  const canSubmit = useMemo(() => {
    if (!title.trim() || !message.trim()) return false;
    if (allUsers) return confirmText.trim() === BLAST_ALL_CONFIRM;
    return userIds.length > 0;
  }, [allUsers, confirmText, message, title, userIds.length]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!user?.isStaff) {
    return (
      <div className='min-h-svh bg-surface text-foreground'>
        <HomeAppHeader />
        <main className='mx-auto flex max-w-3xl px-4 py-10 md:px-6'>
          <Card className='w-full rounded-3xl border-border/60 bg-white'>
            <CardHeader>
              <CardTitle>Akses ditolak</CardTitle>
              <CardDescription>
                Halaman ini hanya untuk admin/staff.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant='outline' className='rounded-full'>
                <Link to={ROUTES.notifications}>Kembali ke notifikasi</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const payload = {
      title: title.trim(),
      message: message.trim(),
    };

    if (linkUrl.trim()) {
      payload.link_url = linkUrl.trim();
    }

    if (allUsers) {
      payload.all_users = true;
      payload.confirm = confirmText.trim();
    } else {
      payload.user_ids = userIds;
    }

    try {
      await notificationsApi.blast(payload);
      toast.success('Blast notifikasi berhasil dikirim.');
      setTitle('');
      setMessage('');
      setLinkUrl('');
      setUserIdsText('');
      setConfirmText('');
      setAllUsers(false);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error?.message;
      toast.error(apiMessage || 'Gagal mengirim blast notifikasi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />
      <main className='mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10'>
        <Card className='rounded-3xl border-border/60 bg-white'>
          <CardHeader className='space-y-2'>
            <div className='inline-flex w-fit items-center gap-2 rounded-full bg-[#FFF1E5] px-3 py-1 text-xs font-bold text-[#FF8000]'>
              <Megaphone className='size-3.5' />
              ADMIN ONLY
            </div>
            <CardTitle className='font-display text-2xl'>Blast Notifikasi</CardTitle>
            <CardDescription>
              Kirim notifikasi massal ke user tertentu atau ke semua user aktif.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className='space-y-5' onSubmit={handleSubmit}>
              <div className='space-y-2'>
                <Label htmlFor='blast-title'>Judul</Label>
                <Input
                  id='blast-title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Contoh: Pengumuman Sistem'
                  className='h-11 rounded-2xl border-border/60 bg-white'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='blast-message'>Pesan</Label>
                <Textarea
                  id='blast-message'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder='Tulis isi notifikasi...'
                  className='min-h-[120px] rounded-2xl border-border/60 bg-white'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='blast-link-url'>Link URL (opsional)</Label>
                <Input
                  id='blast-link-url'
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder='/events/123 atau https://...'
                  className='h-11 rounded-2xl border-border/60 bg-white'
                />
              </div>

              <div className='rounded-2xl border border-border/60 bg-surface-low p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <p className='font-semibold'>Kirim ke semua user aktif</p>
                    <p className='text-xs text-muted-foreground'>
                      Wajib konfirmasi kode untuk mencegah salah blast.
                    </p>
                  </div>
                  <Switch checked={allUsers} onCheckedChange={setAllUsers} />
                </div>
              </div>

              {allUsers ? (
                <div className='space-y-2'>
                  <Label htmlFor='blast-confirm'>
                    Ketik <span className='font-bold'>{BLAST_ALL_CONFIRM}</span>
                  </Label>
                  <Input
                    id='blast-confirm'
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={BLAST_ALL_CONFIRM}
                    className='h-11 rounded-2xl border-border/60 bg-white'
                  />
                </div>
              ) : (
                <div className='space-y-2'>
                  <Label htmlFor='blast-user-ids'>Target user IDs (UUID)</Label>
                  <Textarea
                    id='blast-user-ids'
                    value={userIdsText}
                    onChange={(e) => setUserIdsText(e.target.value)}
                    placeholder={'Satu UUID per baris atau dipisah koma'}
                    className='min-h-[120px] rounded-2xl border-border/60 bg-white'
                  />
                  <p className='text-xs text-muted-foreground'>
                    Terbaca {userIds.length} user ID.
                  </p>
                </div>
              )}

              <div className='flex flex-wrap items-center gap-2 pt-2'>
                <Button
                  type='submit'
                  disabled={!canSubmit || submitting}
                  className='h-11 rounded-full bg-primary-container px-6 font-semibold text-primary-foreground hover:bg-primary-container/90'
                >
                  {submitting ? (
                    <>
                      <Loader2 className='size-4 animate-spin' />
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Blast'
                  )}
                </Button>
                <Button asChild type='button' variant='outline' className='h-11 rounded-full'>
                  <Link to={ROUTES.notifications}>Kembali</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
