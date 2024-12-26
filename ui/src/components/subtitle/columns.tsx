import { createColumnHelper } from '@tanstack/react-table'

import type { useOpenSubtitlesSubtitles } from '@/api/opensubtitles'

import { SortIcon } from '@/lib/icon-utils'
import { selectedSubtitleIds } from '@/store/useVocab'

type SubtitleData = NonNullable<ReturnType<typeof useOpenSubtitlesSubtitles>['data']>['data'][number]

const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })

export function useCommonColumns<T extends SubtitleData>() {
  type ColumnFilterFn = (rowValue: T) => boolean
  const selectedSubtitleIdsSnap = useSnapshot(selectedSubtitleIds)
  const columnHelper = createColumnHelper<T>()
  return [
    columnHelper.accessor((row) => row.id, {
      id: 'action',
      header: ({ header }) => {
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] [&:active:has(.child:not(:active))+th]:signal/active [&:active:has(.child:not(:active))]:signal/active"
          >
            <Div
              className="select-none justify-between gap-1 pl-2 pr-1 signal/active:bg-background-active"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Checkbox
                className="invisible"
              />
              <div className="child flex stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]" />
              <SortIcon isSorted={isSorted} />
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ row, cell, getValue }) => {
        const file_id = row.original.attributes.files[0]?.file_id
        const checked = Boolean(file_id && selectedSubtitleIdsSnap.has(file_id))
        const canExpand = row.getCanExpand()
        return (
          <TableDataCell
            cell={cell}
          >
            <Div className="text-zinc-400">
              <div
                className={cn(
                  'expand-button',
                  'flex h-full grow items-center justify-between pl-1.5 pr-1',
                  canExpand && 'cursor-pointer',
                )}
              >
                <Checkbox
                  onClick={(e) => e.stopPropagation()}
                  checked={checked}
                  onCheckedChange={(checked) => {
                    if (!file_id) return
                    if (checked) {
                      selectedSubtitleIds.add(file_id)
                    } else {
                      selectedSubtitleIds.delete(file_id)
                    }
                  }}
                />
                {'\u200B'}
                <IconLucideChevronRight
                  className={cn(
                    canExpand ? '' : 'invisible',
                    'size-[14px] text-zinc-400 transition-transform duration-200 dark:text-zinc-500',
                    row.getIsExpanded() ? 'rotate-90' : '',
                  )}
                />
              </div>
            </Div>
          </TableDataCell>
        )
      },
      footer: ({ column }) => column.id,
    }),
    columnHelper.accessor((row) => row.attributes.feature_details.year, {
      id: 'year',
      header: ({ header }) => {
        const title = 'Year'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group select-none gap-2 pr-1"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <div
                className="float-right flex grow select-none items-center"
              >
                <span
                  title={title}
                  className={cn('grow text-left stretch-[condensed] before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]', isSorted ? 'font-semibold' : '')}
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
    columnHelper.accessor((row) => row.attributes.feature_details.title, {
      id: 'movie_name',
      filterFn: (row, columnId, fn: ColumnFilterFn) => fn(row.original),
      header: ({ header }) => {
        const title = 'Name'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group gap-2 pr-1"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
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
      cell: ({ cell, getValue }) => {
        const value = getValue()
        return (
          <TableDataCell
            cell={cell}
          >
            <Div
              className="cursor-text select-text pl-2.5 tracking-wider ffs-['cv03','cv05','cv06']"
              onClick={(ev) => ev.stopPropagation()}
            >
              <span>{value}</span>
            </Div>
          </TableDataCell>
        )
      },
      footer: ({ column }) => column.id,
    }),
    columnHelper.accessor((row) => row.attributes.language, {
      id: 'language',
      header: ({ header }) => {
        const title = 'Language'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group select-none gap-2 pr-1 stretch-[condensed]"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
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
      cell: ({ cell, getValue }) => {
        const value = getValue()
        const displayName = displayNames.of(value)
        return (
          <TableDataCell
            cell={cell}
          >
            <Div className="justify-center tabular-nums stretch-[condensed]">
              <span>
                {displayName}
              </span>
            </Div>
          </TableDataCell>
        )
      },
      footer: ({ column }) => column.id,
    }),
    columnHelper.accessor((row) => row.attributes.download_count, {
      id: 'download_count',
      header: ({ header }) => {
        const title = 'Downloads'
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:bg-background-active active:signal/active [&:active+th]:signal/active"
          >
            <Div
              className="group select-none items-center gap-2 pr-1"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
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
            <Div className="justify-end pr-[9px] text-xs tabular-nums">
              {value}
            </Div>
          </TableDataCell>
        )
      },
      footer: ({ column }) => column.id,
    }),
  ]
}
