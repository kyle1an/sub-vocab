import type * as React from 'react'

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'

import { getNativeButtonProp, getRenderChildren, getRenderProp } from '@/components/ui/base-ui-compat'

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  asChild,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CollapsiblePrimitive.Trigger>, 'render'> & {
  asChild?: boolean
}) {
  const render = getRenderProp(asChild, children)

  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      nativeButton={getNativeButtonProp(asChild, children)}
      render={render}
      {...props}
    >
      {getRenderChildren(asChild, children)}
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Panel>) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
