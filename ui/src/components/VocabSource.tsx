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
import clsx from 'clsx'
import { useAtom, useAtomValue } from 'jotai'
import { atomWithImmer } from 'jotai-immer'
import { atomWithStorage } from 'jotai/utils'
import { startTransition, useDeferredValue, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSessionStorage } from 'react-use'
import { toast } from 'sonner'
import IconIconoirSparks from '~icons/iconoir/sparks'
import IconLucideChevronRight from '~icons/lucide/chevron-right'
import IconLucideLoader from '~icons/lucide/loader'

import type { LearningPhase, Sentence } from '@/lib/LabeledTire'
import type { ColumnFilterFn } from '@/lib/table-utils'
import type { Category, LabelDisplaySource } from '@/lib/vocab'

import { useTRPC } from '@/api/trpc'
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter'
import { SearchWidget } from '@/components/search-widget'
import { TablePagination } from '@/components/table-pagination'
import { TablePaginationSizeSelect } from '@/components/table-pagination-size-select'
import { Button } from '@/components/ui/button'
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Div } from '@/components/ui/html-elements'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Spinner } from '@/components/ui/spinner'
import { HeaderTitle, TableDataCell, TableHeader, TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/table-element'
import { AcquaintAllDialog } from '@/components/vocabulary/acquaint-all-dialog'
import { useVocabularyCommonColumns } from '@/components/vocabulary/columns'
import { ExampleSentence } from '@/components/vocabulary/example-sentence'
import { VocabularyMenu } from '@/components/vocabulary/menu'
import { VocabStatics } from '@/components/vocabulary/vocab-statics-bar'
import { useLastTruthy } from '@/lib/hooks'
import { LEARNING_PHASE } from '@/lib/LabeledTire'
import { getFilterFn, noFilter } from '@/lib/table-utils'
import { findClosest, type } from '@/lib/utilities'
import { cn } from '@/lib/utils'
import { isSourceTextStaleAtom } from '@/store/useVocab'
import { searchFilterValue } from '@/utils/vocabulary/filters'

type TableData = LabelDisplaySource & Category

/// keep-unique
const PAGE_SIZES = [10, 20, 40, 50, 100, 200, 500, 1000] as const

const cacheStateAtom = atomWithImmer({
  isUsingRegex: false,
  searchValue: '',
  initialTableState: type<InitialTableState>({
    columnOrder: ['frequency', 'word', 'word.length', 'acquaintedStatus', 'rank'],
    pagination: {
      pageSize: findClosest(100, PAGE_SIZES),
      pageIndex: 0,
    },
  }),
  filterValue: type<Record<string, boolean>>({}),
})

function useSegments() {
  const { t } = useTranslation()
  return [
    { value: 'all', label: t('all') },
    { value: 'new', label: t('new') },
    { value: 'acquainted', label: t('acquainted') },
  ] as const
}

type Segment = ReturnType<typeof useSegments>[number]['value']
const SEGMENT_NAME = 'source-table-segment'

function acquaintedStatusFilter(filterSegment: Segment): (rowValue: TableData) => boolean {
  let filteredValue: LearningPhase[] = []
  if (filterSegment === 'new')
    filteredValue = [LEARNING_PHASE.NEW, LEARNING_PHASE.RETAINING]
  else if (filterSegment === 'acquainted')
    filteredValue = [LEARNING_PHASE.ACQUAINTED, LEARNING_PHASE.FADING]
  else
    return noFilter

  return (row) => filteredValue.includes(row.inertialPhase)
}

function categoryFilter(filterValue: Record<string, boolean>): ColumnFilterFn<TableData> {
  const categories = Object.entries(filterValue).filter(([k, v]) => v).map(([k]) => k)
  if (categories.length === 0)
    return noFilter

  return (row) => categories.includes(row.category || 'others')
}

function useSourceColumns<T extends TableData>() {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  return (
    [
      columnHelper.accessor((row) => row.locations.length, {
        id: 'frequency',
        filterFn: getFilterFn(),
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          const title = t('frequency')
          return (
            <TableHeaderCell
              header={header}
              className="w-[.1%] active:bg-background-active"
            >
              <Div
                className="min-w-[4.5rem] grow select-none gap-0.5 pl-2 pr-1"
                onClick={header.column.getToggleSortingHandler()}
              >
                <HeaderTitle
                  title={title}
                  isSorted={isSorted}
                  className="data-[title]:*:text-right"
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
              <Div className="pl-0.5 pr-px text-zinc-400">
                {row.getCanExpand() ? (
                  <button
                    type="button"
                    className="flex h-full grow items-center justify-between gap-1 px-3"
                    onClick={() => {
                      onExpandedChange?.(isExpanded)
                    }}
                  >
                    <IconLucideChevronRight
                      className={clsx(
                        'size-[14px] text-zinc-400 transition-transform duration-200 dark:text-zinc-500',
                        isExpanded ? 'rotate-90' : '',
                      )}
                    />
                    <span className="float-right inline-block tabular-nums [font-stretch:condensed]">
                      {value}
                    </span>
                  </button>
                ) : (
                  <div className="w-full justify-end px-3">
                    <span className="float-right inline-block tabular-nums [font-stretch:condensed]">
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
  [key in CategoryValue]?: string[]
}

const categoryAtom = atomWithStorage<VocabularyCategory>('categoryAtom', {})

function useCategorize(vocabularyCategory: VocabularyCategory, data: LabelDisplaySource[]) {
  const { t } = useTranslation()
  const { properName = [], acronym = [] } = vocabularyCategory

  return data.map((d) => {
    let category: string | null = null
    if (d.wFamily.some((w) => properName.includes(w.path)))
      category = 'properName'
    else if (d.wFamily.some((w) => acronym.includes(w.path)))
      category = 'acronym'

    return {
      ...d,
      category,
    }
  })
}

export function VocabSourceTable({
  data,
  sentences,
  onPurge: purgeVocabulary,
  className = '',
  onSentenceTrack,
}: {
  data: LabelDisplaySource[]
  sentences: Sentence[]
  onPurge: () => void
  className?: string
  onSentenceTrack: (sentenceId: number) => void
}) {
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'
  const [categoryAtomValue, setCategoryAtom] = useAtom(categoryAtom)
  const { t } = useTranslation()
  const [cacheState, setCacheState] = useAtom(cacheStateAtom)
  const { initialTableState, isUsingRegex, searchValue, filterValue } = cacheState
  const deferredSearchValue = useDeferredValue(searchValue)
  const deferredIsUsingRegex = useDeferredValue(isUsingRegex)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const vocabularyCommonColumns = useVocabularyCommonColumns<TableData>(tbodyRef)
  const sourceColumns = useSourceColumns<TableData>()
  const columns = [...vocabularyCommonColumns, ...sourceColumns]
  const segments = useSegments()
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'all')
  const segmentDeferredValue = useDeferredValue(segment)
  const lastTruthySearchFilterValue = useLastTruthy(searchFilterValue(deferredSearchValue, deferredIsUsingRegex))
  const isSourceTextStale = useAtomValue(isSourceTextStaleAtom)
  const [disableNumberAnim, setDisableNumberAnim] = useState(false)
  const finalData = useCategorize(categoryAtomValue, data)

  const table = useReactTable({
    data: finalData,
    columns,
    state: {
      columnFilters: [
        {
          id: 'acquaintedStatus',
          value: acquaintedStatusFilter(segmentDeferredValue),
        },
        {
          id: 'word',
          value: lastTruthySearchFilterValue ?? noFilter,
        },
        {
          id: 'frequency',
          value: categoryFilter(filterValue),
        },
      ],
    },
    initialState: initialTableState,
    autoResetPageIndex: false,
    getRowId: (row) => row.vocab.word,
    getRowCanExpand: (row) => sentences.length > 0 && row.original.locations.length > 0,
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
          purgeVocabulary()
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
  const rootRef = useRef<HTMLDivElement>(null)
  const isStale = isSourceTextStale || segment !== segmentDeferredValue || searchValue !== deferredSearchValue || isUsingRegex !== deferredIsUsingRegex
  const trpc = useTRPC()
  const { mutateAsync, isPending } = useMutation(trpc.ai.getCategory.mutationOptions({
    retry: 2,
  }))
  const options = [
    {
      label: 'Name',
      value: 'properName',
    },
    {
      label: 'Acronym',
      value: 'acronym',
    },
    {
      label: 'Others',
      value: 'others',
    },
  ]

  const freshVocabularies = data
    .filter((d) => d.vocab.learningPhase === LEARNING_PHASE.NEW && !d.vocab.rank)

  async function handleAiVocabCategorize() {
    if (!isPending) {
      const wordsString = freshVocabularies
        .map((d) => d.wFamily.map((w) => w.path))
        .flat()
        .join(',')
      const { data: category, error } = await mutateAsync({
        prompt: `
You are a REST API that receives an array of vocabulary items (strings) and must classify each item according to the following prioritized rules:

Common Word Exclusion:

First, check if the item is a standard English dictionary word—that is, if it has a clear, widely recognized meaning in common usage.
If it is a common dictionary word, exclude it from the output.
Acronym Identification:

If the item is not a dictionary word, determine if it is an acronym.
An acronym is a term formed from the initial letters (or a combination of letters) of a phrase. It is typically written in uppercase (or in a case-insensitive form) and does not form a standard dictionary word.
If the item meets these criteria, include it in the output under the "acronym" category.
Proper Noun Determination:

If the item is neither a dictionary word nor an acronym, decide whether it represents a specific proper noun (such as the name of a person, place, organization, or other uniquely identified entity).
Avoid treating simply capitalized words or generic titles as proper nouns.
If the item clearly functions as a proper noun, include it in the output under the "properName" category.
Omit Others:

If the item does not satisfy any of the above criteria, omit it from the final output.

The input array is provided as follows:
${wordsString}
`,
      })
      if (category) {
        setCategoryAtom(category)
      }
      else if (error) {
        toast.error(error.message, {
        })
      }
    }
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
        <Button
          className="aspect-square h-full p-0 [--sq-r:.8125rem]"
          variant="ghost"
          disabled={freshVocabularies.length === 0 || isPending}
          onClick={handleAiVocabCategorize}
        >
          {isPending ? (
            <IconLucideLoader
              className="size-[18px] animate-spin duration-1000 [animation-duration:2s]"
            />
          ) : (
            <IconIconoirSparks className="size-[18px]" />
          )}
        </Button>
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
      <div className="h-px w-full border-b border-solid border-zinc-200 shadow-[0_0.4px_2px_0_rgb(0_0_0/0.05)] dark:border-neutral-800" />
      <div className="z-10 w-full outline outline-1 outline-border">
        <SegmentedControl
          value={segment}
          segments={segments}
          onValueChange={handleSegmentChoose}
          variant="ghost"
        />
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
                    src={row.original.locations}
                    onSentenceTrack={onSentenceTrack}
                  />
                </TableRow>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex w-full flex-wrap items-center justify-between gap-0.5 border-t border-t-zinc-200 py-1 pr-0.5 tabular-nums dark:border-neutral-800">
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
      <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-neutral-800">
        <VocabStatics
          total={rowsFiltered.length}
          text={` ${t('vocabulary')}`}
          remaining={rowsNew.length}
          completed={rowsAcquainted.length}
          animated={!disableNumberAnim}
          progress
        />
      </div>
    </div>
  )
}
