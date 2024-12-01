/* eslint-disable react-compiler/react-compiler */
import type { ReactElement, RefObject } from 'react'

import { flexRender, type Row, type Table } from '@tanstack/react-table'
import { mergeRefs } from 'react-merge-refs'
import { useIntersectionObserver } from 'usehooks-ts'

import type { GroupHeader } from '@/types/vocab'

import { useRect } from '@/lib/hooks'

export function TableHeader<T>({ header }: { header: GroupHeader<T> }) {
  'use no memo'
  return (
    header.isPlaceholder ? (
      <th
        colSpan={header.colSpan}
        className="border-y border-solid border-y-zinc-200 p-0 text-sm font-normal"
      />
    ) : (
      <>
        {flexRender(
          header.column.columnDef.header,
          header.getContext(),
        )}
      </>
    )
  )
}

export function TableRow<T>({
  row,
  rootRef,
  index,
  children,
}: {
  row: Row<T>
  rootRef?: RefObject<HTMLDivElement | null>
  index: number
  children?: ReactElement
}) {
  const canExpand = row.getCanExpand()
  const isExpanded = row.getIsExpanded()
  const thHeight = 30
  const rowRef = useRef<HTMLTableRowElement>(null)
  const subRef = useRef<HTMLTableRowElement>(null)
  const { height: trHeight } = useRect(rowRef)
  const [rowRef2, unPinned] = useIntersectionObserver({
    root: rootRef?.current ?? null,
    rootMargin: `${-thHeight - trHeight - 0.01}px 0% 0%`,
  })
  const [subRef2, , subEntry] = useIntersectionObserver({
    root: rootRef?.current ?? null,
    rootMargin: `${-thHeight - trHeight}px 0% 0%`,
  })
  const isSubAboveRoot = (subEntry?.boundingClientRect.bottom ?? 0) < (subEntry?.rootBounds?.top ?? 0)
  const [subRef3, isIntersecting] = useIntersectionObserver({
    root: rootRef?.current ?? null,
    rootMargin: `${-thHeight - trHeight + 1}px 0% -100%`,
  })
  const toggleExpandedHandler = row.getToggleExpandedHandler()
  const [isPending, startTransition] = useTransition()

  function handleToggleExpanded() {
    toggleExpandedHandler()
    if (!unPinned) {
      startTransition(async () => {
        await new Promise((r) => setTimeout(r, 1))
      })
    }
    if (
      subRef.current
      && isIntersecting
      && !unPinned
    ) {
      rootRef?.current?.scrollTo({
        top: subRef.current.offsetTop - thHeight - trHeight,
      })
    }
  }

  return (
    <>
      <tr
        ref={
          mergeRefs([
            rowRef,
            rowRef2,
          ])
        }
        style={{
          '--top': `${thHeight}px`,
          '--z-index': index,
        }}
        className={cn(
          'group z-[--z-index] data-[sticky=true]:sticky data-[sticky=true]:top-[--top] data-[collapsed=true]:shadow-[inset_0px_-4px_10px_-6px_rgba(0,0,0,0.1)]',
        )}
        data-collapsed={canExpand && !isExpanded}
        data-sticky={isExpanded}
        data-boundary={isIntersecting || (isExpanded && isSubAboveRoot)}
        onClick={((event) => {
          if (
            event.nativeEvent.composedPath().some((e) => {
              return e instanceof HTMLElement && e.classList.contains('expand-button')
            })
          ) {
            handleToggleExpanded()
          }
        })}
      >
        {row.getVisibleCells().map((cell) => (
          <td
            key={cell.id}
            className={cn(
              'h-8 border-y border-solid border-b-transparent border-t-border-td pl-0.5 group-first-of-type:border-t-0 group-data-[boundary=true]:border-b-border-td',
            )}
          >
            {flexRender(
              cell.column.columnDef.cell,
              cell.getContext(),
            )}
          </td>
        ))}
      </tr>
      {isExpanded ? (
        <tr
          ref={
            mergeRefs([
              subRef,
              subRef2,
              subRef3,
            ])
          }
          style={{
            '--z-index': index - 1,
          }}
          className={cn(
            'z-[--z-index]',
            isPending ? 'select-none *:opacity-0' : '',
          )}
        >
          {children}
        </tr>
      ) : null}
    </>
  )
}
