import type { UsePaginationItem } from '@mui/material/usePagination'
import type { Table } from '@tanstack/react-table'

export function TablePagination<T>({
  items,
  table,
}: {
  items: UsePaginationItem[]
  table: Table<T>
}) {
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
              className={cn(className, 'px-0 text-zinc-500')}
              disabled={!table.getCanPreviousPage()}
              onClick={table.previousPage}
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
              }}
              key={`${type}${page}`}
            >
              <IconLucideChevronsLeft
                className="hidden size-4 text-zinc-500 group-hover:inline-block"
              />
              <IconPrimeEllipsisH
                className="size-4 text-zinc-600 group-hover:hidden"
              />
            </button>
          )
        }

        if (type === 'first' || type === 'page' || type === 'last') {
          return (
            <button
              className={cn(className, selected && 'border-border font-bold squircle sq-radius-[--sq-r] sq-outline sq-stroke-border [--sq-r:3px] disabled:text-[unset] sq:border-0')}
              type="button"
              disabled={selected}
              onClick={() => {
                table.setPageIndex(Number(page) - 1)
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
              }}
              key={`${type}${page}`}
            >
              <IconLucideChevronsRight
                className="hidden size-4 text-zinc-500 group-hover:inline-block"
              />
              <IconPrimeEllipsisH
                className="size-4 text-zinc-600 group-hover:hidden"
              />
            </button>
          )
        }

        if (type === 'next') {
          return (
            <button
              className={cn('text-zinc-500', className)}
              type="button"
              aria-label="Next page"
              disabled={!table.getCanNextPage()}
              onClick={table.nextPage}
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
