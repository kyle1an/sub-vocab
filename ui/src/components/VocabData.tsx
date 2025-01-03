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
import { useSessionStorage } from 'foxact/use-session-storage'

import type { LabelDisplayTable } from '@/lib/vocab'

import { AcquaintAllDialog } from '@/components/acquaint-all-dialog'
import { TablePagination } from '@/components/table-pagination'
import { TablePaginationSizeSelect } from '@/components/table-pagination-size-select'
import { TableHeaderCell, TableHeaderCellRender, TableRow } from '@/components/ui/tableHeader'
import { useVocabToggle } from '@/hooks/vocabToggle'
import { SortIcon } from '@/lib/icon-utils'
import { LEARNING_PHASE, type LearningPhase } from '@/lib/LabeledTire'
import { tryGetRegex } from '@/lib/regex'
import { findClosest } from '@/lib/utilities'

const columnHelper = createColumnHelper<LabelDisplayTable>()

type ColumnFilterFn = (rowValue: LabelDisplayTable) => boolean

const isUsingRegexAtom = atom(false)
const searchValueAtom = atom('')
const initialTableStateAtom = atom<Partial<TableState>>({})

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

function getAcquaintedStatusFilter(filterSegment: Segment): ColumnFilterFn {
  let filteredValue: LearningPhase[] = []
  if (filterSegment === 'new') {
    filteredValue = [LEARNING_PHASE.NEW, LEARNING_PHASE.RETAINING]
  } else if (filterSegment === 'allAcquainted' || filterSegment === 'mine' || filterSegment === 'top') {
    filteredValue = [LEARNING_PHASE.ACQUAINTED, LEARNING_PHASE.FADING]
  } else {
    return () => true
  }

  return (row) => filteredValue.includes(row.inertialPhase)
}

function getUserOwnedFilter(filterSegment: Segment): ColumnFilterFn {
  let filteredValue: boolean[] = []
  if (filterSegment === 'top') {
    filteredValue = [false]
  } else if (filterSegment === 'mine') {
    filteredValue = [true]
  } else {
    return () => true
  }

  return (row) => filteredValue.includes(row.vocab.isUser)
}

const PAGE_SIZES = [10, 20, 40, 50, 100, 200, 1000] as const

function useColumns() {
  const { t } = useTranslation()
  const handleVocabToggle = useVocabToggle()
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
                className="select-none pl-2 pr-1"
                onClick={header.column.getToggleSortingHandler()}
              >
                <span
                  title={title}
                  className={cn('grow text-right stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold' : '')}
                >
                  {title}
                </span>
                <SortIcon isSorted={isSorted} />
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
              <Div className="justify-center tabular-nums stretch-[condensed]">
                {value ? formatDistanceToNowStrict(new Date(value)) : null}
              </Div>
            </TableDataCell>
          )
        },
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => row.vocab.word, {
        id: 'word',
        filterFn: (row, columnId, fn: ColumnFilterFn) => fn(row.original),
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          const title = t('Word')
          return (
            <TableHeaderCell
              header={header}
              className="active:bg-background-active"
            >
              <Div
                className="group gap-2 pr-1"
                onClick={header.column.getToggleSortingHandler()}
              >
                <Separator
                  orientation="vertical"
                  className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
                />
                <div
                  className="float-right flex grow select-none items-center"
                >
                  <span
                    title={title}
                    className={cn(
                      'grow text-left stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]',
                      isSorted ? 'font-semibold' : '',
                    )}
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
          const { wFamily } = row.original
          const last = wFamily.length - 1
          return (
            <TableDataCell
              cell={cell}
            >
              <>
                {wFamily.map((w, i) => (
                  <div
                    key={w}
                    className="inline-block cursor-text select-text pl-1.5 tracking-wider ffs-['cv03','cv05','cv06'] first:pl-2.5"
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    <span className={cn(i === 0 ? '' : 'text-neutral-500 dark:text-slate-400')}>{w}</span>
                    {i < last && <span className="text-neutral-500 dark:text-slate-400">, </span>}
                  </div>
                ))}
              </>
            </TableDataCell>
          )
        },
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => row.vocab.word.length, {
        id: 'word.length',
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          const title = t('length')
          return (
            <TableHeaderCell
              header={header}
              className="w-[.1%] active:bg-background-active"
            >
              <Div
                className="group select-none gap-2 pr-1 stretch-[condensed]"
                onClick={header.column.getToggleSortingHandler()}
              >
                <Separator
                  orientation="vertical"
                  className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
                />
                <div className="flex items-center">
                  <span
                    title={title}
                    className={cn('grow text-right before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold' : '')}
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
              <Div className="justify-end pr-[9px] text-xs tabular-nums">
                <span>
                  {value}
                </span>
              </Div>
            </TableDataCell>
          )
        },
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => {
        return row.vocab.learningPhase <= 1 ? row.vocab.learningPhase : row.inertialPhase
      }, {
        id: 'acquaintedStatus',
        filterFn: (row, columnId, fn: ColumnFilterFn) => fn(row.original),
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <TableHeaderCell
              header={header}
              className="w-[.1%] active:bg-background-active"
            >
              <Div
                className="group select-none stretch-[condensed]"
                onClick={header.column.getToggleSortingHandler()}
              >
                <Separator
                  orientation="vertical"
                  className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
                />
                <div className="flex min-w-[30px] grow items-center justify-center">
                  <SortIcon
                    isSorted={isSorted}
                    className=""
                    fallback={<IconLucideCheckCircle />}
                  />
                </div>
              </Div>
            </TableHeaderCell>
          )
        },
        cell: ({ row, cell, getValue }) => (
          <TableDataCell
            cell={cell}
          >
            <Div className="justify-center">
              <VocabToggle
                vocab={row.original.vocab}
                onToggle={handleVocabToggle}
              />
            </Div>
          </TableDataCell>
        ),
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => row.vocab.isUser, {
        id: 'userOwned',
        filterFn: (row, columnId, fn: ColumnFilterFn) => fn(row.original),
      }),
      columnHelper.accessor((row) => row.vocab.rank, {
        id: 'rank',
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          const title = t('rank')
          return (
            <TableHeaderCell
              header={header}
              className="w-[.1%] active:bg-background-active"
            >
              <Div
                className="group select-none gap-2 pr-1"
                onClick={header.column.getToggleSortingHandler()}
              >
                <Separator
                  orientation="vertical"
                  className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
                />
                <div className="flex items-center">
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
        cell: ({ cell, getValue }) => {
          const value = getValue()
          return (
            <TableDataCell
              cell={cell}
            >
              <Div className="justify-center tabular-nums stretch-[condensed]">
                {value}
              </Div>
            </TableDataCell>
          )
        },
        footer: ({ column }) => column.id,
      }),
    ]
  )
}

export function VocabDataTable({
  data,
  onPurge,
  className = '',
}: {
  data: LabelDisplayTable[]
  onPurge: () => void
  className?: string
}) {
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useAtom(searchValueAtom)
  const [isUsingRegex, setIsUsingRegex] = useAtom(isUsingRegexAtom)
  const [initialTableState, setInitialTableState] = useAtom(initialTableStateAtom)
  const columns = useColumns()
  const segments = useSegments()
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'allAcquainted')
  const [isSegmentTransitioning, startSegmentTransition] = useTransition()

  const pagination = initialTableState.pagination ?? {
    pageSize: findClosest(100, PAGE_SIZES),
    pageIndex: 0,
  }
  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination,
      columnFilters: [
        {
          id: 'acquaintedStatus',
          value: getAcquaintedStatusFilter(segment),
        },
        {
          id: 'userOwned',
          value: getUserOwnedFilter(segment),
        },
      ],
      columnVisibility: {
        userOwned: false,
      },
      ...initialTableState,
    },
    autoResetPageIndex: false,
    getRowCanExpand: () => false,
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
    table.getColumn('userOwned')?.setFilterValue(() => getUserOwnedFilter(newSegment))
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
    setInitialTableState(tableState)
  })

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
      <div className="w-full grow overflow-auto overflow-y-scroll overscroll-contain">
        <table className="min-w-full border-separate border-spacing-0">
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
            {table.getRowModel().rows.map((row) => {
              return (
                <TableRow
                  key={row.original.vocab.word}
                  row={row}
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
          <div className="flex items-center">
            <TablePaginationSizeSelect
              table={table}
              sizes={PAGE_SIZES}
              value={tableState.pagination.pageSize}
              defaultValue={String(pagination.pageSize)}
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
