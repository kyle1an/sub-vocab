import {
  type ChangeEvent, Fragment, useCallback, useMemo, useState,
} from 'react'
import {
  type ExpandedState,
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { uniq } from 'lodash-es'
import usePagination from '@mui/material/usePagination'
import { formatDistanceToNowStrict } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useSessionStorage } from 'react-use'
import { toast } from 'sonner'
import {
  AcquaintAllDialog, Pagination, VocabStatics,
} from './VocabSource'
import { sortIcon } from '@/lib/icon-utils'
import { Icon } from '@/components/ui/icon'
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx'
import { VocabToggle } from '@/components/ui/ToggleButton.tsx'
import { cn } from '@/lib/utils.ts'
import { Separator } from '@/components/ui/separator.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LEARNING_PHASE, type LearningPhase } from '@/lib/LabeledTire'
import type { LabelDisplayTable } from '@/lib/vocab'
import { useAcquaintWordsMutation, useRevokeWordMutation } from '@/api/vocab-api'
import { useSnapshotStore } from '@/store/useVocab'
import { LoginToast } from '@/components/login-toast'

const columnHelper = createColumnHelper<LabelDisplayTable>()

export function VocabDataTable({
  data,
  onPurge,
  className = '',
}: {
  data: LabelDisplayTable[]
  onPurge: () => void
  className?: string
}) {
  type TProp = LabelDisplayTable
  const { t } = useTranslation()
  const { mutateAsync: mutateRevokeWordAsync } = useRevokeWordMutation()
  const { mutateAsync: mutateAcquaintWordsAsync } = useAcquaintWordsMutation()
  const { username } = useSnapshotStore()

  const handleVocabToggle = useCallback(function handleVocabToggle(vocab: TProp) {
    if (!username) {
      toast(<LoginToast />)
      return
    }

    const rows2Mutate = [vocab].filter((row) => row.word.length <= 32)
    if (rows2Mutate.length === 0) {
      return
    }

    if (vocab.learningPhase === LEARNING_PHASE.ACQUAINTED) {
      mutateRevokeWordAsync(rows2Mutate)
        .catch(console.error)
    } else {
      mutateAcquaintWordsAsync(rows2Mutate)
        .catch(console.error)
    }
  }, [username, mutateAcquaintWordsAsync, mutateRevokeWordAsync])

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.timeModified, {
        id: 'timeModified',
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <div
              className="float-right flex h-7 w-full cursor-pointer select-none items-center pl-2 pr-1 text-zinc-500 active:bg-stone-50"
              onClick={header.column.getToggleSortingHandler()}
            >
              <span
                title={t('distance')}
                className={cn('grow text-right text-xs stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold text-zinc-700' : '')}
              >
                {t('distance')}
              </span>
              <Icon
                icon={sortIcon(isSorted)}
                width={16}
                className="inline-block text-zinc-400"
              />
            </div>
          )
        },
        cell: ({ getValue }) => {
          const timeModified = getValue()
          return (
            <div className="float-right w-full text-center text-sm tabular-nums text-neutral-600 stretch-[condensed]">
              {timeModified ? formatDistanceToNowStrict(new Date(timeModified)) : null}
            </div>
          )
        },
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => row.word, {
        id: 'word',
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <div
              className="group flex h-7 cursor-pointer items-center gap-2 pr-1 active:bg-stone-50"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 group-active:h-full"
              />
              <div
                className="float-right flex grow select-none items-center"
              >
                <span
                  title={t('Word')}
                  className={cn('grow text-left text-xs stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold text-zinc-700' : 'text-zinc-500')}
                >
                  {t('Word')}
                </span>
                <Icon
                  icon={sortIcon(isSorted)}
                  width={16}
                  className="inline-block text-zinc-400"
                />
              </div>
            </div>
          )
        },
        cell: ({ row }) => {
          const wFamily = [row.original.word]
          return (
            <>
              {wFamily.map((w, i) => (
                <div
                  key={w}
                  className="ml-2 inline-block cursor-text select-text font-compact text-[16px] text-black"
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <span className={cn(i !== 0 && 'text-neutral-500')}>{w}</span>
                  {i !== wFamily.length - 1 && <span className="pr-1 text-neutral-300">, </span>}
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
            <div
              className="group float-right flex h-7 w-full cursor-pointer select-none items-center gap-2 pr-1 stretch-[condensed] active:bg-stone-50"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 group-active:h-full"
              />
              <div className="flex items-center">
                <span
                  title={t('length')}
                  className={cn('grow text-right text-xs before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold text-zinc-700' : 'text-zinc-500')}
                >
                  {t('length')}
                </span>
                <Icon
                  icon={sortIcon(isSorted)}
                  width={16}
                  className="inline-block text-zinc-400"
                />
              </div>
            </div>
          )
        },
        cell: ({ getValue }) => (
          <div className="float-right mr-2 text-xs tabular-nums text-neutral-700">
            <span>
              {getValue()}
            </span>
          </div>
        ),
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => {
        return row.learningPhase <= 1 ? row.learningPhase : row.inertialPhase
      }, {
        id: 'acquaintedStatus',
        filterFn: (row, columnId, filterValue: ReturnType<typeof filterValueAcquaintedStatus>) => filterValue.includes(row.original.inertialPhase),
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <div
              className="group flex h-7 cursor-pointer select-none items-center stretch-[condensed] active:bg-stone-50"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 group-active:h-full"
              />
              <div className="flex min-w-[30px] grow items-center justify-center text-zinc-400">
                <>
                  <Icon
                    icon={sortIcon(isSorted) || 'lucide:check-circle'}
                    width={16}
                  />
                </>
              </div>
            </div>
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
      columnHelper.accessor((row) => row.isUser, {
        id: 'vocabOwner',
        filterFn: (row, columnId, filterValue: ReturnType<typeof filterValueVocabOwner>) => filterValue.includes(row.original.isUser),
        header: ({ header }) => {
          return (
            <Icon
              icon="lucide:check-circle"
              width={16}
            />
          )
        },
        cell: ({ getValue }) => (
          <div className="flex justify-center">
            {getValue()}
          </div>
        ),
        footer: ({ column }) => column.id,
      }),
      columnHelper.accessor((row) => row.rank, {
        id: 'rank',
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <div
              className="group float-right flex h-7 w-full cursor-pointer select-none items-center gap-2 pr-1 text-zinc-500 active:bg-stone-50"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 group-active:h-full"
              />
              <div className="flex items-center">
                <span
                  title={t('rank')}
                  className={cn('grow text-right text-xs stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold text-zinc-700' : '')}
                >
                  {t('rank')}
                </span>
                <Icon
                  icon={sortIcon(isSorted)}
                  width={16}
                  className="inline-block text-zinc-400"
                />
              </div>
            </div>
          )
        },
        cell: ({ getValue }) => (
          <div className="float-right w-full text-center text-sm tabular-nums text-neutral-600 stretch-[condensed]">
            {getValue()}
          </div>
        ),
        footer: ({ column }) => column.id,
      }),
    ]
  }, [handleVocabToggle, t])

  const segments = [
    { value: 'new', label: t('recent') },
    { value: 'allAcquainted', label: t('all') },
    { value: 'mine', label: t('mine') },
    { value: 'top', label: t('top') },
  ] as const
  type Segment = typeof segments[number]['value']

  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const SEGMENT_NAME = 'data-table-segment'
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'allAcquainted')

  const pageSize = 100
  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      sorting,
      columnVisibility: {
        vocabOwner: false,
      },
    },
    initialState: {
      pagination: {
        pageSize,
      },
      columnFilters: [
        {
          id: 'acquaintedStatus',
          value: filterValueAcquaintedStatus(segment),
        },
        {
          id: 'vocabOwner',
          value: filterValueVocabOwner(segment),
        },
      ],
    },
    autoResetPageIndex: false,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
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
    table.getColumn('acquaintedStatus')?.setFilterValue(filterValueAcquaintedStatus(newSegment))
    table.getColumn('vocabOwner')?.setFilterValue(filterValueVocabOwner(newSegment))
  }

  function filterValueAcquaintedStatus(filterSegment: Segment): LearningPhase[] {
    switch (filterSegment) {
      case 'new':
        return [LEARNING_PHASE.NEW, LEARNING_PHASE.ACQUAINTING]
      case 'allAcquainted':
      case 'mine':
      case 'top':
        return [LEARNING_PHASE.ACQUAINTED, LEARNING_PHASE.REMOVING]
      default:
        return Object.values(LEARNING_PHASE)
    }
  }

  function filterValueVocabOwner(filterSegment: Segment) {
    switch (filterSegment) {
      case 'top':
        return [false]
      case 'mine':
        return [true]
      default:
        return [true, false]
    }
  }

  const columnWord = table.getColumn('word')

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    columnWord?.setFilterValue(e.target.value)
  }

  const { items } = usePagination({
    count: table.getPageCount(),
    page: table.getState().pagination.pageIndex + 1,
  })

  const rowsFiltered = table.getFilteredRowModel().rows
  const rowsCountAcquainted = rowsFiltered.filter((row) => row.original.learningPhase === LEARNING_PHASE.ACQUAINTED).length
  const rowsCountNew = rowsFiltered.filter((row) => row.original.learningPhase === LEARNING_PHASE.NEW).length

  const pages = [10, 20, 40, 50, 100, 200, 1000]
  const itemsNum = uniq([table.getPaginationRowModel().rows.length, rowsFiltered.length]).filter(Boolean).filter((n) => !pages.includes(n))

  return (
    <div className={cn('flex h-full flex-col items-center overflow-hidden rounded-xl border border-inherit bg-white shadow-sm will-change-transform md:grow', className)}>
      <div className="z-10 flex h-12 w-full justify-between border-b border-solid border-zinc-200 bg-neutral-50 p-2 shadow-[0_0.4px_2px_0_rgb(0_0_0/0.05)]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex max-h-full gap-1 p-2 text-neutral-500"
              variant="ghost"
            >
              <Icon
                icon="ion:ellipsis-horizontal-circle-outline"
                width={19}
              />
              <Icon
                icon="lucide:chevron-down"
                width={14}
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
                  vocabulary={rowsFiltered.map((row) => row.original).filter((row) => row.learningPhase === LEARNING_PHASE.NEW && row.word.length <= 32)}
                />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          type="text"
          value={String(columnWord?.getFilterValue() ?? '')}
          onChange={handleSearchChange}
          placeholder={t('search')}
          className="rounded-md border pl-1 leading-7"
        />
      </div>
      <div className="w-full">
        <SegmentedControl
          value={segment}
          name={SEGMENT_NAME}
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
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'border-y border-solid border-y-zinc-200 p-0 text-sm font-normal',
                      ['word.length', 'acquaintedStatus', 'rank'].includes(header.id) && 'w-[0.2%] whitespace-nowrap',
                      ['timeModified'].includes(header.id) && 'w-[12%] whitespace-nowrap',
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </>
                    )}
                  </th>
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
                        className="h-8 border-t border-solid border-t-zinc-100 pl-0.5 group-first-of-type:border-t-0 [tr:has(+tr>td[colspan])>&]:border-b-white"
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
      <div className="flex w-full flex-wrap items-center justify-between gap-0.5 border-t border-t-zinc-200 py-1 pr-0.5 tabular-nums">
        <Pagination
          items={items}
          table={table}
        />
        <div className="flex grow items-center justify-end">
          <div className="flex items-center text-neutral-600">
            <Select
              defaultValue={String(pageSize)}
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
                  {pages.map((size) => (
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
      <div className="flex w-full justify-center border-t border-solid border-t-zinc-200 bg-neutral-50">
        <VocabStatics
          rowsCountFiltered={rowsFiltered.length}
          rowsCountNew={rowsCountNew}
          rowsCountAcquainted={rowsCountAcquainted}
        />
      </div>
    </div>
  )
}
