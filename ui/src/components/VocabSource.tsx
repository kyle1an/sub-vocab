import usePagination from '@mui/material/usePagination'
import { useUnmountEffect } from '@react-hookz/web'
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type TableState,
  useReactTable,
} from '@tanstack/react-table'
import {
  useTranslation,
} from 'react-i18next'
import { useSessionStorage } from 'react-use'

import type { LabelDisplaySource } from '@/lib/vocab'

import { TablePagination } from '@/components/table-pagination'
import { TablePaginationSizeSelect } from '@/components/table-pagination-size-select'
import { TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/tableHeader'
import { AcquaintAllDialog } from '@/components/vocabulary/acquaint-all-dialog'
import { useVocabularyCommonColumns } from '@/components/vocabulary/columns'
import { Examples } from '@/components/vocabulary/Examples'
import { SortIcon } from '@/lib/icon-utils'
import { LEARNING_PHASE, type LearningPhase } from '@/lib/LabeledTire'
import { tryGetRegex } from '@/lib/regex'
import { findClosest } from '@/lib/utilities'

type ColumnFilterFn = (rowValue: LabelDisplaySource) => boolean

const PAGE_SIZES = [10, 20, 40, 50, 100, 200, 1000] as const

const isUsingRegexAtom = atom(false)
const searchValueAtom = atom('')
const tableInitialStateAtom = atom({
  columnOrder: ['frequency', 'word', 'word.length', 'acquaintedStatus', 'rank'],
  pagination: {
    pageSize: findClosest(100, PAGE_SIZES),
    pageIndex: 0,
  },
} satisfies Partial<TableState>)

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

function getAcquaintedStatusFilter(filterSegment: Segment): ColumnFilterFn {
  let filteredValue: LearningPhase[] = []
  if (filterSegment === 'new') {
    filteredValue = [LEARNING_PHASE.NEW, LEARNING_PHASE.RETAINING]
  } else if (filterSegment === 'acquainted') {
    filteredValue = [LEARNING_PHASE.ACQUAINTED, LEARNING_PHASE.FADING]
  } else {
    return () => true
  }

  return (row) => filteredValue.includes(row.inertialPhase)
}

function useSourceColumns<T extends LabelDisplaySource>() {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  return (
    [
      columnHelper.accessor((row) => row.locations.length, {
        id: 'frequency',
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
                <div className="flex grow items-center">
                  <span
                    title={title}
                    className={cn('grow text-right stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold' : '')}
                  >
                    {title}
                  </span>
                  <SortIcon isSorted={isSorted} />
                </div>
              </Div>
            </TableHeaderCell>
          )
        },
        cell: ({ row, cell, getValue }) => {
          const value = getValue()
          return (
            <TableDataCell
              cell={cell}
            >
              <Div className="text-zinc-400">
                {row.getCanExpand() ? (
                  <button
                    type="button"
                    className={cn(
                      'expand-button',
                      'flex h-full grow items-center justify-between gap-1 px-3',
                    )}
                  >
                    <IconLucideChevronRight
                      className={cn(
                        'size-[14px] text-zinc-400 transition-transform duration-200 dark:text-zinc-500',
                        row.getIsExpanded() ? 'rotate-90' : '',
                      )}
                    />
                    <span className="float-right inline-block tabular-nums stretch-[condensed]">
                      {value}
                    </span>
                  </button>
                ) : (
                  <div className="w-full justify-end px-3">
                    <span className="float-right inline-block tabular-nums stretch-[condensed]">
                      {value}
                    </span>
                  </div>
                )}
              </Div>
            </TableDataCell>
          )
        },
        footer: ({ column }) => column.id,
      }),
    ]
  )
}

export function VocabSourceTable({
  data,
  sentences,
  onPurge,
  className = '',
}: {
  data: LabelDisplaySource[]
  sentences: string[]
  onPurge: () => void
  className?: string
}) {
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useAtom(searchValueAtom)
  const [isUsingRegex, setIsUsingRegex] = useAtom(isUsingRegexAtom)
  const [tableInitialState, setTableInitialState] = useAtom(tableInitialStateAtom)
  const vocabularyCommonColumns = useVocabularyCommonColumns<LabelDisplaySource>()
  const sourceColumns = useSourceColumns()
  const columns = [...vocabularyCommonColumns, ...sourceColumns]
  const segments = useSegments()
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'all')
  const [isSegmentTransitioning, startSegmentTransition] = useTransition()

  const table = useReactTable({
    data,
    columns,
    initialState: {
      columnFilters: [
        {
          id: 'acquaintedStatus',
          value: getAcquaintedStatusFilter(segment),
        },
      ],
      ...tableInitialState,
    },
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
    onPurge()
    setSegment(newSegment)
    requestAnimationFrame(() => {
      startSegmentTransition(() => {})
    })
    table.getColumn('acquaintedStatus')?.setFilterValue(() => getAcquaintedStatusFilter(newSegment))
  }

  const columnWord = table.getColumn('word')

  function handleSearchChange(search: string) {
    setSearchValue(search)
    updateSearchFilter(search, isUsingRegex)
  }

  function handleRegexChange(regex: boolean) {
    setIsUsingRegex(regex)
    updateSearchFilter(searchValue, regex)
  }

  function updateSearchFilter(search: string, usingRegex: boolean) {
    search = search.toLowerCase()
    if (usingRegex) {
      const newRegex = tryGetRegex(search)
      if (newRegex) {
        const regexFilterFn: ColumnFilterFn = (row) => newRegex.test(row.vocab.word)
        columnWord?.setFilterValue(() => regexFilterFn)
      }
    } else {
      const searchFilterFn: ColumnFilterFn = (row) => row.wFamily.some((word) => word.toLowerCase().includes(search))
      columnWord?.setFilterValue(() => searchFilterFn)
    }
  }

  const tableState = table.getState()
  const { items } = usePagination({
    count: table.getPageCount(),
    page: tableState.pagination.pageIndex + 1,
  })

  const rowsFiltered = table.getFilteredRowModel().rows
  const rowsAcquainted = rowsFiltered
    .filter((row) => row.original.vocab.learningPhase === LEARNING_PHASE.ACQUAINTED)
  const rowsNew = rowsFiltered
    .filter((row) => row.original.vocab.learningPhase === LEARNING_PHASE.NEW)
  const rowsToRetain = rowsNew
    .filter((row) => row.original.vocab.word.length <= 32)
    .map((row) => row.original.vocab)

  useUnmountEffect(() => {
    setTableInitialState(tableState)
  })
  const rootRef = useRef<HTMLDivElement>(null)

  return (
    <div className={cn('flex h-full flex-col items-center overflow-hidden bg-background will-change-transform', className)}>
      <div className="z-10 flex h-12 w-full justify-between bg-background p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex max-h-full gap-1 p-2 [--sq-r:5px]"
              variant="ghost"
            >
              <IconIonEllipsisHorizontalCircleOutline
                className="size-[19px]"
              />
              <IconLucideChevronDown
                className="size-[14px]"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-52"
            align="start"
          >
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
          </DropdownMenuContent>
        </DropdownMenu>
        <SearchWidget
          value={searchValue}
          isUsingRegex={isUsingRegex}
          onSearch={handleSearchChange}
          onRegex={handleRegexChange}
        />
      </div>
      <div className="h-px w-full border-b border-solid border-zinc-200 shadow-[0_0.4px_2px_0_rgb(0_0_0/0.05)] dark:border-slate-800" />
      <div className="w-full">
        <SegmentedControl
          value={segment}
          segments={segments}
          onChoose={handleSegmentChoose}
          variant="ghost"
        />
      </div>
      <div
        ref={rootRef}
        className="w-full grow overflow-auto overflow-y-scroll overscroll-contain"
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
                >
                  <Examples
                    sentences={sentences}
                    src={row.original.locations}
                    className="text-xs tracking-wide"
                  />
                </TableRow>
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
              defaultValue={String(tableInitialState.pagination.pageSize)}
            />
            <div className="whitespace-nowrap px-1 text-[.8125rem]">{`/${t('page')}`}</div>
          </div>
        </div>
      </div>
      <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-background dark:border-slate-800">
        <VocabStatics
          rowsCountFiltered={rowsFiltered.length}
          rowsCountNew={rowsNew.length}
          rowsCountAcquainted={rowsAcquainted.length}
          animated={!isSegmentTransitioning}
        />
      </div>
    </div>
  )
}
