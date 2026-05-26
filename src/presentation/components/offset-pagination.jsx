import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import { getVisiblePageNumbers } from '@/shared/lib/pagination';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/presentation/components/ui/pagination';

/**
 * @param {{
 *   total: number;
 *   limit: number;
 *   offset: number;
 *   onOffsetChange: (nextOffset: number) => void;
 *   loading?: boolean;
 *   className?: string;
 *   anchorId?: string;
 *   hideWhenSinglePage?: boolean;
 * }} props
 */
export function OffsetPagination({
  total,
  limit,
  offset,
  onOffsetChange,
  loading = false,
  className,
  anchorId = 'pagination',
  hideWhenSinglePage = true,
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const currentPage = Math.min(totalPages, Math.floor(offset / limit) + 1);
  const hasMore = offset + limit < total;
  const hasPrev = offset > 0;
  const href = `#${anchorId}`;

  const visiblePages = useMemo(
    () => getVisiblePageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(totalPages, page));
    onOffsetChange((p - 1) * limit);
  };

  if (hideWhenSinglePage && totalPages <= 1) {
    return null;
  }

  const disabledClass = 'pointer-events-none opacity-50';

  const goPrev = (e) => {
    e.preventDefault();
    if (!hasPrev || loading) return;
    onOffsetChange(Math.max(0, offset - limit));
  };

  const goNext = (e) => {
    e.preventDefault();
    if (!hasMore || loading) return;
    onOffsetChange(offset + limit);
  };

  return (
    <Pagination className={className} id={anchorId}>
      <PaginationContent className='gap-2 md:hidden'>
        <PaginationItem>
          <PaginationPrevious
            compact
            href={href}
            aria-disabled={!hasPrev || loading}
            className={cn((!hasPrev || loading) && disabledClass)}
            onClick={goPrev}
          />
        </PaginationItem>
        <PaginationItem>
          <span
            className='flex h-9 min-w-[5.5rem] items-center justify-center px-2 text-sm font-medium tabular-nums text-muted-foreground'
            aria-live='polite'
            aria-atomic='true'
          >
            {currentPage} / {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            compact
            href={href}
            aria-disabled={!hasMore || loading}
            className={cn((!hasMore || loading) && disabledClass)}
            onClick={goNext}
          />
        </PaginationItem>
      </PaginationContent>

      <PaginationContent className='hidden md:flex'>
        <PaginationItem>
          <PaginationPrevious
            href={href}
            aria-disabled={!hasPrev || loading}
            className={cn((!hasPrev || loading) && disabledClass)}
            onClick={goPrev}
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
                href={href}
                isActive={currentPage === entry.n}
                className={cn(loading && disabledClass)}
                onClick={(e) => {
                  e.preventDefault();
                  if (loading || currentPage === entry.n) return;
                  goToPage(entry.n);
                }}
              >
                {entry.n}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={href}
            aria-disabled={!hasMore || loading}
            className={cn((!hasMore || loading) && disabledClass)}
            onClick={goNext}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
