import './globals.css'

import { isSafari } from 'foxact/is-safari'
import { useIsClient } from 'foxact/use-is-client'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Fragment, Suspense, useRef } from 'react'
import { Outlet } from 'react-router'
import { ClientOnly } from 'remix-utils/client-only'

import { authChangeEventAtom, sessionAtom } from '@/atoms/auth'
import { isDarkModeAtom } from '@/atoms/ui'
import { AppSidebar } from '@/components/app-sidebar'
import { NavActions } from '@/components/nav-actions'
import { isAnyDrawerOpenAtom } from '@/components/ui/drawer'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { LIGHT_THEME_COLOR } from '@/constants/theme'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAtomEffect } from '@/hooks/useAtomEffect'
import { useStyleObserver } from '@/hooks/useStyleObserver'
import { supabaseAuth } from '@/lib/supabase'
import { isServer } from '@/lib/utilities'
import { cn } from '@/lib/utils'
import { bodyBgColorAtom, mainBgColorAtom, myStore } from '@/store/useVocab'

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
  const isClient = useIsClient()
  return (
    <Fragment>
      <ClientOnly>
        {() => (
          <AppSidebar
            collapsible="icon"
            className={!isClient ? 'invisible' : ''}
          />
        )}
      </ClientOnly>
      <SidebarInset
        ref={ref}
        className={!isClient ? 'invisible' : ''}
      >
        <ClientOnly>
          {() => (
            <Header
              className={!isClient ? 'invisible' : ''}
            />
          )}
        </ClientOnly>
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
      <Content />
      <Suspense fallback={null}>
        <Toaster
          closeButton
          richColors
        />
      </Suspense>
    </SidebarProvider>
  )
}
