import '../globals.css'

import { isSafari } from 'foxact/is-safari'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Fragment, Suspense, useRef } from 'react'
import { Outlet } from 'react-router'
import { ClientOnly } from 'remix-utils/client-only'

import { bodyBgColorAtom, mainBgColorAtom } from '@/atoms'
import { authChangeEventAtom, sessionAtom } from '@/atoms/auth'
import { myStore } from '@/atoms/store'
import { isDarkModeAtom } from '@/atoms/ui'
import { AppSidebar } from '@/components/app-sidebar'
import { NavActions } from '@/components/nav-actions'
import { isAnyDrawerOpenAtom } from '@/components/ui/drawer'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { LIGHT_THEME_COLOR } from '@/constants/theme'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { supabaseAuth } from '@/utils/supabase'
import { useAtomEffect, useStyleObserver } from '@sub-vocab/utils/hooks'
import { isServer } from '@sub-vocab/utils/lib'

const isSafariAtom = atomWithStorage('isSafariAtom', isSafari())

const metaThemeColorAtom = atom((get) => {
  if (get(isAnyDrawerOpenAtom)) {
    if (get(isSafariAtom) && !get(isDarkModeAtom)) {
      return 'transparent'
    }
    return get(bodyBgColorAtom)
  }
  return get(mainBgColorAtom)
})

function useAppEffects() {
  useAtomEffect((get, set) => {
    const { data: { subscription } } = supabaseAuth.onAuthStateChange((event, session) => {
      set(authChangeEventAtom, event)
      set(sessionAtom, session)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  useStyleObserver(isServer ? null : document.body, ([{ value }]) => {
    myStore.set(bodyBgColorAtom, value)
  }, {
    properties: ['background-color'],
  })
  useAtomEffect((get) => {
    if (isServer) return
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', get(metaThemeColorAtom))
  }, [])
  useAtomEffect((get) => {
    if (isServer) return
    document.documentElement.classList.toggle('dark', get(isDarkModeAtom))
  }, [])
}

function Header({ className = '' }: { className?: string }) {
  const isMobile = useIsMobile()
  return (
    <header className={cn('flex h-14 shrink-0 items-center gap-2', className)}>
      <div className="flex h-full flex-1 gap-2">
        {isMobile && (
          <div className="flex p-2">
            <SidebarTrigger className="size-8" />
          </div>
        )}
      </div>
      <div className="ml-auto px-3 pr-4">
        <NavActions />
      </div>
    </header>
  )
}

function Content() {
  const ref = useRef<HTMLDivElement>(null)
  useStyleObserver(ref, ([{ value }]) => {
    myStore.set(mainBgColorAtom, value || LIGHT_THEME_COLOR)
  }, {
    properties: ['background-color'],
  })
  useAppEffects()
  return (
    <Fragment>
      <AppSidebar
        collapsible="icon"
      />
      <SidebarInset
        ref={ref}
      >
        <Header />
        <Outlet />
      </SidebarInset>
    </Fragment>
  )
}

export default function Root() {
  return (
    <SidebarProvider
      className="isolate h-svh pr-(--pr) antialiased sq:superellipse-[1.5]"
      data-vaul-drawer-wrapper=""
    >
      <ClientOnly>
        {() => (
          <Content />
        )}
      </ClientOnly>
      <Suspense fallback={null}>
        <Toaster
          closeButton
          richColors
        />
      </Suspense>
    </SidebarProvider>
  )
}
