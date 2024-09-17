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
import {
  Trans,
  useTranslation,
} from 'react-i18next'
import { useSessionStorage, useUnmount } from 'react-use'

import type { LabelDisplaySource } from '@/lib/vocab'

import { TablePagination } from '@/components/table-pagination'
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
              Are you sure to mark all (
              <span className="font-bold text-foreground">{transParams({ count })}</span>
              ) vocabulary as acquainted?
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="">
          <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (vocabulary.length > 0) {
                acquaintAllVocab(vocabulary)
              }
            }}
          >
            {t('Continue')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const columnHelper = createColumnHelper<LabelDisplaySource>()

type ColumnFilterFn = (rowValue: LabelDisplaySource) => boolean

const useRegexAtom = atom(false)
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

  return (row) => {
    return filteredValue.includes(row.inertialPhase)
  }
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
          return (
            <th
              colSpan={header.colSpan}
              className={cn(
                'group/th w-[.1%] whitespace-nowrap border-y border-solid border-y-zinc-200 p-0 text-sm font-normal active:bg-stone-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400',
              )}
            >
              <div
                className="flex h-7 min-w-[4.5rem] grow cursor-pointer select-none items-center gap-0.5 pl-2 pr-1 text-zinc-500 dark:text-zinc-400"
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex grow items-center">
                  <span
                    title={t('frequency')}
                    className={cn('grow text-right text-xs stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold' : '')}
                  >
                    {t('frequency')}
                  </span>
                  <SortIcon
                    isSorted={isSorted}
                  />
                </div>
              </div>
            </th>
          )
        },
        cell: ({ row, getValue }) => {
          const frequency = getValue()
          return (
            <div className="flex h-full items-center text-sm text-zinc-400">
              {row.getCanExpand() ? (
                <button
                  type="button"
                  onClick={row.getToggleExpandedHandler()}
                  className="flex h-full grow cursor-pointer items-center justify-between gap-1 px-3"
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
      columnHelper.accessor((row) => row.word, {
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
                  className="ml-1.5 inline-block cursor-text select-text text-sm tracking-wider text-black ffs-['cv03','cv05','cv06'] first:ml-1.5 dark:text-slate-300"
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
      columnHelper.accessor((row) => row.word.length, {
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
        return row.learningPhase <= 1 ? row.learningPhase : row.inertialPhase
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
              row={{ vocab: row.original }}
              onToggle={handleVocabToggle}
            />
          </div>
        ),
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => row.rank, {
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
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useAtom(searchValueAtom)
  const [useRegex, setUseRegex] = useAtom(useRegexAtom)
  const [tableState, setTableState] = useAtom(tableStateAtom)
  const columns = useColumns()
  const segments = useSegments()
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'all')

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
    table.getColumn('acquaintedStatus')?.setFilterValue(() => getAcquaintedStatusFilter(newSegment))
  }

  const columnWord = table.getColumn('word')

  function handleSearchChange(search: string) {
    setSearchValue(search)
    updateSearchFilter(search, useRegex)
  }

  function handleRegexChange(regex: boolean) {
    setUseRegex(regex)
    updateSearchFilter(searchValue, regex)
  }

  function updateSearchFilter(search: string, usingRegex: boolean) {
    if (usingRegex) {
      const newRegex = tryGetRegex(search)
      if (newRegex) {
        columnWord?.setFilterValue((): ColumnFilterFn => function regexFilterFn(row) {
          return newRegex.test(row.word)
        })
      }
    } else {
      columnWord?.setFilterValue((): ColumnFilterFn => function searchFilterFn(row) {
        return row.wFamily.some((word) => word.includes(search))
      })
    }
  }

  const { items } = usePagination({
    count: table.getPageCount(),
    page: table.getState().pagination.pageIndex + 1,
  })

  const rowsFiltered = table.getFilteredRowModel().rows
  const rowsAcquainted = rowsFiltered.filter((row) => {
    return row.original.learningPhase === LEARNING_PHASE.ACQUAINTED
  })
  const rowsNew = rowsFiltered.filter((row) => {
    return row.original.learningPhase === LEARNING_PHASE.NEW
  })
  const rowsToRetain = rowsNew.filter((row) => {
    return row.original.word.length <= 32
  }).map((row) => row.original)

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
          useRegex={useRegex}
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
              const canExpand = row.getCanExpand()
              return (
                <Fragment key={`_${row.original.word}`}>
                  <tr className={cn(
                    'group',
                    canExpand ? '[&:not(:has(+tr>td[colspan]))]:shadow-[inset_0px_-4px_10px_-6px_rgba(0,0,0,0.1)]' : '',
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
                  {canExpand && row.getIsExpanded() ? (
                    <tr>
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
                    </tr>
                  ) : null}
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
              <SelectTrigger className="h-5 px-2 py-0 text-xs tabular-nums">
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
        />
      </div>
    </div>
  )
}
