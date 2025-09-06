import clsx from 'clsx'
import ms from 'ms'
import * as React from 'react'
import { useId } from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { drawerStateFamily } from '@/components/ui/drawer.var'
import { cn } from '@/lib/utils'
import { retimerAtomFamily, setAtom } from '@sub-vocab/utils/atoms'
import { useAtomEffect } from '@sub-vocab/utils/hooks'

const TRANSITIONS_DURATION = ms('0.5s')

const animRetimerFamily = retimerAtomFamily()
const removeRetimerFamily = retimerAtomFamily()

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  const { shouldScaleBackground = false, open = false } = props
  const id = useId()
  const drawerStateAtom = drawerStateFamily.useA([
    id,
    {
      open,
      shouldScaleBackground,
    },
  ])
  useAtomEffect((get, set) => {
    const retimeAnim = get(animRetimerFamily(id))
    const setDrawerState = setAtom(set, drawerStateAtom)
    setDrawerState((d) => {
      d.open = open
    })
    retimeAnim(() => {
      setDrawerState((d) => {
        d.openAnimationEnd = open
      })
      retimeAnim.tryRemove()
    }, TRANSITIONS_DURATION)
    return () => {
      retimeAnim.tryRemove()
    }
  }, [drawerStateAtom, id, open])
  useAtomEffect((get) => {
    const retimeRemoveDrawer = get(removeRetimerFamily(id))
    retimeRemoveDrawer()
    return () => {
      retimeRemoveDrawer(() => {
        drawerStateFamily.remove([id])
        retimeRemoveDrawer.tryRemove()
      }, TRANSITIONS_DURATION)
    }
  }, [id])
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/20 dark:bg-black/30',
        className,
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'group/drawer-content fixed z-50 flex h-auto flex-col bg-background',
          'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b',
          'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[calc(100%-1.475rem)] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t',
          'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm',
          'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm',
          'h-full outline-hidden sq:data-[vaul-drawer-direction=bottom]:rounded-t-2xl sq:data-[vaul-drawer-direction=top]:rounded-b-2xl',
          className,
        )}
        {...props}
      >
        <div
          className={clsx(
            'mx-auto mt-1.5 hidden h-2 w-[100px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block',
          )}
        />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
}
