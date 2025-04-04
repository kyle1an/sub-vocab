import type { VariantProps } from 'class-variance-authority'

import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors [--offset:1px] [--sq-r:6px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sq:rounded-none',
  {
    variants: {
      variant: {
        default: cn(
          'hover:bg-primary/90 bg-primary text-primary-foreground shadow',
          'sq-radius-[--sq-r] sq-outline-0 sq-fill-[--primary] hover:sq-fill-[--primary-hover] sq:bg-transparent sq:shadow-none sq:drop-shadow sq:[background:paint(squircle)]',
          'relative focus-visible:after:sq-radius-[calc(var(--sq-r)+var(--offset))] focus-visible:after:sq-outline focus-visible:after:sq-stroke-[--ring] focus-visible:after:sq-fill-transparent sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))] focus-visible:after:sq:[background:paint(squircle)]',
        ),
        destructive:
          'hover:bg-destructive/90 bg-destructive text-destructive-foreground shadow-sm',
        outline: cn(
          'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
          'sq-radius-[--sq-r] sq-outline-[--l-w] sq-stroke-[--input] sq-fill-[--b-g] [--l-w:1px] hover:sq-fill-[--accent] sq:border-0 sq:bg-transparent sq:shadow-none sq:drop-shadow-sm sq:[background:paint(squircle)]',
          'relative focus-visible:after:sq-radius-[calc(var(--sq-r)+var(--offset)-0.5px)] focus-visible:after:sq-outline focus-visible:after:sq-stroke-[--ring] focus-visible:after:sq-fill-transparent sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))] focus-visible:after:sq:[background:paint(squircle)]',
        ),
        secondary:
          'hover:bg-secondary/80 bg-secondary text-secondary-foreground shadow-sm',
        ghost: cn(
          'hover:bg-accent hover:text-accent-foreground',
          'sq-radius-[--sq-r] hover:sq-outline-0 hover:sq-fill-[--accent] hover:sq:bg-transparent hover:sq:[background:paint(squircle)]',
          'relative focus-visible:after:sq-radius-[calc(var(--sq-r)+var(--offset))] focus-visible:after:sq-outline focus-visible:after:sq-stroke-[--ring] focus-visible:after:sq-fill-transparent sq:focus-visible:ring-0 sq:focus-visible:after:absolute sq:focus-visible:after:-left-[--offset] sq:focus-visible:after:-top-[--offset] sq:focus-visible:after:size-[calc(100%+2*var(--offset))] focus-visible:after:sq:[background:paint(squircle)]',
        ),
        link: 'text-primary underline-offset-4 hover:underline',
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
// ^ With auto-imports, adding a new line will cause ReferenceError: buttonVariants is not defined
