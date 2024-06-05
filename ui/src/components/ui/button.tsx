import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const a = (
  <div
    className={cn(
      'squircle sq-rounded-[6px] sq-outline sq-fill-input sq:border-0 sq:shadow-none sq:drop-shadow-sm sq:hover:bg-transparent',
      'before:squircle before:sq-rounded-[5px] before:sq-outline-0 before:sq-fill-transparent hover:before:sq-fill-accent sq:before:absolute sq:before:left-[--l-w] sq:before:top-[--l-w] sq:before:z-[-1] sq:before:size-[calc(100%-2*var(--l-w))]',
    )}
  />
)

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
          'squircle sq-rounded-[6px] sq-outline-0 sq-fill-primary hover:sq-fill-primary/90 sq:bg-transparent sq:shadow-none sq:drop-shadow',
        ),
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: cn(
          'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
          'squircle sq-rounded-[6px] sq-outline-[--l-w] sq-fill-input [--l-w:1px] sq:border-0 sq:shadow-none sq:drop-shadow-sm sq:hover:bg-transparent',
          'before:squircle before:sq-rounded-[5px] before:sq-outline-0 before:sq-fill-transparent hover:before:sq-fill-accent sq:before:absolute sq:before:left-[--l-w] sq:before:top-[--l-w] sq:before:z-[-1] sq:before:size-[calc(100%-2*var(--l-w))]',
        ),
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'sq-rounded-[5px] sq-outline-0 after:absolute after:[mask-image:paint(squircle)] hover:bg-accent hover:text-accent-foreground focus-visible:after:bg-ring focus-visible:after:sq-outline sq:relative sq:rounded-none sq:[mask-image:paint(squircle)] sq:after:size-full',
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps & React.RefAttributes<HTMLButtonElement>) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}
Button.displayName = 'Button'

export { Button, buttonVariants }
