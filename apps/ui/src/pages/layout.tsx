import './globals.css'

import { useColorScheme } from '@mui/joy/styles'
import { useIsomorphicLayoutEffect } from '@react-hookz/web'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { isSafari } from 'foxact/is-safari'
import { useMediaQuery } from 'foxact/use-media-query'
import { atom, useAtom } from 'jotai'
import { DevTools } from 'jotai-devtools'
import css from 'jotai-devtools/styles.css?inline'
import { atomWithStorage } from 'jotai/utils'
import { Suspense, useEffect, useRef } from 'react'
import { Outlet } from 'react-router'
import { useCallbackOne as useStableCallback } from 'use-memo-one'

import { useVocabRealtimeSync } from '@/api/vocab-api'
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
import { normalizeThemeColor } from '@/lib/utilities'
import { bodyBgColorAtom, mainBgColorAtom, myStore, prefersDarkAtom } from '@/store/useVocab'
import devtoolsCss from '@/styles/devtools.css?inline'

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
  useEffect(() => {
    const { data: { subscription } } = supabaseAuth.onAuthStateChange((event, session) => {
      myStore.set(authChangeEventAtom, event)
      myStore.set(sessionAtom, session)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  useAtomEffect(useStableCallback((get) => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', normalizeThemeColor(get(metaThemeColorAtom)))
  }, []))
  {
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)')
    useEffect(() => {
      myStore.set(prefersDarkAtom, isDarkOS)
    }, [isDarkOS])
  }
  {
    const [isDarkMode] = useAtom(isDarkModeAtom)
    const { setMode } = useColorScheme()
    useIsomorphicLayoutEffect(() => {
      setMode(isDarkMode ? 'dark' : 'light')
    }, [isDarkMode, setMode])
  }
  useAtomEffect(useStableCallback((get) => {
    document.documentElement.classList.toggle('dark', get(isDarkModeAtom))
  }, []))
  useStyleObserver(document.body, (values) => {
    myStore.set(bodyBgColorAtom, values['background-color'].value)
  }, {
    properties: ['background-color'],
  })
}

function Header() {
  const isMobile = useIsMobile()
  return (
    <header className="flex h-14 shrink-0 items-center gap-2">
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

export default function Root() {
  const ref = useRef<HTMLDivElement>(null)
  useAppEffects()
  useStyleObserver(ref, (values) => {
    myStore.set(mainBgColorAtom, values['background-color'].value || LIGHT_THEME_COLOR)
  }, {
    properties: ['background-color'],
  })
  const [isDarkMode] = useAtom(isDarkModeAtom)
  useVocabRealtimeSync()

  return (
    <SidebarProvider
      className="isolate h-svh pr-(--pr) antialiased sq:superellipse-[1.5]"
      data-vaul-drawer-wrapper=""
    >
      <AppSidebar collapsible="icon" />
      <SidebarInset
        ref={ref}
      >
        <Header />
        <Outlet />
      </SidebarInset>
      <Suspense fallback={null}>
        <Toaster
          closeButton
          richColors
        />
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
      {import.meta.env.PROD ? (
        <>
          <SpeedInsights />
          <Analytics />
        </>
      ) : import.meta.env.DEV ? (
        <>
          <style>{css}</style>
          <style>{devtoolsCss}</style>
          <DevTools
            store={myStore}
            theme={isDarkMode ? 'dark' : 'light'}
          />
        </>
      ) : null}
    </SidebarProvider>
  )
}
