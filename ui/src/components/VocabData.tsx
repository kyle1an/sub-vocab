import usePagination from '@mui/material/usePagination'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type TableState,
  useReactTable,
} from '@tanstack/react-table'
import { uniq } from 'lodash-es'
import { useSessionStorage, useUnmount } from 'react-use'

import type { LabelDisplayTable } from '@/lib/vocab'

import { TablePagination } from '@/components/table-pagination'
import { AcquaintAllDialog } from '@/components/VocabSource'
import { useVocabToggle } from '@/hooks/vocabToggle'
import { SortIcon } from '@/lib/icon-utils'
import { LEARNING_PHASE, type LearningPhase } from '@/lib/LabeledTire'
import { tryGetRegex } from '@/lib/regex'

const columnHelper = createColumnHelper<LabelDisplayTable>()

type ColumnFilterFn = (rowValue: LabelDisplayTable) => boolean

const isUsingRegexAtom = atom(false)
const searchValueAtom = atom('')
const tableStateAtom = atom<Partial<TableState>>({})

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

const PAGES = [10, 20, 40, 50, 100, 200, 1000] as const

function useColumns() {
  const { t } = useTranslation()
  const handleVocabToggle = useVocabToggle()
  return (
    [
      columnHelper.accessor((row) => row.vocab.timeModified, {
        id: 'timeModified',
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <th
              colSpan={header.colSpan}
              className={cn(
                'group/th w-[12%] whitespace-nowrap border-y border-solid border-y-zinc-200 p-0 text-sm font-normal text-zinc-500 active:bg-stone-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400',
              )}
            >
              <div
                className="float-right flex h-7 w-full cursor-pointer select-none items-center pl-2 pr-1"
                onClick={header.column.getToggleSortingHandler()}
              >
                <span
                  title={t('distance')}
                  className={cn('grow text-right text-xs stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold text-zinc-700' : '')}
                >
                  {t('distance')}
                </span>
                <SortIcon
                  isSorted={isSorted}
                />
              </div>
            </th>
          )
        },
        cell: ({ getValue }) => {
          const timeModified = getValue()
          return (
            <div className="float-right w-full text-center text-sm tabular-nums text-neutral-600 stretch-[condensed] dark:text-neutral-500">
              {timeModified ? formatDistanceToNowStrict(new Date(timeModified)) : null}
            </div>
          )
        },
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => row.vocab.word, {
        id: 'word',
        filterFn: (row, columnId, fn: ColumnFilterFn) => fn(row.original),
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <th
              colSpan={header.colSpan}
              className={cn(
                'group/th border-y border-solid border-y-zinc-200 p-0 text-sm font-normal active:bg-stone-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400',
              )}
            >
              <div
                className="group flex h-7 cursor-pointer items-center gap-2 pr-1"
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
                    title={t('Word')}
                    className={cn(
                      'grow text-left text-xs stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]',
                      isSorted ? 'font-semibold' : '',
                    )}
                  >
                    {t('Word')}
                  </span>
                  <SortIcon
                    isSorted={isSorted}
                  />
                </div>
              </div>
            </th>
          )
        },
        cell: ({ row }) => {
          const { wFamily } = row.original
          return (
            <>
              {wFamily.map((w, i) => (
                <div
                  key={w}
                  className="ml-1.5 inline-block cursor-text select-text text-sm tracking-wider text-black ffs-['cv03','cv05','cv06'] first:ml-2 dark:text-slate-300"
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <span className={cn(i !== 0 && 'text-neutral-500 dark:text-slate-600')}>{w}</span>
                  {i !== wFamily.length - 1 && <span className="text-neutral-300">, </span>}
                </div>
              ))}
            </>
          )
        },
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => row.vocab.word.length, {
        id: 'word.length',
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <th
              colSpan={header.colSpan}
              className={cn(
                'group/th w-[.1%] whitespace-nowrap border-y border-solid border-y-zinc-200 p-0 text-sm font-normal active:bg-stone-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400',
              )}
            >
              <div
                className="group float-right flex h-7 w-full cursor-pointer select-none items-center gap-2 pr-1 stretch-[condensed]"
                onClick={header.column.getToggleSortingHandler()}
              >
                <Separator
                  orientation="vertical"
                  className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
                />
                <div className="flex items-center">
                  <span
                    title={t('length')}
                    className={cn('grow text-right text-xs before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold' : '')}
                  >
                    {t('length')}
                  </span>
                  <SortIcon
                    isSorted={isSorted}
                  />
                </div>
              </div>
            </th>
          )
        },
        cell: ({ getValue }) => {
          const wordLength = getValue()
          return (
            <div className="float-right mr-2 text-xs tabular-nums text-neutral-700 dark:text-neutral-500">
              <span>
                {wordLength}
              </span>
            </div>
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
            <th
              colSpan={header.colSpan}
              className={cn(
                'group/th w-[.1%] whitespace-nowrap border-y border-solid border-y-zinc-200 p-0 text-sm font-normal active:bg-stone-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400',
              )}
            >
              <div
                className="group flex h-7 cursor-pointer select-none items-center stretch-[condensed]"
                onClick={header.column.getToggleSortingHandler()}
              >
                <Separator
                  orientation="vertical"
                  className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
                />
                <div className="flex min-w-[30px] grow items-center justify-center">
                  <SortIcon
                    isSorted={isSorted}
                    className="text-zinc-400"
                    fallback={<IconLucideCheckCircle />}
                  />
                </div>
              </div>
            </th>
          )
        },
        cell: ({ row }) => (
          <div className="flex justify-center">
            <VocabToggle
              vocab={row.original.vocab}
              onToggle={handleVocabToggle}
            />
          </div>
        ),
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => row.vocab.isUser, {
        id: 'userOwned',
        filterFn: (row, columnId, fn: ColumnFilterFn) => fn(row.original),
        header: ({ header }) => {
          return (
            <th
              colSpan={header.colSpan}
              className={cn(
                'group/th border-y border-solid border-y-zinc-200 p-0 text-sm font-normal',
              )}
            >
              <IconLucideCheckCircle
                className="size-4"
              />
            </th>
          )
        },
        cell: ({ getValue }) => (
          <div className="flex justify-center">
            {getValue()}
          </div>
        ),
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => row.vocab.rank, {
        id: 'rank',
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <th
              colSpan={header.colSpan}
              className={cn(
                'group/th w-[.1%] whitespace-nowrap border-y border-solid border-y-zinc-200 p-0 text-sm font-normal text-zinc-500 active:bg-stone-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400',
              )}
            >
              <div
                className="group float-right flex h-7 w-full cursor-pointer select-none items-center gap-2 pr-1"
                onClick={header.column.getToggleSortingHandler()}
              >
                <Separator
                  orientation="vertical"
                  className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
                />
                <div className="flex items-center">
                  <span
                    title={t('rank')}
                    className={cn('grow text-right text-xs stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold' : '')}
                  >
                    {t('rank')}
                  </span>
                  <SortIcon
                    isSorted={isSorted}
                  />
                </div>
              </div>
            </th>
          )
        },
        cell: ({ getValue }) => {
          const rank = getValue()
          return (
            <div className="float-right w-full text-center text-sm tabular-nums text-neutral-600 stretch-[condensed] dark:text-neutral-500">
              {rank}
            </div>
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
  const [tableState, setTableState] = useAtom(tableStateAtom)
  const columns = useColumns()
  const segments = useSegments()
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'allAcquainted')
  const [isSegmentTransitioning, startSegmentTransition] = useTransition()

  const pagination = tableState.pagination ?? {
    pageSize: 100,
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
      ...tableState,
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

  const { items } = usePagination({
    count: table.getPageCount(),
    page: table.getState().pagination.pageIndex + 1,
  })

  const rowsFiltered = table.getFilteredRowModel().rows
  const rowsAcquainted = rowsFiltered
    .filter((row) => row.original.vocab.learningPhase === LEARNING_PHASE.ACQUAINTED)
  const rowsNew = rowsFiltered
    .filter((row) => row.original.vocab.learningPhase === LEARNING_PHASE.NEW)
  const rowsToRetain = rowsNew
    .filter((row) => row.original.vocab.word.length <= 32)
    .map((row) => row.original.vocab)

  const itemsNum = uniq([table.getPaginationRowModel().rows.length, rowsFiltered.length]).filter(Boolean).filter((n) => !PAGES.includes(n))

  useUnmount(() => {
    setTableState(table.getState())
  })

  return (
    <div className={cn('flex h-full flex-col items-center overflow-hidden bg-white will-change-transform dark:bg-slate-900', className)}>
      <div className="z-10 flex h-12 w-full justify-between bg-neutral-50 p-2 dark:bg-slate-900 dark:text-slate-400">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex max-h-full gap-1 p-2 text-neutral-500 [--sq-r:5px]"
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
          <thead className="sticky top-0 z-10 bg-white px-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHeader
                    key={header.id}
                    header={header}
                  />
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <Fragment key={`_${row.original.vocab.word}`}>
                  <tr
                    data-expand={row.getCanExpand()}
                    className={cn(
                      'group',
                      'data-[expand=true]:[&:not(:has(+tr>td[colspan]))]:shadow-[inset_0px_-4px_10px_-6px_rgba(0,0,0,0.1)]',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="h-8 border-t border-solid border-t-zinc-100 pl-0.5 group-first-of-type:border-t-0 dark:border-slate-800 [tr:has(+tr>td[colspan])>&]:border-b-white"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                </Fragment>
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
          <div className="flex items-center text-neutral-600">
            <Select
              defaultValue={String(pagination.pageSize)}
              onValueChange={(e) => {
                table.setPageSize(Number(e))
              }}
            >
              <SelectTrigger className="h-5 w-[unset] px-2 py-0 text-xs tabular-nums">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent
                position="item-aligned"
              >
                <SelectGroup>
                  {PAGES.map((size) => (
                    <SelectItem
                      className="pr-4 text-xs tabular-nums"
                      key={size}
                      value={String(size)}
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
                {itemsNum.length > 0 ? (
                  <>
                    <SelectSeparator />
                    <SelectGroup>
                      {itemsNum.map((size) => (
                        <SelectItem
                          className="pr-4 text-xs tabular-nums"
                          key={size}
                          value={String(size)}
                        >
                          {size}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </>
                ) : null}
              </SelectContent>
            </Select>
            <div className="whitespace-nowrap px-1 text-[.8125rem]">{`/${t('page')}`}</div>
          </div>
        </div>
      </div>
      <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-neutral-50 dark:border-slate-800 dark:bg-slate-900">
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
