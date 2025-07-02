import type { InitialTableState } from '@tanstack/react-table'

import usePagination from '@mui/material/usePagination'
import { useUnmountEffect } from '@react-hookz/web'
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
import { useAtom, useAtomValue } from 'jotai'
import { atomWithImmer } from 'jotai-immer'
import { startTransition, useDeferredValue, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSessionStorage } from 'react-use'
import IconIonRefresh from '~icons/ion/refresh'
import IconLucideLoader2 from '~icons/lucide/loader2'

import type { LearningPhase } from '@/lib/LabeledTire'
import type { ColumnFilterFn } from '@/lib/table-utils'
import type { LabelDisplayTable } from '@/lib/vocab'

import { statusLabels, userVocabularyAtom } from '@/api/vocab-api'
import { SearchWidget } from '@/components/search-widget'
import { TablePagination } from '@/components/table-pagination'
import { TablePaginationSizeSelect } from '@/components/table-pagination-size-select'
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Div } from '@/components/ui/html-elements'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Spinner } from '@/components/ui/spinner'
import { HeaderTitle, TableDataCell, TableHeader, TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/table-element'
import { AcquaintAllDialog } from '@/components/vocabulary/acquaint-all-dialog'
import { useVocabularyCommonColumns } from '@/components/vocabulary/columns'
import { VocabularyMenu } from '@/components/vocabulary/menu'
import { VocabStatics } from '@/components/vocabulary/vocab-statics-bar'
import { customFormatDistance, formatDistanceLocale } from '@/lib/date-utils'
import { customFormatDistanceToNowStrict } from '@/lib/formatDistance'
import { useLastTruthy } from '@/lib/hooks'
import { LEARNING_PHASE } from '@/lib/LabeledTire'
import { getFilterFn, noFilter } from '@/lib/table-utils'
import { findClosest, getFallBack, type } from '@/lib/utilities'
import { cn } from '@/lib/utils'
import { vocabRealtimeSyncStatusAtom } from '@/store/useVocab'
import { searchFilterValue } from '@/utils/vocabulary/filters'

type TableData = LabelDisplayTable

/// keep-unique
const PAGE_SIZES = [10, 20, 40, 50, 100, 200, 500, 1000] as const

const cacheStateAtom = atomWithImmer({
  isUsingRegex: false,
  searchValue: '',
  initialTableState: type<InitialTableState>({
    columnOrder: ['timeModified', 'word', 'word.length', 'acquaintedStatus', 'userOwned', 'rank'],
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
      userOwned: false,
    },
  }),
})

function useSegments() {
  const { t } = useTranslation()
  return [
    { value: 'new', label: t('recent') },
    { value: 'allAcquainted', label: t('all') },
    { value: 'mine', label: t('mine') },
    { value: 'top', label: t('top') },
  ] as const
}

type Segment = ReturnType<typeof useSegments>[number]['value']
const SEGMENT_NAME = 'data-table-segment'

function acquaintedStatusFilter(filterSegment: Segment): ColumnFilterFn<TableData> {
  let filteredValue: LearningPhase[] = []
  if (filterSegment === 'new')
    filteredValue = [LEARNING_PHASE.NEW, LEARNING_PHASE.RETAINING]
  else if (filterSegment === 'allAcquainted' || filterSegment === 'mine' || filterSegment === 'top')
    filteredValue = [LEARNING_PHASE.ACQUAINTED, LEARNING_PHASE.FADING]
  else
    return noFilter

  return (row) => filteredValue.includes(row.inertialPhase)
}

function userOwnedFilter(filterSegment: Segment): ColumnFilterFn<TableData> {
  let filteredValue: boolean[] = []
  if (filterSegment === 'top')
    filteredValue = [false]
  else if (filterSegment === 'mine')
    filteredValue = [true]
  else
    return noFilter

  return (row) => filteredValue.includes(row.vocab.isUser)
}

function useDataColumns<T extends TableData>() {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  return (
    [
      columnHelper.accessor((row) => row.vocab.timeModified, {
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
                onClick={header.column.getToggleSortingHandler()}
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
              <Div className="justify-end pr-2 pl-0.5 tracking-3 tabular-nums">
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
      columnHelper.accessor((row) => row.vocab.isUser, {
        id: 'userOwned',
        filterFn: getFilterFn(),
      }),
    ]
  )
}

export function VocabDataTable({
  data,
  onPurge,
  className = '',
}: {
  data: TableData[]
  onPurge: () => void
  className?: string
}) {
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'
  const { t } = useTranslation()
  const [cacheState, setCacheState] = useAtom(cacheStateAtom)
  const { initialTableState, isUsingRegex, searchValue } = cacheState
  const deferredSearchValue = useDeferredValue(searchValue)
  const deferredIsUsingRegex = useDeferredValue(isUsingRegex)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const vocabularyCommonColumns = useVocabularyCommonColumns<TableData>(tbodyRef)
  const dataColumns = useDataColumns()
  const columns = [...vocabularyCommonColumns, ...dataColumns]
  const segments = useSegments()
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'allAcquainted')
  const segmentDeferredValue = useDeferredValue(segment)
  const [disableNumberAnim, setDisableNumberAnim] = useState(false)
  const lastTruthySearchFilterValue = useLastTruthy(searchFilterValue(deferredSearchValue, deferredIsUsingRegex)) ?? noFilter
  const { refetch, isFetching: isLoadingUserVocab } = useAtomValue(userVocabularyAtom)

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters: [
        {
          id: 'acquaintedStatus',
          value: acquaintedStatusFilter(segmentDeferredValue),
        },
        {
          id: 'userOwned',
          value: userOwnedFilter(segmentDeferredValue),
        },
        {
          id: 'word',
          value: lastTruthySearchFilterValue,
        },
      ],
    },
    initialState: initialTableState,
    autoResetPageIndex: false,
    getRowId: (row) => row.vocab.word,
    getRowCanExpand: () => false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  })

  function handleSegmentChoose(newSegment: typeof segment) {
    setSegment(newSegment)
    requestAnimationFrame(() => {
      startTransition(() => {
        setDisableNumberAnim(true)
        requestAnimationFrame(() => {
          setDisableNumberAnim(false)
          onPurge()
        })
      })
    })
  }

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
    switch (row.original.vocab.learningPhase) {
      case LEARNING_PHASE.ACQUAINTED:
        return 'rowsAcquainted'
      case LEARNING_PHASE.NEW:
        return 'rowsNew'
      default:
        return '_'
    }
  })
  const rowsToRetain = rowsNew
    .map((row) => row.original.vocab)

  useUnmountEffect(() => {
    setCacheState({
      ...cacheState,
      initialTableState: tableState,
    })
  })
  const isStale = segment !== segmentDeferredValue || searchValue !== deferredSearchValue || isUsingRegex !== deferredIsUsingRegex
  const [vocabRealtimeSubscribeState] = useAtom(vocabRealtimeSyncStatusAtom)

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
                requestAnimationFrame(() => refetch())
              }}
            >
              <IconLucideLoader2
                className={clsx(
                  'size-3.5 animate-spin',
                  isLoadingUserVocab ? '' : 'hidden',
                )}
              />
              <IconIonRefresh
                className={clsx(
                  'size-3.5',
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
                {getFallBack(vocabRealtimeSubscribeState ?? '', statusLabels)}
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
              'flex justify-center transition-all delay-300 duration-200',
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
        />
      </div>
      <div className="h-px w-full border-b shadow-[0_0.4px_2px_0_rgb(0_0_0/0.05)]" />
      <div className="w-full">
        <SegmentedControl
          value={segment}
          segments={segments}
          onValueChange={handleSegmentChoose}
          variant="ghost"
        />
      </div>
      <div
        className="w-full grow overflow-auto overflow-y-scroll overscroll-contain [scrollbar-width:thin]"
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
      </div>
      <div className="flex w-full flex-wrap items-center justify-between gap-0.5 border-t border-t-zinc-200 py-1 pr-0.5 tracking-3 tabular-nums dark:border-neutral-800">
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
        <VocabStatics
          total={rowsFiltered.length}
          text={` ${t('vocabulary')}`}
          remaining={rowsNew.length}
          completed={rowsAcquainted.length}
          animated={!disableNumberAnim}
        />
      </div>
    </div>
  )
}
