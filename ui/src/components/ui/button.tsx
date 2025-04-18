import type { VariantProps } from 'class-variance-authority'

import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import clsx from 'clsx'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  clsx(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors [--offset:1px] [--sq-r:1rem] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sq:[corner-shape:squircle]',
  ),
  {
    variants: {
      variant: {
        default: clsx(
          'bg-primary text-primary-foreground shadow hover:bg-primary-hover',
          'sq:rounded-[--sq-r] sq:shadow-none sq:drop-shadow',
          'relative focus-visible:after:rounded-[calc(var(--sq-r)+var(--offset))] focus-visible:after:border focus-visible:after:border-[--ring] focus-visible:after:[corner-shape:squircle] sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))]',
        ),
        destructive: clsx(
          'hover:bg-destructive/90 bg-destructive text-destructive-foreground shadow-sm',
        ),
        outline: clsx(
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
          'sq:rounded-[--sq-r] sq:shadow-none sq:drop-shadow-sm',
          '[--offset:2px]',
          'relative focus-visible:after:rounded-[calc(var(--sq-r)+var(--offset))] focus-visible:after:border focus-visible:after:border-[--ring] focus-visible:after:[corner-shape:squircle] sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))]',
        ),
        secondary: clsx(
          'hover:bg-secondary/80 bg-secondary text-secondary-foreground shadow-sm',
        ),
        ghost: clsx(
          'hover:bg-accent hover:text-accent-foreground',
          'sq:rounded-[--sq-r]',
          'relative focus-visible:after:rounded-[calc(var(--sq-r)+var(--offset))] focus-visible:after:border focus-visible:after:border-[--ring] focus-visible:after:[corner-shape:squircle] sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))]',
        ),
        link: clsx(
          'text-primary underline-offset-4 hover:underline',
        ),
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps extends
  React.ComponentProps<'button'>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
