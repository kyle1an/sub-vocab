/* eslint-disable react-compiler/react-compiler */
import type { UsePaginationItem } from '@mui/material/usePagination'
import type { Table } from '@tanstack/react-table'

export function TablePagination<T>({
  items,
  table: { getCanPreviousPage, previousPage, setPageIndex, getPageCount, getCanNextPage, nextPage, getState },
}: {
  items: UsePaginationItem[]
  table: Table<T>
}) {
  'use no memo'
  const tableState = getState()
  return (
    <div className="flex">
      {items.map(({
        page,
        type,
        selected,
        ...item
      }) => {
        const className = 'flex items-center min-w-[1.625rem] justify-center rounded dark:text-slate-300 dark:disabled:text-zinc-700 border border-transparent text-xs tabular-nums disabled:text-zinc-300'

        if (type === 'previous') {
          return (
            <button
              type="button"
              aria-label="Previous page"
              className={cn(className, 'px-0')}
              disabled={!getCanPreviousPage()}
              onClick={previousPage}
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
                setPageIndex(Math.max(0, tableState.pagination.pageIndex - 2))
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
              className={cn(className, selected && 'border-border font-bold sq-radius-[--sq-r] sq-outline sq-stroke-[--border] sq-fill-transparent [--sq-r:3px] disabled:text-[unset] sq:border-0 sq:[background:paint(squircle)]')}
              type="button"
              disabled={selected}
              onClick={() => {
                setPageIndex(Number(page) - 1)
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
                setPageIndex(Math.min(tableState.pagination.pageIndex + 2, getPageCount() - 1))
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
              disabled={!getCanNextPage()}
              onClick={nextPage}
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
