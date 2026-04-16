import { useCallback, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CheckCheck, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/config/routes';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Button } from '@/presentation/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/presentation/components/ui/pagination';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { useNotificationsInbox } from '../hooks/use-notifications-inbox';

function formatCreatedAt(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return String(iso);
  }
}

function formatNotificationType(type) {
  if (!type) return '';
  if (type === 'admin_broadcast') return 'NgumpulYuk.id';
  return type
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * @param {number} currentPage 1-based
 * @param {number} totalPages
 * @returns {Array<{ type: 'page'; n: number } | { type: 'ellipsis'; key: string }>}
 */
function getVisiblePageNumbers(currentPage, totalPages) {
  const out = [];
  if (totalPages < 1) return out;
  if (totalPages === 1) {
    out.push({ type: 'page', n: 1 });
    return out;
  }
  if (totalPages <= 9) {
    for (let i = 1; i <= totalPages; i++) {
      out.push({ type: 'page', n: i });
    }
    return out;
  }

  out.push({ type: 'page', n: 1 });
  const start = Math.max(2, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);
  if (start > 2) {
    out.push({ type: 'ellipsis', key: 'start' });
  }
  for (let i = start; i <= end; i++) {
    out.push({ type: 'page', n: i });
  }
  if (end < totalPages - 1) {
    out.push({ type: 'ellipsis', key: 'end' });
  }
  out.push({ type: 'page', n: totalPages });
  return out;
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    items,
    unreadCount,
    total,
    loading,
    filterRead,
    setFilterRead,
    filterType,
    setFilterType,
    typeOptions,
    pageLimit,
    offset,
    setOffset,
    hasMore,
    hasPrev,
    load,
    markOneRead,
    markAllRead,
  } = useNotificationsInbox(isAuthenticated);

  const totalPages = Math.max(1, Math.ceil(total / pageLimit));
  const currentPage = Math.min(
    totalPages,
    Math.floor(offset / pageLimit) + 1,
  );
  const visiblePages = useMemo(
    () => getVisiblePageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const goToPage = useCallback(
    (page) => {
      const p = Math.max(1, Math.min(totalPages, page));
      setOffset((p - 1) * pageLimit);
    },
    [pageLimit, setOffset, totalPages],
  );

  const handleOpen = useCallback(
    async (n) => {
      if (!n.isRead) {
        await markOneRead(n.id);
      }
      if (n.linkUrl) {
        if (/^https?:\/\//i.test(n.linkUrl)) {
          window.location.assign(n.linkUrl);
        } else {
          navigate(n.linkUrl);
        }
      }
    },
    [markOneRead, navigate],
  );

  const handleMarkAll = useCallback(async () => {
    try {
      await markAllRead();
    } catch {
      void load();
    }
  }, [load, markAllRead]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />

      <main className='mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10'>
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='font-display text-3xl font-black tracking-tight md:text-4xl'>
              Notifikasi
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              {unreadCount > 0
                ? `${unreadCount} belum dibaca`
                : 'Semua sudah dibaca'}
              {total > 0 ? ` · ${total} total` : ''}
            </p>
          </div>
          <Button
            type='button'
            variant='outline'
            className='h-11 shrink-0 rounded-full border-border/60 font-semibold'
            disabled={loading || unreadCount === 0}
            onClick={() => void handleMarkAll()}
          >
            <CheckCheck className='mr-2 size-4' aria-hidden />
            Tandai semua dibaca
          </Button>
        </div>

        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center'>
          <Select value={filterRead} onValueChange={setFilterRead}>
            <SelectTrigger className='h-11 w-full rounded-2xl border-border/60 bg-white sm:max-w-[200px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua</SelectItem>
              <SelectItem value='unread'>Belum dibaca</SelectItem>
              <SelectItem value='read'>Sudah dibaca</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className='h-11 w-full rounded-2xl border-border/60 bg-white sm:max-w-[240px]'>
              <SelectValue placeholder='Tipe' />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((o) => (
                <SelectItem key={o.value || 'all-types'} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading && items.length === 0 ? (
          <div className='flex justify-center py-16'>
            <Loader2 className='size-8 animate-spin text-muted-foreground' aria-hidden />
          </div>
        ) : null}

        {!loading && items.length === 0 ? (
          <Card className='rounded-3xl border-border/60 bg-white'>
            <CardHeader>
              <CardTitle className='font-display text-lg'>Belum ada notifikasi</CardTitle>
              <CardDescription>
                Notifikasi baru akan muncul di sini. Halaman ini diperbarui otomatis setiap
                beberapa detik.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <ul className='space-y-3'>
          {items.map((n) => (
            <li key={n.id}>
              <button
                type='button'
                onClick={() => void handleOpen(n)}
                className={cn(
                  'w-full rounded-3xl border border-border/60 bg-white p-5 text-left shadow-sm transition hover:border-primary-container/50 hover:shadow-md',
                  !n.isRead && 'border-primary-container/40 bg-[#FFF9F4]',
                )}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0 flex-1'>
                    <p className='font-display text-base font-bold text-foreground'>
                      {n.title}
                    </p>
                    <p className='mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground'>
                      {n.message}
                    </p>
                    <p className='mt-2 text-xs text-muted-foreground'>
                      {formatCreatedAt(n.createdAt)}
                      {n.type ? (
                        <span className='ml-2 rounded-full bg-muted px-2 py-0.5 font-medium text-foreground/80'>
                          {formatNotificationType(n.type)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {!n.isRead ? (
                    <span className='mt-1 size-2 shrink-0 rounded-full bg-primary-container' />
                  ) : null}
                </div>
              </button>
            </li>
          ))}
        </ul>

        {items.length > 0 ? (
          <Pagination className='mt-8'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href='#notifications'
                  aria-disabled={!hasPrev || loading}
                  className={cn(
                    (!hasPrev || loading) && 'pointer-events-none opacity-50',
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!hasPrev || loading) return;
                    setOffset((o) => Math.max(0, o - pageLimit));
                  }}
                />
              </PaginationItem>
              {visiblePages.map((entry) =>
                entry.type === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${entry.key}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={entry.n}>
                    <PaginationLink
                      href='#notifications'
                      isActive={currentPage === entry.n}
                      onClick={(e) => {
                        e.preventDefault();
                        if (loading || currentPage === entry.n) return;
                        goToPage(entry.n);
                      }}
                      className={cn(loading && 'pointer-events-none opacity-50')}
                    >
                      {entry.n}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href='#notifications'
                  aria-disabled={!hasMore || loading}
                  className={cn(
                    (!hasMore || loading) && 'pointer-events-none opacity-50',
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!hasMore || loading) return;
                    setOffset((o) => o + pageLimit);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </main>
    </div>
  );
}
