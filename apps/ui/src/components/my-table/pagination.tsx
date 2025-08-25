import type { UsePaginationItem } from '@mui/material/usePagination'
import type { Table } from '@tanstack/react-table'

import IconLucideChevronLeft from '~icons/lucide/chevron-left'
import IconLucideChevronRight from '~icons/lucide/chevron-right'
import IconLucideChevronsLeft from '~icons/lucide/chevrons-left'
import IconLucideChevronsRight from '~icons/lucide/chevrons-right'
import IconPrimeEllipsisH from '~icons/prime/ellipsis-h'

import { cn } from '@/lib/utils'

export function TablePagination<T>({
  items,
  table,
  rootRef,
}: {
  items: UsePaginationItem[]
  table: Table<T>
  rootRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="flex">
      {items.map(({
        page,
        type,
        selected,
        ...item
      }) => {
        const className = 'flex items-center min-w-6.5 justify-center rounded dark:text-neutral-300 dark:disabled:text-zinc-700 border border-transparent text-xs tabular-nums tracking-[.03em] disabled:text-zinc-300'

        if (type === 'previous') {
          return (
            <button
              type="button"
              aria-label="Previous page"
              className={cn(className, 'px-0')}
              disabled={!table.getCanPreviousPage() || table.getPageCount() === 0}
              onClick={() => {
                table.previousPage()
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
              key={type}
            >
              <IconLucideChevronLeft
                className="size-4"
              />
            </button>
          )
        }

        if (type === 'start-ellipsis') {
          return (
            <button
              className={cn('group', className)}
              aria-label="Start ellipsis"
              type="button"
              onClick={() => {
                table.setPageIndex(Math.max(0, table.getState().pagination.pageIndex - 2))
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
              key={`${type}${page}`}
            >
              <IconLucideChevronsLeft
                className="hidden size-4 group-hover:inline-block"
              />
              <IconPrimeEllipsisH
                className="size-4 group-hover:hidden"
              />
            </button>
          )
        }

        if (type === 'first' || type === 'page' || type === 'last') {
          return (
            <button
              className={cn(className, selected && 'border-border font-bold [--sq-r:.5rem] disabled:text-[unset] sq:rounded-(--sq-r)')}
              type="button"
              disabled={selected}
              onClick={() => {
                table.setPageIndex(Number(page) - 1)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
              key={`${type}${page}`}
            >
              {page}
            </button>
          )
        }

        if (type === 'end-ellipsis') {
          return (
            <button
              className={cn('group', className)}
              type="button"
              aria-label="End ellipsis"
              onClick={() => {
                table.setPageIndex(Math.min(table.getState().pagination.pageIndex + 2, table.getPageCount() - 1))
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
              key={`${type}${page}`}
            >
              <IconLucideChevronsRight
                className="hidden size-4 group-hover:inline-block"
              />
              <IconPrimeEllipsisH
                className="size-4 group-hover:hidden"
              />
            </button>
          )
        }

        if (type === 'next') {
          return (
            <button
              className={cn(className)}
              type="button"
              aria-label="Next page"
              disabled={!table.getCanNextPage()}
              onClick={() => {
                table.nextPage()
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
              key={type}
            >
              <IconLucideChevronRight
                className="size-4"
              />
            </button>
          )
        }

        return null
      })}
    </div>
  )
}
