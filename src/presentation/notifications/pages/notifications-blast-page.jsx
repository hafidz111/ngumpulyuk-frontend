import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

import { mapInterestsTaxonomyResponse } from '@/application/users/map-interests-taxonomy-response';
import { notificationsApi } from '@/infrastructure/notifications/notifications-api';
import { usersApi } from '@/infrastructure/users/users-api';
import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { Badge } from '@/presentation/components/ui/badge';
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
import { Textarea } from '@/presentation/components/ui/textarea';

const RECOMMENDED_EVENT_TEMPLATE = {
  title: 'Rekomendasi Event Untukmu',
  message: 'Kami menemukan event yang mungkin cocok untukmu. Cek sekarang sebelum kuota habis!',
};

function mapUsersResponse(raw) {
  const root = raw?.data ?? raw;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.results)) return root.results;
  if (Array.isArray(root?.users)) return root.users;
  if (Array.isArray(root?.items)) return root.items;
  return [];
}

export default function NotificationsBlastPage() {
  const { user } = useAuth();
  const { onOpenMenu } = useChatPageShell();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [targetMode, setTargetMode] = useState('users');
  const [userQuery, setUserQuery] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userResults, setUserResults] = useState([]);
  const [userComboboxOpen, setUserComboboxOpen] = useState(false);
  const [userSearchMeta, setUserSearchMeta] = useState({ count: 0, limited: false });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [interestRows, setInterestRows] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [interestError, setInterestError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = useMemo(() => {
    if (!title.trim() || !message.trim()) return false;
    if (targetMode === 'all') return true;
    if (targetMode === 'users') return selectedUsers.length > 0;
    if (targetMode === 'interests') return selectedInterests.length > 0;
    return false;
  }, [message, selectedInterests.length, selectedUsers.length, targetMode, title]);

  useEffect(() => {
    const q = userQuery.trim();
    if (targetMode !== 'users' || q.length < 3) {
      setUserResults([]);
      setUserSearchMeta({ count: 0, limited: false });
      setUserComboboxOpen(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await usersApi.search({ search: q, limit: 6, offset: 0 });
        if (!active) return;
        const rows = mapUsersResponse(res.data);
        const root = res.data?.data ?? res.data ?? {};
        const countRaw = root?.count ?? root?.total ?? rows.length;
        const count = typeof countRaw === 'number' ? countRaw : Number(countRaw) || rows.length;
        setUserResults(rows.slice(0, 6));
        setUserSearchMeta({ count, limited: count > rows.length });
        setUserComboboxOpen(true);
      } catch {
        if (active) {
          setUserResults([]);
          setUserSearchMeta({ count: 0, limited: false });
          setUserComboboxOpen(false);
        }
      } finally {
        if (active) setSearchingUsers(false);
      }
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [targetMode, userQuery]);

  useEffect(() => {
    if (targetMode !== 'interests') return;
    if (interestRows.length > 0) return;
    let active = true;
    async function loadInterests() {
      setLoadingInterests(true);
      setInterestError('');
      try {
        const res = await usersApi.interests();
        if (!active) return;
        const { rows } = mapInterestsTaxonomyResponse(res.data);
        setInterestRows(rows);
        if (rows.length === 0) {
          setInterestError('API interests mengembalikan data kosong.');
        }
      } catch (err) {
        if (active) {
          setInterestRows([]);
          setInterestError(
            err?.response?.data?.detail ||
              err?.response?.data?.message ||
              'Gagal memuat interest dari backend.',
          );
        }
      } finally {
        if (active) setLoadingInterests(false);
      }
    }
    void loadInterests();
    return () => {
      active = false;
    };
  }, [interestRows.length, targetMode]);

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

    if (targetMode === 'all') {
      payload.all_users = true;
    } else if (targetMode === 'interests') {
      payload.interests = selectedInterests;
    } else {
      payload.user_ids = selectedUsers
        .map((u) => String(u.id ?? '').trim())
        .filter(Boolean);
    }

    try {
      await notificationsApi.blast(payload);
      toast.success('Blast notifikasi berhasil dikirim.');
      setTitle('');
      setMessage('');
      setLinkUrl('');
      setUserQuery('');
      setUserResults([]);
      setSelectedUsers([]);
      setSelectedInterests([]);
      setTargetMode('users');
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

  function applyRecommendationTemplate() {
    setTitle(RECOMMENDED_EVENT_TEMPLATE.title);
    setMessage(RECOMMENDED_EVENT_TEMPLATE.message);
    if (!linkUrl.trim()) setLinkUrl('/events');
    setTargetMode('all');
    toast.message('Template notifikasi rekomendasi dipakai.');
  }

  function addSelectedUser(item) {
    const id = String(item?.id ?? '').trim();
    if (!id) return;
    setSelectedUsers((prev) => {
      if (prev.some((u) => String(u.id) === id)) return prev;
      return [
        ...prev,
        {
          id,
          full_name: String(item?.full_name ?? '').trim(),
          username: String(item?.username ?? '').trim(),
          email: String(item?.email ?? '').trim(),
        },
      ];
    });
    setUserComboboxOpen(false);
    setUserQuery('');
    setUserResults([]);
  }

  function removeSelectedUser(id) {
    setSelectedUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
  }

  function toggleInterest(interestId) {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId],
    );
  }

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title={SHELL_COPY.pages.notificationsBlastTitle}
        subtitle={SHELL_COPY.pages.notificationsBlastSubtitle}
        onOpenMenu={onOpenMenu}
        showCreateEvent={false}
      />
      <ChatFirstPageBody>
        <div className='mx-auto max-w-3xl'>
        {!user?.isStaff ? (
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
        ) : (
        <Card className='rounded-3xl border-border/60 bg-white'>
          <CardHeader className='space-y-2'>
            <div className='inline-flex w-fit items-center gap-2 rounded-full bg-[#FFF1E5] px-3 py-1 text-xs font-bold text-[#FF8000]'>
              <Megaphone className='size-3.5' />
              ADMIN ONLY
            </div>
            <CardDescription>
              Kirim notifikasi massal ke user tertentu atau ke semua user aktif.
            </CardDescription>
            <div className='pt-1'>
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='rounded-full border-border/60 bg-white'
                onClick={applyRecommendationTemplate}
              >
                Gunakan Template Push Rekomendasi Event
              </Button>
            </div>
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
                <p className='mb-3 text-sm font-semibold'>Target penerima</p>
                <div className='flex flex-wrap gap-2'>
                  <Button
                    type='button'
                    variant={targetMode === 'users' ? 'default' : 'outline'}
                    className='h-9 rounded-full'
                    onClick={() => setTargetMode('users')}
                  >
                    Pilih User
                  </Button>
                  <Button
                    type='button'
                    variant={targetMode === 'interests' ? 'default' : 'outline'}
                    className='h-9 rounded-full'
                    onClick={() => setTargetMode('interests')}
                  >
                    By Interest
                  </Button>
                  <Button
                    type='button'
                    variant={targetMode === 'all' ? 'default' : 'outline'}
                    className='h-9 rounded-full'
                    onClick={() => setTargetMode('all')}
                  >
                    Semua User Aktif
                  </Button>
                </div>
              </div>

              {targetMode === 'users' ? (
                <div className='space-y-2'>
                  <Label htmlFor='blast-user-search'>Cari user lalu klik untuk pilih</Label>
                  <div className='relative'>
                    <Input
                      id='blast-user-search'
                      role='combobox'
                      aria-expanded={userComboboxOpen}
                      aria-controls='blast-user-combobox-list'
                      aria-autocomplete='list'
                      value={userQuery}
                      onFocus={() => {
                        if (userResults.length > 0) setUserComboboxOpen(true);
                      }}
                      onBlur={() => {
                        window.setTimeout(() => setUserComboboxOpen(false), 120);
                      }}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder='Ketik minimal 3 huruf: nama, username, atau email'
                      className='h-11 rounded-2xl border-border/60 bg-white'
                    />
                    {userComboboxOpen && userResults.length > 0 ? (
                      <div
                        id='blast-user-combobox-list'
                        role='listbox'
                        className='absolute z-20 mt-2 max-h-56 w-full space-y-1 overflow-y-auto rounded-2xl border border-border/60 bg-white p-2 shadow-lg'
                      >
                        {userResults.map((item) => {
                          const id = String(item?.id ?? '');
                          const name = String(item?.full_name ?? item?.username ?? 'User');
                          const detail = String(item?.email ?? item?.username ?? '');
                          return (
                            <button
                              key={id}
                              role='option'
                              type='button'
                              className='w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted'
                              onClick={() => addSelectedUser(item)}
                            >
                              <p className='font-semibold text-foreground'>{name}</p>
                              <p className='text-xs text-muted-foreground'>{detail}</p>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                  {userQuery.trim().length > 0 && userQuery.trim().length < 3 ? (
                    <p className='text-xs text-muted-foreground'>Ketik minimal 3 karakter.</p>
                  ) : null}
                  {searchingUsers ? (
                    <p className='text-xs text-muted-foreground'>Mencari user...</p>
                  ) : null}
                  {!searchingUsers && userQuery.trim().length >= 3 && userResults.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>User tidak ditemukan.</p>
                  ) : null}
                  {!searchingUsers && userResults.length > 0 ? (
                    <p className='text-xs text-muted-foreground'>
                      Menampilkan {userResults.length} dari {userSearchMeta.count} hasil.
                      {userSearchMeta.count > userResults.length ? ' Persempit kata kunci untuk hasil lebih spesifik.' : ''}
                    </p>
                  ) : null}
                  {selectedUsers.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                      {selectedUsers.map((u) => (
                        <button
                          key={u.id}
                          type='button'
                          onClick={() => removeSelectedUser(u.id)}
                          className='inline-flex items-center gap-2 rounded-full bg-[#FFF1E5] px-3 py-1 text-xs font-semibold text-[#FF8000]'
                        >
                          {u.full_name || u.username || u.email || u.id}
                          <span aria-hidden>×</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <p className='text-xs text-muted-foreground'>Terpilih {selectedUsers.length} user.</p>
                </div>
              ) : null}

              {targetMode === 'interests' ? (
                <div className='space-y-2'>
                  <Label>Pilih satu atau beberapa interest</Label>
                  {loadingInterests ? (
                    <p className='text-xs text-muted-foreground'>Memuat daftar interest...</p>
                  ) : null}
                  <div className='flex flex-wrap gap-2'>
                    {interestRows.map(({ interest }) => {
                      const selected = selectedInterests.includes(interest);
                      const label = interest
                        .split('_')
                        .filter(Boolean)
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                      return (
                        <button
                          key={interest}
                          type='button'
                          onClick={() => toggleInterest(interest)}
                        >
                          <Badge
                            variant={selected ? 'default' : 'muted'}
                            className='cursor-pointer normal-case tracking-normal'
                          >
                            {label || interest}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                  {!loadingInterests && interestRows.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>
                      {interestError || 'Daftar interest belum tersedia dari API.'}
                    </p>
                  ) : null}
                  <p className='text-xs text-muted-foreground'>
                    Dipilih {selectedInterests.length} interest.
                  </p>
                </div>
              ) : null}

              {targetMode === 'all' ? (
                <p className='rounded-2xl border border-border/60 bg-surface-low px-4 py-3 text-sm text-muted-foreground'>
                  Notifikasi akan dikirim ke seluruh user aktif.
                </p>
              ) : null}

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
        )}
        </div>
      </ChatFirstPageBody>
    </div>
  );
}
