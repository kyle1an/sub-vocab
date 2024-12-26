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

type ExpandableRow<T> = T & { subRows?: T[] }

type SubtitleData = NonNullable<ReturnType<typeof useOpenSubtitlesSubtitles>['data']>['data'][number]

type SubtitleDataExpandable = ExpandableRow<SubtitleData>

function useTVColumns<T extends SubtitleDataExpandable>(highestEpisodeNumber = 0) {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  return [
    columnHelper.accessor((row) => {
      const { season_number, episode_number } = row.attributes.feature_details
      if (season_number && episode_number) {
        return `S${season_number} E${String(episode_number).padStart(Math.min(naturalNumLength(highestEpisodeNumber), 2), '0')}`
      }
    }, {
      id: 'season_episode',
      sortingFn: (rowA, rowB) => {
        const a = [rowA.original.attributes.feature_details.season_number || 0, rowA.original.attributes.feature_details.episode_number || 0] as const
        const b = [rowB.original.attributes.feature_details.season_number || 0, rowB.original.attributes.feature_details.episode_number || 0] as const
        return a[0] - b[0] || a[1] - b[1]
      },
      header: ({ header }) => {
        const title = 'Episode'
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
      cell: ({ cell, getValue }) => {
        const value = getValue()
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

const PAGE_SIZES = [5, 10, 20, 40, 50, 100, 200] as const

const tableInitialState = {
  sorting: [
    {
      id: 'season_episode',
      desc: false,
    },
  ],
  columnOrder: ['action', 'year', 'season_episode', 'movie_name', 'language', 'download_count'],
  pagination: {
    pageSize: findClosest(10, PAGE_SIZES),
    pageIndex: 0,
  },
} satisfies Partial<TableState>

function groupSubtitleRows(rows: SubtitleData[]) {
  const episodeGroup = Object.groupBy(rows, (row) => {
    const { season_number, episode_number } = row.attributes.feature_details
    if (!season_number || !episode_number) {
      return '_'
    }
    return `${season_number}-${episode_number}`
  })
  const { _, ...rest } = episodeGroup
  const subtitles: SubtitleDataExpandable[] = []
  Array.prototype.push.apply(subtitles, _ ?? [])
  for (const group of Object.values(rest)) {
    if (group) {
      group.sort((a, b) => b.attributes.download_count - a.attributes.download_count)
      const [parent, ...subRows] = group
      if (parent) {
        subtitles.push({
          ...parent,
          subRows,
        })
      }
    }
  }
  return subtitles
}

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
  const commonColumns = useCommonColumns<SubtitleDataExpandable>()
  const tvColumns = useTVColumns(highestEpisodeNumber)
  const columns = [...commonColumns, ...tvColumns]
  const table = useReactTable({
    data: groupSubtitleRows(data?.data ?? []),
    columns,
    initialState: tableInitialState,
    autoResetPageIndex: false,
    getRowId: (row) => row.id,
    getRowCanExpand: (row) => row?.subRows.length >= 1,
    getSubRows: (row) => row?.subRows ?? [],
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
  const rootRef = useRef<HTMLDivElement>(null)

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
            ref={rootRef}
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
                      rootRef={rootRef}
                      index={index + 1}
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
                  {` episodes`}
                </span>
              </span>
            </div>
          </div>
        </SquircleMask>
      </SquircleBg>
    </div>
  )
}
