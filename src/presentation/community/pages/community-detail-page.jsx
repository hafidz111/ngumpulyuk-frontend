import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  LogOut,
  Settings,
  Shield,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { mapParticipationSummary } from '@/application/users/map-participation-summary';
import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { communitiesApi } from '@/infrastructure/communities/communities-api';
import { usersApi } from '@/infrastructure/users/users-api';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { APP_SHELL_SECONDARY_BUTTON_CLASS } from '@/presentation/layout/app-shell-chrome';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { ThreadCard } from '../components/thread-card';
import { ThreadComposer } from '../components/thread-composer';
import { MemberSection } from '../components/member-section';
import { ManageAdminsModal } from '../components/manage-admins-modal';
import { ThreadCommentsDialog } from '../components/thread-comments-dialog';
import { parseThreadCommentsResponse } from '../lib/parse-thread-comments-response';
import { CommunityConfirmDialog } from '../components/community-confirm-dialog';
import {
  ButtonBusySkeleton,
  CommunityDetailSkeleton,
  ThreadFeedSkeleton,
} from '@/presentation/components/skeletons';

function extractCollection(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.members)) return data.members;
  if (Array.isArray(data?.threads)) return data.threads;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.results)) return data.data.results;
  if (Array.isArray(data?.data?.members)) return data.data.members;
  if (Array.isArray(data?.data?.threads)) return data.data.threads;
  return [];
}

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onOpenMenu } = useChatPageShell();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [members, setMembers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [memberCount, setMemberCount] = useState(0);

  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [togglingLikeId, setTogglingLikeId] = useState(null);
  const [deletingThreadId, setDeletingThreadId] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activeThread, setActiveThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [likingCommentId, setLikingCommentId] = useState(null);

  const [isJoined, setIsJoined] = useState(false);
  const [composerEvents, setComposerEvents] = useState([]);

  const [manageOpen, setManageOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const currentMembership = members.find((m) => {
    const u = m.user ?? m;
    return String(u?.id) === String(user?.id);
  });
  const isCreator =
    String(community?.created_by?.id ?? community?.creator?.id ?? community?.owner?.id ?? '') ===
    String(user?.id ?? '');
  const currentRole =
    community?.user_role ??
    currentMembership?.role ??
    community?.my_role ??
    (isCreator ? 'owner' : null);
  const isOwner = isCreator || currentRole === 'owner';
  const isAdmin =
    isOwner || currentRole === 'admin' || currentRole === 'moderator';

  const fetchCommunity = useCallback(async () => {
    setLoading(true);
    try {
      const res = await communitiesApi.getById(id);
      const data = res.data?.data ?? res.data;
      setCommunity(data);
      setIsJoined(data.is_joined ?? data.is_member ?? false);
      setMemberCount(data.member_count ?? data.members_count ?? 0);
    } catch {
      setError('Komunitas tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await communitiesApi.members(id, { limit: 50 });
      const items = extractCollection(res.data);
      const source = res.data?.data ?? res.data;
      const countFromApi = source?.count ?? source?.total ?? source?.member_count;
      setMembers(items);
      const adminList = items.filter(
        (m) => m.role === 'admin' || m.role === 'owner' || m.role === 'moderator',
      );
      setAdmins(adminList);
      setMemberCount(countFromApi ?? items.length);
    } catch {
      // silently ignore
    }
  }, [id]);

  const fetchThreads = useCallback(async () => {
    setThreadsLoading(true);
    try {
      const res = await communitiesApi.threads(id, { limit: 20, sort: 'latest' });
      const items = extractCollection(res.data);
      setThreads(items);
    } catch {
      // silently ignore
    } finally {
      setThreadsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCommunity();
    fetchMembers();
    fetchThreads();
  }, [fetchCommunity, fetchMembers, fetchThreads]);

  useEffect(() => {
    if (!isJoined) {
      setComposerEvents([]);
      return;
    }
    let cancelled = false;
    usersApi
      .participationSummary()
      .then((res) => {
        if (cancelled) return;
        const { events } = mapParticipationSummary(res.data);
        setComposerEvents(events);
      })
      .catch(() => {
        if (!cancelled) setComposerEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isJoined]);

  async function handleJoin() {
    setConfirmLoading(true);
    try {
      await communitiesApi.join(id);
      setIsJoined(true);
      setMemberCount((c) => c + 1);
      toast.success('Berhasil bergabung!');
      fetchMembers();
      setConfirmType(null);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Gagal bergabung.');
    } finally {
      setConfirmLoading(false);
    }
  }

  async function handleLeave() {
    setConfirmLoading(true);
    try {
      await communitiesApi.leave(id);
      setIsJoined(false);
      setMemberCount((c) => Math.max(0, c - 1));
      toast.success('Berhasil keluar dari komunitas.');
      fetchMembers();
      setConfirmType(null);
      setManageOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Gagal keluar.');
    } finally {
      setConfirmLoading(false);
    }
  }

  async function handleDeleteCommunity() {
    setConfirmLoading(true);
    try {
      await communitiesApi.remove(id);
      toast.success('Komunitas berhasil dihapus.');
      navigate(ROUTES.community, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Gagal menghapus komunitas.');
    } finally {
      setConfirmLoading(false);
      setConfirmType(null);
    }
  }

  async function handlePostThread(body) {
    await communitiesApi.createThread(id, {
      title: body.content?.trim()?.slice(0, 64),
      content: body.content,
      images: body.images || [],
    });
    toast.success('Thread berhasil dipost!');
    fetchThreads();
  }

  async function handleLikeThread(thread) {
    const threadId = thread?.id;
    if (!threadId || togglingLikeId) return;
    setTogglingLikeId(threadId);
    const alreadyLiked = Boolean(thread.is_liked);
    try {
      if (alreadyLiked) await communitiesApi.unlikeThread(threadId);
      else await communitiesApi.likeThread(threadId);
      setThreads((prev) =>
        prev.map((item) => (item.id === threadId
          ? {
            ...item,
            is_liked: !alreadyLiked,
            like_count: Math.max(
              0,
              (item.like_count ?? item.likes_count ?? 0) + (alreadyLiked ? -1 : 1),
            ),
          }
          : item)),
      );
    } catch {
      toast.error('Gagal memperbarui like thread.');
    } finally {
      setTogglingLikeId(null);
    }
  }

  async function handleDeleteThread(thread) {
    const threadId = thread?.id;
    if (!threadId || deletingThreadId) return;
    const confirmed = window.confirm('Hapus thread ini? Tindakan ini tidak bisa dibatalkan.');
    if (!confirmed) return;

    setDeletingThreadId(threadId);
    try {
      await communitiesApi.removeThread(threadId);
      setThreads((prev) => prev.filter((item) => item.id !== threadId));
      toast.success('Thread berhasil dihapus.');
    } catch {
      toast.error('Gagal menghapus thread.');
    } finally {
      setDeletingThreadId(null);
    }
  }

  async function loadThreadComments(thread) {
    if (!thread?.id) return;
    setCommentsLoading(true);
    try {
      const res = await communitiesApi.threadComments(thread.id, { limit: 50, offset: 0 });
      setComments(parseThreadCommentsResponse(res.data));
    } catch {
      setComments([]);
      toast.error('Gagal memuat komentar.');
    } finally {
      setCommentsLoading(false);
    }
  }

  function handleOpenComments(thread) {
    setActiveThread(thread);
    setCommentsOpen(true);
    loadThreadComments(thread);
  }

  async function handleSubmitComment(thread, content) {
    setCommentSubmitting(true);
    try {
      await communitiesApi.createThreadComment(thread.id, { content });
      await loadThreadComments(thread);
      setThreads((prev) =>
        prev.map((item) => (item.id === thread.id
          ? { ...item, comment_count: (item.comment_count ?? item.comments_count ?? 0) + 1 }
          : item)),
      );
      toast.success('Komentar berhasil dikirim.');
    } catch {
      toast.error('Gagal mengirim komentar.');
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function handleLikeComment(comment) {
    if (!comment?.id || likingCommentId) return;
    setLikingCommentId(comment.id);
    try {
      await communitiesApi.likeComment(comment.id);
      setComments((prev) =>
        prev.map((item) => (item.id === comment.id
          ? { ...item, is_liked: true, like_count: (item.like_count ?? item.likes_count ?? 0) + 1 }
          : item)),
      );
    } catch {
      toast.error('Gagal like komentar.');
    } finally {
      setLikingCommentId(null);
    }
  }

  const headerTitle = loading
    ? 'Memuat...'
    : (community?.name || 'Community');
  const headerSubtitle = loading
    ? 'Lagi load circle…'
    : error || !community
      ? (error || 'Circle gak ketemu')
      : SHELL_COPY.pages.communityDetailMembers(memberCount);

  const createdDate = community?.created_at
    ? new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(
      new Date(community.created_at),
    )
    : null;

  const adminNames = admins
    .map((a) => {
      const u = a.user ?? a;
      return u.full_name || u.username;
    })
    .join(', ');

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        onOpenMenu={onOpenMenu}
        showCreateEvent={false}
      />
      <ChatFirstPageBody className='md:py-8'>
        <div className='mx-auto w-full max-w-3xl space-y-6 pb-8'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground'
          >
            <ArrowLeft className='size-4' />
            {SHELL_COPY.pages.communityDetailBack}
          </button>

          {loading ? (
            <CommunityDetailSkeleton />
          ) : error || !community ? (
            <div className='flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/70 bg-white px-6 py-20 text-center'>
              <Zap className='size-10 text-[#FF8000]/40' />
              <p className='text-muted-foreground'>{error || 'Circle gak ketemu'}</p>
              <Button
                variant='outline'
                onClick={() => navigate(ROUTES.community)}
                className='rounded-full'
              >
                {SHELL_COPY.pages.communityDetailBack}
              </Button>
            </div>
          ) : (
            <>
        <div className='relative overflow-hidden rounded-3xl shadow-sm'>
          <div className='aspect-[16/8] w-full bg-gradient-to-br from-[#FFF1E5] to-primary-container/20 sm:aspect-[16/7]'>
            {community.cover_image ? (
              <img
                src={community.cover_image}
                alt=''
                className='h-full w-full object-cover'
              />
            ) : null}
          </div>
          <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-5 pt-16'>
            <div className='flex items-end justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-white md:text-3xl'>
                  {community.name}
                </h1>
                <div className='mt-1 flex items-center gap-3 text-sm text-white/80'>
                  <span className='inline-flex items-center gap-1'>
                    <Users className='size-3.5' aria-hidden />
                    {SHELL_COPY.pages.communityDetailMembers(memberCount)}
                  </span>
                  {createdDate ? (
                    <>
                      <span className='text-white/40'>&#8226;</span>
                      <span>Dibuat {createdDate}</span>
                    </>
                  ) : null}
                </div>
              </div>
              {isOwner ? (
                <Button
                  type='button'
                  onClick={() => setManageOpen(true)}
                  className='rounded-full bg-white/20 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-white/30'
                >
                  <Settings className='size-4' />
                  Admin Panel
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <Card className='border border-border/60 bg-card p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              {community.description ? (
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {community.description}
                </p>
              ) : null}
              <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground'>
                {community.total_events != null ? (
                  <span className='inline-flex items-center gap-1'>
                    <Calendar className='size-3.5' aria-hidden />
                    {community.total_events} total events
                  </span>
                ) : null}
                {adminNames ? (
                  <span className='inline-flex items-center gap-1'>
                    <Shield className='size-3.5' aria-hidden />
                    Admin: {adminNames}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Join / Leave */}
            {isJoined ? (
              isOwner ? (
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => setConfirmType('delete-community')}
                  disabled={confirmLoading}
                  className={cn(
                    'shrink-0 px-5 text-destructive hover:bg-destructive/10 hover:text-destructive',
                    APP_SHELL_SECONDARY_BUTTON_CLASS,
                  )}
                >
                  {confirmLoading && confirmType === 'delete-community' ? (
                    <ButtonBusySkeleton />
                  ) : (
                    <LogOut className='size-4' />
                  )}
                  Hapus circle
                </Button>
              ) : (
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => setConfirmType('leave-community')}
                  disabled={confirmLoading}
                  className={cn('shrink-0 px-5', APP_SHELL_SECONDARY_BUTTON_CLASS)}
                >
                  {confirmLoading && confirmType === 'leave-community' ? (
                    <ButtonBusySkeleton />
                  ) : (
                    <LogOut className='size-4' />
                  )}
                  {SHELL_COPY.pages.communityDetailLeave}
                </Button>
              )
            ) : (
              <Button
                type='button'
                onClick={() => setConfirmType('join-community')}
                disabled={confirmLoading}
                className='shrink-0 rounded-full bg-[#FF8000] px-5 font-semibold text-white hover:bg-[#FF8000]/90'
              >
                {confirmLoading && confirmType === 'join-community' ? (
                  <ButtonBusySkeleton />
                ) : (
                  <UserPlus className='size-4' />
                )}
                {SHELL_COPY.pages.communityDetailJoin}
              </Button>
            )}
          </div>
        </Card>

        <MemberSection
          members={members}
          totalCount={memberCount}
          isOwner={isOwner}
        />

        <section className='space-y-4'>
          <h2 className='font-display text-base font-bold text-foreground md:text-lg'>
            {SHELL_COPY.pages.communityDetailThreads}
          </h2>

          {isJoined ? (
            <ThreadComposer
              onPost={handlePostThread}
              communities={[{ id: String(community.id), name: community.name }]}
              events={composerEvents}
              autoSelectSingleCommunity
            />
          ) : null}

          {threadsLoading ? (
            <ThreadFeedSkeleton count={2} />
          ) : threads.length === 0 ? (
            <Card className='border border-dashed border-border/70 bg-white p-10 text-center'>
              <Zap className='mx-auto size-8 text-[#FF8000]/35' />
              <p className='mt-2 text-sm text-muted-foreground'>
                {isJoined
                  ? SHELL_COPY.pages.communityDetailThreadsEmptyJoined
                  : SHELL_COPY.pages.communityDetailThreadsEmptyGuest}
              </p>
            </Card>
          ) : (
            <div className='space-y-4'>
              {threads.map((t) => (
                <ThreadCard
                  key={t.id}
                  thread={t}
                  communityName={community.name}
                  communityId={community.id}
                  isLiked={Boolean(t.is_liked)}
                  isLiking={togglingLikeId === t.id}
                  onLike={handleLikeThread}
                  onOpenComments={handleOpenComments}
                  onDelete={handleDeleteThread}
                  canDelete={Boolean(t.can_delete ?? isAdmin)}
                  isDeleting={deletingThreadId === t.id}
                />
              ))}
            </div>
          )}
        </section>
            </>
          )}
        </div>
      </ChatFirstPageBody>

      {/* Manage Admins Modal */}
      <ManageAdminsModal
        open={manageOpen}
        onClose={setManageOpen}
        communityId={id}
        creatorUserId={
          community?.creator?.id ??
          community?.created_by?.id ??
          community?.owner?.id
        }
        admins={admins}
        onPromoted={() => {
          fetchMembers();
          fetchCommunity();
        }}
      />
      <ThreadCommentsDialog
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        thread={activeThread}
        comments={comments}
        loading={commentsLoading}
        submitting={commentSubmitting}
        likingCommentId={likingCommentId}
        onSubmitComment={handleSubmitComment}
        onLikeComment={handleLikeComment}
      />
      <CommunityConfirmDialog
        open={Boolean(confirmType)}
        onOpenChange={() => {
          if (!confirmLoading) setConfirmType(null);
        }}
        title={
          confirmType === 'join-community'
            ? 'Gabung komunitas ini?'
            : confirmType === 'leave-community'
              ? 'Keluar dari komunitas ini?'
              : confirmType === 'owner-leave-community' ||
                  confirmType === 'delete-community'
                ? 'Hapus circle ini?'
                : 'Hapus komunitas ini?'
        }
        description={
          confirmType === 'join-community'
            ? 'Kamu akan menjadi anggota komunitas dan bisa ikut diskusi.'
            : confirmType === 'leave-community'
              ? 'Kamu tidak bisa posting thread sampai gabung kembali.'
              : confirmType === 'owner-leave-community' ||
                  confirmType === 'delete-community'
                ? SHELL_COPY.pages.communityDetailOwnerLeaveHint +
                  ' Semua thread dan data akan hilang permanen.'
                : 'Semua thread dan data komunitas akan hilang permanen.'
        }
        confirmLabel={
          confirmType === 'join-community'
            ? 'Ya, gabung'
            : confirmType === 'leave-community'
              ? 'Ya, keluar'
              : confirmType === 'owner-leave-community' ||
                  confirmType === 'delete-community'
                ? SHELL_COPY.pages.communityDetailDelete
              : 'Ya, hapus komunitas'
        }
        onConfirm={() => {
          if (confirmType === 'join-community') handleJoin();
          else if (confirmType === 'leave-community') handleLeave();
          else if (
            confirmType === 'delete-community' ||
            confirmType === 'owner-leave-community'
          ) {
            handleDeleteCommunity();
          }
        }}
        loading={confirmLoading}
        destructive={confirmType === 'delete-community' || confirmType === 'owner-leave-community'}
      />
    </div>
  );
}
