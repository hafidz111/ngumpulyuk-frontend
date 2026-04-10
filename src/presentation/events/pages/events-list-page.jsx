import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Filter,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  Zap,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/config/routes';
import { eventsApi } from '@/infrastructure/events/events-api';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { EventCard } from '../components/event-card';
import {
  SORT_OPTIONS,
  extractEventCategories,
} from '../event-data';

const LIMIT = 12;

export default function EventsListPage() {
  const { isAuthenticated } = useAuth();

  const [events, setEvents] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('date_asc');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchEvents = useCallback(
    async (newOffset = 0) => {
      setLoading(true);
      try {
        const params = {
          limit: LIMIT,
          offset: newOffset,
        };

        if (search.trim()) params.search = search;
        if (category && category !== ' ') params.category = category;
        if (sort) params.sort = sort;

        const res = await eventsApi.list(params);
        const payload = res.data?.data || res.data;

        let evs = [];
        let totalCountNum = 0;

        if (Array.isArray(payload)) {
          evs = payload;
          totalCountNum = evs.length;
        } else if (payload?.events) {
          evs = payload.events;
          totalCountNum = payload.total ?? payload.count ?? evs.length;
        } else if (payload?.results) {
          evs = payload.results;
          totalCountNum = payload.count ?? payload.total ?? evs.length;
        }

        setEvents(evs);
        setTotalCount(totalCountNum);
        setOffset(newOffset);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    },
    [search, category, sort],
  );

  useEffect(() => {
    fetchEvents(0);
  }, [fetchEvents]);

  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const res = await eventsApi.list({ limit: 200, offset: 0 });
        const payload = res.data?.data || res.data;
        const items = Array.isArray(payload)
          ? payload
          : (payload?.events || payload?.results || []);
        if (active) setCategoryOptions(extractEventCategories(items));
      } catch {
        if (active) setCategoryOptions([]);
      }
    };

    fetchCategories();
    return () => {
      active = false;
    };
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchEvents(0);
  }

  function clearFilters() {
    setSearch('');
    setCategory('');
    setSort('date_asc');
  }

  const hasActiveFilters = category || search;
  const hasMore = offset + LIMIT < totalCount;
  const hasPrev = offset > 0;
  const eventCategories = useMemo(() => categoryOptions, [categoryOptions]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />

      <main className='mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10'>
        <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end'>
          <div>
            <h1 className='font-display text-4xl font-black tracking-tight text-foreground md:text-5xl'>
              Explore Events
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Temukan {totalCount} event seru di sekitarmu.
            </p>
          </div>
          <Button asChild className='h-11 rounded-full bg-primary-container px-6 font-semibold text-primary-foreground shadow-lg shadow-primary-container/30 hover:bg-primary-container/90'>
            <Link to={ROUTES.eventCreate}>
              <Plus className='size-4' />
              Buat Event
            </Link>
          </Button>
        </div>

        <div className='relative z-20 mb-6'>
          <form onSubmit={handleSearch}>
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <Search className='absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Cari event...'
                  className='h-12 rounded-full bg-white pl-11 shadow-sm border-border/60 text-foreground'
                />
              </div>
              <Button
                type='button'
                onClick={() => setFiltersOpen((o) => !o)}
                className={cn(
                  'h-12 shrink-0 rounded-full border border-border/60 px-5 font-semibold shadow-sm transition-colors',
                  filtersOpen ? 'bg-[#FF8000] text-white hover:bg-[#E67300]' : 'bg-white text-foreground hover:bg-muted'
                )}
              >
                <Filter className='size-4' />
                <span className='hidden sm:inline'>Filter</span>
                {hasActiveFilters ? (
                  <span className={cn('ml-1 flex size-5 items-center justify-center rounded-full text-[0.6rem] font-bold', filtersOpen ? 'bg-white text-[#FF8000]' : 'bg-[#FF8000] text-white')}>
                    !
                  </span>
                ) : null}
              </Button>
            </div>
          </form>

          {filtersOpen ? (
            <div className='absolute right-0 top-[56px] w-[300px] rounded-3xl border border-border/60 bg-white p-5 shadow-xl md:w-[320px]'>
              <div className='grid grid-cols-1 gap-5'>
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

                <div className='space-y-1.5'>
                  <label className='text-base font-bold text-[#1A1A1A]'>Urutan</label>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className='h-12 rounded-2xl border-border bg-white text-sm'>
                      <SelectValue placeholder='Tanggal terdekat' />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <div className='mt-2 text-center'>
                    <button
                      type='button'
                      onClick={clearFilters}
                      className='text-[15px] font-semibold text-[#FF8000] hover:text-[#E67300] hover:underline'
                    >
                      Reset Filter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className='flex items-center justify-center py-24'>
            <Loader2 className='size-8 animate-spin text-[#FF8000]' />
          </div>
        ) : events.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-4 py-24 text-center'>
            <div className='rounded-2xl bg-muted/50 p-5'>
              <Zap className='size-10 text-muted-foreground/40' />
            </div>
            <div>
              <h3 className='font-display text-lg font-bold text-foreground'>
                Belum ada event
              </h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                {hasActiveFilters
                  ? 'Coba ubah filter atau cari dengan kata kunci lain.'
                  : 'Yuk jadi yang pertama buat event!'}
              </p>
            </div>
            {!hasActiveFilters ? (
              <Button asChild className='rounded-full bg-primary-container px-6 font-semibold text-primary-foreground'>
                <Link to={ROUTES.eventCreate}>
                  <Plus className='size-4' />
                  Buat Event Pertama
                </Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {events.map((ev, idx) => (
                <EventCard key={ev.id} event={ev} idx={idx} />
              ))}
            </div>

            {/* Pagination */}
            {(hasPrev || hasMore) ? (
              <div className='mt-8 flex items-center justify-center gap-4'>
                <Button
                  variant='outline'
                  disabled={!hasPrev}
                  onClick={() => fetchEvents(Math.max(0, offset - LIMIT))}
                  className='rounded-full px-6'
                >
                  Sebelumnya
                </Button>
                <span className='text-sm text-muted-foreground'>
                  {offset + 1}–{Math.min(offset + LIMIT, totalCount)} dari {totalCount}
                </span>
                <Button
                  variant='outline'
                  disabled={!hasMore}
                  onClick={() => fetchEvents(offset + LIMIT)}
                  className='rounded-full px-6'
                >
                  Selanjutnya
                </Button>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
