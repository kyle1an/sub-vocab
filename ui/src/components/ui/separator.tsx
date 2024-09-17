import * as SeparatorPrimitive from '@radix-ui/react-separator'

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
