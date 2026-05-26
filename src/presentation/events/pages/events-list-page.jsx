import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Plus, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { eventsApi } from '@/infrastructure/events/events-api';
import { Button } from '@/presentation/components/ui/button';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { ThemedSearchField } from '@/presentation/components/themed-search-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { OffsetPagination } from '@/presentation/components/offset-pagination';
import { EventGridSkeleton } from '@/presentation/components/skeletons';
import { EventCard } from '../components/event-card';
import { parseEventsListResponse } from '../lib/parse-events-list-response';
import { parseCategoriesResponse } from '../lib/parse-categories-response';

const LIMIT = 12;

/**
 * @param {{
 *   title: string;
 *   events: Record<string, unknown>[];
 *   loading: boolean;
 *   total: number;
 *   offset: number;
 *   emptyHint: string;
 *   showCreateOnEmpty?: boolean;
 *   onPage: (nextOffset: number) => void;
 * }} props
 */
function EventSection({
  title,
  events,
  loading,
  total,
  offset,
  emptyHint,
  showCreateOnEmpty = false,
  onPage,
}) {
  return (
    <section className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='font-display text-lg font-bold text-foreground md:text-xl'>{title}</h2>
        <span className='text-sm text-muted-foreground'>{total} event</span>
      </div>

      {loading ? (
        <EventGridSkeleton count={6} />
      ) : (events ?? []).length === 0 ? (
        <div className='rounded-2xl border border-dashed border-border/70 bg-white px-4 py-10 text-center'>
          <p className='text-sm text-muted-foreground'>{emptyHint}</p>
          {showCreateOnEmpty ? (
            <Button
              asChild
              className='mt-4 rounded-full bg-[#FF8000] px-6 font-semibold text-white hover:bg-[#FF8000]/90'
            >
              <Link to={ROUTES.eventCreate}>
                <Plus className='size-4' />
                Buat Event
              </Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {(events ?? []).map((ev, idx) => (
              <EventCard key={String(ev.id)} event={ev} idx={idx} />
            ))}
          </div>
          <OffsetPagination
            total={total}
            limit={LIMIT}
            offset={offset}
            onOffsetChange={onPage}
            loading={loading}
            anchorId='events-list'
            className='pt-2'
          />
        </>
      )}
    </section>
  );
}

export default function EventsListPage() {
  const { onOpenMenu } = useChatPageShell();

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [upcoming, setUpcoming] = useState({
    events: [],
    total: 0,
    offset: 0,
    loading: true,
  });
  const [past, setPast] = useState({
    events: [],
    total: 0,
    offset: 0,
    loading: false,
    loaded: false,
  });

  const buildParams = useCallback(
    (status, offset, sort) => {
      const params = { limit: LIMIT, offset, status, sort };
      if (search.trim()) params.search = search.trim();
      if (category && category !== ' ') params.category = category;
      return params;
    },
    [search, category],
  );

  const fetchSection = useCallback(
    async (status, offset, sort, setter) => {
      setter((prev) => ({ ...prev, loading: true }));
      try {
        const res = await eventsApi.list(buildParams(status, offset, sort));
        const { events, total } = parseEventsListResponse(res.data);
        setter((prev) => ({
          ...prev,
          events: events ?? [],
          total,
          offset,
          loading: false,
          ...(status === 'past' ? { loaded: true } : {}),
        }));
      } catch (err) {
        console.error(err);
        setter((prev) => ({
          ...prev,
          events: [],
          total: 0,
          offset,
          loading: false,
          ...(status === 'past' ? { loaded: true } : {}),
        }));
      }
    },
    [buildParams],
  );

  const reloadUpcoming = useCallback(() => {
    void fetchSection('upcoming', 0, 'date_asc', setUpcoming);
  }, [fetchSection]);

  const reloadPast = useCallback(() => {
    void fetchSection('past', 0, 'date_desc', setPast);
  }, [fetchSection]);

  const reloadAll = useCallback(() => {
    reloadUpcoming();
    setPast({ events: [], total: 0, offset: 0, loading: false, loaded: false });
  }, [reloadUpcoming]);

  useEffect(() => {
    reloadUpcoming();
  }, [reloadUpcoming]);

  useEffect(() => {
    if (upcoming.loading || past.loaded) return;
    reloadPast();
  }, [upcoming.loading, past.loaded, reloadPast]);

  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const res = await eventsApi.categories();
        if (active) setCategoryOptions(parseCategoriesResponse(res.data));
      } catch {
        if (active) setCategoryOptions([]);
      }
    };

    void fetchCategories();
    return () => {
      active = false;
    };
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    reloadAll();
  }

  function clearFilters() {
    setSearch('');
    setCategory('');
  }

  const hasActiveFilters = category || search;
  const eventCategories = useMemo(() => categoryOptions, [categoryOptions]);
  const pageLoading = upcoming.loading && upcoming.events.length === 0;

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title={SHELL_COPY.pages.exploreTitle}
        subtitle={SHELL_COPY.pages.exploreSubtitle}
        onOpenMenu={onOpenMenu}
      />
      <ChatFirstPageBody>
        <div className='relative z-20 mb-6'>
          <form onSubmit={handleSearch}>
            <div className='flex gap-2'>
              <ThemedSearchField
                className='flex-1'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Cari event...'
              />
              <Button
                type='button'
                onClick={() => setFiltersOpen((o) => !o)}
                className={cn(
                  'h-12 shrink-0 rounded-full border border-border/60 px-5 font-semibold shadow-sm transition-colors',
                  filtersOpen
                    ? 'bg-[#FF8000] text-white hover:bg-[#E67300]'
                    : 'bg-white text-foreground hover:bg-muted',
                )}
              >
                <Filter className='size-4' />
                <span className='hidden sm:inline'>Filter</span>
                {hasActiveFilters ? (
                  <span
                    className={cn(
                      'ml-1 flex size-5 items-center justify-center rounded-full text-[0.6rem] font-bold',
                      filtersOpen ? 'bg-white text-[#FF8000]' : 'bg-[#FF8000] text-white',
                    )}
                  >
                    !
                  </span>
                ) : null}
              </Button>
            </div>
          </form>

          {filtersOpen ? (
            <div className='absolute right-0 top-[56px] w-[300px] rounded-3xl border border-border/60 bg-white p-5 shadow-xl md:w-[320px]'>
              <div className='space-y-1.5'>
                <label className='text-base font-bold text-[#1A1A1A]'>Kategori</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className='h-12 rounded-2xl border-border bg-white text-sm'>
                    <SelectValue placeholder='Semua' />
                  </SelectTrigger>
                  <SelectContent className='z-[9999]'>
                    <SelectItem value=' '>Semua</SelectItem>
                    {eventCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters ? (
                <div className='mt-4 text-center'>
                  <button
                    type='button'
                    onClick={clearFilters}
                    className='text-[15px] font-semibold text-[#FF8000] hover:underline'
                  >
                    Reset Filter
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {pageLoading ? (
          <EventGridSkeleton count={6} />
        ) : !hasActiveFilters &&
          !upcoming.loading &&
          past.loaded &&
          !past.loading &&
          upcoming.events.length === 0 &&
          past.events.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-4 py-24 text-center'>
            <div className='rounded-2xl bg-muted/50 p-5'>
              <Zap className='size-10 text-muted-foreground/40' />
            </div>
            <div>
              <h3 className='font-display text-lg font-bold text-foreground'>Belum ada event</h3>
              <p className='mt-1 text-sm text-muted-foreground'>Yuk jadi yang pertama buat event!</p>
            </div>
            <Button
              asChild
              className='rounded-full bg-primary-container px-6 font-semibold text-primary-foreground'
            >
              <Link to={ROUTES.eventCreate}>
                <Plus className='size-4' />
                Buat Event Pertama
              </Link>
            </Button>
          </div>
        ) : (
          <div className='space-y-10 pb-8'>
            <EventSection
              title={SHELL_COPY.pages.exploreUpcoming}
              events={upcoming.events}
              loading={upcoming.loading}
              total={upcoming.total}
              offset={upcoming.offset}
              emptyHint={
                hasActiveFilters
                  ? SHELL_COPY.pages.exploreUpcomingEmptyFiltered
                  : SHELL_COPY.pages.exploreUpcomingEmpty
              }
              showCreateOnEmpty={!hasActiveFilters}
              onPage={(next) => void fetchSection('upcoming', next, 'date_asc', setUpcoming)}
            />
            <EventSection
              title={SHELL_COPY.pages.explorePast}
              events={past.events}
              loading={past.loading}
              total={past.total}
              offset={past.offset}
              emptyHint={SHELL_COPY.pages.explorePastEmpty}
              onPage={(next) => void fetchSection('past', next, 'date_desc', setPast)}
            />
          </div>
        )}
      </ChatFirstPageBody>
    </div>
  );
}
