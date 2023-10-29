import { type HTMLAttributes, useEffect } from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { useMeasure, useSessionStorage } from 'react-use'
import { cn } from '@/lib/utils.ts'

const segmentedControlVariants = cva(
  `box-border grid w-full !touch-manipulation select-none auto-cols-[1fr] grid-flow-col overflow-hidden rounded-[9px] tracking-wide antialiased outline-none tap-transparent !overflow-scrolling-touch ffs-['cv08'] [text-rendering:geometricPrecision] [&_*]:box-border`,
  {
    variants: {
      variant: {
        default: 'bg-[#EFEFF0] p-0.5',
        ghost: 'bg-transparent px-1.5 py-1 [&>span]:border-0 [&>span]:bg-neutral-200 [&>span]:shadow-none [&_label>span]:leading-[1.375rem]',
      },
      size: {
        default: '',
        small: '',
        medium: '',
      },
    },
    compoundVariants: [],
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
  const [pillWidth, setPillWidth] = useSessionStorage(`${name}-width`, 0)
  const [pill, { width }] = useMeasure<HTMLSpanElement>()
  useEffect(() => {
    if (width !== 0) {
      setPillWidth(width)
    }
  }, [width, setPillWidth])
  return (
    <div
      className={cn(segmentedControlVariants({ variant, size, className }))}
      {...props}
    >
      <span
        style={{ transform: `translateX(${pillWidth * segments.findIndex((seg) => seg.value === value)}px)` }}
        className={cn('ease-[ease] z-10 col-start-1 col-end-auto row-start-1 row-end-auto rounded-[7px] border-[.5px] border-black/[0.04] bg-white shadow transition-transform duration-300 will-change-transform', pillWidth === 0 && 'hidden')}
      />
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
            onChange={(ev) => onChoose((ev.target as HTMLInputElement).value as T)}
          />
          <label
            htmlFor={`${name}-${item.value}`}
            className="before:ease-[ease] relative block cursor-pointer bg-transparent text-center before:absolute before:inset-y-[14%] before:left-0 before:w-px before:translate-x-[-.5px] before:rounded-[10px] before:bg-neutral-300 before:transition-[background] before:duration-200 before:will-change-[background]  before:group-first-of-type:opacity-0  before:group-[&:has(input:checked)+div]:bg-opacity-0 peer-checked:cursor-default before:peer-checked:z-[1] before:peer-checked:bg-opacity-0 [&_span]:peer-checked:font-medium"
          >
            <span
              ref={pill}
              className="ease-[ease] relative z-10 flex justify-center text-sm/6 text-black transition-all duration-200 will-change-transform group-hover:opacity-20 group-focus:opacity-20 group-active:opacity-20 group-[&:checked+label]/i:opacity-100 group-active:group-[&:not(:checked)+label]/i:scale-95"
            >
              {item.label}
            </span>
          </label>
        </div>
      ))}
    </div>
  )
}
