import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import * as React from 'react'

import { cn } from '@/lib/utils'

type PositionerProps = Pick<
  React.ComponentProps<typeof TooltipPrimitive.Positioner>,
  'align' | 'alignOffset' | 'anchor' | 'collisionBoundary' | 'collisionPadding' | 'side' | 'sideOffset' | 'sticky'
>

type PortalProps = Pick<
  React.ComponentProps<typeof TooltipPrimitive.Portal>,
  'container' | 'keepMounted'
>

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Popup> & PositionerProps & PortalProps & {
  avoidCollisions?: boolean | undefined
  popupRef?: React.Ref<HTMLDivElement> | undefined
  positionerClassName?: string | undefined
}

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
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      {...props}
    />
  )
}

function TooltipArrowSvg({
  className,
  ...props
}: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="20"
      height="10"
      viewBox="0 0 20 10"
      fill="none"
      className={cn('h-2.5 w-5', className)}
      aria-hidden
      {...props}
    >
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-[canvas]"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-gray-200 dark:fill-none"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="dark:fill-gray-300"
      />
    </svg>
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
  sideOffset = 10,
  side,
  sticky,
  children,
  container,
  keepMounted,
  popupRef,
  positionerClassName,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal container={container} keepMounted={keepMounted}>
      <TooltipPrimitive.Positioner
        className={positionerClassName}
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
          ref={popupRef}
          data-slot="tooltip-content"
          className={cn(
            'z-50 flex w-fit origin-(--transform-origin) flex-col rounded-md bg-[canvas] px-2 py-1 text-sm text-[canvastext] scheme-light shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-ending-style:scale-90 data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-90 data-starting-style:opacity-0 dark:scheme-dark dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300',
            className,
          )}
          {...props}
        >
          <TooltipPrimitive.Arrow
            data-slot="tooltip-arrow"
            className="flex data-[side=bottom]:-top-2 data-[side=bottom]:rotate-0 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
          >
            <TooltipArrowSvg />
          </TooltipPrimitive.Arrow>
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
