import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'
import * as React from 'react'

import { getNativeButtonProp, getRenderChildren, getRenderProp } from '@/components/ui/base-ui-compat'
import { buttonVariants } from '@/components/ui/button.var'
import { cn } from '@/lib/utils'

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  asChild,
  children,
  ...props
}: Omit<React.ComponentProps<typeof AlertDialogPrimitive.Trigger>, 'render'> & {
  asChild?: boolean
}) {
  const render = getRenderProp(asChild, children)

  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      nativeButton={getNativeButtonProp(asChild, children)}
      render={render}
      {...props}
    >
      {getRenderChildren(asChild, children)}
    </AlertDialogPrimitive.Trigger>
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Backdrop>) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50 opacity-100 transition-opacity duration-200 data-[closed]:opacity-0 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Popup>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        className={cn(
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95 sm:max-w-lg',
          '[--sq-r:1.25rem] sq:shadow-none sq:drop-shadow-lg sq:sm:rounded-(--sq-r)',
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  asChild,
  children,
  ...props
}: Omit<React.ComponentProps<typeof AlertDialogPrimitive.Close>, 'render'> & {
  asChild?: boolean
}) {
  const render = getRenderProp(asChild, children)

  return (
    <AlertDialogPrimitive.Close
      nativeButton={getNativeButtonProp(asChild, children)}
      render={render}
      className={cn(buttonVariants(), className)}
      {...props}
    >
      {getRenderChildren(asChild, children)}
    </AlertDialogPrimitive.Close>
  )
}

function AlertDialogCancel({
  className,
  asChild,
  children,
  ...props
}: Omit<React.ComponentProps<typeof AlertDialogPrimitive.Close>, 'render'> & {
  asChild?: boolean
}) {
  const render = getRenderProp(asChild, children)

  return (
    <AlertDialogPrimitive.Close
      nativeButton={getNativeButtonProp(asChild, children)}
      render={render}
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    >
      {getRenderChildren(asChild, children)}
    </AlertDialogPrimitive.Close>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
