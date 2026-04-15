import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Users,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { communitiesApi } from '@/infrastructure/communities/communities-api';
import { usersApi } from '@/infrastructure/users/users-api';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Tabs } from '@/presentation/components/ui/tabs';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { CommunityCard } from '../components/community-card';
import { ThreadCard } from '../components/thread-card';
import { ThreadComposer } from '../components/thread-composer';
import { ThreadCommentsDialog } from '../components/thread-comments-dialog';

const LIMIT = 12;
const FEED_LIMIT = 10;

const TAB_ITEMS = [
  { id: 'threads', label: 'Threads', icon: MessageCircle },
  { id: 'communities', label: 'Communities', icon: Users },
];

function extractCollection(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.threads)) return data.threads;
  if (Array.isArray(data?.communities)) return data.communities;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.threads)) return data.data.threads;
  if (Array.isArray(data?.data?.results)) return data.data.results;
  if (Array.isArray(data?.data?.communities)) return data.data.communities;
  return [];
}

function isJoinedCommunity(item = {}) {
  return Boolean(
    item.is_joined ||
    item.is_member ||
    item.joined ||
    item.membership?.joined ||
    item.membership?.role,
  );
}

function mapParticipationSummary(payload) {
  const data = payload?.data ?? payload;
  const activeEventsRaw = Array.isArray(data?.active_events) ? data.active_events : [];
  const joinedCommunitiesRaw = Array.isArray(data?.joined_communities)
    ? data.joined_communities
    : [];

  const events = activeEventsRaw
    .map((item) => ({
      id: String(item?.id ?? ''),
      title: String(item?.title ?? 'Event'),
    }))
    .filter((item) => item.id);

  const communities = joinedCommunitiesRaw
    .map((item) => ({
      id: String(item?.id ?? ''),
      name: String(item?.title ?? item?.name ?? 'Community'),
    }))
    .filter((item) => item.id);

  return { events, communities };
}

export default function CommunityPage() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('threads');

  const [feedThreads, setFeedThreads] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);
  const [feedOffset, setFeedOffset] = useState(0);
  const [feedTotal, setFeedTotal] = useState(0);
  const loadMoreRef = useRef(null);
  const [togglingLikeId, setTogglingLikeId] = useState(null);
  const [deletingThreadId, setDeletingThreadId] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activeThread, setActiveThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [likingCommentId, setLikingCommentId] = useState(null);

  const [communities, setCommunities] = useState([]);
  const [composerCommunities, setComposerCommunities] = useState([]);
  const [composerEvents, setComposerEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCommunities = useCallback(
    async (newOffset = 0) => {
      setLoading(true);
      try {
        const params = { limit: LIMIT, offset: newOffset };
        if (search.trim()) params.search = search.trim();

        const res = await communitiesApi.list(params);
        const data = res.data;
        let items = extractCollection(data);
        let count = 0;
        if (Array.isArray(data)) {
          count = data.length;
        } else if (data?.results) {
          count = data.count ?? data.results.length;
        } else if (data?.data) {
          const inner = data.data;
          count = inner.count ?? inner.total ?? (Array.isArray(inner) ? inner.length : items.length);
        }

        setCommunities(items);
        setTotalCount(count);
        setOffset(newOffset);
      } catch {
        setCommunities([]);
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  const fetchFeed = useCallback(async (newOffset = 0, append = false) => {
    if (append) setFeedLoadingMore(true);
    else setFeedLoading(true);
    try {
      const res = await communitiesApi.threadFeed({ limit: FEED_LIMIT, offset: newOffset });
      const data = res.data;
      let items = [];
      let count = 0;
      if (Array.isArray(data)) {
        items = data;
        count = data.length;
      } else if (data?.results) {
        items = data.results;
        count = data.count ?? data.results.length;
      } else if (data?.data?.threads) {
        items = data.data.threads;
        count = data.data.total ?? data.data.count ?? data.data.threads.length;
      }
      else if (data?.data) {
        items = Array.isArray(data.data) ? data.data : (data.data.results || data.data.threads || []);
        count = data.count ?? data.data?.count ?? items.length;
      }
      setFeedThreads((prev) => (append ? [...prev, ...items] : items));
      setFeedOffset(newOffset);
      setFeedTotal((prev) => count || (append ? prev : items.length));
    } catch {
      if (!append) setFeedThreads([]);
    } finally {
      if (append) setFeedLoadingMore(false);
      else setFeedLoading(false);
    }
  }, []);

  const fetchComposerParticipation = useCallback(async () => {
    try {
      const res = await usersApi.participationSummary();
      const { communities, events } = mapParticipationSummary(res.data);
      setComposerCommunities(communities);
      setComposerEvents(events);
    } catch {
      setComposerCommunities([]);
      setComposerEvents([]);
    }
  }, []);

  async function handleFeedPost(payload) {
    const communityId = payload.community_id;
    try {
      const body = {
        title: payload.content?.trim()?.slice(0, 64),
        content: payload.content,
        images: payload.images || [],
        ...(payload.related_event_id
          ? { related_event_id: payload.related_event_id }
          : {}),
      };
      if (communityId) {
        await communitiesApi.createThread(communityId, body);
      } else {
        await communitiesApi.createGlobalThread(body);
      }
      toast.success('Thread berhasil dipost.');
      fetchFeed(0, false);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Gagal posting thread.');
      throw err;
    }
  }

  async function handleLikeThread(thread) {
    const threadId = thread?.id;
    if (!threadId || togglingLikeId) return;
    setTogglingLikeId(threadId);
    const alreadyLiked = Boolean(thread.is_liked);
    try {
      if (alreadyLiked) {
        await communitiesApi.unlikeThread(threadId);
      } else {
        await communitiesApi.likeThread(threadId);
      }
      setFeedThreads((prev) =>
        prev.map((item) => {
          if (item.id !== threadId) return item;
          const count = item.like_count ?? item.likes_count ?? 0;
          return {
            ...item,
            is_liked: !alreadyLiked,
            like_count: Math.max(0, count + (alreadyLiked ? -1 : 1)),
          };
        }),
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
      setFeedThreads((prev) => prev.filter((item) => item.id !== threadId));
      setFeedTotal((prev) => Math.max(0, prev - 1));
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
      setFeedThreads((prev) =>
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

  useEffect(() => {
    if (tab === 'communities') {
      fetchCommunities(0);
    } else if (tab === 'threads') {
      fetchFeed(0, false);
      fetchComposerParticipation();
    }
  }, [tab, fetchCommunities, fetchFeed, fetchComposerParticipation]);

  useEffect(() => {
    if (tab !== 'threads') return;
    if (!loadMoreRef.current) return;
    const hasMoreFeed = feedThreads.length < feedTotal;
    if (!hasMoreFeed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (feedLoading || feedLoadingMore) return;
        fetchFeed(feedOffset + FEED_LIMIT, true);
      },
      { rootMargin: '160px 0px' },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [tab, feedThreads.length, feedTotal, feedLoading, feedLoadingMore, feedOffset, fetchFeed]);

  function handleSearch(e) {
    e.preventDefault();
    fetchCommunities(0);
  }

  const hasMore = offset + LIMIT < totalCount;
  const hasPrev = offset > 0;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />

      <main className='mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10'>
        {/* Header */}
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='font-display text-2xl font-bold text-foreground md:text-3xl'>
              Community
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Ngobrol, sharing, dan connect dengan komunitas
            </p>
          </div>
          {tab === 'communities' ? (
            <Button
              asChild
              className='h-11 rounded-full bg-primary-container px-6 font-semibold text-primary-foreground shadow-lg shadow-primary-container/30 hover:bg-primary-container/90'
            >
              <Link to={ROUTES.communityCreate}>
                <Plus className='size-4' />
                Buat Community
              </Link>
            </Button>
          ) : null}
        </div>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={setTab}
          items={TAB_ITEMS}
          className='mb-6'
        />

        {/* Tab: Threads */}
        {tab === 'threads' ? (
          <div className='space-y-5'>
            <ThreadComposer
              communities={composerCommunities}
              events={composerEvents}
              onPost={handleFeedPost}
            />
            {feedLoading ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='size-6 animate-spin text-primary-container' />
              </div>
            ) : feedThreads.length === 0 ? (
              <div className='rounded-2xl border border-border/80 bg-card p-10 text-center'>
                <MessageCircle className='mx-auto mb-3 size-10 text-muted-foreground/30' />
                <p className='text-muted-foreground'>Belum ada thread di feed kamu.</p>
              </div>
            ) : (
              feedThreads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  communityName={thread.community?.name || thread.community_name}
                  communityId={thread.community?.id || thread.community_id}
                  isLiked={Boolean(thread.is_liked)}
                  isLiking={togglingLikeId === thread.id}
                  onLike={handleLikeThread}
                  onOpenComments={handleOpenComments}
                  onDelete={handleDeleteThread}
                  canDelete={Boolean(thread.can_delete)}
                  isDeleting={deletingThreadId === thread.id}
                />
              ))
            )}
            {!feedLoading && feedThreads.length > 0 && feedThreads.length < feedTotal ? (
              <div ref={loadMoreRef} className='flex items-center justify-center py-2'>
                {feedLoadingMore ? <Loader2 className='size-4 animate-spin text-primary-container' /> : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Tab: Communities */}
        {tab === 'communities' ? (
          <>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className='mb-6'>
              <div className='relative'>
                <Search className='absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Cari komunitas...'
                  className='h-12 rounded-full bg-card pl-11 shadow-sm border-border/60'
                />
              </div>
            </form>

            {/* Grid */}
            {loading ? (
              <div className='flex items-center justify-center py-24'>
                <Loader2 className='size-8 animate-spin text-primary-container' />
              </div>
            ) : communities.length === 0 ? (
              <div className='flex flex-col items-center justify-center gap-4 py-24 text-center'>
                <div className='rounded-2xl bg-muted/50 p-5'>
                  <Zap className='size-10 text-muted-foreground/40' />
                </div>
                <div>
                  <h3 className='font-display text-lg font-bold text-foreground'>
                    Belum ada komunitas
                  </h3>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    {search
                      ? 'Coba cari dengan kata kunci lain.'
                      : 'Yuk buat komunitas pertamamu!'}
                  </p>
                </div>
                {!search ? (
                  <Button
                    asChild
                    className='rounded-full bg-primary-container px-6 font-semibold text-primary-foreground'
                  >
                    <Link to={ROUTES.communityCreate}>
                      <Plus className='size-4' />
                      Buat Community
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                  {communities.map((c) => (
                    <CommunityCard key={c.id} community={c} />
                  ))}
                </div>

                {/* Pagination */}
                {(hasPrev || hasMore) ? (
                  <div className='mt-8 flex items-center justify-center gap-4'>
                    <Button
                      variant='outline'
                      disabled={!hasPrev}
                      onClick={() => fetchCommunities(Math.max(0, offset - LIMIT))}
                      className='rounded-full px-6'
                    >
                      Sebelumnya
                    </Button>
                    <span className='text-sm text-muted-foreground'>
                      {offset + 1}&ndash;{Math.min(offset + LIMIT, totalCount)} dari {totalCount}
                    </span>
                    <Button
                      variant='outline'
                      disabled={!hasMore}
                      onClick={() => fetchCommunities(offset + LIMIT)}
                      className='rounded-full px-6'
                    >
                      Selanjutnya
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </main>
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
    </div>
  );
}
