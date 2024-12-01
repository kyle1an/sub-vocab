import usePagination from '@mui/material/usePagination'
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
import { uniq } from 'lodash-es'
import {
  Trans,
  useTranslation,
} from 'react-i18next'
import { useSessionStorage, useUnmount } from 'react-use'

import type { LabelDisplaySource } from '@/lib/vocab'

import { TablePagination } from '@/components/table-pagination'
import { Examples } from '@/components/ui/Examples'
import { TableHeader, TableHeaderWrapper, TableRow } from '@/components/ui/tableHeader'
import { useAcquaintAll, useVocabToggle } from '@/hooks/vocabToggle'
import { transParams } from '@/i18n'
import { SortIcon } from '@/lib/icon-utils'
import { LEARNING_PHASE, type LearningPhase, type VocabState } from '@/lib/LabeledTire'
import { tryGetRegex } from '@/lib/regex'

export function AcquaintAllDialog<T extends VocabState>({ vocabulary }: { vocabulary: T[] }) {
  const { t } = useTranslation()
  const acquaintAllVocab = useAcquaintAll()
  const count = vocabulary.length
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex w-full flex-row items-center gap-1.5 px-2 py-1.5">
          <IconSolarListCheckBold />
          <div className="">{t('acquaintedAll')}</div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('acquaintedAll')}</AlertDialogTitle>
          <AlertDialogDescription>
            <Trans
              i18nKey="acquaintedAllConfirmText"
              values={{ count }}
            >
              ()
              <span className="font-bold text-foreground">{transParams({ count })}</span>
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (vocabulary.length > 0) {
                acquaintAllVocab(vocabulary)
              }
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const columnHelper = createColumnHelper<LabelDisplaySource>()

type ColumnFilterFn = (rowValue: LabelDisplaySource) => boolean

const isUsingRegexAtom = atom(false)
const searchValueAtom = atom('')
const tableStateAtom = atom<Partial<TableState>>({})

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

const PAGES = [10, 20, 40, 50, 100, 200, 1000] as const

function useColumns() {
  const { t } = useTranslation()
  const handleVocabToggle = useVocabToggle()
  return (
    [
      columnHelper.accessor((row) => row.locations.length, {
        id: 'frequency',
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          const title = t('frequency')
          return (
            <TableHeader
              header={header}
              className={cn(
                'w-[.1%] whitespace-nowrap active:bg-background-active',
              )}
            >
              <div
                className="flex h-7 min-w-[4.5rem] grow cursor-pointer select-none items-center gap-0.5 pl-2 pr-1"
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex grow items-center">
                  <span
                    title={title}
                    className={cn('grow text-right text-xs stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold' : '')}
                  >
                    {title}
                  </span>
                  <SortIcon
                    isSorted={isSorted}
                  />
                </div>
              </div>
            </TableHeader>
          )
        },
        cell: ({ row, getValue }) => {
          const frequency = getValue()
          return (
            <div className="flex h-full items-center text-sm text-zinc-400">
              {row.getCanExpand() ? (
                <button
                  type="button"
                  className={cn(
                    'expand-button',
                    'flex h-full grow cursor-pointer items-center justify-between gap-1 px-3',
                  )}
                >
                  <IconLucideChevronRight
                    className={cn('size-[14px] text-zinc-300 transition-transform dark:text-zinc-600', row.getIsExpanded() ? 'rotate-90' : '')}
                  />
                  <span className="float-right inline-block tabular-nums stretch-[condensed]">
                    {frequency}
                  </span>
                </button>
              ) : (
                <div className="w-full justify-end px-3">
                  <span className="float-right inline-block tabular-nums stretch-[condensed]">
                    {frequency}
                  </span>
                </div>
              )}
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
          const title = t('Word')
          return (
            <TableHeader
              header={header}
              className={cn(
                'active:bg-background-active',
              )}
            >
              <div
                className="group flex h-7 cursor-pointer items-center gap-1.5 pr-1"
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
                      'grow text-left text-xs stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]',
                      isSorted ? 'font-semibold' : '',
                    )}
                  >
                    {title}
                  </span>
                  <SortIcon
                    isSorted={isSorted}
                  />
                </div>
              </div>
            </TableHeader>
          )
        },
        cell: ({ row }) => {
          const { wFamily } = row.original
          const last = wFamily.length - 1
          return (
            <>
              {wFamily.map((w, i) => (
                <div
                  key={w}
                  className="ml-1.5 inline-block cursor-text select-text text-sm tracking-wider ffs-['cv03','cv05','cv06'] first:ml-1.5"
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <span className={cn(i === 0 ? '' : 'text-neutral-500 dark:text-slate-400')}>{w}</span>
                  {i < last && <span className="text-neutral-500 dark:text-slate-400">, </span>}
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
          const title = t('length')
          return (
            <TableHeader
              header={header}
              className={cn(
                'w-[.1%] whitespace-nowrap active:bg-background-active',
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
                    title={title}
                    className={cn('grow text-right text-xs before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold' : '')}
                  >
                    {title}
                  </span>
                  <SortIcon
                    isSorted={isSorted}
                  />
                </div>
              </div>
            </TableHeader>
          )
        },
        cell: ({ getValue }) => {
          const wordLength = getValue()
          return (
            <div className="float-right mr-2 text-xs tabular-nums">
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
            <TableHeader
              header={header}
              className={cn(
                'w-[.1%] whitespace-nowrap active:bg-background-active',
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
                    className=""
                    fallback={<IconLucideCheckCircle />}
                  />
                </div>
              </div>
            </TableHeader>
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
      columnHelper.accessor((row) => row.vocab.rank, {
        id: 'rank',
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          const title = t('rank')
          return (
            <TableHeader
              header={header}
              className={cn(
                'w-[.1%] whitespace-nowrap active:bg-background-active',
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
                    title={title}
                    className={cn('grow text-right text-xs stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold' : '')}
                  >
                    {title}
                  </span>
                  <SortIcon
                    isSorted={isSorted}
                  />
                </div>
              </div>
            </TableHeader>
          )
        },
        cell: ({ getValue }) => {
          const rank = getValue()
          return (
            <div className="float-right w-full text-center text-sm tabular-nums stretch-[condensed]">
              {rank}
            </div>
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
  const [tableState, setTableState] = useAtom(tableStateAtom)
  const columns = useColumns()
  const segments = useSegments()
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'all')
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
      ],
      ...tableState,
    },
    autoResetPageIndex: false,
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
          <thead
            style={{
              '--z-index': 999_999_999,
            }}
            className="sticky top-0 z-[--z-index] bg-white px-0"
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHeaderWrapper
                    key={header.id}
                    header={header}
                  />
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => {
              return (
                <TableRow
                  key={`_${row.original.vocab.word}`}
                  row={row}
                  rootRef={rootRef}
                  index={index}
                >
                  <td
                    colSpan={row.getVisibleCells().length}
                    aria-label="Examples"
                    className="py-0"
                  >
                    <Examples
                      sentences={sentences}
                      src={row.original.locations}
                      className="text-xs tracking-wide"
                    />
                  </td>
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
      <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-background  dark:border-slate-800">
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
