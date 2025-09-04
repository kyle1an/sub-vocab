'use client'

import { useStore } from 'jotai'
import { useRef } from 'react'

import { useAppEffects } from '@/app/[locale]/_hooks/useAppEffects'
import { mainBgColorAtom } from '@/atoms'
import { NavActions } from '@/components/nav-actions'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { LIGHT_THEME_COLOR } from '@/constants/theme'
import { useStyleObserver } from '@sub-vocab/utils/hooks'

export function AppSidebarInset({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const store = useStore()
  useStyleObserver(ref, ([{ value }]) => {
    store.set(mainBgColorAtom, value || LIGHT_THEME_COLOR)
  }, {
    properties: ['background-color'],
  })
  useAppEffects()
  return (
    <SidebarInset
      ref={ref}
    >
      <header className="flex h-14 shrink-0 items-center gap-2">
        <div className="flex h-full flex-1 gap-2">
          <div className="flex p-2 md:hidden">
            <SidebarTrigger className="size-8" />
          </div>
        </div>
        <div className="ml-auto px-3 pr-4">
          <NavActions />
        </div>
      </header>
      {children}
    </SidebarInset>
  )
}
