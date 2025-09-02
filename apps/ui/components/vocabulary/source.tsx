import type { InitialTableState } from '@tanstack/react-table'

import usePagination from '@mui/material/usePagination'
import { useUnmountEffect } from '@react-hookz/web'
import { useMutation } from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { TRPCClientError } from '@trpc/client'
import { $trycatch } from '@tszen/trycatch'
import clsx from 'clsx'
import { identity } from 'es-toolkit'
import { useSessionStorage } from 'foxact/use-session-storage'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { atomWithStorage } from 'jotai/utils'
import { startTransition, useDeferredValue, useRef } from 'react'
import { toast } from 'sonner'

import type { LearningPhase, Sentence } from '@/lib/LexiconTrie'
import type { ColumnFilterFn } from '@/lib/table-utils'
import type { VocabularySourceData, VocabularySourceState } from '@/lib/vocab'

import { isSourceTextStaleAtom } from '@/atoms/vocabulary'
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter'
import { TableGoToLastPage } from '@/components/my-table/go-to-last-page'
import { TablePagination } from '@/components/my-table/pagination'
import { TablePaginationSizeSelect } from '@/components/my-table/pagination-size-select'
import { SearchWidget } from '@/components/search-widget'
import { Button } from '@/components/ui/button'
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Div } from '@/components/ui/html-elements'
import { SegmentedControl, SegmentItem } from '@/components/ui/segmented-control'
import { Spinner } from '@/components/ui/spinner'
import { HeaderTitle, TableDataCell, TableHeader, TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/table-element'
import { AcquaintAllDialog } from '@/components/vocabulary/acquaint-all-dialog'
import { useVocabularyCommonColumns } from '@/components/vocabulary/columns'
import { ExampleSentence } from '@/components/vocabulary/example-sentence'
import { VocabularyMenu } from '@/components/vocabulary/menu'
import { VocabStatics } from '@/components/vocabulary/statics-bar'
import { LEARNING_PHASE } from '@/lib/LexiconTrie'
import { getCategory } from '@/lib/prompts/getCategory'
import { combineFilters, filterFn, noFilter } from '@/lib/table-utils'
import { cn } from '@/lib/utils'
import { useManagedVocabulary } from '@/lib/vocab-utils'
import { searchFilterValue } from '@/lib/vocabulary/filters'
import { useI18n } from '@/locales/client'
import { useTRPC } from '@/trpc/client'
import { useClone, useLastTruthy } from '@sub-vocab/utils/hooks'
import { findClosest, isRegexValid } from '@sub-vocab/utils/lib'
import { narrow } from '@sub-vocab/utils/types'

type TableData = VocabularySourceState & {
  category: string | null
}

/// keep-unique
const PAGE_SIZES = [10, 20, 40, 50, 100, 200, 500, 1000] as const

const cacheStateAtom = atom({
  isUsingRegex: false,
  searchValue: '',
  initialTableState: identity<InitialTableState>({
    columnOrder: ['frequency', 'word', 'word.length', 'acquaintedStatus', 'rank'],
    pagination: {
      pageSize: findClosest(100, PAGE_SIZES),
      pageIndex: 0,
    },
  }),
  filterValue: identity<Record<string, boolean>>({}),
})

function useSegments() {
  const t = useI18n()
  return narrow([
    { value: 'all', label: t('all') },
    { value: 'new', label: t('new') },
    { value: 'acquainted', label: t('acquainted') },
  ])
}

type Segment = ReturnType<typeof useSegments>[number]['value']
const SEGMENT_NAME = 'source-table-segment'

function acquaintedStatusFilter(filterSegment: Segment): ColumnFilterFn<TableData> {
  let filteredValue: LearningPhase[] = []
  if (filterSegment === 'new') {
    filteredValue = [LEARNING_PHASE.NEW, LEARNING_PHASE.RETAINING]
  } else if (filterSegment === 'acquainted') {
    filteredValue = [LEARNING_PHASE.ACQUAINTED, LEARNING_PHASE.FADING]
  } else {
    return noFilter
  }

  return (row) => filteredValue.includes(row.inertialPhase)
}

function categoryFilter(filterValue: Record<string, boolean>): ColumnFilterFn<TableData> {
  const categories = Object.entries(filterValue).filter(([, v]) => v).map(([k]) => k)
  if (categories.length === 0) {
    return noFilter
  }

  return (row) => categories.includes(row.category || 'others')
}

function useSourceColumns<T extends TableData>(rootRef: React.RefObject<HTMLDivElement | null>) {
  const t = useI18n()
  const columnHelper = createColumnHelper<T>()
  return (
    [
      columnHelper.accessor((row) => row.locators.length, {
        id: 'frequency',
        filterFn,
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          const title = t('frequency')
          return (
            <TableHeaderCell
              header={header}
              className="w-[.1%] active:bg-background-active"
            >
              <Div
                className="min-w-18 grow gap-0.5 pr-1 pl-2 select-none"
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
        cell: ({ row, cell, getValue, onExpandedChange }) => {
          const value = getValue()
          const isExpanded = row.getIsExpanded()
          return (
            <TableDataCell
              cell={cell}
            >
              <Div className="pr-px pl-0.5 text-zinc-400">
                {row.getCanExpand() ? (
                  <button
                    type="button"
                    className="flex h-full grow items-center justify-between gap-1 px-3"
                    onClick={() => {
                      onExpandedChange?.(isExpanded)
                    }}
                  >
                    <svg
                      className={clsx(
                        'icon-[lucide--chevron-right] size-3.5 text-zinc-400 transition-transform duration-200 dark:text-zinc-500',
                        isExpanded ? 'rotate-90' : '',
                      )}
                    />
                    <span className="float-right inline-block tracking-[.03em] tabular-nums">
                      {value}
                    </span>
                  </button>
                ) : (
                  <div className="w-full justify-end px-3">
                    <span className="float-right inline-block tracking-[.03em] tabular-nums">
                      {value}
                    </span>
                  </div>
                )}
              </Div>
            </TableDataCell>
          )
        },
      }),
    ]
  )
}

type CategoryValue = 'properName' | 'acronym'

type VocabularyCategory = {
  [K in CategoryValue]?: string[]
}

const categoryAtom = atomWithStorage<VocabularyCategory>('categoryAtom', {})

function useCategorize(vocabularyCategory: VocabularyCategory, data: VocabularySourceState[]) {
  const t = useI18n()
  const { properName = [], acronym = [] } = vocabularyCategory

  return data.map((d) => {
    let category: string | null = null
    if (d.wordFamily.some((w) => properName.includes(w.pathe))) {
      category = 'properName'
    } else if (d.wordFamily.some((w) => acronym.includes(w.pathe))) {
      category = 'acronym'
    }

    return {
      ...d,
      category,
    }
  })
}

export function VocabSourceTable({
  data: rows,
  sentences,
  className = '',
  onSentenceTrack,
}: {
  data: VocabularySourceData[]
  sentences: Sentence[]
  className?: string
  onSentenceTrack: (sentenceId: number) => void
}) {
  const [data, handlePurge] = useManagedVocabulary(rows)
  const [categoryAtomValue, setCategoryAtom] = useAtom(categoryAtom)
  const t = useI18n()
  const [{ initialTableState, isUsingRegex, searchValue, filterValue }, setCacheState] = useImmerAtom(cacheStateAtom)
  const deferredSearchValue = useDeferredValue(searchValue)
  const deferredIsUsingRegex = useDeferredValue(isUsingRegex)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const vocabularyCommonColumns = useVocabularyCommonColumns<TableData>(tbodyRef, rootRef)
  const sourceColumns = useSourceColumns<TableData>(rootRef)
  const columns = [...vocabularyCommonColumns, ...sourceColumns]
  const segments = useSegments()
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'all')
  const segmentDeferredValue = useDeferredValue(segment)
  const lastTruthySearchFilterValue = useLastTruthy(searchFilterValue(deferredSearchValue, deferredIsUsingRegex))() ?? noFilter
  const inValidSearch = deferredIsUsingRegex && !isRegexValid(deferredSearchValue)
  const isSourceTextStale = useAtomValue(isSourceTextStaleAtom)
  const categorizedData = useCategorize(categoryAtomValue, data)

  const preCategoryFilters = [
    acquaintedStatusFilter(segmentDeferredValue),
    lastTruthySearchFilterValue,
  ]
  const globalFilter = combineFilters(preCategoryFilters)
  const table = useClone(useReactTable({
    data: categorizedData,
    columns,
    state: {
      globalFilter,
      columnFilters: [
        {
          id: 'word',
          value: categoryFilter(filterValue),
        },
      ],
    },
    globalFilterFn: filterFn,
    initialState: initialTableState,
    autoResetPageIndex: false,
    getRowId: (row) => row.trackedWord.form,
    getRowCanExpand: (row) => sentences.length > 0 && row.original.locators.length > 0,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
  }))

  const tableState = table.getState()
  const { items } = usePagination({
    count: table.getPageCount(),
    page: tableState.pagination.pageIndex + 1,
  })

  const filteredRows = table.getFilteredRowModel().rows
  const preFilteredRows = table.getPreFilteredRowModel().rows
  const {
    rowsAcquainted = [],
    rowsNew = [],
  } = Object.groupBy(filteredRows, (row) => {
    switch (row.original.trackedWord.learningPhase) {
      case LEARNING_PHASE.ACQUAINTED:
        return 'rowsAcquainted'
      case LEARNING_PHASE.NEW:
        return 'rowsNew'
      default:
        return '_'
    }
  })
  const preCategoryFilteredRows = preFilteredRows.filter((row) => globalFilter(row.original))
  const {
    properName = [],
    acronym = [],
    others = [],
  } = Object.groupBy(preCategoryFilteredRows, (row) => {
    switch (row.original.category) {
      case 'properName':
        return 'properName'
      case 'acronym':
        return 'acronym'
      default:
        return 'others'
    }
  })
  const rowsToRetain = rowsNew
    .map((row) => row.original.trackedWord)

  useUnmountEffect(() => {
    setCacheState((draft) => {
      draft.initialTableState = tableState
    })
  })
  const isStale = isSourceTextStale || segment !== segmentDeferredValue || searchValue !== deferredSearchValue || isUsingRegex !== deferredIsUsingRegex
  const trpc = useTRPC()
  const { mutateAsync, isPending } = useMutation(trpc.ai.getCategory.mutationOptions({
    retry: 1,
  }))
  const options = [
    {
      label: 'Name',
      value: 'properName',
      count: properName.length,
    },
    {
      label: 'Acronym',
      value: 'acronym',
      count: acronym.length,
    },
    {
      label: 'Others',
      value: 'others',
      count: others.length,
    },
  ]

  const freshVocabularies = data
    .filter((d) => d.trackedWord.learningPhase === LEARNING_PHASE.NEW && !d.trackedWord.rank)

  const handleAiVocabCategorize = async () => {
    const words = freshVocabularies
      .filter((d) => !d.trackedWord.isBaseForm && !d.trackedWord.isUser && !d.trackedWord.rank)
      .map((d) => d.wordFamily.map((w) => w.pathe))
      .flat()
    const [value, error] = await $trycatch(mutateAsync({
      prompt: getCategory(words),
    }))
    let message: string
    if (error) {
      if (error.cause instanceof TRPCClientError) {
        message = error.cause.message
      } else {
        message = error.message
      }
    } else {
      const { data: category, error } = value
      if (error) {
        message = error.message
      } else {
        setCategoryAtom(category)
        return
      }
    }
    toast.error(message, {
      duration: Infinity,
    })
  }

  return (
    <div className={cn('flex h-full flex-col items-center overflow-hidden bg-background will-change-transform', className)}>
      <div className="z-10 flex h-12 w-full justify-between bg-background p-2">
        <VocabularyMenu>
          <DropdownMenuLabel>{t('Options')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="p-0"
            >
              <AcquaintAllDialog
                vocabulary={rowsToRetain}
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </VocabularyMenu>
        <div className="p-0.5"></div>
        <DataTableFacetedFilter
          title="Category"
          className="[--sq-r:.875rem]"
          options={options}
          filterValue={filterValue}
          onFilterChange={(v) => {
            setCacheState((draft) => {
              draft.filterValue = v
            })
          }}
        />
        <div className="p-0.5"></div>
        <Button
          className="aspect-square h-full p-0 [--sq-r:.8125rem]"
          variant="ghost"
          disabled={freshVocabularies.length === 0 || isPending}
          onClick={handleAiVocabCategorize}
          aria-label="ai categorize"
        >
          {isPending ? (
            <svg
              className="icon-[lucide--loader] size-4.5 animate-spin duration-1000 [animation-duration:2s]"
            />
          ) : (
            <svg className="icon-[iconoir--sparks] size-4.5" />
          )}
        </Button>
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
      <div className="h-px w-full border-b border-transparent shadow-[0_0.4px_2px_0_rgb(0_0_0/0.05)]" />
      <div className="z-10 w-full outline-1 outline-border outline-solid">
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
            {table.getRowModel().rows.map((row, index) => {
              return (
                <TableRow
                  key={row.id}
                  row={row}
                  root={rootRef}
                  index={index + 1}
                >
                  <ExampleSentence
                    sentences={sentences}
                    wordOccurrences={row.original.wordOccurrences}
                    onSentenceTrack={onSentenceTrack}
                  />
                </TableRow>
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
          total={filteredRows.length}
          text={` ${t('vocabulary')}`}
          remaining={rowsNew.length}
          completed={rowsAcquainted.length}
          progress
        />
      </div>
    </div>
  )
}
