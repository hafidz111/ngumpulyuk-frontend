import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LogOut,
  MapPin,
  PencilLine,
  Save,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { mapParticipationSummary } from '@/application/users/map-participation-summary';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { usersApi } from '@/infrastructure/users/users-api';
import { eventsApi } from '@/infrastructure/events/events-api';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { Card } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Textarea } from '@/presentation/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar';
import {
  ButtonBusySkeleton,
  ListRowsSkeleton,
  ProfilePageSkeleton,
} from '@/presentation/components/skeletons';

const ACTIVITY_LIMIT = 20;
const CIRCLE_PREVIEW_LIMIT = 4;

const profileListItemClass =
  'block rounded-xl border border-border/70 bg-background/70 p-3 transition-colors hover:border-[#FF8000]/35 hover:bg-[#FFF1E5]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8000]/40';

function extractPayload(payload) {
  return payload?.data ?? payload;
}

function initialFromName(name) {
  const first = String(name || '').trim().charAt(0).toUpperCase();
  return first || 'U';
}

function fallbackColorClass(identity) {
  const palette = [
    'bg-rose-200 text-rose-900',
    'bg-sky-200 text-sky-900',
    'bg-emerald-200 text-emerald-900',
    'bg-amber-200 text-amber-900',
    'bg-violet-200 text-violet-900',
    'bg-fuchsia-200 text-fuchsia-900',
    'bg-cyan-200 text-cyan-900',
  ];
  const source = String(identity || 'user');
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }
  return palette[Math.abs(hash) % palette.length];
}

function profileMeta(profile) {
  const stats = profile?.stats ?? {};
  return [
    { label: 'Events Joined', value: stats.events_joined ?? 0, icon: Calendar },
    { label: 'Events Created', value: stats.events_created ?? 0, icon: CheckCircle2 },
    { label: 'Communities Joined', value: stats.communities_joined ?? 0, icon: Users },
  ];
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function extractEventTitle(activity, eventDetail) {
  if (eventDetail?.title) return eventDetail.title;
  const description = String(activity?.description || '').trim();
  const split = description.split(':');
  if (split.length > 1) return split.slice(1).join(':').trim();
  return description || 'Event';
}

function eventDetailPath(eventId) {
  const id = String(eventId ?? '').trim();
  if (!id) return null;
  return ROUTES.eventDetail.replace(':id', id);
}

function communityDetailPath(communityId) {
  const id = String(communityId ?? '').trim();
  if (!id) return null;
  return ROUTES.communityDetail.replace(':id', id);
}

function formatEventSchedule(detail) {
  if (!detail) return null;
  const date = detail.event_date || detail.start_date;
  if (!date) return null;
  const parts = [formatDate(date)];
  const time = detail.event_time || detail.start_time;
  if (time) parts.push(String(time).slice(0, 5));
  const loc = detail.location_area || detail.location || detail.area;
  if (loc) parts.push(String(loc));
  return parts.join(' · ');
}

function isUpcomingEvent(eventDetail) {
  if (!eventDetail) return false;
  const status = String(eventDetail.status || '').toLowerCase();
  if (status === 'cancelled' || status === 'completed') return false;
  const sourceDate = eventDetail.end_date || eventDetail.event_date || eventDetail.start_date || '';
  if (!sourceDate) return false;
  const date = new Date(sourceDate);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { onOpenMenu } = useChatPageShell();
  const [logoutPending, setLogoutPending] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activityOffset, setActivityOffset] = useState(0);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesLoadingMore, setActivitiesLoadingMore] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState({});
  const [joinedCircles, setJoinedCircles] = useState([]);
  const [circlesLoading, setCirclesLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    phone: '',
    location: '',
  });

  const isPublicProfile = Boolean(username);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = isPublicProfile
        ? await usersApi.getPublicByUsername(username)
        : await usersApi.getMe();
      const data = extractPayload(res.data);
      setProfile(data);
      setForm({
        full_name: data?.full_name || '',
        bio: data?.bio || '',
        phone: data?.phone || '',
        location: data?.location || '',
      });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Gagal memuat profil.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isPublicProfile, username]);

  const fetchActivities = useCallback(async (newOffset = 0, append = false) => {
    if (isPublicProfile) return;
    if (append) setActivitiesLoadingMore(true);
    else setActivitiesLoading(true);
    try {
      const res = await usersApi.activityHistory({ limit: ACTIVITY_LIMIT, offset: newOffset });
      const payload = extractPayload(res.data);
      const items = payload?.activities || payload?.results || [];
      setActivities((prev) => (append ? [...prev, ...items] : items));
      setActivityOffset(newOffset);
      setActivityTotal(payload?.total ?? items.length);
    } catch {
      if (!append) setActivities([]);
    } finally {
      if (append) setActivitiesLoadingMore(false);
      else setActivitiesLoading(false);
    }
  }, [isPublicProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!isPublicProfile) {
      fetchActivities(0, false);
    }
  }, [isPublicProfile, fetchActivities]);

  useEffect(() => {
    if (isPublicProfile) return undefined;
    let active = true;
    setCirclesLoading(true);
    usersApi
      .participationSummary()
      .then((res) => {
        if (!active) return;
        const { communities } = mapParticipationSummary(res.data);
        setJoinedCircles(communities);
      })
      .catch(() => {
        if (active) setJoinedCircles([]);
      })
      .finally(() => {
        if (active) setCirclesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isPublicProfile]);

  async function handleSave() {
    setSaving(true);
    try {
      await usersApi.updateMe({
        full_name: form.full_name?.trim(),
        bio: form.bio?.trim(),
        phone: form.phone?.trim(),
        location: form.location?.trim(),
      });
      toast.success('Profil berhasil diperbarui.');
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  }

  const canLoadMoreActivities = activityOffset + ACTIVITY_LIMIT < activityTotal;
  const displayName = profile?.full_name || profile?.username || user?.displayName || 'User';
  const identity = profile?.id || profile?.username || profile?.email || displayName;
  const stats = useMemo(() => profileMeta(profile), [profile]);
  const eventParticipationActivities = useMemo(() => {
    const leftEventIds = new Set(
      activities
        .filter((item) => String(item.activity_type || '').toLowerCase() === 'left_event')
        .map((item) => String(item.related_id || ''))
        .filter(Boolean),
    );
    return activities.filter((item) => {
      const type = String(item.activity_type || '').toLowerCase();
      const relatedId = String(item.related_id || '');
      if (type !== 'joined_event') return false;
      if (!relatedId) return true;
      return !leftEventIds.has(relatedId);
    });
  }, [activities]);

  useEffect(() => {
    const joinedIds = Array.from(
      new Set(
        eventParticipationActivities
          .map((item) => String(item.related_id || ''))
          .filter(Boolean),
      ),
    );
    if (joinedIds.length === 0) {
      setRelatedEvents({});
      return;
    }

    let active = true;
    async function loadRelatedEvents() {
      try {
        const results = await Promise.all(
          joinedIds.map(async (eventId) => {
            try {
              const res = await eventsApi.getById(eventId);
              return [eventId, extractPayload(res.data)];
            } catch {
              return [eventId, null];
            }
          }),
        );
        if (!active) return;
        const next = {};
        results.forEach(([eventId, detail]) => {
          next[eventId] = detail;
        });
        setRelatedEvents(next);
      } catch {
        if (active) setRelatedEvents({});
      }
    }

    loadRelatedEvents();
    return () => {
      active = false;
    };
  }, [eventParticipationActivities]);

  const upcomingFollowedEvents = useMemo(
    () => eventParticipationActivities.filter((activity) => {
      const id = String(activity.related_id || '');
      return isUpcomingEvent(relatedEvents[id]);
    }),
    [eventParticipationActivities, relatedEvents],
  );

  const historyFollowedEvents = useMemo(
    () => eventParticipationActivities.filter((activity) => {
      const id = String(activity.related_id || '');
      return !isUpcomingEvent(relatedEvents[id]);
    }),
    [eventParticipationActivities, relatedEvents],
  );

  const previewCircles = useMemo(
    () => joinedCircles.slice(0, CIRCLE_PREVIEW_LIMIT),
    [joinedCircles],
  );
  const hasMoreCircles = joinedCircles.length > CIRCLE_PREVIEW_LIMIT;

  const profileTitle = loading
    ? SHELL_COPY.pages.profileLoadingTitle
    : (isPublicProfile ? displayName : SHELL_COPY.pages.profileMyTitle);
  const profileSubtitle = loading
    ? SHELL_COPY.pages.profileLoadingSubtitle
    : (profile ? `@${profile.username}` : SHELL_COPY.pages.profileNotFound);

  async function handleLogout() {
    if (logoutPending) return;
    setLogoutPending(true);
    try {
      await logout();
      navigate(ROUTES.login, { replace: true });
    } finally {
      setLogoutPending(false);
    }
  }

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title={profileTitle}
        subtitle={profileSubtitle}
        onOpenMenu={onOpenMenu}
        showCreateEvent={false}
      />
      <ChatFirstPageBody>
        <div className='mx-auto max-w-5xl space-y-6'>
        {loading ? (
          <ProfilePageSkeleton />
        ) : !profile ? (
          <Card className='border border-border/80 bg-card p-8 text-center'>
            <p className='text-muted-foreground'>{SHELL_COPY.pages.profileNotFound}</p>
            {!isPublicProfile ? (
              <Button asChild variant='outline' className='mt-4 rounded-full'>
                <Link to={ROUTES.chat}>Kembali ke Chat</Link>
              </Button>
            ) : null}
          </Card>
        ) : (
          <>
            <Card className='border border-border/80 bg-card p-6'>
              <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
                <div className='flex items-center gap-4'>
                  <Avatar className='size-16 border-0'>
                    <AvatarFallback className={`${fallbackColorClass(identity)} text-xl font-bold`}>
                      {initialFromName(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className='font-display text-2xl font-bold text-foreground'>
                      {displayName}
                    </h1>
                    <p className='text-sm text-muted-foreground'>@{profile.username}</p>
                    <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                      {profile.location ? (
                        <span className='inline-flex items-center gap-1'>
                          <MapPin className='size-3.5' />
                          {profile.location}
                        </span>
                      ) : null}
                      <span className='inline-flex items-center gap-1'>
                        <Clock3 className='size-3.5' />
                        Bergabung {formatDate(profile.created_at)}
                      </span>
                      {profile.is_verified ? (
                        <span className='inline-flex items-center gap-1 text-emerald-600'>
                          <ShieldCheck className='size-3.5' />
                          Verified
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {!isPublicProfile ? (
                  <div className='flex flex-wrap items-center justify-end gap-2'>
                    {user?.isStaff ? (
                      <>
                        <Button asChild type='button' variant='outline' className='rounded-full'>
                          <Link to={ROUTES.notificationsBlast}>Blast Notifikasi</Link>
                        </Button>
                        <Button asChild type='button' variant='outline' className='rounded-full'>
                          <Link to={ROUTES.adminChatMonitoring}>Chat Monitoring</Link>
                        </Button>
                        <Button asChild type='button' variant='outline' className='rounded-full'>
                          <Link to={ROUTES.adminChatCorrections}>Chat Corrections</Link>
                        </Button>
                      </>
                    ) : null}
                    <Button
                      type='button'
                      variant={editMode ? 'outline' : 'default'}
                      onClick={() => setEditMode((v) => !v)}
                      className='rounded-full'
                    >
                      <PencilLine className='size-4' />
                      {editMode ? 'Batal Edit' : 'Edit Profil'}
                    </Button>
                  </div>
                ) : null}
              </div>

              {editMode ? (
                <div className='mt-6 grid gap-3 md:grid-cols-2'>
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                    placeholder='Nama lengkap'
                  />
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder='Nomor telepon'
                  />
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder='Lokasi'
                    className='md:col-span-2'
                  />
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder='Bio'
                    className='min-h-[96px] md:col-span-2'
                  />
                  <div className='md:col-span-2'>
                    <Button
                      type='button'
                      onClick={handleSave}
                      disabled={saving}
                      className='rounded-full'
                    >
                      {saving ? <ButtonBusySkeleton /> : <Save className='size-4' />}
                      Simpan Profil
                    </Button>
                  </div>
                </div>
              ) : (
                <p className='mt-4 text-sm text-muted-foreground'>
                  {profile.bio || 'Belum ada bio.'}
                </p>
              )}
            </Card>

            <div className='grid gap-4 sm:grid-cols-3'>
              {stats.map((item) => (
                <Card key={item.label} className='border border-border/80 bg-card p-4'>
                  <div className='inline-flex size-9 items-center justify-center rounded-full bg-primary-container/15 text-primary-container'>
                    <item.icon className='size-4' />
                  </div>
                  <p className='mt-3 text-2xl font-bold text-foreground'>{item.value}</p>
                  <p className='text-xs text-muted-foreground'>{item.label}</p>
                </Card>
              ))}
            </div>

            {!isPublicProfile ? (
              <div className='grid gap-4 md:grid-cols-2'>
                <Card className='border border-border/80 bg-card p-5'>
                  <div className='flex items-center justify-between gap-3'>
                    <h2 className='text-base font-semibold text-foreground'>
                      {SHELL_COPY.pages.profileUpcomingEvents}
                    </h2>
                    <span className='rounded-full bg-primary-container/15 px-3 py-1 text-xs font-semibold text-primary-container'>
                      {upcomingFollowedEvents.length}
                    </span>
                  </div>
                  {activitiesLoading ? (
                    <ListRowsSkeleton rows={3} className='mt-4' />
                  ) : upcomingFollowedEvents.length === 0 ? (
                    <p className='py-8 text-sm text-muted-foreground'>Belum ada event akan datang.</p>
                  ) : (
                    <div className='mt-4 space-y-2.5'>
                      {upcomingFollowedEvents.map((activity) => {
                        const eventId = String(activity.related_id || '');
                        const detail = relatedEvents[eventId];
                        const title = extractEventTitle(activity, detail);
                        const subtitle =
                          formatEventSchedule(detail) ||
                          `Diikuti ${formatDateTime(activity.created_at)}`;
                        const to = eventDetailPath(eventId);
                        const content = (
                          <>
                            <div className='flex items-start justify-between gap-2'>
                              <p className='text-sm font-medium text-foreground'>{title}</p>
                              {to ? (
                                <ChevronRight
                                  className='size-4 shrink-0 text-muted-foreground'
                                  aria-hidden
                                />
                              ) : null}
                            </div>
                            <p className='mt-1 text-xs text-muted-foreground'>{subtitle}</p>
                          </>
                        );
                        return to ? (
                          <Link
                            key={activity.id}
                            to={to}
                            className={profileListItemClass}
                            aria-label={`${SHELL_COPY.pages.profileOpenEvent}: ${title}`}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div key={activity.id} className={profileListItemClass}>
                            {content}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                <Card className='border border-border/80 bg-card p-5'>
                  <div className='flex items-center justify-between gap-3'>
                    <h2 className='text-base font-semibold text-foreground'>
                      {SHELL_COPY.pages.profileEventHistory}
                    </h2>
                    <span className='rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground'>
                      {historyFollowedEvents.length}
                    </span>
                  </div>
                  {activitiesLoading ? (
                    <ListRowsSkeleton rows={3} className='mt-4' />
                  ) : historyFollowedEvents.length === 0 ? (
                    <p className='py-8 text-sm text-muted-foreground'>Belum ada riwayat event.</p>
                  ) : (
                    <div className='mt-4 space-y-2.5'>
                      {historyFollowedEvents.map((activity) => {
                        const eventId = String(activity.related_id || '');
                        const detail = relatedEvents[eventId];
                        const title = extractEventTitle(activity, detail);
                        const subtitle =
                          formatEventSchedule(detail) ||
                          `Diikuti ${formatDateTime(activity.created_at)}`;
                        const to = eventDetailPath(eventId);
                        const content = (
                          <>
                            <div className='flex items-start justify-between gap-2'>
                              <p className='text-sm font-medium text-foreground'>{title}</p>
                              {to ? (
                                <ChevronRight
                                  className='size-4 shrink-0 text-muted-foreground'
                                  aria-hidden
                                />
                              ) : null}
                            </div>
                            <p className='mt-1 text-xs text-muted-foreground'>{subtitle}</p>
                          </>
                        );
                        return to ? (
                          <Link
                            key={activity.id}
                            to={to}
                            className={profileListItemClass}
                            aria-label={`${SHELL_COPY.pages.profileOpenEvent}: ${title}`}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div key={activity.id} className={profileListItemClass}>
                            {content}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                <Card className='border border-border/80 bg-card p-5 md:col-span-2'>
                  <div className='flex items-center justify-between gap-3'>
                    <h2 className='text-base font-semibold text-foreground'>
                      {SHELL_COPY.pages.profileMyCircles}
                    </h2>
                    <div className='flex items-center gap-2'>
                      <span className='rounded-full bg-primary-container/15 px-3 py-1 text-xs font-semibold text-primary-container'>
                        {joinedCircles.length}
                      </span>
                      {joinedCircles.length > 0 ? (
                        <Button
                          asChild
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-8 rounded-full px-2 text-xs font-semibold text-[#FF8000] hover:text-[#FF8000]'
                        >
                          <Link to={ROUTES.community}>
                            {SHELL_COPY.pages.profileSeeAllCircles}
                            <ChevronRight className='size-3.5' aria-hidden />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {circlesLoading ? (
                    <ListRowsSkeleton rows={2} className='mt-4' />
                  ) : joinedCircles.length === 0 ? (
                    <p className='py-8 text-sm text-muted-foreground'>
                      {SHELL_COPY.pages.profileNoCircles}{' '}
                      <Link
                        to={ROUTES.community}
                        className='font-semibold text-[#FF8000] hover:underline'
                      >
                        Jelajahi circle
                      </Link>
                    </p>
                  ) : (
                    <div className='mt-4 grid gap-2.5 sm:grid-cols-2'>
                      {previewCircles.map((circle) => {
                        const to = communityDetailPath(circle.id);
                        const content = (
                          <>
                            <div className='flex items-start justify-between gap-2'>
                              <p className='text-sm font-medium text-foreground'>{circle.name}</p>
                              {to ? (
                                <ChevronRight
                                  className='size-4 shrink-0 text-muted-foreground'
                                  aria-hidden
                                />
                              ) : null}
                            </div>
                            <p className='mt-1 text-xs text-muted-foreground'>
                              {SHELL_COPY.pages.profileOpenCircle}
                            </p>
                          </>
                        );
                        return to ? (
                          <Link
                            key={circle.id}
                            to={to}
                            className={profileListItemClass}
                            aria-label={`${SHELL_COPY.pages.profileOpenCircle}: ${circle.name}`}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div key={circle.id} className={profileListItemClass}>
                            {content}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {hasMoreCircles ? (
                    <p className='mt-3 text-center text-xs text-muted-foreground'>
                      +{joinedCircles.length - CIRCLE_PREVIEW_LIMIT} circle lainnya —{' '}
                      <Link
                        to={ROUTES.community}
                        className='font-semibold text-[#FF8000] hover:underline'
                      >
                        {SHELL_COPY.pages.profileSeeAllCircles}
                      </Link>
                    </p>
                  ) : null}
                </Card>

                {canLoadMoreActivities ? (
                  <div className='md:col-span-2'>
                    <Button
                      type='button'
                      variant='outline'
                      className='rounded-full'
                      onClick={() => fetchActivities(activityOffset + ACTIVITY_LIMIT, true)}
                      disabled={activitiesLoadingMore}
                    >
                      {activitiesLoadingMore ? <ButtonBusySkeleton /> : null}
                      Muat lebih banyak
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!isPublicProfile ? (
              <Card className='overflow-hidden border border-border/60 bg-white lg:hidden'>
                <div className='border-b border-border/50 bg-[#FFF1E5]/40 px-4 py-3'>
                  <p className='text-xs font-bold uppercase tracking-wide text-[#FF8000]'>
                    Akun
                  </p>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    Keluar kalau mau ganti akun atau selesai ngumpul
                  </p>
                </div>
                <div className='p-3'>
                  <button
                    type='button'
                    disabled={logoutPending}
                    onClick={() => void handleLogout()}
                    className='flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#FF8000] text-sm font-bold text-white shadow-sm transition hover:bg-[#FF8000]/90 active:scale-[0.99] disabled:opacity-60'
                  >
                    {logoutPending ? (
                      <ButtonBusySkeleton />
                    ) : (
                      <LogOut className='size-4' />
                    )}
                    Keluar akun
                  </button>
                </div>
              </Card>
            ) : null}
          </>
        )}
        </div>
      </ChatFirstPageBody>
    </div>
  );
}
