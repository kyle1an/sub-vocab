import { Slot } from '@/components/ui/slot'
import { cn } from '@/lib/utils'

export interface DivProps extends
  React.ComponentProps<'div'> {}

export function Div({
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
      className={cn(className)}
      {...props}
    >
      {children}
    </Component>
  )
}
