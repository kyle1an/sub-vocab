import * as HoverCardPrimitive from '@radix-ui/react-hover-card'
import * as React from 'react'

import { cn } from '@/lib/utils'

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = ({ ref, container, className, align = 'center', sideOffset = 4, ...props }: React.ComponentPropsWithRef<typeof HoverCardPrimitive.Content> & Pick<React.ComponentPropsWithRef<typeof HoverCardPrimitive.Portal>, 'container'>) => (
  <HoverCardPrimitive.Portal container={container}>
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        'sq:rounded-[.875rem] sq:[corner-shape:squircle] [[data-radix-popper-content-wrapper]:has(&)]:absolute!',
        className,
      )}
      {...props}
    />
  </HoverCardPrimitive.Portal>
)
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardContent, HoverCardTrigger }
