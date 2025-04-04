import type { VariantProps } from 'class-variance-authority'

import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
  {
    variants: {
      variant: {
        default: cn(
          'bg-transparent',
          '[--sq-r:2px] before:absolute before:size-full before:transition-colors before:sq-radius-[--sq-r] sq:rounded-none sq:bg-transparent sq:before:-z-10 before:sq:[mask:paint(squircle)] sq:before:hover:bg-muted sq:data-[state=on]:before:bg-accent',
          'relative [--offset:1px] focus-visible:after:sq-radius-[calc(var(--sq-r)+var(--offset))] focus-visible:after:sq-outline focus-visible:after:sq-stroke-[--ring] focus-visible:after:sq-fill-transparent sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))] focus-visible:after:sq:[background:paint(squircle)]',
        ),
        outline: cn(
          'border border-input shadow-sm sq-radius-[--sq-r] sq-outline sq-stroke-[--input] sq-fill-transparent [--sq-r:6] hover:sq-fill-[--muted] data-[state=on]:sq-fill-[--accent] sq:border-none sq:shadow-none sq:drop-shadow-sm sq:[background:paint(squircle)] hover:sq:bg-transparent data-[state=on]:sq:bg-transparent',
          'relative [--offset:1px] focus-visible:after:sq-radius-[calc(var(--sq-r)+var(--offset))] focus-visible:after:sq-outline focus-visible:after:sq-stroke-[--ring] focus-visible:after:sq-fill-transparent sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))] focus-visible:after:sq:[background:paint(squircle)]',
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
