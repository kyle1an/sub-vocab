import {
  type ChangeEvent, type HTMLAttributes, type RefObject, createRef, useRef,
} from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils.ts'

const segmentedControlVariants = cva(
  `box-border grid w-full !touch-manipulation select-none auto-cols-[1fr] grid-flow-col overflow-hidden rounded-[9px] tracking-wide antialiased outline-none tap-transparent !overflow-scrolling-touch ffs-['cv08'] [text-rendering:geometricPrecision] [&_*]:box-border`,
  {
    variants: {
      variant: {
        default: 'bg-[#EFEFF0] p-0.5',
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

export interface SegmentedControlProps<T extends string> extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof segmentedControlVariants> {
  value: T
  name: string
  segments: Readonly<{ value: T; label: string }[]>
  onChoose: (value: T) => void
}

export const SegmentedControl = <T extends string>({
  value,
  name,
  segments,
  onChoose,
  variant,
  size,
  className,
  ...props
}: SegmentedControlProps<T>) => {
  const pillRefs = useRef<RefObject<HTMLSpanElement>[]>([])
  pillRefs.current = segments.map((_, i) => pillRefs.current[i] ?? createRef())

  function handleOnChange(ev: ChangeEvent<HTMLInputElement>, index: number) {
    const previousPillIndex = segments.findIndex((s) => s.value === value)
    const previousPill = pillRefs.current[previousPillIndex]?.current
    const previousPillClientRect = previousPill?.getBoundingClientRect()
    const element = pillRefs.current[index].current

    if (!previousPillClientRect || !element) {
      return
    }

    // https://github.com/angular/components/blob/a7f87a80a18a62d75a8c5621fd89dbc2cf28a865/src/material/tabs/ink-bar.ts#L114
    const currentClientRect = element.getBoundingClientRect()
    const widthDelta = previousPillClientRect.width / currentClientRect.width
    const xPosition = previousPillClientRect.left - currentClientRect.left
    element.style.setProperty(
      'transform',
      `translateX(${xPosition}px) scaleX(${widthDelta})`,
    )
    element.getBoundingClientRect()
    element.style.setProperty('transform', '')
    onChoose(ev.target.value as T)
  }

  return (
    <div
      className={cn(segmentedControlVariants({ variant, size, className }))}
      {...props}
    >
      {segments.map((item, index) => (
        <div
          key={index}
          className="group relative first-of-type:col-[1] first-of-type:row-[1] first-of-type:shadow-[none]"
        >
          <input
            id={`${name}-${item.value}`}
            type="radio"
            value={item.value}
            checked={item.value === value}
            className="group/i peer absolute inset-0 appearance-none opacity-0 outline-none"
            onChange={(ev) => handleOnChange(ev, index)}
          />
          <label
            htmlFor={`${name}-${item.value}`}
            className="group/l before:ease-[ease] relative block cursor-pointer bg-transparent text-center before:absolute before:inset-y-[14%] before:left-0 before:w-px before:translate-x-[-.5px] before:rounded-[10px] before:bg-neutral-300 before:transition-[background] before:duration-200 before:will-change-[background] before:group-first-of-type:opacity-0 before:group-[&:has(input:checked)+div]:bg-opacity-0 peer-checked:cursor-default before:peer-checked:z-[1] before:peer-checked:bg-opacity-0 [&_span]:peer-checked:font-medium"
          >
            <span className="flex flex-col justify-center text-sm/6 group-[]/ghost:leading-[1.375rem]">
              <span
                className="ease-[ease] relative z-10 flex justify-center text-black transition-all duration-200 will-change-transform group-hover:opacity-20 group-focus:opacity-20 group-active:opacity-20 group-active:delay-150 group-active:group-[&:not(:checked)+label]/i:scale-95 peer-checked:group-[]/l:opacity-100"
              >
                {item.label}
              </span>
              <span
                title={item.label}
                className="before:hidden-bold before:content-[attr(title)]"
              />
            </span>
            <span className="absolute left-0 top-0 h-full w-full">
              <span
                ref={pillRefs.current[index]}
                className={cn(
                  'ease-[ease] flex h-full w-full rounded-[7px] will-change-transform group-[]/default:peer-checked:group-[]/l:border-[.5px] group-[]/default:peer-checked:group-[]/l:border-black/[0.04]  group-[]/ghost:peer-checked:group-[]/l:bg-neutral-200 peer-checked:group-[]/l:bg-white group-[]/default:peer-checked:group-[]/l:shadow',
                  item.value === value && 'transition-transform duration-300',
                )}
              />
            </span>
          </label>
        </div>
      ))}
    </div>
  )
}
