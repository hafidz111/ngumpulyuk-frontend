import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  LogIn,
  LogOut,
  MapPin,
  Share2,
  Target,
  Trash2,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/config/routes';
import { eventsApi } from '@/infrastructure/events/events-api';
import {
  getAuthErrorMessage,
  isApiErrorCode,
} from '@/application/auth/auth-error';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Card } from '@/presentation/components/ui/card';
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar';
import {
  AvatarGroup,
  AvatarGroupCount,
} from '@/presentation/components/ui/avatar-group';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import {
  ButtonBusySkeleton,
  EventDetailSkeleton,
} from '@/presentation/components/skeletons';
import {
  formatTimeId,
  formatLocation,
  formatEventDateRange,
} from '@/shared/lib/formatters';
import { DIFFICULTY_LABELS } from '../event-data';
import { isEventPast } from '../lib/event-schedule';
import { eventQueryKeys, userQueryKeys } from '../hooks/event-query-keys';
import { useEventDetailQuery } from '../hooks/use-event-detail-query';
import { EventMapPreview } from '../components/event-map-preview';
import { buildGoogleMapsUrl } from '@/shared/lib/google-maps-url';

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

function extractParticipantsFromEvent(event) {
  if (!event) return { items: [], count: 0 };
  if (Array.isArray(event.participants)) {
    return {
      items: event.participants,
      count:
        event.current_participants ??
        event.participant_count ??
        event.participants_count ??
        event.participants.length,
    };
  }
  return {
    items: [],
    count: event.current_participants ?? event.participant_count ?? 0,
  };
}

function nameFromParticipant(participant, idx) {
  return (
    participant.full_name ||
    participant.user?.full_name ||
    participant.display_name ||
    participant.username ||
    participant.user?.username ||
    participant.email ||
    participant.user?.email ||
    `Peserta ${idx + 1}`
  );
}

function colorClassForIdentity(identity) {
  const palette = [
    'bg-rose-200 text-rose-900',
    'bg-sky-200 text-sky-900',
    'bg-emerald-200 text-emerald-900',
    'bg-amber-200 text-amber-900',
    'bg-violet-200 text-violet-900',
    'bg-fuchsia-200 text-fuchsia-900',
    'bg-cyan-200 text-cyan-900',
  ];
  const source = String(identity || 'participant');
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }
  return palette[Math.abs(hash) % palette.length];
}

export default function EventDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { onOpenMenu } = useChatPageShell();
  const queryClient = useQueryClient();

  const preview =
    location.state?.preview && String(location.state.preview.id) === String(id)
      ? location.state.preview
      : null;

  const {
    data: event,
    isPending,
    isError,
  } = useEventDetailQuery(id, { preview });

  const { items: participants, count: participantsTotal } = useMemo(
    () => extractParticipantsFromEvent(event),
    [event],
  );

  const loading = isPending && !event;
  const error = isError ? 'Event tidak ditemukan.' : '';
  const [actionLoading, setActionLoading] = useState('');

  async function refreshEventDetail() {
    await queryClient.invalidateQueries({
      queryKey: eventQueryKeys.detail(id),
    });
    await queryClient.invalidateQueries({
      queryKey: userQueryKeys.participationSummary,
    });
  }

  const isOwner =
    event &&
    user?.email &&
    (event.creator_email === user.email ||
      event.creator?.email === user.email ||
      event.user?.email === user.email ||
      event.is_owner === true);

  const isJoined =
    participants.some(
      (p) =>
        p.email === user?.email ||
        p.user?.email === user?.email ||
        p.user_email === user?.email,
    ) || event?.is_joined === true;

  const participantCount =
    event?.participant_count ??
    event?.participants_count ??
    participants.length;
  const maxP = event?.max_participants;
  const isFull = maxP && participantCount >= maxP;
  const eventStatus = String(event?.status || '').toLowerCase();
  const isEventPastDate = event ? isEventPast(event) : false;
  const isEventClosed =
    isEventPastDate ||
    eventStatus === 'completed' ||
    eventStatus === 'cancelled';
  const joinButtonLabel = isEventClosed
    ? eventStatus === 'cancelled'
      ? 'Event Dibatalkan'
      : 'Event Selesai'
    : isFull
      ? 'Event Penuh'
      : 'Gabung Event';

  async function handleJoin() {
    setActionLoading('join');
    try {
      await eventsApi.join(id);
      toast.success('Berhasil bergabung! 🎉');
      await refreshEventDetail();
    } catch (err) {
      if (isApiErrorCode(err, ['ALREADY_JOINED'])) {
        toast.info('Kamu sudah bergabung di event ini.');
        return;
      }
      if (isApiErrorCode(err, ['EVENT_FULL'])) {
        toast.error('Event sudah penuh.');
        return;
      }
      if (isApiErrorCode(err, ['REGISTRATION_CLOSED'])) {
        toast.error('Pendaftaran event sudah ditutup.');
        return;
      }
      if (isApiErrorCode(err, ['EVENT_ENDED'])) {
        toast.error('Event sudah lewat.');
        return;
      }
      toast.error(getAuthErrorMessage(err, 'Gagal bergabung.'));
    } finally {
      setActionLoading('');
    }
  }

  async function handleLeave() {
    setActionLoading('leave');
    try {
      await eventsApi.leave(id);
      toast.success('Kamu telah keluar dari event.');
      await refreshEventDetail();
    } catch (err) {
      if (isApiErrorCode(err, ['CONFLICT', 'NOT_PARTICIPANT'])) {
        toast.info('Kamu belum terdaftar sebagai peserta event ini.');
        return;
      }
      if (isApiErrorCode(err, ['EVENT_ENDED'])) {
        toast.error('Event sudah lewat. Partisipasi tidak bisa dibatalkan.');
        return;
      }
      toast.error(getAuthErrorMessage(err, 'Gagal keluar dari event.'));
    } finally {
      setActionLoading('');
    }
  }

  async function handleDelete() {
    if (!window.confirm('Yakin ingin menghapus event ini?')) return;
    setActionLoading('delete');
    try {
      await eventsApi.remove(id);
      queryClient.removeQueries({ queryKey: eventQueryKeys.detail(id) });
      toast.success('Event berhasil dihapus.');
      navigate(ROUTES.events, { replace: true });
    } catch (err) {
      toast.error(getAuthErrorMessage(err, 'Gagal menghapus event.'));
    } finally {
      setActionLoading('');
    }
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event?.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link disalin ke clipboard!');
    }
  }

  const headerTitle = loading ? 'Memuat...' : event?.title || 'Event';
  const headerSubtitle = loading
    ? 'Memuat detail event'
    : error || !event
      ? error || 'Event tidak ditemukan'
      : formatLocation(event.location_address, event.location_area);

  const diffClass = event
    ? DIFFICULTY_COLORS[event.difficulty_level] || DIFFICULTY_COLORS.beginner
    : '';

  const dateDisplay = event
    ? formatEventDateRange(event.event_date, event.end_date)
    : '';
  const formattedTime = event ? formatTimeId(event.event_time) : '';

  let timeDisplay = formattedTime;
  if (event?.end_time && event.end_time !== event.event_time) {
    timeDisplay += ` - ${formatTimeId(event.end_time)}`;
  }

  const locationDisplay = event
    ? formatLocation(event.location_address, event.location_area)
    : '';
  const googleMapsUrl = event
    ? buildGoogleMapsUrl({
        latitude: event.latitude,
        longitude: event.longitude,
        address: locationDisplay,
      })
    : null;
  const normalizedParticipantCount =
    participantCount || participantsTotal || participants.length;
  const participantPreview = participants.slice(0, 7);
  const remainingParticipants = Math.max(
    0,
    normalizedParticipantCount - participantPreview.length,
  );

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        onOpenMenu={onOpenMenu}
        showCreateEvent={false}
      />
      <ChatFirstPageBody>
        <div className='mx-auto max-w-4xl space-y-6'>
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='-ml-2 rounded-full'
          >
            <Link to={ROUTES.events}>
              <ArrowLeft className='size-4' />
              Kembali ke Events
            </Link>
          </Button>

          {loading ? (
            <EventDetailSkeleton />
          ) : error || !event ? (
            <div className='flex flex-col items-center justify-center gap-4 py-32 text-center'>
              <Zap className='size-12 text-muted-foreground/30' />
              <h2 className='font-display text-xl font-bold'>
                {error || 'Event tidak ditemukan'}
              </h2>
              <Button asChild variant='outline' className='rounded-full'>
                <Link to={ROUTES.events}>
                  <ArrowLeft className='size-4' />
                  Kembali
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className='relative mb-6 h-56 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-container/20 to-secondary/20 shadow-sm md:h-72'>
                {event.cover_image ? (
                  <img
                    src={event.cover_image}
                    alt={event.title}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <Zap className='size-16 text-primary-container/20' />
                  </div>
                )}
                <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent' />
                <div className='absolute bottom-4 left-4 flex flex-wrap gap-2'>
                  <Badge className='bg-white/90 text-foreground shadow-sm backdrop-blur-sm text-xs uppercase'>
                    {event.category}
                  </Badge>
                  {event.is_competition ? (
                    <span className='inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold uppercase text-amber-900 shadow backdrop-blur-sm'>
                      <Trophy className='size-3' />
                      Kompetisi
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-bold uppercase',
                      diffClass,
                    )}
                  >
                    {DIFFICULTY_LABELS[event.difficulty_level] ||
                      event.difficulty_level}
                  </span>
                </div>
                <button
                  type='button'
                  onClick={handleShare}
                  className='absolute right-4 top-4 rounded-full bg-white/80 p-2.5 shadow backdrop-blur-sm transition hover:bg-white'
                >
                  <Share2 className='size-4 text-foreground' />
                </button>
              </div>

              <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                <div className='space-y-6 lg:col-span-2'>
                  <div>
                    <h1 className='font-display text-2xl font-bold text-foreground md:text-3xl'>
                      {event.title}
                    </h1>
                    {isEventPastDate ||
                    (event.status &&
                      String(event.status).toLowerCase() !== 'upcoming') ? (
                      <span className='mt-2 inline-block rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase text-muted-foreground'>
                        {event.status === 'ongoing'
                          ? 'Berlangsung'
                          : event.status === 'cancelled'
                            ? 'Dibatalkan'
                            : isEventPastDate || event.status === 'completed'
                              ? 'Selesai'
                              : event.status}
                      </span>
                    ) : null}
                  </div>

                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <InfoItem
                      icon={Calendar}
                      label='Tanggal'
                      value={dateDisplay}
                    />
                    <InfoItem icon={Clock} label='Waktu' value={timeDisplay} />
                    <InfoItem
                      icon={MapPin}
                      label='Lokasi'
                      value={locationDisplay}
                      href={googleMapsUrl}
                    />
                    <InfoItem
                      icon={Users}
                      label='Peserta'
                      value={`${normalizedParticipantCount}/${maxP ?? '∞'}`}
                    />
                    <InfoItem
                      icon={Target}
                      label='Level'
                      value={
                        DIFFICULTY_LABELS[event.difficulty_level] ||
                        event.difficulty_level
                      }
                    />
                    {event.is_competition ? (
                      <InfoItem icon={Trophy} label='Tipe' value='Kompetisi' />
                    ) : null}
                  </div>

                  <Card className='border-0 bg-card rounded-2xl shadow-sm'>
                    <div className='p-5 md:p-6'>
                      <h3 className='mb-3 font-display text-sm font-bold text-foreground'>
                        Tentang Event
                      </h3>
                      <p className='whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground'>
                        {event.description}
                      </p>
                    </div>
                  </Card>

                  {event.tags?.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className='rounded-full border border-primary-container/30 bg-primary-container/10 px-3 py-1 text-xs font-medium text-foreground'
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {event.latitude && event.longitude ? (
                    <EventMapPreview
                      latitude={event.latitude}
                      longitude={event.longitude}
                      title={event.title}
                      locationAddress={event.location_address}
                      locationArea={event.location_area}
                    />
                  ) : null}
                </div>

                <div className='space-y-4'>
                  <Card className='border-0 bg-card rounded-2xl shadow-sm'>
                    <div className='space-y-3 p-5'>
                      {isOwner ? (
                        <>
                          <Button
                            asChild
                            className='h-11 w-full rounded-full bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/30 hover:bg-primary-container/90'
                          >
                            <Link to={`/events/${id}/edit`}>
                              <Edit3 className='size-4' />
                              Edit Event
                            </Link>
                          </Button>
                          <Button
                            variant='outline'
                            disabled={actionLoading === 'delete'}
                            onClick={handleDelete}
                            className='h-11 w-full rounded-full border-red-300 text-red-600 hover:bg-red-50'
                          >
                            {actionLoading === 'delete' ? (
                              <ButtonBusySkeleton />
                            ) : (
                              <Trash2 className='size-4' />
                            )}
                            Hapus Event
                          </Button>
                        </>
                      ) : isJoined ? (
                        isEventPastDate ? (
                          <p className='rounded-xl bg-muted/60 px-4 py-3 text-center text-sm text-muted-foreground'>
                            Event sudah lewat. Partisipasi tidak bisa
                            dibatalkan.
                          </p>
                        ) : (
                          <Button
                            variant='outline'
                            disabled={!!actionLoading}
                            onClick={handleLeave}
                            className='h-11 w-full rounded-full border-red-300 text-red-600 hover:bg-red-50'
                          >
                            {actionLoading === 'leave' ? (
                              <ButtonBusySkeleton />
                            ) : (
                              <LogOut className='size-4' />
                            )}
                            Batalkan Partisipasi
                          </Button>
                        )
                      ) : (
                        <Button
                          disabled={isFull || isEventClosed || !!actionLoading}
                          onClick={handleJoin}
                          className='h-11 w-full rounded-full bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/30 hover:bg-primary-container/90 disabled:opacity-60'
                        >
                          {actionLoading === 'join' ? (
                            <ButtonBusySkeleton />
                          ) : (
                            <LogIn className='size-4' />
                          )}
                          {joinButtonLabel}
                        </Button>
                      )}
                    </div>
                  </Card>

                  <Card className='border-0 bg-card rounded-2xl shadow-sm'>
                    <div className='p-5'>
                      <h3 className='mb-3 flex items-center gap-2 font-display text-sm font-bold text-foreground'>
                        <Users className='size-4 text-primary-container' />
                        Peserta ({normalizedParticipantCount})
                      </h3>
                      {participants.length > 0 ? (
                        <div className='space-y-3'>
                          <AvatarGroup>
                            {participantPreview.map((p, idx) => {
                              const name = nameFromParticipant(p, idx);
                              const identity =
                                p.id ??
                                p.user?.id ??
                                p.email ??
                                p.user?.email ??
                                name;
                              return (
                                <Avatar
                                  key={p.id ?? p.user?.id ?? `${name}-${idx}`}
                                  className='avatar-group-item size-9'
                                >
                                  <AvatarFallback
                                    className={colorClassForIdentity(identity)}
                                  >
                                    {name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              );
                            })}
                            {remainingParticipants > 0 ? (
                              <AvatarGroupCount>
                                +{remainingParticipants}
                              </AvatarGroupCount>
                            ) : null}
                          </AvatarGroup>
                          <p className='text-xs text-muted-foreground'>
                            Total peserta terdaftar:{' '}
                            {normalizedParticipantCount}
                          </p>
                        </div>
                      ) : (
                        <p className='text-sm text-muted-foreground'>
                          Belum ada peserta. Jadilah yang pertama!
                        </p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </ChatFirstPageBody>
    </div>
  );
}

function InfoItem({ icon, label, value, href }) {
  if (!value) return null;
  const InfoIcon = icon;
  const body = (
    <>
      <span className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-container/15 text-primary-container'>
        <InfoIcon className='size-4' />
      </span>
      <div className='min-w-0'>
        <p className='text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground'>
          {label}
        </p>
        <p
          className={cn(
            'truncate text-sm font-semibold text-foreground',
            href && 'text-[#FF8000] underline-offset-2 group-hover:underline',
          )}
        >
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className='group flex items-start gap-3 rounded-xl border border-border/40 bg-card p-3 shadow-sm transition-colors hover:border-[#FF8000]/35 hover:bg-[#FFF1E5]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8000]/40'
      >
        {body}
      </a>
    );
  }

  return (
    <div className='flex items-start gap-3 rounded-xl border border-border/40 bg-card p-3 shadow-sm'>
      {body}
    </div>
  );
}
