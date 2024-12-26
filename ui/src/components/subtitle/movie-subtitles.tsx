import usePagination from '@mui/material/usePagination'
import NumberFlow from '@number-flow/react'
import { createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, type TableState, useReactTable } from '@tanstack/react-table'

import { useOpenSubtitlesSubtitles } from '@/api/opensubtitles'
import { useCommonColumns } from '@/components/subtitle/columns'
import { TablePagination } from '@/components/table-pagination'
import { TablePaginationSizeSelect } from '@/components/table-pagination-size-select'
import { TableRow } from '@/components/ui/tableHeader'
import { SortIcon } from '@/lib/icon-utils'
import { findClosest } from '@/lib/utilities'

type SubtitleData = NonNullable<ReturnType<typeof useOpenSubtitlesSubtitles>['data']>['data'][number]

function useMovieColumns<T extends SubtitleData>() {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  return [
  ]
}

const PAGE_SIZES = [5, 10, 20, 40, 50, 100, 200] as const

const tableInitialState = {
  sorting: [
    {
      id: 'download_count',
      desc: true,
    },
  ],
  columnOrder: ['action', 'year', 'media_type', 'movie_name', 'language', 'download_count'],
  pagination: {
    pageSize: findClosest(10, PAGE_SIZES),
    pageIndex: 0,
  },
} satisfies Partial<TableState>

export function MovieSubtitleFiles({
  id,
}: {
  id: number
}) {
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'
  const { t } = useTranslation()
  const { data, isPending } = useOpenSubtitlesSubtitles({
    type: 'movie',
    tmdb_id: id,
    languages: 'en',
    per_page: 100,
  })
  const commonColumns = useCommonColumns<SubtitleData>()
  const movieColumns = useMovieColumns()
  const columns = [...commonColumns, ...movieColumns]
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    initialState: tableInitialState,
    autoResetPageIndex: false,
    getRowId: (row) => row.id,
    getRowCanExpand: () => false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  })
  const rowsFiltered = table.getFilteredRowModel().rows
  const tableState = table.getState()
  const { items } = usePagination({
    count: table.getPageCount(),
    page: tableState.pagination.pageIndex + 1,
  })

  return (
    <div className="pb-5 pl-24 pr-12 pt-2">
      <SquircleBg className="flex h-[286px] items-center justify-center overflow-hidden rounded-xl border">
        <SquircleMask
          className="flex size-full flex-col bg-[--theme-bg]"
        >
          <div className="flex h-12 gap-2 p-1.5">
            <div className="flex aspect-square h-full items-center justify-center">
              {isPending ? (
                <IconLucideLoader2
                  className="animate-spin"
                />
              ) : null}
            </div>
          </div>
          <div
            className="size-full grow overflow-auto overflow-y-scroll overscroll-contain"
          >
            <table className="relative min-w-full border-separate border-spacing-0">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHeaderCellRender
                        key={header.id}
                        header={header}
                      />
                    ))}
                  </tr>
                ))}
              </TableHeader>
              <tbody>
                {table.getRowModel().rows.map((row, index) => {
                  return (
                    <TableRow
                      key={row.id}
                      row={row}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-0.5 border-t border-t-zinc-200 py-1 pr-0.5 tabular-nums dark:border-slate-800">
            <TablePagination
              items={items}
              table={table}
            />
            <div className="flex grow items-center justify-end">
              <div className="flex items-center">
                <TablePaginationSizeSelect
                  table={table}
                  sizes={PAGE_SIZES}
                  value={tableState.pagination.pageSize}
                  defaultValue={String(tableInitialState.pagination.pageSize)}
                />
                <div className="whitespace-nowrap px-1 text-[.8125rem]">{`/${t('page')}`}</div>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-slate-800">
            <div className="flex h-7 items-center text-xs tabular-nums">
              <span>
                <NumberFlow
                  value={rowsFiltered.length}
                  locales="en-US"
                  animated
                  isolate
                />
                <span>
                  {` items`}
                </span>
              </span>
            </div>
          </div>
        </SquircleMask>
      </SquircleBg>
    </div>
  )
}
