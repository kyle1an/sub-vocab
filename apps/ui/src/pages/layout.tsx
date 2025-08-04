import { useColorScheme } from '@mui/joy/styles'

import './globals.css'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { isSafari } from 'foxact/is-safari'
import { atom, useAtom } from 'jotai'
import { DevTools } from 'jotai-devtools'
import css from 'jotai-devtools/styles.css?inline'
import { atomWithStorage } from 'jotai/utils'
import { Fragment, Suspense, useEffect, useRef } from 'react'
import { Outlet } from 'react-router'
import { useCallbackOne as useStableCallback } from 'use-memo-one'

import { useVocabularySubscription } from '@/api/vocab-api'
import { authChangeEventAtom, sessionAtom } from '@/atoms/auth'
import { isDarkModeAtom } from '@/atoms/ui'
import { AppSidebar } from '@/components/app-sidebar'
import { NavActions } from '@/components/nav-actions'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { LIGHT_THEME_COLOR } from '@/constants/theme'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAtomEffect } from '@/hooks/useAtomEffect'
import { useStyleObserver } from '@/hooks/useStyleObserver'
import { supabaseAuth } from '@/lib/supabase'
import { bodyBgColorAtom, mainBgColorAtom, myStore } from '@/store/useVocab'
import devtoolsCss from '@/styles/devtools.css?inline'

const isSafariAtom = atomWithStorage('isSafariAtom', isSafari())

const metaThemeColorAtom = atom((get) => {
  if (get(isSafariAtom) && !get(isDarkModeAtom)) {
    return 'transparent'
  }
  return get(bodyBgColorAtom)
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
  useStyleObserver(document.body, (values) => {
    myStore.set(bodyBgColorAtom, values['background-color'].value)
  }, {
    properties: ['background-color'],
  })
  useAtomEffect(useStableCallback((get) => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', get(metaThemeColorAtom))
  }, []))
  {
    const { setMode } = useColorScheme()
    useAtomEffect(useStableCallback((get) => {
      setMode(get(isDarkModeAtom) ? 'dark' : 'light')
    }, [setMode]))
  }
  useAtomEffect(useStableCallback((get) => {
    document.documentElement.classList.toggle('dark', get(isDarkModeAtom))
  }, []))
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
  useStyleObserver(ref, (values) => {
    myStore.set(mainBgColorAtom, values['background-color'].value || LIGHT_THEME_COLOR)
  }, {
    properties: ['background-color'],
  })
  useAppEffects()
  const [isDarkMode] = useAtom(isDarkModeAtom)
  useVocabularySubscription()

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
        <Fragment>
          <SpeedInsights />
          <Analytics />
        </Fragment>
      ) : import.meta.env.DEV ? (
        <Fragment>
          <style>{css}</style>
          <style>{devtoolsCss}</style>
          <DevTools
            store={myStore}
            theme={isDarkMode ? 'dark' : 'light'}
          />
        </Fragment>
      ) : null}
    </SidebarProvider>
  )
}
