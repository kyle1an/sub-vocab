import {
  createColumnHelper,
} from '@tanstack/react-table'
import clsx from 'clsx'
import {
  useTranslation,
} from 'react-i18next'
import IconLucideCheckCircle from '~icons/lucide/check-circle'

import type { LabelDisplayTable } from '@/lib/vocab'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Div } from '@/components/ui/html-elements'
import { Separator } from '@/components/ui/separator'
import { HeaderTitle, TableDataCell, TableHeaderCell } from '@/components/ui/table-element'
import { VocabularyMenu } from '@/components/vocabulary/cells'
import { VocabToggle } from '@/components/vocabulary/toggle-button'
import { useVocabToggle } from '@/hooks/vocab-toggle'
import { SortIcon } from '@/lib/icon-utils'
import { getFilterFn } from '@/lib/table-utils'

export function useVocabularyCommonColumns<T extends LabelDisplayTable = LabelDisplayTable>(tbody?: React.RefObject<HTMLTableSectionElement | null>) {
  const { t } = useTranslation()
  const columnHelper = createColumnHelper<T>()
  const handleVocabToggle = useVocabToggle()
  return [
    columnHelper.accessor((row) => row.vocab.word, {
      id: 'word',
      filterFn: getFilterFn(),
      header: ({ header }) => {
        const isSorted = header.column.getIsSorted()
        const title = t('Word')
        return (
          <TableHeaderCell
            header={header}
            className="active:bg-background-active"
          >
            <Div
              className="group gap-1.5 pr-1"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
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
      cell({ row, cell }) {
        const { wFamily } = row.original
        const last = wFamily.length - 1
        return (
          <TableDataCell
            cell={cell}
            className="py-1"
          >
            <>
              {wFamily.map(({ path: w, src }, i) => (
                <div
                  key={w}
                  className="inline-block cursor-text pl-1 tracking-4 select-text first:pl-1.5"
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <HoverCard
                    openDelay={200}
                    closeDelay={100}
                  >
                    <HoverCardTrigger asChild>
                      <span
                        className={clsx(
                          'rounded-lg px-1 py-0.5 transition-colors delay-100 hover:bg-background-focus',
                          i === 0 && src.length >= 1 ? '' : 'text-neutral-500 dark:text-neutral-400',
                        )}
                      >
                        {w}
                      </span>
                    </HoverCardTrigger>
                    <HoverCardContent
                      container={tbody?.current}
                      side="top"
                      sideOffset={-1}
                      align="end"
                      style={{
                        '--z-index': 999_999_999,
                      }}
                      className="z-(--z-index) flex size-6 justify-center p-0.5 [[data-radix-popper-content-wrapper]:has(&)]:z-[1991991991]!"
                    >
                      <VocabularyMenu
                        word={w}
                      />
                    </HoverCardContent>
                  </HoverCard>
                  {i < last && (
                    <span className="text-neutral-500 dark:text-neutral-400">, </span>
                  )}
                </div>
              ))}
            </>
          </TableDataCell>
        )
      },
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
              className="group gap-2 pr-1 select-none"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
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
            <Div className="justify-end pr-[9px] pl-0.5 tracking-3 tabular-nums">
              <span>
                {value}
              </span>
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => {
      return row.vocab.learningPhase <= 1 ? row.vocab.learningPhase : row.inertialPhase
    }, {
      id: 'acquaintedStatus',
      filterFn: getFilterFn(),
      header: ({ header }) => {
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:bg-background-active"
          >
            <Div
              className="group select-none"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
              />
              <div className="flex min-w-[30px] grow items-center justify-center">
                <SortIcon
                  isSorted={isSorted}
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
          <Div className="justify-center pr-px pl-0.5">
            <VocabToggle
              vocab={row.original.vocab}
              onToggle={handleVocabToggle}
            />
          </Div>
        </TableDataCell>
      ),
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
              className="group gap-2 pr-1 select-none"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
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
            <Div className="justify-center pr-px pl-0.5 tracking-3 tabular-nums">
              {value}
            </Div>
          </TableDataCell>
        )
      },
    }),
  ]
}
