import usePagination from '@mui/material/usePagination'
import NumberFlow from '@number-flow/react'
import { createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, type TableState, useReactTable } from '@tanstack/react-table'
import { maxBy } from 'lodash-es'

import { useOpenSubtitlesSubtitles } from '@/api/opensubtitles'
import { TablePagination } from '@/components/table-pagination'
import { TablePaginationSizeSelect } from '@/components/table-pagination-size-select'
import { TableRow } from '@/components/ui/tableHeader'
import { SortIcon } from '@/lib/icon-utils'
import { findClosest, naturalNumLength } from '@/lib/utilities'

import { useCommonColumns } from './columns'

type SubtitleData = NonNullable<ReturnType<typeof useOpenSubtitlesSubtitles>['data']>['data'][number]

function useTVColumns<T extends SubtitleData>(highestEpisodeNumber = 0) {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  return [
    columnHelper.accessor((row) => row.attributes.feature_details.feature_type, {
      id: 'media_type',
      sortingFn: (rowA, rowB) => {
        const a = [rowA.original.attributes.feature_details.season_number || 0, rowA.original.attributes.feature_details.episode_number || 0] as const
        const b = [rowB.original.attributes.feature_details.season_number || 0, rowB.original.attributes.feature_details.episode_number || 0] as const
        return a[0] - b[0] || a[1] - b[1]
      },
      header: ({ header }) => {
        const title = 'Media'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group select-none gap-2 pr-1"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <div className="flex items-center">
                <span
                  title={title}
                  className={cn('grow text-right stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold' : '')}
                >
                  {title}
                </span>
                <SortIcon isSorted={isSorted} />
              </div>
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ row, cell }) => {
        const { season_number, episode_number, feature_type } = row.original.attributes.feature_details
        const value = season_number && episode_number
          ? `S${season_number} E${String(episode_number).padStart(Math.min(naturalNumLength(highestEpisodeNumber), 2), '0')}`
          : feature_type
        return (
          <TableDataCell
            cell={cell}
          >
            <Div
              className="pl-2 capitalize tabular-nums stretch-[condensed] data-[value='tv']:uppercase"
              data-value={value}
            >
              {value}
            </Div>
          </TableDataCell>
        )
      },
      footer: ({ column }) => column.id,
    }),
  ]
}

const initialTableState: Partial<TableState> = {
  sorting: [
    {
      id: 'download_count',
      desc: true,
    },
  ],
  columnOrder: ['action', 'year', 'media_type', 'movie_name', 'language', 'download_count'],
}

const PAGE_SIZES = [5, 10, 20, 40, 50, 100, 200] as const

export function TVSubtitleFiles({
  id,
}: {
  id: number
}) {
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'
  const { t } = useTranslation()
  const { data, isPending } = useOpenSubtitlesSubtitles({
    parent_tmdb_id: id,
    languages: 'en',
    per_page: 100,
  })
  const highestEpisode = maxBy(data?.data, (d) => d.attributes.feature_details.episode_number)
  const highestEpisodeNumber = highestEpisode?.attributes.feature_details.episode_number
  const commonColumns = useCommonColumns<SubtitleData>()
  const tvColumns = useTVColumns(highestEpisodeNumber)
  const columns = [...commonColumns, ...tvColumns]
  const pagination = initialTableState.pagination ?? {
    pageSize: findClosest(5, PAGE_SIZES),
    pageIndex: 0,
  }
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    initialState: {
      ...initialTableState,
      pagination,
      columnVisibility: {
      },
    },
    autoResetPageIndex: false,
    getRowCanExpand: () => true,
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
    <div className="pb-5 pl-32 pr-5 pt-2">
      <SquircleBg className="flex h-[286px] items-center justify-center overflow-hidden rounded-xl border">
        <SquircleMask asChild>
          <div className="flex size-full flex-col bg-[--theme-bg]">
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
                        key={row.original.id}
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
                    defaultValue={String(pagination.pageSize)}
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
          </div>
        </SquircleMask>
      </SquircleBg>
    </div>
  )
}
