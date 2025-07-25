import type { InitialTableState } from '@tanstack/react-table'

import usePagination from '@mui/material/usePagination'
import NumberFlow from '@number-flow/react'
import { useUnmountEffect } from '@react-hookz/web'
import { createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import clsx from 'clsx'
import { merge } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { Subtitles } from '@/api/opensubtitles'
import type { SubtitleData } from '@/components/subtitle/columns'
import type { RowSelectionChangeFn } from '@/types/utils'

import { useOpenSubtitlesSubtitles } from '@/api/opensubtitles'
import { mediaSubtitleAtomFamily } from '@/atoms/subtitles'
import { SortIcon } from '@/components/my-icon/sort-icon'
import { TableGoToLastPage } from '@/components/my-table/go-to-last-page'
import { TablePagination } from '@/components/my-table/pagination'
import { TablePaginationSizeSelect } from '@/components/my-table/pagination-size-select'
import { useCommonColumns } from '@/components/subtitle/columns'
import { RefetchButton } from '@/components/subtitle/menu-items'
import { Checkbox } from '@/components/ui/checkbox'
import { Div } from '@/components/ui/html-elements'
import { Separator } from '@/components/ui/separator'
import { HeaderTitle, TableDataCell, TableHeader, TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/table-element'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsEllipsisActive } from '@/hooks/useIsEllipsisActive'
import { getFileId } from '@/lib/subtitle'
import { filterFn, sortBySelection } from '@/lib/table-utils'
import { findClosest, omitUndefined } from '@/lib/utilities'
import { osLanguageAtom } from '@/store/useVocab'

type MovieSubtitleData = SubtitleData

function useMovieColumns<T extends MovieSubtitleData>(root: React.RefObject<HTMLDivElement | null>, tbody: React.RefObject<HTMLTableSectionElement | null>) {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  return [
    columnHelper.accessor((row) => row.subtitle.id, {
      id: 'action',
      sortingFn: sortBySelection,
      header: ({ header }) => {
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] [&:active:has(.child:not(:active))]:signal/active [&:active:has(.child:not(:active))+th]:signal/active"
          >
            <Div
              className="justify-between gap-1 pr-1 pl-2 select-none signal/active:bg-background-active"
              onClick={header.column.getToggleSortingHandler()}
            >
              <div className="child flex" />
              <SortIcon isSorted={isSorted} />
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ row, cell, onRowSelectionChange }) => {
        const canExpand = row.getCanExpand()
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
              >
                <Checkbox
                  className={clsx('rounded-full sq:rounded-full sq:[corner-shape:round]!')}
                  onClick={(e) => e.stopPropagation()}
                  checked={row.getIsSelected()}
                  onCheckedChange={(checked) => {
                    onRowSelectionChange?.(checked, row, 'singleRow')
                  }}
                />
                {'\u200B'}
              </div>
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.subtitle.attributes.files[0]?.file_name || '', {
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
      // https://github.com/TanStack/table/discussions/5164#discussioncomment-9478554
      cell: function Cell({ cell, getValue }) {
        const value = getValue()
        /* eslint-disable react-compiler/react-compiler */
        const ref = useRef<HTMLDivElement>(null)
        const [isEllipsisActive, handleOnMouseOver] = useIsEllipsisActive<HTMLButtonElement>()
        /* eslint-enable react-compiler/react-compiler */
        const className = 'tracking-[.04em] text-sm'
        const rootRect = root.current?.getBoundingClientRect()
        const refRect = ref.current?.getBoundingClientRect()
        let maxWidth = 0
        if (rootRect && refRect) {
          maxWidth = rootRect.x + rootRect.width - refRect.x + 12 - 4
        }
        return (
          <TableDataCell
            cell={cell}
          >
            <Div
              className="cursor-text py-1 pr-px pl-2.5"
              onClick={(ev) => ev.stopPropagation()}
            >
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
            </Div>
          </TableDataCell>
        )
      },
    }),
  ]
}

/// keep-unique
const PAGE_SIZES = [4, 5, 10, 20, 40, 50, 100, 200] as const

const initialTableState: InitialTableState = {
  sorting: [
    {
      id: 'download_count',
      desc: true,
    },
  ],
  columnOrder: ['action', 'movie_name', 'language', 'upload_date', 'download_count'],
  pagination: {
    pageSize: findClosest(10, PAGE_SIZES),
    pageIndex: 0,
  },
}

export function MovieSubtitleFiles({
  id,
}: {
  id: number
}) {
  const [language] = useAtom(osLanguageAtom)
  const { data, isFetching, refetch } = useOpenSubtitlesSubtitles({
    type: 'movie',
    tmdb_id: id,
    languages: language,
    per_page: 100,
  })
  return (
    <>
      <div>
        <div className="flex h-9 gap-2 p-1.5">
          <RefetchButton
            refetch={refetch}
            isFetching={isFetching}
          />
        </div>
      </div>
      <SubtitleFiles
        id={id}
        subtitleData={data ?? []}
      />
    </>
  )
}

function SubtitleFiles({
  id,
  subtitleData,
}: {
  id: number
  subtitleData: Subtitles['Response']['data']
}) {
  'use no memo'
  const { t } = useTranslation()
  const commonColumns = useCommonColumns<MovieSubtitleData>()
  const rootRef = useRef<HTMLDivElement>(null)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const movieColumns = useMovieColumns(rootRef, tbodyRef)
  const columns = [...commonColumns, ...movieColumns]
  const [{ pagination, rowSelection }, setMediaSubtitleState] = useImmerAtom(mediaSubtitleAtomFamily(id))
  const table = useReactTable({
    data: subtitleData.map((subtitle) => ({
      subtitle,
    })),
    columns,
    initialState: omitUndefined(merge(initialTableState, omitUndefined({ pagination }))),
    state: {
      rowSelection,
    },
    autoResetPageIndex: false,
    getRowId: getFileId,
    getRowCanExpand: () => false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  const rowsFiltered = table.getFilteredRowModel().rows
  const tableState = table.getState()
  const { items } = usePagination({
    count: table.getPageCount(),
    page: tableState.pagination.pageIndex + 1,
  })
  function handleRowSelectionChange(...[checked, row, mode]: Parameters<RowSelectionChangeFn<SubtitleData>>) {
    setMediaSubtitleState((prev) => {
      if (mode === 'singleRow') {
        prev.rowSelection = {}
      } else if (mode === 'singleSubRow') {
        const subRows = row.getParentRow()?.subRows ?? []
        subRows.forEach(({ id }) => {
          prev.rowSelection[id] = false
        })
      }
      prev.rowSelection[row.id] = Boolean(checked)
    })
  }
  useUnmountEffect(() => {
    setMediaSubtitleState((draft) => {
      draft.pagination = tableState.pagination
    })
  })
  return (
    <>
      <>
        <>
          <div
            ref={rootRef}
            className="grow overflow-auto overflow-y-scroll"
          >
            <table className="relative border-separate border-spacing-0">
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
          <div className="flex flex-wrap items-center justify-between gap-0.5 border-t border-t-zinc-200 py-1 pr-0.5 tracking-[.03em] tabular-nums dark:border-neutral-800">
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
          <div className="flex justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-neutral-800">
            <div className="flex h-7 items-center text-xs tracking-[.03em] tabular-nums">
              <span>
                <NumberFlow
                  value={rowsFiltered.length}
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
