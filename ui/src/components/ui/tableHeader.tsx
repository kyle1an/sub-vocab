/* eslint-disable react-compiler/react-compiler */
import type { ReactElement, RefObject } from 'react'

import { Slot } from '@radix-ui/react-slot'
import { type Cell, flexRender, type Row } from '@tanstack/react-table'
import { useRetimer } from 'foxact/use-retimer'
import React from 'react'
import { mergeRefs } from 'react-merge-refs'
import { useIntersectionObserver } from 'usehooks-ts'

import type { GroupHeader } from '@/types/vocab'

import { useRect } from '@/lib/hooks'

const HEAD_HEIGHT = 30

export function TableHeader({
  children,
  className = '',
  style,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      style={{
        '--z-index': 999_999_999,
        '--height': `${HEAD_HEIGHT}px`,
        ...style,
      }}
      className={cn(
        'sticky top-0 z-[--z-index] h-[--height] bg-background px-0',
        className,
      )}
      {...props}
    >
      {children}
    </thead>
  )
}

export function TableHeaderCellRender<T>({ header }: { header: GroupHeader<T> }) {
  'use no memo'
  return (
    header.isPlaceholder ? (
      <TableHeaderCell header={header} />
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

export function TableHeaderCell<T>({
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
        'group/th whitespace-nowrap border-y border-solid border-y-zinc-200 bg-background p-0 text-xs font-normal dark:border-slate-800',
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
  cell,
  children,
  className = '',
}: {
  cell: Cell<T, unknown>
  children?: ReactElement
  className?: string
}) {
  return (
    <td
      key={cell.id}
      className={cn(
        'h-8 border-y border-solid border-b-transparent border-t-border-td p-0 text-sm group-first-of-type/tr:border-t-0 group-data-[boundary=true]/tr:border-b-border-td',
        className,
      )}
    >
      {children?.type === React.Fragment ? children : (
        <Slot className="flex size-full items-center pl-0.5 pr-px">
          {children}
        </Slot>
      )}
    </td>
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

const ANIM_DURATION = 300

const SHADOW_DURATION = 400

export function TableRow<T>({
  row,
  rootRef,
  index = 0,
  children,
}: RowProp<T>) {
  const canExpand = row.getCanExpand()
  const isExpanded = row.getIsExpanded()
  const rowRef = useRef<HTMLTableRowElement>(null!)
  const subRef = useRef<HTMLTableRowElement>(null)
  const { height: rowHeight } = useRect(rowRef)
  const [rowRef2, rowUnderPinnedVisible] = useIntersectionObserver({
    root: rootRef?.current ?? null,
    rootMargin: `${-HEAD_HEIGHT - rowHeight - 0.01}px 0% 0%`,
  })
  const rowPinnedOrAbove = !rowUnderPinnedVisible
  const [subRef2, , subEntry] = useIntersectionObserver({
    root: rootRef?.current ?? null,
    rootMargin: `${-HEAD_HEIGHT - rowHeight}px 0% 0%`,
  })
  const isSubAboveRoot = subEntry && subEntry.boundingClientRect.bottom < (subEntry.rootBounds?.top ?? 0)
  const [subRef3, isSubVisibleIntersecting] = useIntersectionObserver({
    root: rootRef?.current ?? null,
    rootMargin: `${-HEAD_HEIGHT - rowHeight + 1}px 0% -100%`,
  })
  const toggleExpandedHandler = row.getToggleExpandedHandler()
  const [accordionValue, setAccordionValue] = useState(isExpanded ? 'x' : '')
  const [openAnimationDisabled, setOpenAnimationDisabled] = useState(isExpanded)
  const [shadowTransitionDisabled, setShadowTransitionDisabled] = useState(true)
  const retimerAnim = useRetimer()
  const retimerShadow = useRetimer()

  function handleAccordionUpdate() {
    setAccordionValue(isExpanded ? '' : 'x')
    if (!isExpanded) {
      retimerAnim(window.setTimeout(() => setOpenAnimationDisabled(true), ANIM_DURATION))
    }
    retimerShadow(window.setTimeout(() => setShadowTransitionDisabled(true), SHADOW_DURATION))
  }

  function handleToggleExpanded() {
    toggleExpandedHandler()
    setOpenAnimationDisabled(false)
    setShadowTransitionDisabled(false)
    if (subRef.current) {
      handleAccordionUpdate()
    } else {
      requestAnimationFrame(() => {
        handleAccordionUpdate()
      })
    }
    if (rowPinnedOrAbove) {
      if (subRef.current) {
        if (isSubVisibleIntersecting) {
          rootRef?.current?.scrollTo({
            top: subRef.current.offsetTop - HEAD_HEIGHT - rowHeight,
          })
        } else if (isSubAboveRoot) {
          rootRef?.current?.scrollTo({
            top: rowRef.current.offsetTop - HEAD_HEIGHT - subRef.current.offsetHeight,
          })
        }
      } else {
        rootRef?.current?.scrollTo({
          top: rowRef.current.offsetTop - HEAD_HEIGHT,
          behavior: 'smooth',
        })
      }
    }
  }

  const visibleCells = row.getVisibleCells()
  const isCollapsed = canExpand && !isExpanded

  return (
    <>
      <tr
        ref={mergeRefs([
          rowRef,
          rowRef2,
        ])}
        style={{
          '--top': `${HEAD_HEIGHT}px`,
          '--z-index': index,
        }}
        className="row group/tr relative z-[--z-index] bg-background shadow-[0px_-4px_10px_-6px] shadow-black/10 transition-shadow duration-300 data-[expanded=true]:sticky data-[expanded=true]:top-[--top] dark:shadow-slate-600 [[data-collapsed=false]&+.row]:shadow-none [[data-no-shadow-transition=true]&+.row]:duration-0"
        data-collapsed={isCollapsed}
        data-expanded={isExpanded}
        data-no-shadow-transition={shadowTransitionDisabled}
        data-boundary={isSubAboveRoot ? isExpanded : isSubVisibleIntersecting}
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
        {visibleCells.map((cell) => (
          <Fragment key={cell.id}>
            {flexRender(
              cell.column.columnDef.cell,
              cell.getContext(),
            )}
          </Fragment>
        ))}
      </tr>
      {children && (isExpanded || subRef.current) ? (
        <tr
          ref={mergeRefs([
            subRef,
            subRef2,
            subRef3,
          ])}
          style={{
            '--z-index': index - 1,
          }}
          data-collapsed={isCollapsed}
          data-no-shadow-transition={shadowTransitionDisabled}
          className="relative z-[--z-index] bg-background [[data-collapsed=false]&+.row]:shadow-none [[data-no-shadow-transition=true]&+.row]:duration-0"
        >
          <td
            colSpan={visibleCells.length}
            className="p-0"
          >
            <Accordion type="single" value={accordionValue}>
              <AccordionItem
                value="x"
                data-no-open-anim={openAnimationDisabled}
                data-no-closed-anim={isSubAboveRoot && !isExpanded}
                className="border-none *:data-[no-closed-anim=true]:data-[state=closed]:anim-duration-0 *:data-[no-open-anim=true]:data-[state=open]:anim-duration-0"
              >
                <AccordionContent className="pb-0">
                  {children}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </td>
        </tr>
      ) : null}
    </>
  )
}
