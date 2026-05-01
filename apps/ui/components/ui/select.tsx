import {
  CaretSortIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons'
import {
  Select as SelectPrimitive,
  type SelectRootProps,
} from '@base-ui/react/select'
import * as React from 'react'

import { cn } from '@/lib/utils'

type PositionerProps = Pick<
  React.ComponentProps<typeof SelectPrimitive.Positioner>,
  | 'align'
  | 'alignItemWithTrigger'
  | 'alignOffset'
  | 'anchor'
  | 'collisionBoundary'
  | 'collisionPadding'
  | 'side'
  | 'sideOffset'
  | 'sticky'
>

type PortalProps = Pick<
  React.ComponentProps<typeof SelectPrimitive.Portal>,
  'container'
>

type SelectValue<Value, Multiple extends boolean | undefined> =
  Multiple extends true ? Value[] : Value

type SelectProps<
  Value = string,
  Multiple extends boolean | undefined = false,
> = Omit<SelectRootProps<Value, Multiple>, 'onValueChange'> & {
  onValueChange?: ((
    value: SelectValue<Value, Multiple>,
    eventDetails: Parameters<
      NonNullable<SelectRootProps<Value, Multiple>['onValueChange']>
    >[1],
  ) => void) | undefined
}

function Select<Value = string, Multiple extends boolean | undefined = false>({
  children,
  items,
  onValueChange,
  ...props
}: SelectProps<Value, Multiple>) {
  const derivedItems = React.useMemo(() => {
    if (items) {
      return items
    }

    const collectedItems = collectSelectItems(children)
    return collectedItems.length > 0 ? collectedItems : undefined
  }, [children, items])

  if (onValueChange) {
    return (
      <SelectPrimitive.Root<Value, Multiple>
        data-slot="select"
        items={derivedItems}
        onValueChange={(value, eventDetails) => {
          if (value !== null) {
            onValueChange(value as SelectValue<Value, Multiple>, eventDetails)
          }
        }}
        {...props}
      >
        {children}
      </SelectPrimitive.Root>
    )
  }

  return (
    <SelectPrimitive.Root<Value, Multiple>
      data-slot="select"
      items={derivedItems}
      {...props}
    >
      {children}
    </SelectPrimitive.Root>
  )
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow,border-color] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        '[--sq-r:.75rem] sq:rounded-(--sq-r) sq:shadow-none',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <CaretSortIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  align,
  alignItemWithTrigger,
  alignOffset,
  anchor,
  collisionBoundary,
  collisionPadding,
  container,
  side,
  sideOffset,
  sticky,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Popup> & PositionerProps & PortalProps & {
  position?: 'item-aligned' | 'popper'
}) {
  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger ?? position !== 'popper'}
        alignOffset={alignOffset}
        anchor={anchor}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            'relative z-50 min-w-16 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
            position === 'popper'
            && 'data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95',
            position === 'popper'
            && 'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            position === 'popper'
            && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            position === 'item-aligned' && 'data-[side=none]:translate-y-px',
            '[--sq-r:.9375rem] sq:relative sq:rounded-(--sq-r) sq:shadow-none sq:drop-shadow-md',
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List
            className={cn(
              'p-1',
              position === 'popper'
              && 'h-(--anchor-height) w-full min-w-(--anchor-width) scroll-my-1',
            )}
          >
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn('px-2 py-1.5 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex h-6 w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-6 text-sm outline-hidden select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        '[--sq-r:.5rem] sq:rounded-(--sq-r)',
        className,
      )}
      {...props}
    >
      <span className="absolute left-0 flex size-3.5 w-6 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText render={<span />}>
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function collectSelectItems(children: React.ReactNode) {
  const items: Array<{ label: React.ReactNode, value: unknown }> = []

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return
    }

    if (child.type === SelectItem) {
      const props = child.props as React.ComponentProps<typeof SelectItem>
      items.push({
        label: props.label ?? props.children,
        value: props.value ?? null,
      })
      return
    }

    const props = child.props as { children?: React.ReactNode }
    items.push(...collectSelectItems(props.children))
  })

  return items
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="select-separator"
      role="separator"
      className={cn('pointer-events-none mx-3 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        'inset-x-0 top-0 z-10 flex h-6 cursor-default items-center justify-center bg-popover',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        'inset-x-0 bottom-0 z-10 flex h-6 cursor-default items-center justify-center bg-popover',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
