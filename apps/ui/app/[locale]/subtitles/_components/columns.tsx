import { createColumnHelper } from '@tanstack/react-table'

import type { SubtitleResponseData } from '@/app/[locale]/subtitles/_api/os'

import { Div } from '@/components/ui/html-elements'
import { Separator } from '@/components/ui/separator'
import { HeaderTitle, TableDataCell, TableHeaderCell } from '@/components/ui/table-element'
import { useI18n } from '@/locales/client'
import { customFormatDistance, customFormatDistanceToNowStrict, formatDistanceLocale } from '@sub-vocab/utils/lib'

type Subtitle = {
  subtitle: SubtitleResponseData
}

export type SubtitleData<T = undefined> = T extends undefined ? Subtitle : Subtitle & {
  media?: T | undefined
}

const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
const numberFormat = new Intl.NumberFormat('en')

export function useCommonColumns<T extends SubtitleData>(rootRef: React.RefObject<HTMLDivElement | null>) {
  const t = useI18n()
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
              className="group gap-2 pr-1 select-none"
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="*:data-title:text-right"
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
            <Div className="justify-center pr-px pl-1.5 tracking-[.03em] whitespace-nowrap tabular-nums">
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
              className="group items-center gap-2 pr-1 select-none"
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="*:data-title:text-right"
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
            <Div className="justify-end pr-4 pl-0.5 text-xs tracking-[.03em] tabular-nums">
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
              className="group gap-2 pr-1 select-none"
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
            >
              <Separator
                orientation="vertical"
                className="h-5 signal/active:h-full"
              />
              <HeaderTitle
                title={title}
                isSorted={isSorted}
                className="*:data-title:text-left"
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
            <Div className="justify-end pr-1.5 tracking-[.03em] tabular-nums">
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
