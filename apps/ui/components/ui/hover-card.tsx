import type { PreviewCardRootProps } from '@base-ui/react/preview-card'

import {
  PreviewCard as HoverCardPrimitive,

} from '@base-ui/react/preview-card'
import * as React from 'react'

import { getRenderChildren, getRenderProp } from '@/components/ui/base-ui-compat'
import { cn } from '@/lib/utils'

type PositionerProps = Pick<
  React.ComponentProps<typeof HoverCardPrimitive.Positioner>,
  'align' | 'alignOffset' | 'anchor' | 'collisionBoundary' | 'collisionPadding' | 'side' | 'sideOffset' | 'sticky'
>

type PortalProps = Pick<
  React.ComponentProps<typeof HoverCardPrimitive.Portal>,
  'container' | 'keepMounted'
>

type HoverCardDelayContextValue = {
  closeDelay: number | undefined
  openDelay: number | undefined
}

type HoverCardProps = Omit<PreviewCardRootProps, 'children'> & {
  children?: React.ReactNode
  closeDelay?: number | undefined
  openDelay?: number | undefined
}

const HoverCardDelayContext = React.createContext<HoverCardDelayContextValue>({
  closeDelay: undefined,
  openDelay: undefined,
})

function HoverCard({
  children,
  closeDelay,
  openDelay,
  ...props
}: HoverCardProps) {
  return (
    <HoverCardDelayContext.Provider value={{ closeDelay, openDelay }}>
      <HoverCardPrimitive.Root data-slot="hover-card" {...props}>
        {children}
      </HoverCardPrimitive.Root>
    </HoverCardDelayContext.Provider>
  )
}

function HoverCardTrigger({
  asChild,
  children,
  closeDelay,
  delay,
  ...props
}: Omit<React.ComponentProps<typeof HoverCardPrimitive.Trigger>, 'render'> & {
  asChild?: boolean
}) {
  const delayConfig = React.useContext(HoverCardDelayContext)
  const render = getRenderProp(asChild, children)

  return (
    <HoverCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      closeDelay={closeDelay ?? delayConfig.closeDelay}
      delay={delay ?? delayConfig.openDelay}
      render={render}
      {...props}
    >
      {getRenderChildren(asChild, children)}
    </HoverCardPrimitive.Trigger>
  )
}

function HoverCardContent({
  className,
  align = 'center',
  alignOffset,
  anchor,
  collisionBoundary,
  collisionPadding,
  sideOffset = 4,
  container,
  keepMounted,
  side,
  sticky,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Popup> & PositionerProps & PortalProps) {
  return (
    <HoverCardPrimitive.Portal
      data-slot="hover-card-portal"
      keepMounted={keepMounted}
      container={container}
    >
      <HoverCardPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
      >
        <HoverCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            'z-50 w-64 origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            'sq:rounded-[.875rem]',
            className,
          )}
          {...props}
        />
      </HoverCardPrimitive.Positioner>
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardContent, HoverCardTrigger }
