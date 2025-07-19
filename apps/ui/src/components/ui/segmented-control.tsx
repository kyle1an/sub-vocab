import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import clsx from 'clsx'
import { useRef } from 'react'
import $ from 'render-hooks'

import { cn } from '@/lib/utils'

const segmentedControlVariants = cva(
  clsx(
    `grid w-full touch-manipulation! auto-cols-[1fr] grid-flow-col overflow-hidden rounded-lg antialiased outline-hidden select-none [text-rendering:geometricPrecision]`,
    'sq:rounded-[.9375rem] sq:superellipse-[1.75]',
  ),
  {
    variants: {
      variant: {
        default: 'bg-[#EFEFF0] p-0.5 dark:bg-neutral-800/40',
        ghost: 'bg-transparent px-1.5 py-1',
      },
      size: {
        default: '',
        small: '',
        medium: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        className: 'group/default',
      },
      {
        variant: 'ghost',
        className: 'group/ghost',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface SegmentedControlProps<T extends string> extends
  React.ComponentProps<'div'>,
  VariantProps<typeof segmentedControlVariants> {
  value: NoInfer<T>
  segments: Readonly<{ value: T, label: string }[]>
  onValueChange: (value: T) => void
}

const checkedSegmentVariants = cva(
  'bg-white transition-transform duration-300',
  {
    variants: {
      variant: {
        default: 'border-[.5px] border-black/[.1] bg-white drop-shadow-xs dark:bg-neutral-600',
        ghost: 'bg-neutral-200 dark:bg-neutral-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export function SegmentedControl<T extends string>({
  value,
  segments,
  onValueChange: setValue,
  variant,
  size,
  className,
  ...props
}: SegmentedControlProps<T>) {
  const pillRefs = useRef<Partial<Record<T, HTMLSpanElement>>>({})

  function handleOnChange(newValue: T) {
    const pillRef = pillRefs.current[newValue]
    if (pillRef) {
      const previousPill = pillRefs.current[value]
      const domRect = previousPill?.getBoundingClientRect()
      activatePill(pillRef, domRect)
      setValue(newValue)
    }
  }

  function activatePill(pillRef: HTMLElement, previousIndicatorClientRect?: DOMRect) {
    const element = pillRef

    if (
      !previousIndicatorClientRect
      || !element.getBoundingClientRect
    )
      return

    // https://github.com/angular/components/blob/a7f87a80a18a62d75a8c5621fd89dbc2cf28a865/src/material/tabs/ink-bar.ts#L114
    const currentClientRect = element.getBoundingClientRect()
    const widthDelta = previousIndicatorClientRect.width / currentClientRect.width
    const xPosition = previousIndicatorClientRect.left - currentClientRect.left
    element.style.setProperty(
      'transform',
      `translateX(${xPosition}px) scaleX(${widthDelta})`,
    )
    element.getBoundingClientRect()
    element.style.setProperty('transform', '')
  }

  function addToRefs(key: T) {
    return (el: HTMLDivElement) => {
      pillRefs.current[key] = el
    }
  }

  return (
    <div
      className={cn(segmentedControlVariants({ variant, size, className }))}
      {...props}
    >
      {segments.map((item) => (
        <$ key={item.value}>
          {({ useId }) => {
            // eslint-disable-next-line react-compiler/react-compiler, react-hooks/rules-of-hooks
            const id = useId()
            const checked = item.value === value
            const label = item.label
            return (
              <div
                className="group/d relative first-of-type:col-1 first-of-type:row-1 first-of-type:shadow-none"
                data-checked={checked}
              >
                <input
                  id={id}
                  aria-label="Segmented control"
                  type="radio"
                  value={item.value}
                  checked={checked}
                  className="absolute inset-0 appearance-none opacity-0 outline-hidden"
                  onChange={() => {
                    handleOnChange(item.value)
                  }}
                />
                <label
                  htmlFor={id}
                  className="relative block cursor-pointer bg-transparent text-center group-data-[checked=true]/d:cursor-default before:absolute before:inset-y-[14%] before:left-0 before:w-px before:translate-x-[-.5px] before:rounded-[.625rem] before:bg-neutral-300 before:transition-[background] before:duration-200 before:ease-[ease] before:will-change-[background] group-first-of-type/d:before:opacity-0 group-data-[checked=true]/d:before:z-10 group-data-[checked=true]/d:before:bg-transparent group-[&[data-checked=true]+*]/d:before:bg-transparent dark:before:bg-neutral-700"
                >
                  <div className={clsx(
                    'flex flex-col justify-center text-sm/6',
                    variant === 'ghost' && 'leading-5.5',
                  )}
                  >
                    <div
                      className={clsx(
                        'relative z-10 flex justify-center text-black transition-all duration-200 ease-[ease] will-change-transform group-hover/d:opacity-20 group-focus/d:opacity-20 group-active/d:opacity-20 group-active/d:delay-150 group-data-[checked=true]/d:font-medium group-data-[checked=true]/d:opacity-100 group-[&:active[data-checked=false]]/d:scale-95 dark:text-white',
                      )}
                    >
                      {label}
                    </div>
                    <div
                      title={label}
                      className="before:invisible before:block before:h-0 before:overflow-hidden before:font-bold before:content-[attr(title)]"
                    />
                  </div>
                  <div className="absolute top-0 left-0 size-full">
                    <div
                      ref={addToRefs(item.value)}
                      className={cn(
                        'flex size-full rounded-md ease-[ease] will-change-transform',
                        'sq:rounded-[.6875rem] sq:superellipse-[1.75]',
                        checked && checkedSegmentVariants({ variant }),
                      )}
                    />
                  </div>
                </label>
              </div>
            )
          }}
        </$>
      ))}
    </div>
  )
}
