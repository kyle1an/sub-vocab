/* eslint-disable react-compiler/react-compiler */
import type { ReactElement, RefObject } from 'react'

import { flexRender, type Row } from '@tanstack/react-table'
import { mergeRefs } from 'react-merge-refs'
import { useIntersectionObserver } from 'usehooks-ts'

import type { GroupHeader } from '@/types/vocab'

import { useRect } from '@/lib/hooks'

export function TableHeaderWrapper<T>({ header }: { header: GroupHeader<T> }) {
  'use no memo'
  return (
    header.isPlaceholder ? (
      <TableHeader header={header} />
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

export function TableHeader<T>({
  header,
  children,
  className = '',
}: {
  header: GroupHeader<T>
  children?: ReactElement
  className?: string
}) {
  return (
    <th
      key={header.id}
      colSpan={header.colSpan}
      className={cn(
        'group/th border-y border-solid border-y-zinc-200 bg-background p-0 text-sm font-normal dark:border-slate-800',
        className,
      )}
    >
      {children}
    </th>
  )
}

type RowProp<T> = {
  row: Row<T>
} & (ExpandProp | Partial<ExpandProp>)

type ExpandProp = {
  children: ReactElement
  index: number
  rootRef: RefObject<HTMLDivElement | null>
}

export function TableRow<T>({
  row,
  rootRef,
  index = 0,
  children,
}: RowProp<T>) {
  const className = 'relative bg-background'
  const canExpand = row.getCanExpand()
  const isExpanded = row.getIsExpanded()
  const headHeight = 30
  const rowRef = useRef<HTMLTableRowElement>(null)
  const subRef = useRef<HTMLTableRowElement>(null)
  const { height: rowHeight } = useRect(rowRef)
  const [rowRef2, rowUnderPinnedVisible] = useIntersectionObserver({
    root: rootRef?.current ?? null,
    rootMargin: `${-headHeight - rowHeight - 0.01}px 0% 0%`,
  })
  const [subRef2, , subEntry] = useIntersectionObserver({
    root: rootRef?.current ?? null,
    rootMargin: `${-headHeight - rowHeight}px 0% 0%`,
  })
  const isSubAboveRoot = subEntry && subEntry.boundingClientRect.bottom < (subEntry.rootBounds?.top ?? 0)
  const [subRef3, isSubVisibleIntersecting] = useIntersectionObserver({
    root: rootRef?.current ?? null,
    rootMargin: `${-headHeight - rowHeight + 1}px 0% -100%`,
  })
  const toggleExpandedHandler = row.getToggleExpandedHandler()

  function handleToggleExpanded() {
    toggleExpandedHandler()
    if (!rowRef.current) return
    const rowPinnedOrAbove = !rowUnderPinnedVisible
    if (rowPinnedOrAbove) {
      if (subRef.current) {
        if (isSubVisibleIntersecting) {
          rootRef?.current?.scrollTo({
            top: subRef.current.offsetTop - headHeight - rowHeight,
          })
        } else if (isSubAboveRoot) {
          rootRef?.current?.scrollTo({
            top: rowRef.current.offsetTop - headHeight - subRef.current.offsetHeight,
          })
        }
      } else {
        rootRef?.current?.scrollTo({
          top: rowRef.current.offsetTop - headHeight,
        })
      }
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
          '--top': `${headHeight}px`,
          '--z-index': index,
        }}
        className={cn(
          className,
          'group/tr z-[--z-index] shadow-[0px_-4px_10px_-6px_rgba(0,0,0,0.1)] transition-shadow data-[sticky=true]:sticky data-[sticky=true]:top-[--top]',
        )}
        data-collapsed={canExpand && !isExpanded}
        data-sticky={isExpanded}
        data-boundary={isSubVisibleIntersecting || isSubAboveRoot}
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
              'h-8 border-y border-solid border-b-transparent border-t-border-td pl-0.5 group-first-of-type/tr:border-t-0 group-data-[boundary=true]/tr:border-b-border-td',
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
            className,
            'z-[--z-index] [&+tr]:shadow-none',
          )}
        >
          {children}
        </tr>
      ) : null}
    </>
  )
}
