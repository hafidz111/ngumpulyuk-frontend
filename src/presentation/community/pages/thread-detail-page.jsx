import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { communitiesApi } from '@/infrastructure/communities/communities-api';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { ThreadCard } from '../components/thread-card';
import { ThreadCommentsDialog } from '../components/thread-comments-dialog';
import { parseThreadCommentsResponse } from '../lib/parse-thread-comments-response';
import { ThreadCardSkeleton } from '@/presentation/components/skeletons';

function extractPayload(payload) {
  return payload?.data ?? payload;
}

export default function ThreadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onOpenMenu } = useChatPageShell();

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
      setComments(parseThreadCommentsResponse(res.data));
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

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title={SHELL_COPY.pages.threadTitle}
        subtitle={SHELL_COPY.pages.threadSubtitle}
        onOpenMenu={onOpenMenu}
        showCreateEvent={false}
      />
      <ChatFirstPageBody>
        <div className='mx-auto max-w-3xl space-y-6'>
          <Button asChild variant='ghost' size='sm' className='-ml-2 rounded-full'>
            <Link to={ROUTES.community}>
              <ArrowLeft className='size-4' />
              Kembali ke Community
            </Link>
          </Button>

          {loading ? (
            <ThreadCardSkeleton className='p-6' />
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
        </div>
      </ChatFirstPageBody>
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
