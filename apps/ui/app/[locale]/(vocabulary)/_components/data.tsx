import type { InitialTableState } from '@tanstack/react-table'

import usePagination from '@mui/material/usePagination'
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { identity } from 'es-toolkit'
import { useSessionStorage } from 'foxact/use-session-storage'
import { atom, useAtom, useAtomValue, useStore } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { startTransition, useDeferredValue, useRef, useState } from 'react'

import type { LearningPhase } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'
import type { VocabularySourceData, VocabularySourceState } from '@/app/[locale]/(vocabulary)/_lib/vocab'
import type { ColumnFilterFn } from '@/lib/table-utils'

import { STATUS_LABELS, userVocabularyAtom } from '@/app/[locale]/(vocabulary)/_api'
import { vocabSubscriptionAtom } from '@/app/[locale]/(vocabulary)/_atoms'
import { AcquaintAllDialog } from '@/app/[locale]/(vocabulary)/_components/acquaint-all-dialog'
import { useVocabularyCommonColumns } from '@/app/[locale]/(vocabulary)/_components/columns'
import { VocabularyMenu } from '@/app/[locale]/(vocabulary)/_components/menu'
import { VocabStatics } from '@/app/[locale]/(vocabulary)/_components/statics-bar'
import { searchFilterValue } from '@/app/[locale]/(vocabulary)/_lib/filters'
import { LEARNING_PHASE } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'
import { useManagedVocabulary } from '@/app/[locale]/(vocabulary)/_lib/vocab-utils'
import { TableGoToLastPage } from '@/components/my-table/go-to-last-page'
import { TablePagination } from '@/components/my-table/pagination'
import { TablePaginationSizeSelect } from '@/components/my-table/pagination-size-select'
import { SearchWidget } from '@/components/search-widget'
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Div } from '@/components/ui/html-elements'
import { SegmentedControl, SegmentItem } from '@/components/ui/segmented-control'
import { Spinner } from '@/components/ui/spinner'
import { HeaderTitle, TableDataCell, TableHeader, TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/table-element'
import { combineFilters, noFilter } from '@/lib/table-utils'
import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'
import { useClone, useLastTruthy } from '@sub-vocab/utils/hooks'
import { customFormatDistance, customFormatDistanceToNowStrict, findClosest, formatDistanceLocale, getFallBack, isRegexValid } from '@sub-vocab/utils/lib'
import { narrow } from '@sub-vocab/utils/types'

type TableData = VocabularySourceState

/// keep-unique
const PAGE_SIZES = [10, 20, 40, 50, 100, 200, 500, 1000] as const

const cacheStateAtom = atom({
  isUsingRegex: false,
  searchValue: '',
})
const initialTableStateAtom = atom(identity<InitialTableState>({
  columnOrder: ['timeModified', 'word', 'word.length', 'acquaintedStatus', 'rank'],
  pagination: {
    pageSize: findClosest(100, PAGE_SIZES),
    pageIndex: 0,
  },
  sorting: [
    {
      id: 'timeModified',
      desc: true,
    },
  ],
  columnVisibility: {
  },
}))

function useSegments() {
  const t = useI18n()
  return narrow([
    { value: 'new', label: t('recent') },
    { value: 'allAcquainted', label: t('all') },
    { value: 'mine', label: t('mine') },
    { value: 'top', label: t('top') },
  ])
}

type Segment = ReturnType<typeof useSegments>[number]['value']
const SEGMENT_NAME = 'data-table-segment'

function acquaintedStatusFilter(filterSegment: Segment): ColumnFilterFn<TableData> {
  let filteredValue: LearningPhase[] = []
  if (filterSegment === 'new') {
    filteredValue = [LEARNING_PHASE.NEW, LEARNING_PHASE.RETAINING]
  } else if (filterSegment === 'allAcquainted' || filterSegment === 'mine' || filterSegment === 'top') {
    filteredValue = [LEARNING_PHASE.ACQUAINTED, LEARNING_PHASE.FADING]
  } else {
    return noFilter
  }

  return (row) => filteredValue.includes(row.inertialPhase)
}

function userOwnedFilter(filterSegment: Segment): ColumnFilterFn<TableData> {
  let filteredValue: boolean[] = []
  if (filterSegment === 'top') {
    filteredValue = [false]
  } else if (filterSegment === 'mine') {
    filteredValue = [true]
  } else {
    return noFilter
  }

  return (row) => filteredValue.includes(row.trackedWord.isUser)
}

function useDataColumns<T extends TableData>(rootRef: React.RefObject<HTMLDivElement | null>) {
  const t = useI18n()
  const columnHelper = createColumnHelper<T>()
  return (
    [
      columnHelper.accessor((row) => row.trackedWord.timeModified, {
        id: 'timeModified',
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          const title = t('distance')
          return (
            <TableHeaderCell
              header={header}
              className="w-[12%] active:bg-background-active"
            >
              <Div
                className="pr-1 pl-2 select-none"
                onClick={(e) => {
                  header.column.getToggleSortingHandler()?.(e)
                  requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
                }}
              >
                <HeaderTitle
                  title={title}
                  isSorted={isSorted}
                  className="*:data-title:text-right"
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
              <Div className="justify-end pr-2 pl-0.5 tracking-[.03em] tabular-nums">
                {value ? customFormatDistanceToNowStrict(new Date(value), {
                  addSuffix: true,
                  locale: {
                    formatDistance: customFormatDistance(formatDistanceLocale),
                  },
                }) : null}
              </Div>
            </TableDataCell>
          )
        },
      }),
    ]
  )
}

export function VocabDataTable({
  data: rows,
  className = '',
}: {
  data: VocabularySourceData[]
  className?: string
}) {
  const [data, handlePurge] = useManagedVocabulary(rows)
  const t = useI18n()
  const [{ isUsingRegex, searchValue }, setCacheState] = useImmerAtom(cacheStateAtom)
  const deferredSearchValue = useDeferredValue(searchValue)
  const deferredIsUsingRegex = useDeferredValue(isUsingRegex)
  const [tbody, setTbody] = useState<HTMLTableSectionElement | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const vocabularyCommonColumns = useVocabularyCommonColumns<TableData>(tbody, rootRef)
  const dataColumns = useDataColumns(rootRef)
  const columns = [...vocabularyCommonColumns, ...dataColumns]
  const segments = useSegments()
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'allAcquainted')
  const segmentDeferredValue = useDeferredValue(segment)
  const lastTruthySearchFilterValue = useLastTruthy(searchFilterValue(deferredSearchValue, deferredIsUsingRegex))() ?? noFilter
  const inValidSearch = deferredIsUsingRegex && !isRegexValid(deferredSearchValue)
  const { refetch, isFetching: isLoadingUserVocab } = useAtomValue(userVocabularyAtom)
  const store = useStore()
  const table = useClone(useReactTable({
    data,
    columns,
    state: {
      columnFilters: [
        {
          id: 'word',
          value: combineFilters([
            acquaintedStatusFilter(segmentDeferredValue),
            userOwnedFilter(segmentDeferredValue),
            lastTruthySearchFilterValue,
          ]),
        },
      ],
    },
    initialState: store.get(initialTableStateAtom),
    autoResetPageIndex: false,
    getRowId: (row) => row.trackedWord.form,
    getRowCanExpand: () => false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onStateChange: (updater) => {
      // eslint-disable-next-line ts/no-use-before-define
      store.set(initialTableStateAtom, typeof updater === 'function' ? updater(tableState) : updater)
    },
    getSortedRowModel: getSortedRowModel(),
  }))

  const tableState = table.getState()
  const { items } = usePagination({
    count: table.getPageCount(),
    page: tableState.pagination.pageIndex + 1,
  })

  const rowsFiltered = table.getFilteredRowModel().rows
  const {
    rowsAcquainted = [],
    rowsNew = [],
  } = Object.groupBy(rowsFiltered, (row) => {
    switch (row.original.trackedWord.learningPhase) {
      case LEARNING_PHASE.ACQUAINTED:
        return 'rowsAcquainted'
      case LEARNING_PHASE.NEW:
        return 'rowsNew'
      default:
        return '_'
    }
  })
  const rowsToRetain = rowsNew
    .map((row) => row.original.trackedWord)

  const isStale = segment !== segmentDeferredValue || searchValue !== deferredSearchValue || isUsingRegex !== deferredIsUsingRegex
  const [vocabRealtimeSubscribeState] = useAtom(vocabSubscriptionAtom)

  return (
    <div className={cn('flex h-full flex-col items-center overflow-hidden bg-background will-change-transform', className)}>
      <div className="z-10 flex h-12 w-full justify-between bg-background p-2">
        <VocabularyMenu>
          <DropdownMenuLabel>{t('Options')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={isLoadingUserVocab}
              className="gap-3"
              onClick={(e) => {
                refetch()
              }}
            >
              <svg
                className={clsx(
                  'icon-[lucide--loader-2] size-3.5 animate-spin',
                  isLoadingUserVocab ? '' : 'hidden',
                )}
              />
              <svg
                className={clsx(
                  'icon-[ion--refresh] size-3.5',
                  isLoadingUserVocab ? 'hidden' : '',
                )}
              />
              <div>
                Refresh
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled
              className={clsx(
                'gap-3',
              )}
            >
              <div
                className="size-3.5"
              />
              <div>
                {getFallBack(vocabRealtimeSubscribeState ?? '', STATUS_LABELS)}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="justify-between p-0"
            >
              <AcquaintAllDialog
                vocabulary={rowsToRetain}
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </VocabularyMenu>
        <div className="flex items-center px-2.5 text-base">
          <div
            className={clsx(
              'flex justify-center transition-opacity delay-300 duration-200',
              isStale ? '' : 'opacity-0',
            )}
          >
            <Spinner
              variant="primary"
              size="sm"
            />
          </div>
        </div>
        <div className="grow"></div>
        <SearchWidget
          value={searchValue}
          isUsingRegex={isUsingRegex}
          onSearch={(v) => {
            setCacheState((draft) => {
              draft.searchValue = v
            })
          }}
          onRegex={(v) => {
            setCacheState((draft) => {
              draft.isUsingRegex = v
            })
          }}
          className={inValidSearch ? '!border-red-500' : ''}
        />
      </div>
      <div className="h-px w-full border-b border-border" />
      <div className="z-10 w-full bg-background">
        <SegmentedControl
          value={segment}
          onValueChange={(newSegment) => {
            setSegment(newSegment)
            startTransition(() => {
              handlePurge()
            })
          }}
          variant="ghost"
        >
          {segments.map((segment) => (
            <SegmentItem
              key={segment.value}
              segment={segment}
            />
          ))}
        </SegmentedControl>
      </div>
      <div
        ref={rootRef}
        className="z-1 w-full grow overflow-auto overflow-y-scroll overscroll-contain [scrollbar-width:thin]"
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
          <tbody
            ref={(element) => {
              setTbody(element)
            }}
          >
            {table.getRowModel().rows.map((row) => {
              return (
                <TableRow
                  key={row.id}
                  row={row}
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
      <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-neutral-800">
        <VocabStatics
          total={rowsFiltered.length}
          text={` ${t('vocabulary')}`}
          remaining={rowsNew.length}
          completed={rowsAcquainted.length}
        />
      </div>
    </div>
  )
}
