import type { CellContext, InitialTableState } from '@tanstack/react-table'
import type { RefObject } from 'react'

import usePagination from '@mui/material/usePagination'
import NumberFlow from '@number-flow/react'
import { useUnmountEffect } from '@react-hookz/web'
import { useQueries, useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import clsx from 'clsx'
import { addMinutes, formatDuration, getYear, intervalToDuration } from 'date-fns'
import { pipe } from 'effect'
import { maxBy, sum } from 'es-toolkit'
import { produce } from 'immer'
import { useAtom, useAtomValue, useStore } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { Fragment, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import IconLucideChevronRight from '~icons/lucide/chevron-right'

import type { Subtitles } from '@/api/opensubtitles'
import type { SubtitleData } from '@/components/subtitle/columns'
import type { RowId } from '@/lib/subtitle'
import type { ColumnFilterFn } from '@/lib/table-utils'
import type { paths } from '@/types/schema/themoviedb'
import type { RowSelectionChangeFn } from '@/types/utils'

import { openSubtitlesQueryOptionsAtom, osSessionAtom } from '@/api/opensubtitles'
import { $api } from '@/api/tmdb'
import { buildMediaSubtitleState, mediaSubtitleAtomFamily } from '@/atoms/subtitles'
import { SortIcon } from '@/components/my-icon/sort-icon'
import { TableGoToLastPage } from '@/components/my-table/go-to-last-page'
import { TablePagination } from '@/components/my-table/pagination'
import { TablePaginationSizeSelect } from '@/components/my-table/pagination-size-select'
import { useCommonColumns } from '@/components/subtitle/columns'
import { RefetchButton } from '@/components/subtitle/menu-items'
import { Checkbox } from '@/components/ui/checkbox'
import { Div } from '@/components/ui/html-elements'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { HeaderTitle, TableDataCell, TableHeader, TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/table-element'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useRect } from '@/hooks'
import { useIsEllipsisActive } from '@/hooks/useIsEllipsisActive'
import { customFormatDistance, formatIntervalLocale } from '@/lib/date-utils'
import { getFileId } from '@/lib/subtitle'
import { filterFn, noFilter, sortBySelection } from '@/lib/table-utils'
import { compareBy, findClosest, naturalNumLength } from '@/lib/utilities'
import { osLanguageAtom } from '@/store/useVocab'
import { isNonEmptyArray } from '@sub-vocab/utils/lib'

type ExpandableRow<T> = T & { subRows?: T[] }

type Episode = NonNullable<paths['/3/tv/{series_id}/season/{season_number}']['get']['responses'][200]['content']['application/json']['episodes']>[number]

type TVSubtitleData = SubtitleData<Episode> & RowId

type RowData = ExpandableRow<TVSubtitleData>

function useTVColumns<T extends RowData>(mediaId: number, highestEpisodeNumber = 0, root: React.RefObject<HTMLDivElement | null>, tbody: React.RefObject<HTMLTableSectionElement | null>) {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  const store = useStore()
  const [osSession] = useAtom(osSessionAtom)
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
              className="group gap-2 pr-1 select-none"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="*:data-title:text-left"
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
            <Div className="justify-center tracking-[.03em] tabular-nums">
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
            className="w-[.1%] [&:active:has(.child:not(:active))]:signal/active [&:active:has(.child:not(:active))+th]:signal/active"
          >
            <Div
              className="justify-between gap-1.5 pr-1 pl-2 select-none signal/active:bg-background-active"
              onClick={header.column.getToggleSortingHandler()}
            >
              <div className="flex">
                {osSession?.token ? (
                  <Checkbox
                    checked={checked}
                    className="child"
                    onClick={(e) => {
                      e.stopPropagation()
                      store.set(mediaSubtitleAtomFamily({ key: mediaId }), produce(({ tableState }) => {
                        parentRows.forEach(({ subRows, id }) => {
                          if (subRows.length === 0) {
                            tableState.rowSelection[id] = !checked
                          } else {
                            subRows.forEach(({ id }, index) => {
                              tableState.rowSelection[id] = !checked && index === 0
                            })
                          }
                        })
                      }))
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
                  'flex h-full grow items-center justify-between pr-1 pl-2',
                  canExpand && 'cursor-pointer',
                )}
                onClick={() => {
                  onExpandedChange?.(isExpanded)
                }}
              >
                <Checkbox
                  className={clsx(row.depth >= 1 && 'rounded-full sq:rounded-full sq:[corner-shape:round]!')}
                  onClick={(e) => e.stopPropagation()}
                  checked={checked}
                  onCheckedChange={(checked) => {
                    if (row.depth === 0) {
                      const [row1] = row.subRows
                      if (row1) {
                        onRowSelectionChange?.(checked, row1, 'singleSubRow')
                      } else {
                        onRowSelectionChange?.(checked, row)
                      }
                    } else {
                      onRowSelectionChange?.(checked, row, 'singleSubRow')
                    }
                  }}
                />
                {'\u200B'}
                <IconLucideChevronRight
                  className={clsx(
                    canExpand ? '' : 'invisible',
                    'size-3.5 text-zinc-400 transition-transform duration-200 dark:text-zinc-500',
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
      if (season_number && episode_number) {
        return `S${season_number} E${String(episode_number).padStart(Math.min(naturalNumLength(highestEpisodeNumber), 2), '0')}`
      }
    }, {
      id: 'season_episode',
      filterFn,
      sortingFn: compareBy((row) => {
        const { season_number = 0, episode_number = 0 } = row.original.subtitle.attributes.feature_details
        return [season_number, episode_number]
      }),
      header: ({ header }) => {
        const title = 'Ep'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group gap-2 pr-1 select-none"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="*:data-title:text-left"
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
              className="pr-px pl-1 tracking-[.04em] whitespace-nowrap tabular-nums"
            >
              {row.depth >= 1 ? null : value}
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.media?.name ?? '', {
      id: 'movie_name',
      filterFn,
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
                className="*:data-title:text-left"
              />
            </Div>
          </TableHeaderCell>
        )
      },
      cell: (ctx) => {
        return (
          <TvNameCell
            {...ctx}
            root={root}
            tbody={tbody}
          />
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
              className="group gap-2 pr-1 select-none"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="*:data-title:text-left"
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
            <Div className="justify-end pr-px pl-0.5 tracking-[.03em] tabular-nums">
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

function TvNameSubRow<TData extends RowData>({
  root,
  tbody,
  row,
}: {
  root: RefObject<HTMLDivElement | null>
  tbody: React.RefObject<HTMLTableSectionElement | null>
} & Pick<CellContext<TData, string>, 'row'>) {
  const ref = useRef<HTMLDivElement>(null)
  const value = row.original.subtitle.attributes.files[0]?.file_name || ''
  const className = 'tracking-[.04em] text-sm'
  const rootRect = useRect(root)
  const refRect = useRect(ref)
  const [isEllipsisActive, handleOnMouseOver] = useIsEllipsisActive<HTMLButtonElement>()
  let maxWidth = 0
  if (rootRect && refRect) {
    maxWidth = rootRect.x + rootRect.width - refRect.x + 12 - 4
  }
  return (
    <div
      ref={ref}
      className="w-0 grow truncate"
    >
      <Tooltip
        delayDuration={500}
      >
        <TooltipTrigger
          onMouseOver={handleOnMouseOver}
          asChild
        >
          <div
            className={clsx('truncate', className)}
          >
            {value}
          </div>
        </TooltipTrigger>
        <TooltipContent
          container={tbody.current}
          side="bottom"
          sideOffset={-21 - 1}
          align="start"
          alignOffset={-8 - 1}
          avoidCollisions={false}
          hidden={!isEllipsisActive}
          className="max-w-(--max-width) border bg-background px-2 py-px text-foreground shadow-xs slide-in-from-top-0! zoom-in-100! zoom-out-100! [word-wrap:break-word] **:[[data-slot=tooltip-arrow]]:hidden!"
          style={{
            '--max-width': `${maxWidth}px`,
          }}
        >
          <span
            className={className}
          >
            {value}
          </span>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

function TvNameCell<TData extends RowData>({
  root,
  tbody,
  cell,
  getValue,
  row,
}: {
  root: RefObject<HTMLDivElement | null>
  tbody: React.RefObject<HTMLTableSectionElement | null>
} & CellContext<TData, string>) {
  const value = getValue()
  return (
    <TableDataCell
      cell={cell}
    >
      <Div
        className="cursor-text py-1 pr-px pl-2.5 tracking-[.04em] select-text"
        onClick={(ev) => ev.stopPropagation()}
      >
        {row.depth === 0 ? (
          <span>
            {value}
          </span>
        ) : (
          <TvNameSubRow
            root={root}
            tbody={tbody}
            row={row}
          />
        )}
      </Div>
    </TableDataCell>
  )
}

/// keep-unique
const PAGE_SIZES = [5, 6, 10, 20, 40, 50, 100, 200] as const

type Season = paths['/3/tv/{series_id}/season/{season_number}']['get']['responses'][200]['content']['application/json']

function subtitleEpisodeData(subtitles: Subtitles['Response']['data'], episodes: Season['episodes'] = []) {
  return pipe(
    subtitles
      .map((subtitle) => {
        const { season_number, episode_number } = subtitle.attributes.feature_details
        if (season_number && episode_number) {
          return {
            media: episodes.find((episode) => episode.episode_number === episode_number && episode.season_number === season_number),
            subtitle,
          }
        }
        return undefined
      })
      .filter(Boolean),
    (v) => Object.groupBy(v, ({ subtitle }) => {
      const { season_number, episode_number } = subtitle.attributes.feature_details
      return `${season_number}0${episode_number}`
    }),
    (v) => Object.values(v)
      .filter(Boolean)
      .filter(isNonEmptyArray)
      .map((group) => {
        group.sort((a, b) => b.subtitle.attributes.download_count - a.subtitle.attributes.download_count)
        const [parent] = group
        const { season_number, episode_number } = parent.subtitle.attributes.feature_details
        return {
          ...parent,
          '~rowId': `${season_number}0${episode_number}`,
          subRows: group,
        }
      }),
  )
}

function episodeFilter(filterEpisode: string): ColumnFilterFn<RowData> {
  if (filterEpisode === 'all') {
    return noFilter
  } else {
    return (row) => row.subtitle.attributes.feature_details.season_number === Number(filterEpisode)
  }
}

export function TVSubtitleFiles({
  id,
}: {
  id: number
}) {
  // eslint-disable-next-line react-compiler/react-compiler
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
  const openSubtitlesQueryOptions = useAtomValue(openSubtitlesQueryOptionsAtom)
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
  const highestEpisode = maxBy(subtitles, (d) => d.attributes.feature_details.episode_number ?? 0)
  const highestEpisodeNumber = highestEpisode?.attributes.feature_details.episode_number
  const commonColumns = useCommonColumns<RowData>()
  const rootRef = useRef<HTMLDivElement>(null)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const tvColumns = useTVColumns(id, highestEpisodeNumber, rootRef, tbodyRef)
  const columns = [...commonColumns, ...tvColumns]
  const dataRows = subtitleEpisodeData(subtitles, episodes)
  const [{ episodeFilter: filterEpisode = 'all', initialTableState: mediaInitialTableState, tableState: mediaTableState }, setMediaSubtitleState] = useImmerAtom(mediaSubtitleAtomFamily({
    key: id,
    initialValue: buildMediaSubtitleState({
      initialTableState: {
        sorting: [
          {
            id: 'season_episode',
            desc: false,
          },
        ],
        columnOrder: ['action', 'year', 'season_episode', 'movie_name', 'runtime', 'language', 'upload_date', 'download_count'],
        pagination: {
          pageSize: findClosest(10, PAGE_SIZES),
        },
      } satisfies InitialTableState,
    }),
  }))
  const table = useReactTable({
    data: dataRows,
    columns,
    initialState: mediaInitialTableState,
    state: {
      ...mediaTableState,
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
  })
  const tableState = table.getState()
  const { items } = usePagination({
    count: table.getPageCount(),
    page: tableState.pagination.pageIndex + 1,
  })
  const rowsFiltered = table.getFilteredRowModel().rows.filter((row) => row.depth === 0 && row.subRows.length >= 1)
  const totalSubtitles = sum(rowsFiltered.map((row) => row.subRows.length))
  const allAvailableRowsMatch = rowsFiltered.length === totalEpisodes
  function handleRowSelectionChange(...[checked, row, mode]: Parameters<RowSelectionChangeFn<SubtitleData>>) {
    setMediaSubtitleState(({ tableState }) => {
      if (mode === 'singleRow') {
        tableState.rowSelection = {}
      } else if (mode === 'singleSubRow') {
        const subRows = row.getParentRow()?.subRows ?? []
        subRows.forEach(({ id }) => {
          tableState.rowSelection[id] = false
        })
      }
      tableState.rowSelection[row.id] = Boolean(checked)
    })
  }
  useUnmountEffect(() => {
    setMediaSubtitleState((draft) => {
      draft.initialTableState = table.getState()
    })
  })
  return (
    <Fragment>
      <Fragment>
        <Fragment>
          <div>
            <div className="flex h-9 gap-1.5 p-1.5">
              <Select
                value={filterEpisode}
                onValueChange={(e) => {
                  setMediaSubtitleState((draft) => {
                    draft.episodeFilter = e
                  })
                }}
              >
                <SelectTrigger className="h-full! w-[unset] gap-0 px-2 py-0 text-xs tracking-[.03em] tabular-nums [--sq-r:.625rem]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent
                  position="item-aligned"
                  className="tracking-[.03em] tabular-nums"
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
              <tbody ref={tbodyRef}>
                {table.getRowModel().rows.map((row, index) => {
                  return (
                    <TableRow
                      key={row.id}
                      row={row}
                      root={rootRef}
                      index={index + 1}
                      onRowSelectionChange={handleRowSelectionChange}
                    />
                  )
                })}
              </tbody>
            </table>
            <TableGoToLastPage
              table={table}
            />
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-0.5 border-t border-t-zinc-200 py-1 pr-0.5 tracking-[.03em] tabular-nums dark:border-neutral-800">
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
                <div className="px-1 whitespace-nowrap">{`/${t('page')}`}</div>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-neutral-800">
            <div className="flex h-7 items-center gap-1.5 text-xs tracking-[.03em] tabular-nums">
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
        </Fragment>
      </Fragment>
    </Fragment>
  )
}
