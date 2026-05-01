import type { VariantProps } from 'class-variance-authority'

import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import * as React from 'react'

import { toggleVariants } from '@/components/ui/toggle.var'
import { cn } from '@/lib/utils'

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive>
  & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle }
