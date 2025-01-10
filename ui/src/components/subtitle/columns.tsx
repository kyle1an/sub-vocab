import { createColumnHelper } from '@tanstack/react-table'

import type { SubtitleResponseData } from '@/api/opensubtitles'

import { SortIcon } from '@/lib/icon-utils'

export type SubtitleData = SubtitleResponseData

const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })

export function useCommonColumns<T extends SubtitleData>() {
  const { t } = useTranslation()
  type ColumnFilterFn = (rowValue: T) => boolean
  const columnHelper = createColumnHelper<T>()
  return [
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
            <Div className="justify-end pr-4 text-xs tabular-nums">
              {value}
            </Div>
          </TableDataCell>
        )
      },
    }),
  ]
}
