import type { Cell, Renderable, Row, SortDirection } from '@tanstack/react-table'
import type { ReactElement } from 'react'

import { Slot } from '@radix-ui/react-slot'
import { useIntersectionObserver } from '@react-hookz/web'
import { flexRender } from '@tanstack/react-table'
import clsx from 'clsx'
import { sum } from 'es-toolkit'
import ms from 'ms'
import nstr from 'nstr'
import React, { Fragment, useRef, useState } from 'react'

import type { DivProps } from '@/components/ui/html-elements'
import type { RowSelectionChangeFn } from '@/types/utils'
import type { GroupHeader } from '@/types/vocab'

import { SortIcon } from '@/components/my-icon/sort-icon'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { useClone, useRect } from '@/hooks'
import { useRetimer } from '@/hooks/useRetimer'
import { cn } from '@/lib/utils'

export const HEAD_HEIGHT = 30

function FlexRender<TProps extends object>({
  comp,
  props,
}: {
  comp: Renderable<TProps>
  props: TProps
}) {
  return flexRender(comp, useClone(props))
}

export function TableHeader({
  children,
  className = '',
  style,
  ...props
}: React.ComponentProps<'thead'>) {
  return (
    <thead
      style={{
        '--z-index': 999_999_999,
        '--height': `${HEAD_HEIGHT}px`,
        ...style,
      }}
      className={cn(
        'sticky top-0 z-(--z-index) h-(--height) bg-background px-0',
        className,
      )}
      {...props}
    >
      {children}
    </thead>
  )
}

export function TableHeaderCellRender<T>({ header }: { header: GroupHeader<T> }) {
  const props = useClone(header.getContext())
  return (
    header.isPlaceholder ? (
      <TableHeaderCell header={header} />
    ) : (
      <FlexRender
        comp={header.column.columnDef.header}
        props={props}
      />
    )
  )
}

export function TableHeaderCell<T>({
  header: {
    id,
    colSpan,
  },
  children,
  className = '',
}: {
  header: GroupHeader<T>
  children?: ReactElement
  className?: string
}) {
  return (
    <th
      key={id}
      colSpan={colSpan}
      className={cn(
        'group/th border-y border-solid border-y-zinc-200 bg-background p-0 text-xs font-normal whitespace-nowrap dark:border-neutral-800',
        className,
      )}
    >
      <Slot className="flex size-full h-7 cursor-pointer items-center">
        {children}
      </Slot>
    </th>
  )
}

export function TableDataCell<T>({
  cell: {
    id,
  },
  children,
  className = '',
}: {
  cell: Cell<T, unknown>
  children?: ReactElement
  className?: string
}) {
  return (
    <td
      key={id}
      className={cn(
        'h-8 border-t border-solid border-t-border-td p-0 text-sm group-first-of-type/tr:border-t-transparent group-data-boundary/tr:border-b-border-td',
        className,
      )}
    >
      {children?.type === Fragment ? children : (
        <Slot className="flex size-full items-center">
          {children}
        </Slot>
      )}
    </td>
  )
}

export function HeaderTitle({
  title,
  className,
  isSorted,
}: DivProps & {
  isSorted: false | SortDirection
}) {
  return (
    <div className={cn('flex grow items-center select-none', className)}>
      <span
        data-title={title}
        className={clsx(
          'grow before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(data-title)]',
          isSorted ? 'font-semibold' : '',
        )}
      >
        {title}
      </span>
      <SortIcon
        isSorted={isSorted}
      />
    </div>
  )
}

type RowProp<T> = {
  row: Row<T>
  onRowSelectionChange?: RowSelectionChangeFn<T>
} & Partial<ExpandProp>

type ExpandProp = {
  children: ReactElement
  index: number
  root: React.RefObject<HTMLDivElement | null> | null
}

const ANIM_DURATION = ms('0.3s')

const SHADOW_DURATION = ms('0.4s')

export function TableRow<T>({
  row: {
    id,
    subRows,
    toggleExpanded,
    getCanExpand,
    getIsExpanded,
    getVisibleCells,
  },
  root: rootRef = null,
  index = 0,
  children,
  onRowSelectionChange,
}: RowProp<T>) {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const { height: rowHeight } = useRect(rowRef)
  const detailRef = useRef<HTMLTableRowElement>(null)
  const [open, setOpen] = useState(getIsExpanded)
  const [animationOpen, setAnimationOpen] = useState(false)
  const retimeAnim = useRetimer()
  const [transitionOpen, setTransitionOpen] = useState(false)
  const retimeTransition = useRetimer()

  function handleToggleExpanded(isClosing: boolean) {
    const isOpening = !isClosing
    setAnimationOpen(true)
    setTransitionOpen(true)
    setOpen(isOpening)
    toggleExpanded()
    if (isOpening) {
      retimeAnim(() => setAnimationOpen(false), ANIM_DURATION)
    }

    retimeTransition(() => setTransitionOpen(false), SHADOW_DURATION)
    if (rootRef?.current && rowRef.current) {
      if (rowRef.current.getBoundingClientRect().y - rootRef.current.getBoundingClientRect().y <= HEAD_HEIGHT) {
        if (isClosing && detailRef.current) {
          const subRowsHeight = sum(
            subRows
              .map((subRow) => document.querySelector(`tr[data-id="${subRow.id}"]`))
              .map((e) => e?.offsetHeight || 0),
          )
          const overlapHeight = rowRef.current.offsetTop + rowHeight - detailRef.current.offsetTop
          const expandedHeight = detailRef.current.offsetHeight + subRowsHeight
          if (overlapHeight < expandedHeight) {
            // subRow / isDetailVisibleIntersecting
            rootRef?.current.scrollTo({
              top: -HEAD_HEIGHT - rowHeight + detailRef.current.offsetTop,
            })
          } else {
            // isDetailAboveRoot
            rootRef.current.scrollTo({
              top: -HEAD_HEIGHT + rowRef.current.offsetTop - expandedHeight,
              behavior: isClosing ? 'instant' : 'smooth',
            })
          }
        } else {
          rootRef.current.scrollTo({
            top: -HEAD_HEIGHT + rowRef.current.offsetTop,
            behavior: 'smooth',
          })
        }
      }
    }
  }

  const canExpand = getCanExpand()
  const detailEntry = useIntersectionObserver(canExpand ? detailRef : null, {
    root: rootRef,
    rootMargin: `${nstr(-HEAD_HEIGHT - rowHeight)}px 0% 0%`,
  })
  const isDetailAboveRoot = detailEntry && detailEntry.boundingClientRect.bottom < (detailEntry.rootBounds?.top ?? 0)
  const detailEntry2 = useIntersectionObserver(canExpand ? detailRef : null, {
    root: rootRef,
    rootMargin: `${nstr(-HEAD_HEIGHT - rowHeight + 1)}px 0% -100%`,
  })
  const isDetailVisibleIntersecting = Boolean(detailEntry2?.isIntersecting)
  const visibleCells = useClone(getVisibleCells())
  const state = open ? 'open' : 'closed'

  let rowZIndex = index
  if (open && subRows.length >= 1) {
    rowZIndex += subRows.length + 1
  }
  return (
    <Fragment>
      <tr
        ref={rowRef}
        data-id={id}
        style={{
          '--top': `${HEAD_HEIGHT}px`,
          '--z-index': rowZIndex,
        }}
        data-row
        className="group/tr relative z-(--z-index) bg-background transition-shadow duration-0 [content-visibility:auto] data-boundary:shadow-intersect! data-[state=open]:sticky data-[state=open]:top-(--top) [[data-boundary]+*:empty+&>*]:border-t-transparent [[data-detail-above]+&]:shadow-collapse [[data-detail-above]+&]:duration-200 [[data-state=closed]+&]:shadow-collapse [[data-state=closed][data-disabled]+&]:shadow-none [[data-transition-open]+&]:duration-300"
        data-disabled={!canExpand || undefined}
        data-state={state}
        data-boundary={(isDetailAboveRoot ? open : isDetailVisibleIntersecting) && !animationOpen ? '' : undefined}
      >
        {visibleCells.map((cell) => (
          <FlexRender
            key={cell.id}
            comp={cell.column.columnDef.cell}
            props={{
              ...cell.getContext(),
              onExpandedChange: handleToggleExpanded,
              onRowSelectionChange,
            }}
          />
        ))}
      </tr>
      {canExpand ? (
        <tr
          ref={detailRef}
          style={{
            '--z-index': index - 1,
          }}
          data-state={state}
          data-detail-above={isDetailAboveRoot || undefined}
          data-transition-open={transitionOpen || undefined}
          className="relative z-(--z-index) bg-background"
        >
          {children ? (
            <td
              colSpan={visibleCells.length}
              className="p-0"
            >
              <Collapsible
                open={open}
              >
                <CollapsibleContent
                  data-no-anim-open={!animationOpen || undefined}
                  data-no-anim-closed={(isDetailAboveRoot && !open) || undefined}
                  className="overflow-hidden data-[state=closed]:animate-accordion-up data-[no-anim-closed]:data-[state=closed]:[animation-duration:0s] data-[state=open]:animate-accordion-down data-[no-anim-open]:data-[state=open]:[animation-duration:0s]"
                >
                  {children}
                </CollapsibleContent>
              </Collapsible>
            </td>
          ) : null}
        </tr>
      ) : null}
    </Fragment>
  )
}
