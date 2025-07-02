import { Slot } from '@radix-ui/react-slot'

import type { DivProps } from '@/components/ui/html-elements'

import { cn } from '@/lib/utils'

export function ContentRoot({
  className,
  asChild = false,
  children,
  ...props
}: DivProps & {
  asChild?: boolean
}) {
  const Component = asChild ? Slot : 'div'
  return (
    <Component
      className={cn('z-0 flex grow flex-col items-center', className)}
      {...props}
    >
      {children}
    </Component>
  )
}
