import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import * as React from 'react'

import { cn } from '@/lib/utils'

type PositionerProps = Pick<
  React.ComponentProps<typeof PopoverPrimitive.Positioner>,
  'align' | 'alignOffset' | 'anchor' | 'collisionBoundary' | 'collisionPadding' | 'side' | 'sideOffset' | 'sticky'
>

type PortalProps = Pick<
  React.ComponentProps<typeof PopoverPrimitive.Portal>,
  'container' | 'keepMounted'
>

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      {...props}
    />
  )
}

function PopoverContent({
  className,
  align = 'center',
  alignOffset,
  anchor,
  collisionBoundary,
  collisionPadding,
  container,
  keepMounted,
  side,
  sideOffset = 4,
  sticky,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> & PositionerProps & PortalProps) {
  return (
    <PopoverPrimitive.Portal keepMounted={keepMounted} container={container}>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            'z-50 w-72 origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            '[--sq-r:1.125rem] sq:rounded-(--sq-r) sq:shadow-none sq:drop-shadow-lg',
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<'div'>) {
  return <div data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
