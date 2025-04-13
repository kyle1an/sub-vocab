import type { VariantProps } from 'class-variance-authority'

import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva } from 'class-variance-authority'
import clsx from 'clsx'

import { cn } from '@/lib/utils'

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
  {
    variants: {
      variant: {
        default: clsx(
          'bg-transparent',
          '[--sq-r:.375rem] sq:rounded-[--sq-r] sq:[corner-shape:squircle]',
          'relative [--offset:1px] sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))] focus-visible:after:sq:rounded-[calc(var(--sq-r)+var(--offset))] focus-visible:after:sq:border focus-visible:after:sq:border-[--ring] focus-visible:after:sq:[corner-shape:squircle]',
        ),
        outline: clsx(
          'border border-input shadow-sm [--sq-r:1rem] sq:rounded-[--sq-r] sq:shadow-none sq:drop-shadow-sm sq:[corner-shape:squircle]',
          'relative [--offset:2px] sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))] focus-visible:after:sq:rounded-[calc(var(--sq-r)+var(--offset))] focus-visible:after:sq:border focus-visible:after:sq:border-[--ring] focus-visible:after:sq:[corner-shape:squircle]',
        ),
      },
      size: {
        default: 'h-9 px-3',
        sm: 'h-8 px-2',
        lg: 'h-10 px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle }
