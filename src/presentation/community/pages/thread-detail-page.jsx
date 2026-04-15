import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { communitiesApi } from '@/infrastructure/communities/communities-api';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { ThreadCard } from '../components/thread-card';
import { ThreadCommentsDialog } from '../components/thread-comments-dialog';

function extractPayload(payload) {
  return payload?.data ?? payload;
}

export default function ThreadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingLike, setTogglingLike] = useState(false);
  const [deletingThread, setDeletingThread] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [likingCommentId, setLikingCommentId] = useState(null);

  const loadThread = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await communitiesApi.getThreadById(id);
      setThread(extractPayload(res.data));
    } catch {
      setThread(null);
      toast.error('Thread tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  async function loadComments(targetThread = thread) {
    if (!targetThread?.id) return;
    setCommentsLoading(true);
    try {
      const res = await communitiesApi.threadComments(targetThread.id, { limit: 50, offset: 0 });
      const data = extractPayload(res.data);
      const items = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];
      setComments(items);
    } catch {
      setComments([]);
      toast.error('Gagal memuat komentar.');
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleLikeThread(currentThread) {
    if (!currentThread?.id || togglingLike) return;
    setTogglingLike(true);
    const alreadyLiked = Boolean(currentThread.is_liked);
    try {
      if (alreadyLiked) await communitiesApi.unlikeThread(currentThread.id);
      else await communitiesApi.likeThread(currentThread.id);
      setThread((prev) => {
        if (!prev) return prev;
        const count = prev.like_count ?? prev.likes_count ?? 0;
        return {
          ...prev,
          is_liked: !alreadyLiked,
          like_count: Math.max(0, count + (alreadyLiked ? -1 : 1)),
        };
      });
    } catch {
      toast.error('Gagal memperbarui like thread.');
    } finally {
      setTogglingLike(false);
    }
  }

  async function handleDeleteThread(currentThread) {
    if (!currentThread?.id || deletingThread) return;
    const confirmed = window.confirm('Hapus thread ini? Tindakan ini tidak bisa dibatalkan.');
    if (!confirmed) return;
    setDeletingThread(true);
    try {
      await communitiesApi.removeThread(currentThread.id);
      toast.success('Thread berhasil dihapus.');
      navigate(ROUTES.community, { replace: true });
    } catch {
      toast.error('Gagal menghapus thread.');
    } finally {
      setDeletingThread(false);
    }
  }

  async function handleOpenComments(currentThread) {
    setCommentsOpen(true);
    await loadComments(currentThread);
  }

  async function handleSubmitComment(currentThread, content) {
    if (!currentThread?.id) return;
    setCommentSubmitting(true);
    try {
      await communitiesApi.createThreadComment(currentThread.id, { content });
      await loadComments(currentThread);
      setThread((prev) => {
        if (!prev) return prev;
        const count = prev.comment_count ?? prev.comments_count ?? 0;
        return { ...prev, comment_count: count + 1 };
      });
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
        prev.map((item) =>
          item.id === comment.id
            ? {
                ...item,
                is_liked: true,
                like_count: (item.like_count ?? item.likes_count ?? 0) + 1,
              }
            : item,
        ),
      );
    } catch {
      toast.error('Gagal like komentar.');
    } finally {
      setLikingCommentId(null);
    }
  }

  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />;

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />
      <main className='mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-6 md:py-10'>
        <Button asChild variant='ghost' size='sm' className='-ml-2 rounded-full'>
          <Link to={ROUTES.community}>
            <ArrowLeft className='size-4' />
            Kembali ke Community
          </Link>
        </Button>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='size-7 animate-spin text-primary-container' />
          </div>
        ) : !thread ? (
          <Card className='border border-border/80 bg-card p-10 text-center'>
            <MessageCircle className='mx-auto size-8 text-muted-foreground/30' />
            <p className='mt-2 text-sm text-muted-foreground'>Thread tidak ditemukan.</p>
          </Card>
        ) : (
          <ThreadCard
            thread={thread}
            communityName={thread.community?.name || thread.community_name}
            communityId={thread.community?.id || thread.community_id}
            isLiked={Boolean(thread.is_liked)}
            isLiking={togglingLike}
            onLike={handleLikeThread}
            onOpenComments={handleOpenComments}
            onDelete={handleDeleteThread}
            canDelete={Boolean(thread.can_delete)}
            isDeleting={deletingThread}
          />
        )}
      </main>
      <ThreadCommentsDialog
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        thread={thread}
        comments={comments}
        loading={commentsLoading}
        submitting={commentSubmitting}
        likingCommentId={likingCommentId}
        onSubmitComment={handleSubmitComment}
        onLikeComment={handleLikeComment}
      />
    </div>
  );
}
