import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2,
  MessageCircle,
  Plus,
  Users,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { mapParticipationSummary } from '@/application/users/map-participation-summary';
import { communitiesApi } from '@/infrastructure/communities/communities-api';
import { usersApi } from '@/infrastructure/users/users-api';
import { Button } from '@/presentation/components/ui/button';
import { ThemedSearchField } from '@/presentation/components/themed-search-field';
import { Tabs } from '@/presentation/components/ui/tabs';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { CommunityCard } from '../components/community-card';
import { ThreadCard } from '../components/thread-card';
import { ThreadComposer } from '../components/thread-composer';
import { ThreadCommentsDialog } from '../components/thread-comments-dialog';

const LIMIT = 12;
const FEED_LIMIT = 10;

const TAB_ITEMS = [
  { id: 'threads', label: SHELL_COPY.pages.communityTabFeed, icon: MessageCircle },
  { id: 'communities', label: SHELL_COPY.pages.communityTabCircles, icon: Users },
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

export default function CommunityPage() {
  const { onOpenMenu } = useChatPageShell();
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
  const [myUpcomingEventsCount, setMyUpcomingEventsCount] = useState(0);
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
      const { communities, events, activeEventsCount } = mapParticipationSummary(res.data);
      setComposerCommunities(communities);
      setComposerEvents(events);
      setMyUpcomingEventsCount(activeEventsCount);
    } catch {
      setComposerCommunities([]);
      setComposerEvents([]);
      setMyUpcomingEventsCount(0);
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
    fetchComposerParticipation();
    if (tab === 'communities') {
      fetchCommunities(0);
    } else if (tab === 'threads') {
      fetchFeed(0, false);
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

  const joinedCommunities = communities.filter(isJoinedCommunity);
  const exploreCommunities = communities.filter((c) => !isJoinedCommunity(c));

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title={SHELL_COPY.pages.communityTitle}
        subtitle={SHELL_COPY.pages.communitySubtitle}
        onOpenMenu={onOpenMenu}
        showCreateEvent={false}
        actions={
          tab === 'communities' ? (
            <Button
              asChild
              className='h-9 shrink-0 rounded-full bg-[#FF8000] px-3 text-sm font-semibold text-white hover:bg-[#FF8000]/90'
            >
              <Link to={ROUTES.communityCreate}>
                <Plus className='size-4' />
                <span className='hidden sm:inline'>{SHELL_COPY.pages.createCommunity}</span>
                <span className='sm:hidden'>{SHELL_COPY.pages.createCommunityShort}</span>
              </Link>
            </Button>
          ) : null
        }
      />
      <ChatFirstPageBody className='md:py-8'>
        <div className='mb-6 rounded-3xl border border-[#FF8000]/15 bg-gradient-to-br from-[#FFF1E5]/90 via-white to-white px-5 py-4 shadow-sm'>
          <p className='text-sm font-medium leading-relaxed text-foreground/90'>
            {SHELL_COPY.pages.communityHubHint}
          </p>
        </div>

        <Tabs
          value={tab}
          onChange={setTab}
          items={TAB_ITEMS}
          className='mb-8'
        />

        {tab === 'threads' ? (
          <div className='space-y-5 pb-4'>
            <div className='flex items-end justify-between gap-3'>
              <h2 className='font-display text-lg font-bold text-foreground'>
                {SHELL_COPY.pages.communityFeedTitle}
              </h2>
            </div>
            {myUpcomingEventsCount > 0 ? (
              <p className='-mt-2 text-xs font-medium text-sky-700'>
                {SHELL_COPY.pages.communityFeedEventHint(myUpcomingEventsCount)}
              </p>
            ) : null}
            <ThreadComposer
              communities={composerCommunities}
              events={composerEvents}
              onPost={handleFeedPost}
            />
            {feedLoading ? (
              <div className='flex items-center justify-center py-16'>
                <Loader2 className='size-8 animate-spin text-[#FF8000]' />
              </div>
            ) : feedThreads.length === 0 ? (
              <div className='rounded-3xl border border-dashed border-border/70 bg-white px-6 py-14 text-center'>
                <MessageCircle className='mx-auto mb-3 size-10 text-[#FF8000]/35' />
                <p className='text-sm text-muted-foreground'>
                  {SHELL_COPY.pages.communityFeedEmpty}
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {feedThreads.map((thread) => (
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
                ))}
              </div>
            )}
            {!feedLoading && feedThreads.length > 0 && feedThreads.length < feedTotal ? (
              <div ref={loadMoreRef} className='flex items-center justify-center py-4'>
                {feedLoadingMore ? (
                  <Loader2 className='size-5 animate-spin text-[#FF8000]' />
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === 'communities' ? (
          <div className='space-y-8 pb-6'>
            {myUpcomingEventsCount > 0 ? (
              <div className='rounded-2xl border border-sky-200/80 bg-sky-50/80 px-4 py-3 text-sm font-semibold text-sky-800'>
                {SHELL_COPY.pages.communityFeedEventHint(myUpcomingEventsCount)}
              </div>
            ) : null}

            <form onSubmit={handleSearch}>
              <ThemedSearchField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={SHELL_COPY.pages.communitySearchPlaceholder}
              />
            </form>

            {loading ? (
              <div className='flex items-center justify-center py-20'>
                <Loader2 className='size-8 animate-spin text-[#FF8000]' />
              </div>
            ) : communities.length === 0 ? (
              <div className='flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/70 bg-white px-6 py-16 text-center'>
                <div className='rounded-2xl bg-[#FFF1E5] p-5'>
                  <Zap className='size-10 text-[#FF8000]/50' />
                </div>
                <div>
                  <h3 className='font-display text-lg font-bold text-foreground'>
                    {SHELL_COPY.pages.communityEmptyTitle}
                  </h3>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    {search
                      ? SHELL_COPY.pages.communityEmptySearch
                      : SHELL_COPY.pages.communityEmptyNoSearch}
                  </p>
                </div>
                {!search ? (
                  <Button
                    asChild
                    className='rounded-full bg-[#FF8000] px-6 font-semibold text-white hover:bg-[#FF8000]/90'
                  >
                    <Link to={ROUTES.communityCreate}>
                      <Plus className='size-4' />
                      {SHELL_COPY.pages.createCommunity}
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                {!search && joinedCommunities.length > 0 ? (
                  <section className='space-y-4'>
                    <h2 className='font-display text-base font-bold text-foreground md:text-lg'>
                      {SHELL_COPY.pages.communityJoinedSection}
                    </h2>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                      {joinedCommunities.map((c) => (
                        <CommunityCard key={c.id} community={c} />
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className='space-y-4'>
                  <div className='flex items-center justify-between gap-2'>
                    <h2 className='font-display text-base font-bold text-foreground md:text-lg'>
                      {search ? 'Hasil pencarian' : SHELL_COPY.pages.communityExploreSection}
                    </h2>
                    <span className='text-xs font-medium text-muted-foreground'>
                      {totalCount} circle
                    </span>
                  </div>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {(search ? communities : exploreCommunities).map((c) => (
                      <CommunityCard key={c.id} community={c} />
                    ))}
                  </div>
                  {!search && joinedCommunities.length > 0 && exploreCommunities.length === 0 ? (
                    <p className='rounded-2xl bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground'>
                      {SHELL_COPY.pages.communityAllJoinedHint}
                    </p>
                  ) : null}
                </section>

                {hasPrev || hasMore ? (
                  <div className='flex flex-wrap items-center justify-center gap-3 pt-2'>
                    <Button
                      variant='outline'
                      disabled={!hasPrev}
                      onClick={() => fetchCommunities(Math.max(0, offset - LIMIT))}
                      className='rounded-full px-5'
                    >
                      Sebelumnya
                    </Button>
                    <span className='text-sm text-muted-foreground'>
                      {offset + 1} sampai {Math.min(offset + LIMIT, totalCount)} dari {totalCount}
                    </span>
                    <Button
                      variant='outline'
                      disabled={!hasMore}
                      onClick={() => fetchCommunities(offset + LIMIT)}
                      className='rounded-full px-5'
                    >
                      Lanjut
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </ChatFirstPageBody>
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
