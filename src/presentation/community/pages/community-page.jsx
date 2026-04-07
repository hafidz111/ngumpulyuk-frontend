import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Users,
  Zap,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/config/routes';
import { communitiesApi } from '@/infrastructure/communities/communities-api';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Tabs } from '@/presentation/components/ui/tabs';
import { apiClient } from '@/infrastructure/http/api-client';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { CommunityCard } from '../components/community-card';
import { ThreadCard } from '../components/thread-card';
import { ThreadComposer } from '../components/thread-composer';

const LIMIT = 12;

const TAB_ITEMS = [
  { id: 'threads', label: 'Threads', icon: MessageCircle },
  { id: 'communities', label: 'Communities', icon: Users },
];

export default function CommunityPage() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('threads');

  const [feedThreads, setFeedThreads] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const [communities, setCommunities] = useState([]);
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

        let items = [];
        let count = 0;
        if (Array.isArray(data)) {
          items = data;
          count = data.length;
        } else if (data?.results) {
          items = data.results;
          count = data.count ?? data.results.length;
        } else if (data?.data) {
          const inner = data.data;
          if (Array.isArray(inner)) {
            items = inner;
            count = data.count ?? inner.length;
          } else if (inner?.results || inner?.communities) {
            const arr = inner.results || inner.communities;
            items = arr;
            count = inner.count ?? inner.total ?? arr.length;
          }
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

  const fetchFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const res = await apiClient.get('/v1/threads/feed/');
      const data = res.data;
      let items = [];
      if (Array.isArray(data)) items = data;
      else if (data?.results) items = data.results;
      else if (data?.data) {
        items = Array.isArray(data.data) ? data.data : (data.data.results || []);
      }
      setFeedThreads(items);
    } catch {
      setFeedThreads([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'communities') {
      fetchCommunities(0);
    } else if (tab === 'threads') {
      fetchFeed();
    }
  }, [tab, fetchCommunities, fetchFeed]);

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
              communities={communities}
              communityName='Pilih Komunitas...'
              onPost={async (body) => {
                // Post logic to global feed not fully supported unless community selected
                // Requires UI for community selection, but structure is ready.
              }}
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
                />
              ))
            )}
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
    </div>
  );
}
