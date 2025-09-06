import type { VariantProps } from 'class-variance-authority'

import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'

import { buttonVariants } from '@/components/ui/button.var'
import { cn } from '@/lib/utils'

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'>
  & VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
