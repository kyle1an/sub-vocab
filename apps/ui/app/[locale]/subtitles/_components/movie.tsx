import type { CellContext, InitialTableState, RowData } from '@tanstack/react-table'

import usePagination from '@mui/material/usePagination'
import NumberFlow from '@number-flow/react'
import { useUnmountEffect } from '@react-hookz/web'
import { createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import clsx from 'clsx'
import { useAtom, useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import nstr from 'nstr'
import { Fragment, useRef } from 'react'

import type { Subtitles } from '@/app/[locale]/subtitles/_api/os'
import type { SubtitleData } from '@/app/[locale]/subtitles/_components/columns'
import type { RowSelectionChangeFn } from '@/types/utils'

import { openSubtitlesSubtitlesAtom } from '@/app/[locale]/subtitles/_api/os'
import { buildMediaSubtitleState, mediaSubtitleFamily, osLanguageAtom } from '@/app/[locale]/subtitles/_atoms'
import { useCommonColumns } from '@/app/[locale]/subtitles/_components/columns'
import { RefetchButton } from '@/app/[locale]/subtitles/_components/menu-items'
import { getFileId } from '@/app/[locale]/subtitles/_utils'
import { SortIcon } from '@/components/my-icon/sort-icon'
import { TableGoToLastPage } from '@/components/my-table/go-to-last-page'
import { TablePagination } from '@/components/my-table/pagination'
import { TablePaginationSizeSelect } from '@/components/my-table/pagination-size-select'
import { Checkbox } from '@/components/ui/checkbox'
import { Div } from '@/components/ui/html-elements'
import { Separator } from '@/components/ui/separator'
import { HeaderTitle, TableDataCell, TableHeader, TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/table-element'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { filterFn, sortBySelection } from '@/lib/table-utils'
import { useI18n } from '@/locales/client'
import { useClone, useIsEllipsisActive, useRect } from '@sub-vocab/utils/hooks'
import { findClosest } from '@sub-vocab/utils/lib'

type MovieSubtitleData = SubtitleData

function useMovieColumns<T extends MovieSubtitleData>(rootRef: React.RefObject<HTMLDivElement | null>, tbodyRef: React.RefObject<HTMLTableSectionElement | null>) {
  const t = useI18n()
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
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
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
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
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
          <MovieNameCell
            {...ctx}
            rootRef={rootRef}
            tbodyRef={tbodyRef}
          />
        )
      },
    }),
  ]
}

function MovieNameCell<TData extends RowData>({
  rootRef,
  tbodyRef,
  cell,
  getValue,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>
  tbodyRef: React.RefObject<HTMLTableSectionElement | null>
} & CellContext<TData, string>) {
  const value = getValue()
  const ref = useRef<HTMLDivElement>(null)
  const [isEllipsisActive, handleOnMouseOver] = useIsEllipsisActive<HTMLButtonElement>()
  const { x: rootX, width: rootWidth } = useRect(rootRef)
  const { x: refX } = useRect(ref)
  const className = 'tracking-[.04em] text-sm'
  const maxWidth = rootX + rootWidth - refX + 12 - 4
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
              container={tbodyRef.current}
              side="bottom"
              sideOffset={-21 - 1}
              align="start"
              alignOffset={-8 - 1}
              avoidCollisions={false}
              hidden={!isEllipsisActive}
              className="max-w-(--max-width) border bg-background px-2 py-px text-foreground shadow-xs slide-in-from-top-0! zoom-in-100! zoom-out-100! [word-wrap:break-word] **:[[data-slot=tooltip-arrow]]:hidden!"
              style={{
                '--max-width': `${nstr(maxWidth)}px`,
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
}

/// keep-unique
const PAGE_SIZES = [4, 5, 10, 20, 40, 50, 100, 200] as const

export function MovieSubtitleFiles({
  id,
}: {
  id: number
}) {
  const [language] = useAtom(osLanguageAtom)
  const { data, isFetching, refetch } = useAtomValue(openSubtitlesSubtitlesAtom({
    type: 'movie',
    tmdb_id: id,
    languages: language,
    per_page: 100,
  }))
  return (
    <Fragment>
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
    </Fragment>
  )
}

function SubtitleFiles({
  id,
  subtitleData,
}: {
  id: number
  subtitleData: Subtitles['Response']['data']
}) {
  const t = useI18n()
  const rootRef = useRef<HTMLDivElement>(null)
  const commonColumns = useCommonColumns<MovieSubtitleData>(rootRef)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const movieColumns = useMovieColumns(rootRef, tbodyRef)
  const columns = [...commonColumns, ...movieColumns]
  const [{ initialTableState: mediaInitialTableState, tableState: mediaTableState }, setMediaSubtitleState] = useImmerAtom(mediaSubtitleFamily([
    id,
    buildMediaSubtitleState({
      initialTableState: {
        sorting: [
          {
            id: 'download_count',
            desc: true,
          },
        ],
        columnOrder: ['action', 'movie_name', 'language', 'upload_date', 'download_count'],
        pagination: {
          pageSize: findClosest(10, PAGE_SIZES),
        },
      } satisfies InitialTableState,
    }),
  ]))
  const table = useClone(useReactTable({
    data: subtitleData.map((subtitle) => ({
      subtitle,
    })),
    columns,
    initialState: mediaInitialTableState,
    state: mediaTableState,
    autoResetPageIndex: false,
    getRowId: getFileId,
    getRowCanExpand: () => false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
  }))
  const rowsFiltered = table.getFilteredRowModel().rows
  const tableState = table.getState()
  const { items } = usePagination({
    count: table.getPageCount(),
    page: tableState.pagination.pageIndex + 1,
  })
  const handleRowSelectionChange: RowSelectionChangeFn<SubtitleData> = (checked, row, mode) => {
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
          <div
            ref={rootRef}
            className="grow overflow-auto overflow-y-scroll"
          >
            <table className="relative border-separate border-spacing-0">
              <TableHeader>
                {useClone(table.getHeaderGroups()).map((headerGroup) => (
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
                {useClone(table.getRowModel().rows).map((row) => {
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
              rootRef={rootRef}
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
        </Fragment>
      </Fragment>
    </Fragment>
  )
}
