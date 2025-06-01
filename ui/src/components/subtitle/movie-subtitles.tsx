import type { InitialTableState } from '@tanstack/react-table'

import usePagination from '@mui/material/usePagination'
import NumberFlow from '@number-flow/react'
import { createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import clsx from 'clsx'
import { useAtom } from 'jotai'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { Subtitles } from '@/api/opensubtitles'
import type { SubtitleData } from '@/components/subtitle/columns'

import { useOpenSubtitlesSubtitles } from '@/api/opensubtitles'
import { useCommonColumns } from '@/components/subtitle/columns'
import { RefetchButton } from '@/components/subtitle/menu-items'
import { TablePagination } from '@/components/table-pagination'
import { TablePaginationSizeSelect } from '@/components/table-pagination-size-select'
import { Checkbox } from '@/components/ui/checkbox'
import { Div } from '@/components/ui/html-elements'
import { Separator } from '@/components/ui/separator'
import { HeaderTitle, TableDataCell, TableHeader, TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/table-element'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsEllipsisActive } from '@/hooks/useIsEllipsisActive'
import { SortIcon } from '@/lib/icon-utils'
import { getFileId } from '@/lib/subtitle'
import { getFilterFn, sortBySelection } from '@/lib/table-utils'
import { findClosest } from '@/lib/utilities'
import { osLanguageAtom, subtitleSelectionStateFamily } from '@/store/useVocab'

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
            className="w-[.1%] [&:active:has(.child:not(:active))+th]:signal/active [&:active:has(.child:not(:active))]:signal/active"
          >
            <Div
              className="select-none justify-between gap-1 pl-2 pr-1 signal/active:bg-background-active"
              onClick={header.column.getToggleSortingHandler()}
            >
              <div className="child flex [font-stretch:condensed]" />
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
                  'flex h-full grow items-center justify-between pl-2 pr-1',
                  canExpand && 'cursor-pointer',
                )}
              >
                <Checkbox
                  variant="radio"
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
      cell({ cell, getValue }) {
        const value = getValue()
        /* eslint-disable react-compiler/react-compiler */
        /* eslint-disable react-hooks/rules-of-hooks */
        const [ref, isEllipsisActive] = useIsEllipsisActive<HTMLDivElement>()
        /* eslint-enable react-compiler/react-compiler */
        /* eslint-enable react-hooks/rules-of-hooks */
        const className = 'tracking-wider text-sm'
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
              className="cursor-text select-text pl-2.5 pr-px tracking-wider"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div
                ref={ref}
                className="w-0 grow overflow-hidden overflow-ellipsis whitespace-nowrap"
              >
                <Tooltip
                  delayDuration={500}
                >
                  <TooltipTrigger asChild>
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
                    className="max-w-[var(--max-width)] border bg-background px-2 py-px text-foreground shadow-sm !zoom-in-100 !zoom-out-100 !slide-in-from-top-0 [word-wrap:break-word]"
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
  'use no memo'
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
  const [rowSelection = {}, setRowSelection] = useAtom(subtitleSelectionStateFamily(id))
  const table = useReactTable({
    data: subtitleData.map((subtitle) => ({
      subtitle,
    })),
    columns,
    initialState: initialTableState,
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
    debugTable: true,
  })
  const rowsFiltered = table.getFilteredRowModel().rows
  const tableState = table.getState()
  const { items } = usePagination({
    count: table.getPageCount(),
    page: tableState.pagination.pageIndex + 1,
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
                      onRowSelectionChange={setRowSelection}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-0.5 border-t border-t-zinc-200 py-1 pr-0.5 tabular-nums dark:border-neutral-800">
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
          <div className="flex justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-neutral-800">
            <div className="flex h-7 items-center text-xs tabular-nums">
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
