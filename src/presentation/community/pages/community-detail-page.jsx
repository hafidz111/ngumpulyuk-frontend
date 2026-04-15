import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Loader2,
  LogOut,
  Settings,
  Shield,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { communitiesApi } from '@/infrastructure/communities/communities-api';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { ThreadCard } from '../components/thread-card';
import { ThreadComposer } from '../components/thread-composer';
import { MemberSection } from '../components/member-section';
import { ManageAdminsModal } from '../components/manage-admins-modal';
import { ThreadCommentsDialog } from '../components/thread-comments-dialog';
import { CommunityConfirmDialog } from '../components/community-confirm-dialog';

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

function isThreadOwnedByUser(thread, user) {
  const author = thread?.author ?? thread?.user ?? {};
  const threadUserId = String(author.id ?? author.user_id ?? '').trim();
  const currentUserId = String(user?.id ?? '').trim();
  if (threadUserId && currentUserId && threadUserId === currentUserId) return true;

  const threadEmail = String(author.email ?? author.user_email ?? '').trim().toLowerCase();
  const currentEmail = String(user?.email ?? '').trim().toLowerCase();
  if (threadEmail && currentEmail && threadEmail === currentEmail) return true;

  const threadUsername = String(author.username ?? '').trim().toLowerCase();
  const currentUsername = String(user?.username ?? '').trim().toLowerCase();
  if (threadUsername && currentUsername && threadUsername === currentUsername) return true;

  return false;
}

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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
  const currentRole = currentMembership?.role ?? community?.my_role ?? (isCreator ? 'owner' : null);
  const isOwner = currentRole === 'owner';
  const isAdmin = currentRole === 'owner' || currentRole === 'admin' || currentRole === 'moderator';

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
      const data = res.data;
      let items = [];
      if (Array.isArray(data)) items = data;
      else if (Array.isArray(data?.results)) items = data.results;
      else if (Array.isArray(data?.data)) items = data.data;
      else if (Array.isArray(data?.data?.results)) items = data.data.results;
      setComments(items);
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

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (loading) {
    return (
      <div className='min-h-svh bg-surface text-foreground'>
        <HomeAppHeader />
        <div className='flex items-center justify-center py-32'>
          <Loader2 className='size-8 animate-spin text-primary-container' />
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className='min-h-svh bg-surface text-foreground'>
        <HomeAppHeader />
        <div className='flex flex-col items-center justify-center gap-4 py-32 text-center'>
          <Zap className='size-10 text-muted-foreground/40' />
          <p className='text-muted-foreground'>{error || 'Komunitas tidak ditemukan'}</p>
          <Button
            variant='outline'
            onClick={() => navigate(ROUTES.community)}
            className='rounded-full'
          >
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const createdDate = community.created_at
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
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />

      <main className='mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8'>
        {/* Back button */}
        <button
          type='button'
          onClick={() => navigate(-1)}
          className='mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft className='size-4' />
          Kembali
        </button>

        {/* Hero Banner */}
        <div className='relative overflow-hidden rounded-2xl'>
          <div className='aspect-[16/7] w-full bg-gradient-to-br from-primary-container/20 to-secondary/20'>
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
                    {memberCount} members
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

        {/* Info Section */}
        <Card className='mt-4 border border-border/80 bg-card p-5'>
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
                  variant='outline'
                  onClick={() => setConfirmType('owner-leave-community')}
                  disabled={confirmLoading}
                  className='shrink-0 rounded-full px-5 font-semibold'
                >
                  {confirmLoading && confirmType === 'owner-leave-community' ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    <LogOut className='size-4' />
                  )}
                  Keluar
                </Button>
              ) : (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setConfirmType('leave-community')}
                  disabled={confirmLoading}
                  className='shrink-0 rounded-full px-5 font-semibold'
                >
                  {confirmLoading && confirmType === 'leave-community' ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    <LogOut className='size-4' />
                  )}
                  Keluar
                </Button>
              )
            ) : (
              <Button
                type='button'
                onClick={() => setConfirmType('join-community')}
                disabled={confirmLoading}
                className='shrink-0 rounded-full bg-primary-container px-5 font-semibold text-primary-foreground hover:bg-primary-container/90'
              >
                {confirmLoading && confirmType === 'join-community' ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <UserPlus className='size-4' />
                )}
                Join
              </Button>
            )}
          </div>
        </Card>

        {/* Members Section */}
        <div className='mt-6'>
          <MemberSection
            members={members}
            totalCount={memberCount}
            isOwner={isOwner}
          />
        </div>

        {/* Thread Composer */}
        {isJoined ? (
          <div className='mt-6'>
            <ThreadComposer
              onPost={handlePostThread}
              communities={[{ id: String(community.id), name: community.name }]}
              autoSelectSingleCommunity
            />
          </div>
        ) : null}

        {/* Threads */}
        <div className='mt-6 space-y-4'>
          {threadsLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='size-6 animate-spin text-primary-container' />
            </div>
          ) : threads.length === 0 ? (
            <Card className='border border-border/80 bg-card p-8 text-center'>
              <Zap className='mx-auto size-8 text-muted-foreground/30' />
              <p className='mt-2 text-sm text-muted-foreground'>
                Belum ada thread. {isJoined ? 'Jadilah yang pertama posting!' : 'Gabung untuk posting.'}
              </p>
            </Card>
          ) : (
            threads.map((t) => (
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
                canDelete={
                  isAdmin || isThreadOwnedByUser(t, user)
                }
                isDeleting={deletingThreadId === t.id}
              />
            ))
          )}
        </div>
      </main>

      {/* Manage Admins Modal */}
      <ManageAdminsModal
        open={manageOpen}
        onClose={setManageOpen}
        communityId={id}
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
              : confirmType === 'owner-leave-community'
                ? 'Kamu adalah creator komunitas'
                : 'Hapus komunitas ini?'
        }
        description={
          confirmType === 'join-community'
            ? 'Kamu akan menjadi anggota komunitas dan bisa ikut diskusi.'
            : confirmType === 'leave-community'
              ? 'Kamu tidak bisa posting thread sampai gabung kembali.'
              : confirmType === 'owner-leave-community'
                ? 'Creator tidak bisa keluar dari komunitas. Untuk keluar, kamu harus menghapus komunitas ini.'
                : 'Semua thread dan data komunitas akan hilang permanen.'
        }
        confirmLabel={
          confirmType === 'join-community'
            ? 'Ya, gabung'
            : confirmType === 'leave-community'
              ? 'Ya, keluar'
              : confirmType === 'owner-leave-community'
                ? 'Hapus komunitas'
              : 'Ya, hapus komunitas'
        }
        onConfirm={() => {
          if (confirmType === 'join-community') handleJoin();
          else if (confirmType === 'leave-community') handleLeave();
          else handleDeleteCommunity();
        }}
        loading={confirmLoading}
        destructive={confirmType === 'delete-community' || confirmType === 'owner-leave-community'}
      />
    </div>
  );
}
