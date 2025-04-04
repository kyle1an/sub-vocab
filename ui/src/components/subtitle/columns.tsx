import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import type { SubtitleResponseData } from '@/api/opensubtitles'

import { Div } from '@/components/ui/html-elements'
import { Separator } from '@/components/ui/separator'
import { HeaderTitle, TableDataCell, TableHeaderCell } from '@/components/ui/table-element'
import { customFormatDistance, formatDistanceLocale } from '@/lib/date-utils'
import { customFormatDistanceToNowStrict } from '@/lib/formatDistance'

type Subtitle = {
  subtitle: SubtitleResponseData
}

export type SubtitleData<T = undefined> = T extends undefined ? Subtitle : Subtitle & {
  media?: T | undefined
}

const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
const numberFormat = new Intl.NumberFormat('en')

export function useCommonColumns<T extends SubtitleData>() {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  return [
    columnHelper.accessor((row) => row.subtitle.attributes.language, {
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
              className="group select-none gap-2 pr-1 [font-stretch:condensed]"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="data-[title]:*:text-right"
              />
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
            <Div className="justify-center whitespace-nowrap pl-1.5 pr-px tabular-nums [font-stretch:condensed]">
              <span>
                {displayName}
              </span>
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.subtitle.attributes.download_count || 0, {
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
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="data-[title]:*:text-right"
              />
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
            <Div className="justify-end pl-0.5 pr-4 text-xs tabular-nums">
              {numberFormat.format(value)}
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.subtitle.attributes.upload_date, {
      id: 'upload_date',
      header: ({ header }) => {
        const title = 'Uploaded'
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
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="data-[title]:*:text-left"
              />
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
            <Div className="justify-end pr-1.5 tabular-nums [font-stretch:condensed]">
              {value ? customFormatDistanceToNowStrict(new Date(value), {
                addSuffix: true,
                locale: {
                  formatDistance: customFormatDistance(formatDistanceLocale),
                },
              }) : null}
            </Div>
          </TableDataCell>
        )
      },
    }),
  ]
}
