import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
  {
    variants: {
      variant: {
        default: cn(
          'bg-transparent',
          '[--sq-r:2px] before:size-full before:mask-squircle before:sq-radius-[--sq-r] sq:bg-transparent sq:before:absolute sq:before:-z-10 sq:before:hover:bg-muted sq:data-[state=on]:before:bg-accent',
          'relative [--offset:1px] focus-visible:after:squircle focus-visible:after:sq-radius-[calc(var(--sq-r)+var(--offset))] focus-visible:after:sq-outline focus-visible:after:sq-stroke-ring sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))]',
        ),
        outline:
          'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
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
  ref,
  className,
  variant,
  size,
  ...props
}: React.ComponentPropsWithRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
