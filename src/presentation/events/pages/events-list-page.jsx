import { useCallback, useEffect, useState } from 'react';
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
  EVENT_CATEGORIES,
  EVENT_STATUS_OPTIONS,
  SORT_OPTIONS,
  AREA_OPTIONS,
} from '../event-data';

const LIMIT = 12;

export default function EventsListPage() {
  const { isAuthenticated } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('date_asc');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchEvents = useCallback(
    async (newOffset = 0) => {
      setLoading(true);
      try {
        const params = { limit: LIMIT, offset: newOffset, sort };
        if (search.trim()) params.search = search.trim();
        if (category) params.category = category;
        if (location) params.location = location;
        if (status) params.status = status;

        const res = await eventsApi.list(params);
        const data = res.data;

        if (Array.isArray(data)) {
          setEvents(data);
          setTotalCount(data.length);
        } else if (data?.results) {
          setEvents(data.results);
          setTotalCount(data.count ?? data.results.length);
        } else if (data?.data) {
          const inner = data.data;
          if (Array.isArray(inner)) {
            setEvents(inner);
            setTotalCount(data.count ?? inner.length);
          } else if (inner?.results || inner?.events) {
            const arr = inner.results || inner.events;
            setEvents(arr);
            setTotalCount(inner.count ?? inner.total ?? arr.length);
          }
        }

        setOffset(newOffset);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    },
    [search, category, location, status, sort],
  );

  useEffect(() => {
    fetchEvents(0);
  }, [fetchEvents]);

  function handleSearch(e) {
    e.preventDefault();
    fetchEvents(0);
  }

  function clearFilters() {
    setSearch('');
    setCategory('');
    setLocation('');
    setStatus('');
    setSort('date_asc');
  }

  const hasActiveFilters = category || location || status || search;
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
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='font-display text-2xl font-bold text-foreground md:text-3xl'>
              Explore Events
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Temukan event seru di sekitarmu
            </p>
          </div>
          <Button asChild className='h-11 rounded-full bg-primary-container px-6 font-semibold text-primary-foreground shadow-lg shadow-primary-container/30 hover:bg-primary-container/90'>
            <Link to={ROUTES.eventCreate}>
              <Plus className='size-4' />
              Buat Event
            </Link>
          </Button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className='mb-6'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Cari event...'
                className='h-12 rounded-full bg-card pl-11 shadow-sm border-border/60'
              />
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={() => setFiltersOpen((o) => !o)}
              className={cn(
                'h-12 shrink-0 rounded-full px-4 border-border/60',
                filtersOpen && 'bg-primary-container/10 border-primary-container',
              )}
            >
              <SlidersHorizontal className='size-4' />
              <span className='hidden sm:inline'>Filter</span>
              {hasActiveFilters ? (
                <span className='ml-1 flex size-5 items-center justify-center rounded-full bg-primary-container text-[0.6rem] font-bold text-primary-foreground'>
                  !
                </span>
              ) : null}
            </Button>
          </div>
        </form>

        {/* Filter panel */}
        {filtersOpen ? (
          <div className='mb-6 rounded-2xl border border-border/60 bg-card p-4 shadow-sm md:p-6'>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='flex items-center gap-2 text-sm font-bold text-foreground'>
                <Filter className='size-4 text-primary-container' />
                Filter Event
              </h3>
              {hasActiveFilters ? (
                <button
                  type='button'
                  onClick={clearFilters}
                  className='inline-flex items-center gap-1 text-xs font-medium text-primary-container hover:underline'
                >
                  <X className='size-3' />
                  Reset
                </button>
              ) : null}
            </div>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className='h-10 rounded-xl border-border bg-muted/40 text-sm'>
                  <SelectValue placeholder='Kategori' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=' '>Semua Kategori</SelectItem>
                  {EVENT_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className='h-10 rounded-xl border-border bg-muted/40 text-sm'>
                  <SelectValue placeholder='Lokasi' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=' '>Semua Lokasi</SelectItem>
                  {AREA_OPTIONS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className='h-10 rounded-xl border-border bg-muted/40 text-sm'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.id || '_all'} value={s.id || ' '}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className='h-10 rounded-xl border-border bg-muted/40 text-sm'>
                  <SelectValue placeholder='Urutkan' />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        {/* Event Grid */}
        {loading ? (
          <div className='flex items-center justify-center py-24'>
            <Loader2 className='size-8 animate-spin text-primary-container' />
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
              {events.map((ev) => (
                <EventCard key={ev.id} event={ev} />
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
