import React, { useCallback, useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ExpandedState,
  type SortingState,
  type Table,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import { uniq } from 'lodash-es'
import usePagination, { type UsePaginationItem } from '@mui/material/usePagination'
import { type SortDirection } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { useSessionStorage } from 'react-use'
import { useToast } from './use-toast'
import { Examples } from '@/components/ui/Examples.tsx'
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx'
import { VocabToggle } from '@/components/ui/ToggleButton.tsx'
import { cn } from '@/lib/utils.ts'
import { Separator } from '@/components/ui/separator.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LEARNING_PHASE, type LearningPhase, type VocabState } from '@/lib/LabeledTire'
import type { LabelDisplaySource } from '@/components/vocab'
import { useAcquaintWordsMutation, useRevokeWordMutation } from '@/api/vocab-api'
import { useSnapshotStore } from '@/store/useVocab'
import type { TI } from '@/i18n'
import { loginToast } from '@/components/vocab'

export const ChevronSort = ({
  isSorted,
  size = 16,
}: {
  isSorted: Exclude<SortDirection, false>
  size?: number
}) => {
  return (
    <>
      {{
        asc: (
          <Icon
            icon="lucide:chevron-up"
            width={size}
          />
        ),
        desc: (
          <Icon
            icon="lucide:chevron-down"
            width={size}
          />
        ),
      }[isSorted]}
    </>
  )
}

export const IconSort = ({
  isSorted,
  className = '',
}: {
  isSorted: SortDirection
  className?: string
}) => {
  return (
    <div className={cn('inline-block h-[16px] w-[16px] text-zinc-400', className)}>
      {isSorted ? (
        <ChevronSort isSorted={isSorted} />
      ) : null}
    </div>
  )
}

export function VocabSourceTable<TProp extends LabelDisplaySource>({
  data,
  sentences,
  onPurge,
  className = '',
}: Readonly<{
  data: TProp[]
  sentences: string[]
  onPurge: () => void
  className?: string
}>) {
  const { t } = useTranslation()
  const { mutateAsync: mutateRevokeWordAsync } = useRevokeWordMutation()
  const { mutateAsync: mutateAcquaintWordsAsync } = useAcquaintWordsMutation()
  const { toast } = useToast()
  const { username } = useSnapshotStore()

  const handleVocabToggle = useCallback(function handleVocabToggle(vocab: TProp) {
    if (!username) {
      toast(loginToast())
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
  }, [username, mutateAcquaintWordsAsync, mutateRevokeWordAsync, toast])

  const columns = useMemo<ColumnDef<TProp>[]>(() => {
    return [
      {
        id: 'frequency',
        accessorFn: (row) => row.locations.length,
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <div
              className="flex min-w-[60px] grow cursor-pointer select-none items-center gap-1 pl-2 text-zinc-500"
              onClick={header.column.getToggleSortingHandler()}
            >
              <div className="flex grow items-center">
                <span
                  title={t('frequency')}
                  className={cn('before:hidden-bold grow text-right stretch-[condensed] before:content-[attr(title)]', isSorted ? 'font-semibold text-zinc-700' : '')}
                >
                  {t('frequency')}
                </span>
                <IconSort
                  isSorted={isSorted}
                />
              </div>
              <Separator
                orientation="vertical"
                className="h-5"
              />
            </div>
          )
        },
        cell: ({ row, getValue }) => {
          return (
            <div className="flex h-full items-center text-sm tabular-nums text-zinc-400">
              {row.getCanExpand() ? (
                <button
                  type="button"
                  onClick={row.getToggleExpandedHandler()}
                  className="flex h-full grow cursor-pointer items-center justify-between px-3"
                >
                  {row.getIsExpanded() ? (
                    <Icon
                      icon="lucide:chevron-down"
                      className="text-zinc-300"
                      width={14}
                    />
                  ) : (
                    <Icon
                      icon="lucide:chevron-right"
                      className="text-zinc-300"
                      width={14}
                    />
                  )}
                  <span className="float-right inline-block stretch-[condensed]">
                    <>{getValue()}</>
                  </span>
                </button>
              ) : (
                <div className="w-full justify-end px-3">
                  <span className="float-right inline-block stretch-[condensed]">
                    <>{getValue()}</>
                  </span>
                </div>
              )}
            </div>
          )
        },
        footer: ({ column }) => column.id,
      },
      {
        id: 'word',
        accessorFn: (row) => row.word,
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <div className="ml-1.5 flex items-center gap-1">
              <div
                className="float-right flex grow cursor-pointer select-none items-center"
                onClick={header.column.getToggleSortingHandler()}
              >
                <span
                  title={t('Word')}
                  className={cn('before:hidden-bold grow text-left stretch-[condensed] before:content-[attr(title)]', isSorted ? 'font-semibold text-zinc-700' : 'text-zinc-500')}
                >
                  {t('Word')}
                </span>
                <IconSort
                  isSorted={isSorted}
                />
              </div>
              <Separator
                orientation="vertical"
                className="h-5"
              />
            </div>
          )
        },
        cell: ({ row }) => (
          <>
            {row.original.wFamily.map((w, i) => (
              <div
                key={w}
                className="ml-1.5 inline-block cursor-text select-text font-compact text-[16px] text-black"
                onClick={(ev) => ev.stopPropagation()}
              >
                <span className={`${i !== 0 ? 'text-neutral-500' : ''}`}>{w}</span>
                {i !== row.original.wFamily.length - 1 && <span className="pr-1 text-neutral-300">, </span>}
              </div>
            ))}
          </>
        ),
        footer: ({ column }) => column.id,
      },
      {
        id: 'word.length',
        accessorFn: (row) => row.word.length,
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <div
              className="float-right flex w-full cursor-pointer select-none items-center gap-1 pl-1.5 stretch-[condensed]"
              onClick={header.column.getToggleSortingHandler()}
            >
              <div className="flex select-none items-center">
                <span
                  title={t('length')}
                  className={cn('before:hidden-bold grow text-right before:content-[attr(title)]', isSorted ? 'font-semibold text-zinc-700' : 'text-zinc-500')}
                >
                  {t('length')}
                </span>
                <IconSort
                  isSorted={isSorted}
                />
              </div>
              <Separator
                orientation="vertical"
                className="h-5"
              />
            </div>
          )
        },
        cell: ({ getValue }) => (
          <div className="float-right mr-2 text-xs tabular-nums text-neutral-700">
            <span><>{getValue()}</></span>
          </div>
        ),
        footer: ({ column }) => column.id,
      },
      {
        id: 'acquaintedStatus',
        accessorFn: (row) => row.inertialPhase === LEARNING_PHASE.ACQUAINTED,
        filterFn: (row, columnId, filterValue: ReturnType<typeof filterValueAcquaintedStatus>) => filterValue.includes(row.original.inertialPhase),
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <div
              className="flex min-w-[30px] cursor-pointer select-none items-center stretch-[condensed]"
              onClick={header.column.getToggleSortingHandler()}
            >
              <div className="flex grow items-center justify-center text-zinc-400">
                {isSorted ? (
                  <>
                    {{
                      asc: (
                        <Icon
                          icon="lucide:chevron-up"
                          width={16}
                        />
                      ),
                      desc: (
                        <Icon
                          icon="lucide:chevron-down"
                          width={16}
                        />
                      ),
                    }[isSorted]}
                  </>
                ) : (
                  <Icon
                    icon="lucide:check-circle"
                    width={16}
                  />
                )}
              </div>
              <Separator
                orientation="vertical"
                className="float-right h-5"
              />
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
      },
      {
        id: 'rank',
        accessorFn: (row) => row.rank,
        header: ({ header }) => {
          const isSorted = header.column.getIsSorted()
          return (
            <div
              className="float-right flex w-full cursor-pointer select-none items-center pl-2 pr-1 text-zinc-500"
              onClick={header.column.getToggleSortingHandler()}
            >
              <span
                title={t('rank')}
                className={cn('before:hidden-bold grow text-right stretch-[condensed] before:content-[attr(title)]', isSorted ? 'font-semibold text-zinc-700' : '')}
              >
                {t('rank')}
              </span>
              <IconSort
                isSorted={isSorted}
              />
            </div>
          )
        },
        cell: ({ getValue }) => (
          <div className="float-right w-full text-center text-sm tabular-nums text-neutral-600 stretch-[condensed]">
            <>{getValue()}</>
          </div>
        ),
        footer: ({ column }) => column.id,
      },
    ]
  }, [handleVocabToggle, t])

  const segments = [
    { value: 'all', label: t('all') },
    { value: 'new', label: t('new') },
    { value: 'acquainted', label: t('acquainted') },
  ] as const
  type Segment = typeof segments[number]['value']

  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const SEGMENT_NAME = 'source-table-segment'
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'all')

  const pageSize = 100
  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      sorting,
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
      ],
    },
    autoResetPageIndex: false,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
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
    table.getColumn('acquaintedStatus')?.setFilterValue(filterValueAcquaintedStatus(newSegment))
  }

  function filterValueAcquaintedStatus(filterSegment: Segment): LearningPhase[] {
    switch (filterSegment) {
      case 'new':
        return [LEARNING_PHASE.NEW, LEARNING_PHASE.ACQUAINTING]
      case 'acquainted':
        return [LEARNING_PHASE.ACQUAINTED, LEARNING_PHASE.REMOVING]
      default:
        return Object.values(LEARNING_PHASE)
    }
  }

  const columnWord = table.getColumn('word')

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    columnWord?.setFilterValue(e.target.value)
  }

  const { items } = usePagination({
    count: table.getPageCount(),
    page: table.getState().pagination.pageIndex + 1,
  })

  const rowsFiltered = table.getFilteredRowModel().rows
  const rowsCountAcquainted = rowsFiltered.filter((row) => row.original.learningPhase === LEARNING_PHASE.ACQUAINTED).length
  const rowsCountNew = rowsFiltered.filter((row) => row.original.learningPhase === LEARNING_PHASE.NEW).length

  return (
    <div className={cn('flex h-full flex-col items-center overflow-hidden rounded-xl border border-inherit bg-white shadow-sm will-change-transform', className)}>
      <div className="z-10 flex h-12 w-full justify-between bg-neutral-50 p-2 shadow-sm">
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
      <div className="w-full border-t border-solid border-zinc-200">
        <SegmentedControl
          value={segment}
          name={SEGMENT_NAME}
          segments={segments}
          onChoose={handleSegmentChoose}
          variant="ghost"
        />
      </div>
      <div className="w-full grow overflow-auto overflow-y-scroll overscroll-contain">
        <table className="min-w-full">
          <thead className="sticky top-0 z-10 bg-white px-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'border-y border-solid border-y-zinc-200 px-0 py-1 text-sm font-normal',
                      header.id !== 'word' && 'w-[0.1%] whitespace-nowrap',
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
                <React.Fragment key={`_${row.original.word}`}>
                  <tr className={cn(
                    'group',
                    canExpand ? '[&:not(:has(+tr>td[colspan]))]:shadow-[inset_0px_-4px_10px_-6px_rgba(0,0,0,0.1)]' : '',
                  )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="h-8 border-t border-solid border-t-zinc-100 group-first-of-type:border-t-0 [tr:has(+tr>td[colspan])>&]:border-b-white"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                  {canExpand && row.getIsExpanded() && (
                    <tr>
                      <td
                        colSpan={row.getVisibleCells().length}
                        className="py-0"
                      >
                        <Examples
                          sentences={sentences}
                          src={row.original.locations}
                          className="text-xs tracking-wide"
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex w-full flex-wrap items-center justify-between gap-0.5 border-t border-t-zinc-200 tabular-nums">
        <Pagination
          items={items}
          table={table}
        />
        <div className="flex grow items-center justify-end">
          <div className="m-0.5 flex items-center text-neutral-600">
            <Select
              defaultValue={String(pageSize)}
              onValueChange={(e) => {
                table.setPageSize(Number(e))
              }}
            >
              <SelectTrigger className="h-5 px-2 py-0 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {uniq([10, 20, 40, 50, 100, 200, 1000, table.getPaginationRowModel().rows.length, rowsFiltered.length]).filter(Boolean).map((size) => (
                    <SelectItem
                      className="py-0.5 text-[.8125rem] tabular-nums"
                      key={size}
                      value={String(size)}
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
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

export function Pagination<T>({
  items,
  table,
}: {
  items: UsePaginationItem[]
  table: Table<T>
}) {
  return (
    <div className="flex h-7 py-1">
      {items.map(({
        page, type, selected, ...item
      }, index) => {
        const size = 17
        const Item = (props: {
              className?: string
            }) => {
          if (type === 'previous') {
            return (
              <button
                type="button"
                className={cn('text-zinc-500', props.className)}
                disabled={!table.getCanPreviousPage()}
                onClick={table.previousPage}
              >
                <Icon
                  icon="lucide:chevron-left"
                  width={size}
                />
              </button>
            )
          } if (type === 'start-ellipsis') {
            return (
              <button
                className={cn('group', props.className)}
                type="button"
                onClick={() => {
                  table.setPageIndex(Math.max(0, table.getState().pagination.pageIndex - 2))
                }}
              >
                <Icon
                  icon="lucide:chevrons-left"
                  className="hidden text-zinc-500 group-hover:inline-block"
                  width={size}
                />
                <span className="group-hover:hidden">...</span>
              </button>
            )
          } if (type === 'first' || type === 'page' || type === 'last') {
            return (
              <button
                className={cn(props.className, selected ? 'border-[color:hsl(var(--border))] font-bold' : '')}
                type="button"
                onClick={() => {
                  table.setPageIndex(Number(page) - 1)
                }}
              >
                {page}
              </button>
            )
          } if (type === 'end-ellipsis') {
            return (
              <button
                className={cn('group', props.className)}
                type="button"
                onClick={() => {
                  table.setPageIndex(Math.min(table.getState().pagination.pageIndex + 2, table.getPageCount() - 1))
                }}
              >
                <Icon
                  icon="lucide:chevrons-right"
                  className="hidden text-zinc-500 group-hover:inline-block"
                  width={size}
                />
                <span className="group-hover:hidden">...</span>
              </button>
            )
          } if (type === 'next') {
            return (
              <button
                className={cn('text-zinc-500', props.className)}
                type="button"
                disabled={!table.getCanNextPage()}
                onClick={table.nextPage}
              >
                <Icon
                  icon="lucide:chevron-right"
                  width={size}
                />
              </button>
            )
          }
          return null
        }

        return (
          <Item
            key={index}
            className="flex min-w-[27px] items-center justify-center rounded border border-transparent px-1 text-xs tabular-nums disabled:text-zinc-300"
          />
        )
      })}
    </div>
  )
}

export function VocabStatics(props: {rowsCountFiltered: number; rowsCountNew: number; rowsCountAcquainted: number}) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center py-1.5 text-xs tabular-nums text-neutral-600">
      <span>
        {`${props.rowsCountFiltered.toLocaleString('en-US')} ${t('vocabulary')}`}
      </span>
      <div className="flex items-center gap-0.5">
        {props.rowsCountNew > 0 ? (
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-400">, </span>
            <div className="flex items-center gap-1">
              <span>
                {props.rowsCountNew.toLocaleString('en-US')}
              </span>
              <Icon
                icon="lucide:circle"
                width={14}
                className="text-neutral-400"
              />
            </div>
          </div>
        ) : null}
        {props.rowsCountAcquainted > 0 ? (
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-400">, </span>
            <div className="flex items-center gap-1">
              <span>
                {props.rowsCountAcquainted.toLocaleString('en-US')}
              </span>
              <Icon
                icon="lucide:check-circle"
                width={14}
                className="text-neutral-400"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function AcquaintAllDialog<T extends VocabState>({ vocabulary }: {vocabulary: T[]}) {
  const { t } = useTranslation()
  const { mutateAsync: mutateAcquaintWordsAsync } = useAcquaintWordsMutation()
  const { toast } = useToast()
  const { username } = useSnapshotStore()
  function acquaintAllVocab(rows: T[]) {
    if (!username) {
      toast(loginToast())
      return
    }

    mutateAcquaintWordsAsync(rows)
      .catch(console.error)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex w-full flex-row items-center gap-1.5 px-2 py-1.5">
          <Icon icon="solar:list-check-bold" />
          <div className="">{t('acquaintedAll')}</div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('acquaintedAll')}</AlertDialogTitle>
          <AlertDialogDescription>
            <Trans
              i18nKey="acquaintedAllConfirmText"
              count={vocabulary.length}
            >
              Are you sure to mark all (
              <span className="font-bold text-black">{{ count: vocabulary.length } as TI}</span>
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
