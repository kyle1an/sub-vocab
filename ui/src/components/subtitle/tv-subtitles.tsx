import type { InitialTableState } from '@tanstack/react-table'

import usePagination from '@mui/material/usePagination'
import NumberFlow from '@number-flow/react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import clsx from 'clsx'
import { addMinutes, formatDuration, getYear, intervalToDuration } from 'date-fns'
import { useAtom, useSetAtom } from 'jotai'
import { maxBy, sum } from 'lodash-es'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import IconLucideChevronRight from '~icons/lucide/chevron-right'

import type { Subtitles } from '@/api/opensubtitles'
import type { SubtitleData } from '@/components/subtitle/columns'
import type { RowId } from '@/lib/subtitle'
import type { ColumnFilterFn } from '@/lib/table-utils'
import type { paths } from '@/types/schema/themoviedb'

import { osSessionAtom, useOpenSubtitlesQueryOptions } from '@/api/opensubtitles'
import { $api } from '@/api/tmdb'
import { useCommonColumns } from '@/components/subtitle/columns'
import { RefetchButton } from '@/components/subtitle/menu-items'
import { TablePagination } from '@/components/table-pagination'
import { TablePaginationSizeSelect } from '@/components/table-pagination-size-select'
import { Checkbox } from '@/components/ui/checkbox'
import { Div } from '@/components/ui/html-elements'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { HeaderTitle, TableDataCell, TableHeader, TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/table-element'
import { customFormatDistance, formatIntervalLocale } from '@/lib/date-utils'
import { SortIcon } from '@/lib/icon-utils'
import { getFileId } from '@/lib/subtitle'
import { getFilterFn, noFilter, sortBySelection } from '@/lib/table-utils'
import { findClosest, naturalNumLength } from '@/lib/utilities'
import { episodeFilterStateFamily, mediaSubtitleStateAtom, osLanguageAtom, subtitleSelectionStateFamily } from '@/store/useVocab'

type ExpandableRow<T> = T & { subRows?: T[] }

type Episode = NonNullable<paths['/3/tv/{series_id}/season/{season_number}']['get']['responses'][200]['content']['application/json']['episodes']>[number]

type TVSubtitleData = SubtitleData<Episode> & RowId

type RowData = ExpandableRow<TVSubtitleData>

function useTVColumns<T extends RowData>(mediaId: number, highestEpisodeNumber = 0) {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  const [osSession] = useAtom(osSessionAtom)
  const setSubtitleSelectionState = useSetAtom(mediaSubtitleStateAtom)
  return [
    columnHelper.accessor((row) => {
      const air_date = row.media?.air_date
      return air_date ? getYear(air_date) : row.subtitle.attributes.feature_details.year
    }, {
      id: 'year',
      header: ({ header }) => {
        const title = 'Year'
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
      cell: ({ cell, getValue, row }) => {
        const value = getValue()
        return (
          <TableDataCell
            cell={cell}
          >
            <Div className="justify-center tabular-nums [font-stretch:condensed]">
              {row.depth >= 1 ? null : value}
            </Div>
          </TableDataCell>
        )
      },
    }),
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
                        const state = selection[mediaId] ??= { rowSelection: {} }
                        parentRows.forEach(({ subRows, id }) => {
                          if (subRows.length === 0) {
                            state.rowSelection[id] = !checked
                          }
                          else {
                            subRows.forEach(({ id }, index) => {
                              state.rowSelection[id] = !checked && index === 0
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
      filterFn: getFilterFn(),
      sortingFn: (rowA, rowB) => {
        const a = [rowA.original.subtitle.attributes.feature_details.season_number || 0, rowA.original.subtitle.attributes.feature_details.episode_number || 0] as const
        const b = [rowB.original.subtitle.attributes.feature_details.season_number || 0, rowB.original.subtitle.attributes.feature_details.episode_number || 0] as const
        return a[0] - b[0] || a[1] - b[1]
      },
      header: ({ header }) => {
        const title = 'Ep'
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
      cell: ({ cell, getValue, row }) => {
        const value = getValue()
        return (
          <TableDataCell
            cell={cell}
          >
            <Div
              className="whitespace-nowrap pl-1 pr-px capitalize tabular-nums [font-stretch:condensed] data-[value='tv']:uppercase"
              data-value={value}
            >
              {row.depth >= 1 ? null : value}
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.media?.name ?? '', {
      id: 'movie_name',
      filterFn: getFilterFn(),
      header: ({ header }) => {
        const title = 'Name'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group gap-2 pr-1"
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
      cell: ({ cell, getValue, row }) => {
        let element = <></>
        if (row.depth === 0) {
          const value = getValue()
          element = (
            <span>{value}</span>
          )
        }
        else {
          const value = row.original.subtitle.attributes.files[0]?.file_name || ''
          element = (
            <div
              title={value}
              className="w-0 grow overflow-hidden overflow-ellipsis whitespace-nowrap"
            >
              <span>{value}</span>
            </div>
          )
        }
        return (
          <TableDataCell
            cell={cell}
          >
            <Div
              className="cursor-text select-text pl-2.5 pr-px tracking-wider [font-feature-settings:'cv03','cv05','cv06']"
              onClick={(ev) => ev.stopPropagation()}
            >
              {element}
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
      cell: ({ cell, getValue, row }) => {
        const value = getValue() || 0
        const start = new Date(0)
        const end = addMinutes(start, value)
        return (
          <TableDataCell
            cell={cell}
          >
            <Div className="justify-end pl-0.5 pr-px tabular-nums [font-stretch:condensed]">
              {row.depth >= 1 ? null : formatDuration(
                intervalToDuration({ start, end }),
                {
                  locale: {
                    formatDistance: customFormatDistance(formatIntervalLocale),
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

/// keep-unique
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

type Season = paths['/3/tv/{series_id}/season/{season_number}']['get']['responses'][200]['content']['application/json']

function subtitleEpisodeData(subtitles: Subtitles['Response']['data'], episodes: Season['episodes'] = []) {
  const subtitleRows = subtitles.map((subtitle) => {
    const { season_number, episode_number } = subtitle.attributes.feature_details
    const media = episodes.find((episode) => episode.episode_number === episode_number && episode.season_number === season_number)
    return {
      media,
      subtitle,
    }
  }).filter((row) => {
    const { season_number, episode_number } = row.subtitle.attributes.feature_details
    return season_number && episode_number
  })
  const episodeGroup = Object.groupBy(subtitleRows, (row) => {
    const { season_number, episode_number } = row.subtitle.attributes.feature_details
    return `${season_number}0${episode_number}`
  })
  return Object.values(episodeGroup).map((group) => {
    if (group?.[0]) {
      group.sort((a, b) => b.subtitle.attributes.download_count - a.subtitle.attributes.download_count)
      const [parent] = group
      const { season_number, episode_number } = parent.subtitle.attributes.feature_details
      return {
        ...parent,
        '~rowId': `${season_number}0${episode_number}`,
        subRows: group,
      }
    }
    return undefined
  }).filter(Boolean)
}

function episodeFilter(filterEpisode: string): ColumnFilterFn<RowData> {
  if (filterEpisode === 'all')
    return noFilter
  else
    return (row) => row.subtitle.attributes.feature_details.season_number === Number(filterEpisode)
}

export function TVSubtitleFiles({
  id,
}: {
  id: number
}) {
  'use no memo'
  const { t } = useTranslation()
  const { data: seriesDetail, isLoading: isSeriesDetailLoading } = useQuery($api.queryOptions(
    'get',
    '/3/tv/{series_id}',
    {
      params: {
        path: {
          series_id: id,
        },
      },
    },
  ))
  const seasons = (seriesDetail?.seasons ?? []).filter((season) => season.season_number >= 1)
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
  const [language] = useAtom(osLanguageAtom)
  const { data: subtitles, isPending: isSubtitlesPending, refetchAll } = useQueries({
    queries: seasons.map((season) => {
      return openSubtitlesQueryOptions({
        parent_tmdb_id: id,
        languages: language,
        per_page: 100,
        season_number: season.season_number,
      })
    }),
    combine: (results) => {
      return {
        data: results.map((result) => result.data ?? []).flat(),
        isPending: results.some((result) => result.isFetching),
        refetchAll: () => {
          results.forEach((result) => result.refetch())
        },
      }
    },
  })
  const isPending = isSeriesDetailLoading || isSubtitlesPending
  const highestEpisode = maxBy(subtitles, (d) => d.attributes.feature_details.episode_number)
  const highestEpisodeNumber = highestEpisode?.attributes.feature_details.episode_number
  const commonColumns = useCommonColumns<RowData>()
  const tvColumns = useTVColumns(id, highestEpisodeNumber)
  const columns = [...commonColumns, ...tvColumns]
  const [rowSelection, setRowSelection] = useAtom(subtitleSelectionStateFamily(id))
  const dataRows = subtitleEpisodeData(subtitles, episodes)
  const [filterEpisode, setFilterEpisode] = useAtom(episodeFilterStateFamily(id))
  const table = useReactTable({
    data: dataRows,
    columns,
    initialState: initialTableState,
    state: {
      rowSelection,
      columnFilters: [
        {
          id: 'season_episode',
          value: episodeFilter(filterEpisode),
        },
      ],
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
  const rowsFiltered = table.getFilteredRowModel().rows.filter((row) => row.depth === 0 && row.subRows.length >= 1)
  const totalSubtitles = sum(rowsFiltered.map((row) => row.subRows.length))
  const allAvailableRowsMatch = rowsFiltered.length === totalEpisodes
  return (
    <>
      <>
        <>
          <div>
            <div className="flex h-9 gap-1.5 p-1.5">
              <Select
                value={filterEpisode}
                onValueChange={(e) => {
                  setFilterEpisode(e)
                }}
              >
                <SelectTrigger className="h-full w-[unset] px-2 py-0 text-xs tabular-nums [--sq-r:.625rem]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent
                  position="item-aligned"
                  className="tabular-nums"
                >
                  <SelectItem
                    className="pr-4 text-xs"
                    value="all"
                  >
                    All Seasons
                  </SelectItem>
                  {seasons.map((season) => (
                    <SelectItem
                      key={season.season_number}
                      className="pr-4 text-xs"
                      value={String(season.season_number)}
                    >
                      {`Season ${season.season_number}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <div className="flex items-center text-xs">
                <TablePaginationSizeSelect
                  table={table}
                  sizes={PAGE_SIZES}
                  value={tableState.pagination.pageSize}
                />
                <div className="whitespace-nowrap px-1">{`/${t('page')}`}</div>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-slate-800">
            <div className="flex h-7 items-center gap-1.5 text-xs tabular-nums">
              <span>
                <NumberFlow
                  value={rowsFiltered.length}
                  className={clsx(allAvailableRowsMatch && 'hidden')}
                  locales="en-US"
                  animated
                  isolate
                />
                <span
                  className={clsx(allAvailableRowsMatch && 'hidden')}
                >
                  {` of `}
                </span>
                <NumberFlow
                  value={totalEpisodes}
                  locales="en-US"
                  animated
                  isolate={!allAvailableRowsMatch}
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
        </>
      </>
    </>
  )
}
