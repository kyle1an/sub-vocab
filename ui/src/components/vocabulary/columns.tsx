import {
  createColumnHelper,
} from '@tanstack/react-table'
import {
  useTranslation,
} from 'react-i18next'

import type { LabelDisplayTable } from '@/lib/vocab'

import { HeaderTitle, TableHeaderCell } from '@/components/ui/table-element'
import { VocabToggle } from '@/components/vocabulary/toggle-button'
import { useVocabToggle } from '@/hooks/vocab-toggle'
import { SortIcon } from '@/lib/icon-utils'
import { getFilterFn } from '@/lib/table-utils'

export function useVocabularyCommonColumns<T extends LabelDisplayTable = LabelDisplayTable>() {
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
                className="data-[title]:*:text-left"
              />
            </Div>
          </TableHeaderCell>
        )
      },
      cell: ({ row, cell }) => {
        const { wFamily } = row.original
        const last = wFamily.length - 1
        return (
          <TableDataCell
            cell={cell}
          >
            <>
              {wFamily.map(({ path: w, src }, i) => (
                <div
                  key={w}
                  className="inline-block cursor-text select-text pl-1.5 tracking-wider [font-feature-settings:'cv03','cv05','cv06'] first:pl-2"
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <span className={clsx(i === 0 && src.length >= 1 ? '' : 'text-neutral-500 dark:text-slate-400')}>{w}</span>
                  {i < last && <span className="text-neutral-500 dark:text-slate-400">, </span>}
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
              className="group select-none gap-2 pr-1 [font-stretch:condensed]"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
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
            <Div className="justify-end pl-0.5 pr-[9px] text-xs tabular-nums">
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
              className="group select-none [font-stretch:condensed]"
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
          <Div className="justify-center pl-0.5 pr-px">
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
              className="group select-none gap-2 pr-1"
              onClick={header.column.getToggleSortingHandler()}
            >
              <Separator
                orientation="vertical"
                className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
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
            <Div className="justify-center pl-0.5 pr-px tabular-nums [font-stretch:condensed]">
              {value}
            </Div>
          </TableDataCell>
        )
      },
    }),
  ]
}
