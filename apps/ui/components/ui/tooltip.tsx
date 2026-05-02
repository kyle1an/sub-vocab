import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import clsx from 'clsx'
import * as React from 'react'

import { getRenderChildren, getRenderProp } from '@/components/ui/base-ui-compat'
import { cn } from '@/lib/utils'

type PositionerProps = Pick<
  React.ComponentProps<typeof TooltipPrimitive.Positioner>,
  'align' | 'alignOffset' | 'anchor' | 'collisionBoundary' | 'collisionPadding' | 'side' | 'sideOffset' | 'sticky'
>

type PortalProps = Pick<
  React.ComponentProps<typeof TooltipPrimitive.Portal>,
  'container' | 'keepMounted'
>

function TooltipProvider({
  delayDuration,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider> & {
  delayDuration?: number | undefined
}) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delayDuration ?? 0}
      {...props}
    />
  )
}

function Tooltip({
  delayDuration,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root> & {
  delayDuration?: number | undefined
}) {
  return (
    <TooltipProvider
      {...(delayDuration === undefined ? {} : { delayDuration })}
    >
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  asChild,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TooltipPrimitive.Trigger>, 'render'> & {
  asChild?: boolean
}) {
  const render = getRenderProp(asChild, children)

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      render={render}
      {...props}
    >
      {getRenderChildren(asChild, children)}
    </TooltipPrimitive.Trigger>
  )
}

function TooltipContent({
  className,
  align,
  alignOffset,
  anchor,
  collisionBoundary,
  collisionPadding,
  avoidCollisions,
  sideOffset = 0,
  side,
  sticky,
  children,
  container,
  keepMounted,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> & PositionerProps & PortalProps & {
  avoidCollisions?: boolean | undefined
}) {
  return (
    <TooltipPrimitive.Portal container={container} keepMounted={keepMounted}>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        collisionAvoidance={
          avoidCollisions === false
            ? { side: 'none', align: 'none', fallbackAxisSide: 'none' }
            : undefined
        }
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            'z-50 w-fit origin-(--transform-origin) animate-in rounded-md bg-primary px-3 py-1.5 text-xs text-balance text-primary-foreground fade-in-0 zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            'sq:rounded-[.6875rem]',
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow
            data-slot="tooltip-arrow"
            className={clsx(
              'z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-primary fill-primary',
              'sq:rounded-[.251rem]',
            )}
          />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
