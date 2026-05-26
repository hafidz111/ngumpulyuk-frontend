import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/presentation/components/ui/button";

function Pagination({
  className,
  ...props
}) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props} />
  );
}

function PaginationContent({
  className,
  ...props
}) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props} />
  );
}

function PaginationItem({
  ...props
}) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        !isActive && "font-normal text-muted-foreground",
        isActive && "font-medium",
        className,
      )}
      {...props} />
  );
}

function PaginationPrevious({
  className,
  compact = false,
  ...props
}) {
  return (
    <PaginationLink
      aria-label="Halaman sebelumnya"
      size={compact ? "icon" : "default"}
      className={cn(
        compact
          ? "size-9 font-normal text-muted-foreground hover:text-foreground"
          : "h-9 gap-1 px-2.5 pl-2.5 font-normal text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}>
      <ChevronLeftIcon className="size-4" />
      {compact ? null : <span>Sebelumnya</span>}
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  compact = false,
  ...props
}) {
  return (
    <PaginationLink
      aria-label="Halaman berikutnya"
      size={compact ? "icon" : "default"}
      className={cn(
        compact
          ? "size-9 font-normal text-muted-foreground hover:text-foreground"
          : "h-9 gap-1 px-2.5 pr-2.5 font-normal text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}>
      {compact ? null : <span>Berikutnya</span>}
      <ChevronRightIcon className="size-4" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-9 items-center justify-center text-muted-foreground",
        className,
      )}
      {...props}>
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">Halaman lainnya</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
