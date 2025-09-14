import { useNetworkState } from '@react-hookz/web'
import {
  createColumnHelper,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { useAtomCallback } from 'jotai/utils'
import { Fragment } from 'react'
import { toast } from 'sonner'

import type { TrackedWord } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'
import type { VocabularySourceState } from '@/app/[locale]/(vocabulary)/_lib/vocab'

import { userWordPhaseMutationAtom } from '@/app/[locale]/(vocabulary)/_api'
import { VocabularyMenu } from '@/app/[locale]/(vocabulary)/_components/cells'
import { VocabToggle } from '@/app/[locale]/(vocabulary)/_components/toggle-button'
import { userAtom } from '@/atoms/auth'
import { LoginToast } from '@/components/login-toast'
import { SortIcon } from '@/components/my-icon/sort-icon'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Div } from '@/components/ui/html-elements'
import { Separator } from '@/components/ui/separator'
import { HeaderTitle, TableDataCell, TableHeaderCell } from '@/components/ui/table-element'
import { filterFn } from '@/lib/table-utils'
import { useI18n } from '@/locales/client'

export function useVocabularyCommonColumns<T extends VocabularySourceState = VocabularySourceState>(tbody?: HTMLTableSectionElement | null, rootRef?: React.RefObject<HTMLDivElement | null>) {
  const t = useI18n()
  const columnHelper = createColumnHelper<T>()
  const { online: isOnline } = useNetworkState()
  const handleVocabToggle = useAtomCallback((get, _, vocab: TrackedWord) => {
    if (!get(userAtom)) {
      toast(<LoginToast />)
      return
    }
    if (!isOnline) {
      toast('You must be online to save your progress.')
      return
    }
    const rows2Mutate = [vocab].filter((row) => row.form.length <= 32)
    if (rows2Mutate.length === 0) {
      return
    }
    get(userWordPhaseMutationAtom).mutateAsync(rows2Mutate)
      .catch(console.error)
  })
  return [
    columnHelper.accessor((row) => row.trackedWord.form, {
      id: 'word',
      filterFn,
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
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
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
        const { wordFamily } = row.original
        const last = wordFamily.length - 1
        return (
          <TableDataCell
            cell={cell}
            className="py-1"
          >
            <Fragment>
              {wordFamily.map(({ pathe: w, locators: src }, i) => (
                <div
                  key={w}
                  className="inline-block cursor-text pl-1 tracking-[.04em] select-text"
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
                      container={tbody}
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
            </Fragment>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => row.trackedWord.form.length, {
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
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
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
            <Div className="justify-end pr-[9px] pl-0.5 tracking-[.03em] tabular-nums">
              <span>
                {value}
              </span>
            </Div>
          </TableDataCell>
        )
      },
    }),
    columnHelper.accessor((row) => {
      return row.trackedWord.learningPhase <= 1 ? row.trackedWord.learningPhase : row.inertialPhase
    }, {
      id: 'acquaintedStatus',
      filterFn,
      header: ({ header }) => {
        const isSorted = header.column.getIsSorted()
        return (
          <TableHeaderCell
            header={header}
            className="w-[.1%] active:bg-background-active"
          >
            <Div
              className="group select-none"
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
            >
              <Separator
                orientation="vertical"
                className="h-5 group-active:h-full group-[:has(:active)+th]/th:h-full"
              />
              <div className="flex min-w-[30px] grow items-center justify-center">
                <SortIcon
                  isSorted={isSorted}
                  fallback={<svg className="icon-[lucide--check-circle]" />}
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
              vocab={row.original.trackedWord}
              onToggle={handleVocabToggle}
            />
          </Div>
        </TableDataCell>
      ),
    }),
    columnHelper.accessor((row) => row.trackedWord.rank, {
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
              onClick={(e) => {
                header.column.getToggleSortingHandler()?.(e)
                requestAnimationFrame(() => rootRef?.current?.scrollTo({ top: 0 }))
              }}
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
            <Div className="justify-center pr-px pl-0.5 tracking-[.03em] tabular-nums">
              {value}
            </Div>
          </TableDataCell>
        )
      },
    }),
  ]
}
