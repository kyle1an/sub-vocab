import { Slot } from '@radix-ui/react-slot'

export interface DivProps extends
  React.HTMLAttributes<HTMLDivElement>,
  React.RefAttributes<HTMLDivElement> {}

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
