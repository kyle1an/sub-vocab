import type { InitialTableState } from '@tanstack/react-table'

import usePagination from '@mui/material/usePagination'
import NumberFlow from '@number-flow/react'
import { useQueries } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { enUS } from 'date-fns/locale/en-US'
import { maxBy, sum } from 'lodash-es'

import type { SubtitleData } from '@/components/subtitle/columns'
import type { RowId } from '@/lib/subtitle'
import type { paths } from '@/types/schema-themoviedb'

import { osSessionAtom, useOpenSubtitlesQueryOptions } from '@/api/opensubtitles'
import { $api } from '@/api/tmdb'
import { useCommonColumns } from '@/components/subtitle/columns'
import { RefetchButton } from '@/components/subtitle/menu-items'
import { TablePagination } from '@/components/table-pagination'
import { TablePaginationSizeSelect } from '@/components/table-pagination-size-select'
import { HeaderTitle, TableRow } from '@/components/ui/table-element'
import { SortIcon } from '@/lib/icon-utils'
import { getFileId } from '@/lib/subtitle'
import { sortBySelection } from '@/lib/table-utils'
import { findClosest, naturalNumLength, omitUndefined } from '@/lib/utilities'
import { subtitleSelectionStateAtom, subtitleSelectionStateFamily } from '@/store/useVocab'

type ExpandableRow<T> = T & { subRows?: T[] }

type Episode = NonNullable<paths['/3/tv/{series_id}/season/{season_number}']['get']['responses'][200]['content']['application/json']['episodes']>[number]

type TVSubtitleData = SubtitleData<Episode> & RowId

const formatDistanceLocale = {
  xMinutes: '{{count}} min',
  xHours: '{{count}} hr',
}

// https://www.reddit.com/r/typescript/comments/s1rdbp/comment/ihh0hyx/
function hasKey<T extends string>(obj: unknown, key: T): obj is { [key in T]: unknown } {
  return Boolean(typeof obj === 'object' && obj && key in obj)
}

function useTVColumns<T extends ExpandableRow<TVSubtitleData>>(mediaId: number, highestEpisodeNumber = 0) {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  const [osSession] = useAtom(osSessionAtom)
  const setSubtitleSelectionState = useSetAtom(subtitleSelectionStateAtom)
  return [
    columnHelper.accessor((row) => row.subtitle.id, {
      id: 'action',
      sortingFn: sortBySelection,
      header: ({ header, table }) => {
        const { rows } = table.getRowModel()
        const parentRows = rows.filter((row) => row.depth === 0)
        const checked = parentRows.length > 0 && parentRows.every((row) => row.getIsSelected() || row.getIsSomeSelected() || row.getIsAllSubRowsSelected())
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] [&:active:has(.child:not(:active))+th]:signal/active [&:active:has(.child:not(:active))]:signal/active"
          >
            <Div
              className="select-none justify-between gap-1.5 pl-2 pr-1 signal/active:bg-background-active"
              onClick={header.column.getToggleSortingHandler()}
            >
              <div className="flex [font-stretch:condensed]">
                {osSession?.token ? (
                  <Checkbox
                    checked={checked}
                    className="child"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSubtitleSelectionState((selection) => {
                        const selectionState = selection[mediaId] ??= {}
                        parentRows.forEach(({ subRows, id }) => {
                          if (subRows.length === 0) {
                            selectionState[id] = !checked
                          }
                          else {
                            subRows.forEach(({ id }, index) => {
                              selectionState[id] = !checked && index === 0
                            })
                          }
                        })
                      })
                    }}
                  />
                ) : (
                  <div className="child w-4" />
                )}
              </div>
              <SortIcon isSorted={isSorted} />
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ row, cell, onExpandedChange, onRowSelectionChange }) => {
        const canExpand = row.getCanExpand()
        const isExpanded = row.getIsExpanded()
        const checked = row.getIsSelected() || row.getIsSomeSelected() || row.getIsAllSubRowsSelected()
        return (
          <TableDataCell
            cell={cell}
          >
            <Div className="text-zinc-400">
              <div
                className={clsx(
                  'flex h-full grow items-center justify-between pl-2 pr-1',
                  canExpand && 'cursor-pointer',
                )}
                onClick={() => {
                  onExpandedChange?.(isExpanded)
                }}
              >
                <Checkbox
                  variant={row.depth === 0 ? undefined : 'radio'}
                  onClick={(e) => e.stopPropagation()}
                  checked={checked}
                  onCheckedChange={(checked) => {
                    if (row.depth === 0) {
                      const [row1] = row.subRows
                      if (row1)
                        onRowSelectionChange?.(checked, row1, 'singleSubRow')
                      else
                        onRowSelectionChange?.(checked, row)
                    }
                    else {
                      onRowSelectionChange?.(checked, row, 'singleSubRow')
                    }
                  }}
                />
                {'\u200B'}
                <IconLucideChevronRight
                  className={clsx(
                    canExpand ? '' : 'invisible',
                    'size-[14px] text-zinc-400 transition-transform duration-200 dark:text-zinc-500',
                    isExpanded ? 'rotate-90' : '',
                  )}
                />
              </div>
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => {
      const { season_number, episode_number } = row.subtitle.attributes.feature_details
      if (season_number && episode_number)
        return `S${season_number} E${String(episode_number).padStart(Math.min(naturalNumLength(highestEpisodeNumber), 2), '0')}`
    }, {
      id: 'season_episode',
      sortingFn: (rowA, rowB) => {
        const a = [rowA.original.subtitle.attributes.feature_details.season_number || 0, rowA.original.subtitle.attributes.feature_details.episode_number || 0] as const
        const b = [rowB.original.subtitle.attributes.feature_details.season_number || 0, rowB.original.subtitle.attributes.feature_details.episode_number || 0] as const
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
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="data-[title]:*:text-right"
              />
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
              className="pl-2 pr-px capitalize tabular-nums [font-stretch:condensed] data-[value='tv']:uppercase"
              data-value={value}
            >
              {value}
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.media?.runtime, {
      id: 'runtime',
      header: ({ header }) => {
        const title = 'Run Time'
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
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="data-[title]:*:text-left"
              />
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ cell, getValue }) => {
        const value = getValue() || 0
        const start = new Date(0)
        const end = addMinutes(start, value)
        return (
          <TableDataCell
            cell={cell}
          >
            <Div className="justify-end pl-0.5 pr-px tabular-nums [font-stretch:condensed]">
              {formatDuration(
                intervalToDuration({ start, end }),
                {
                  locale: {
                    formatDistance: (token, count) => {
                      if (hasKey(formatDistanceLocale, token)) {
                        const tokenValue = formatDistanceLocale[token]
                        if (typeof tokenValue === 'string')
                          return tokenValue.replace('{{count}}', String(count))
                      }
                      return enUS.formatDistance(token, count)
                    },
                  },
                },
              )}
            </Div>
          </TableDataCell>
        )
      },
    }),
  ]
}

const PAGE_SIZES = [5, 6, 10, 20, 40, 50, 100, 200] as const

const initialTableState: InitialTableState = {
  sorting: [
    {
      id: 'season_episode',
      desc: false,
    },
  ],
  columnOrder: ['action', 'year', 'season_episode', 'movie_name', 'runtime', 'language', 'upload_date', 'download_count'],
  pagination: {
    pageSize: findClosest(10, PAGE_SIZES),
    pageIndex: 0,
  },
}

function groupSubtitleRows(rows: TVSubtitleData[]) {
  const episodeGroup = Object.groupBy(rows, (row) => {
    const { season_number, episode_number } = row.subtitle.attributes.feature_details
    if (!season_number || !episode_number)
      return '_'

    return `${season_number}-${episode_number}`
  })
  const { _, ...rest } = episodeGroup
  const subtitles: ExpandableRow<TVSubtitleData>[] = []
  Array.prototype.push.apply(subtitles, _ ?? [])
  for (const group of Object.values(rest)) {
    if (group) {
      group.sort((a, b) => b.subtitle.attributes.download_count - a.subtitle.attributes.download_count)
      const [parent] = group
      if (parent) {
        const { season_number, episode_number } = parent.subtitle.attributes.feature_details
        subtitles.push({
          ...parent,
          '~rowId': `${season_number}0${episode_number}`,
          subRows: group,
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
  'use no memo'
  const { t } = useTranslation()
  const { data: seriesDetail, isLoading: isSeriesDetailLoading } = $api.useQuery(
    'get',
    '/3/tv/{series_id}',
    {
      params: {
        path: {
          series_id: id,
        },
      },
    },
  )
  const seasons = seriesDetail?.seasons ?? []
  const { data: episodes } = useQueries({
    queries: seasons.map((season) => $api.queryOptions(
      'get',
      '/3/tv/{series_id}/season/{season_number}',
      {
        params: {
          path: {
            series_id: id,
            season_number: season.season_number,
          },
        },
      },
    )),
    combine: (results) => {
      return {
        data: results.map((result) => result.data?.episodes ?? []).flat(),
        isPending: results.some((result) => result.isFetching),
        refetchAll: () => {
          results.forEach((result) => result.refetch())
        },
      }
    },
  })
  const totalEpisodes = sum(seasons.map((season) => season.episode_count))
  const openSubtitlesQueryOptions = useOpenSubtitlesQueryOptions()
  const { data: subtitles, isPending: isSubtitlesPending, refetchAll } = useQueries({
    queries: seasons.map((season) => {
      return openSubtitlesQueryOptions({
        parent_tmdb_id: id,
        languages: 'en',
        per_page: 100,
        season_number: season.season_number,
      })
    }),
    combine: (results) => {
      return {
        data: results.map((result) => result.data?.data ?? []).flat(),
        isPending: results.some((result) => result.isFetching),
        refetchAll: () => {
          results.forEach((result) => result.refetch())
        },
      }
    },
  })
  const totalSubtitles = subtitles.length
  const isPending = isSeriesDetailLoading || isSubtitlesPending
  const highestEpisode = maxBy(subtitles, (d) => d.attributes.feature_details.episode_number)
  const highestEpisodeNumber = highestEpisode?.attributes.feature_details.episode_number
  const commonColumns = useCommonColumns<ExpandableRow<TVSubtitleData>>()
  const tvColumns = useTVColumns(id, highestEpisodeNumber)
  const columns = [...commonColumns, ...tvColumns]
  const [rowSelection = {}, setRowSelection] = useAtom(subtitleSelectionStateFamily(id))
  const table = useReactTable({
    data: groupSubtitleRows(subtitles.map((subtitle) => {
      const { season_number, episode_number } = subtitle.attributes.feature_details
      const media = episodes.find((episode) => episode.episode_number === episode_number && episode.season_number === season_number)
      return {
        media,
        subtitle,
      }
    })),
    columns,
    initialState: initialTableState,
    state: {
      rowSelection,
    },
    autoResetPageIndex: false,
    getRowId: getFileId,
    getRowCanExpand: (row) => row?.subRows.length >= 1,
    getSubRows: (row) => row?.subRows ?? [],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  })
  const tableState = table.getState()
  const { items } = usePagination({
    count: table.getPageCount(),
    page: tableState.pagination.pageIndex + 1,
  })
  const rootRef = useRef<HTMLDivElement>(null)

  return (
    <div className="px-6 pb-5 pt-2 md:pl-16 md:pr-12">
      <SquircleBg
        style={{
          '--h': `${126 + 6 * 32}px`,
        }}
        className="flex h-[--h] items-center justify-center overflow-hidden rounded-xl border"
      >
        <SquircleMask
          className="flex size-full flex-col bg-[--theme-bg]"
        >
          <div>
            <div className="flex h-9 gap-2 p-1.5">
              <RefetchButton
                refetch={refetchAll}
                isFetching={isPending}
              />
            </div>
          </div>
          <div
            ref={rootRef}
            className="grow overflow-auto overflow-y-scroll"
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
                      onRowSelectionChange={setRowSelection}
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
                />
                <div className="whitespace-nowrap px-1 text-[.8125rem]">{`/${t('page')}`}</div>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-slate-800">
            <div className="flex h-7 items-center gap-1.5 text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
              <span>
                <NumberFlow
                  value={totalEpisodes}
                  locales="en-US"
                  animated
                  isolate
                />
                <span>
                  {` episodes`}
                </span>
                <span className="text-neutral-400">, </span>
              </span>
              <span>
                <NumberFlow
                  value={totalSubtitles}
                  locales="en-US"
                  animated
                  isolate
                />
                <span>
                  {` subtitles`}
                </span>
              </span>
            </div>
          </div>
        </SquircleMask>
      </SquircleBg>
    </div>
  )
}
