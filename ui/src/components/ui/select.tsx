import {
  CaretSortIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons'
import * as SelectPrimitive from '@radix-ui/react-select'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground',
        'sq-radius-[--sq-r] sq-outline-[--l-w] sq-stroke-[--input] sq-fill-transparent [--l-w:1px] [--sq-r:4px] sq:rounded-none sq:border-0 sq:shadow-none sq:[background:paint(squircle)]',
        'relative [--offset:1px] focus:after:sq-radius-[calc(var(--sq-r)+var(--offset)-0.3px)] focus:after:sq-outline focus:after:sq-stroke-[--ring] focus:after:sq-fill-transparent sq:focus:ring-0 sq:focus:after:absolute sq:focus:after:-left-[--offset] sq:focus:after:-top-[--offset] sq:focus:after:size-[calc(100%+2*var(--offset))] focus:after:sq:[background:paint(squircle)]',
        'tracking-wide',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretSortIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'relative z-50 min-w-16 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
          position === 'popper' && 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper'
          && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          'sq-radius-[--sq-r] sq-outline-[--l-w] sq-stroke-[--border] sq-fill-[--popover] [--l-w:1px] [--sq-r:6px] sq:relative sq:border-0 sq:bg-transparent sq:p-[calc(0px+var(--l-w))] sq:shadow-none sq:drop-shadow-md sq:[background:paint(squircle)]',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-[25px] cursor-default items-center justify-center bg-transparent">
          <ChevronUpIcon />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper'
            && 'h-[--radix-select-trigger-height] w-full min-w-[--radix-select-trigger-width]',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-[25px] cursor-default items-center justify-center bg-transparent">
          <ChevronDownIcon />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn('px-6 text-xs font-semibold leading-6 text-zinc-500', className)}
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
      className={cn(
        'relative flex h-6 w-full cursor-default select-none items-center rounded-sm px-6 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:outline-none',
        'sq-radius-[--sq-r] [--sq-r:3px] focus:sq-outline-0 focus:sq-fill-[--accent] data-[highlighted]:sq-fill-[--accent] focus:sq:bg-transparent focus:sq:[background:paint(squircle)] data-[highlighted]:sq:bg-transparent',
        'tracking-wide',
        className,
      )}
      {...props}
    >
      <span className="absolute left-0 flex h-3.5 w-6 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn('mx-3 my-1 h-px bg-muted', className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
