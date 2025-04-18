import './globals.css'

import { useColorScheme } from '@mui/joy/styles'
import { useIsomorphicLayoutEffect } from '@react-hookz/web'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useMediaQuery } from 'foxact/use-media-query'
import { useAtom, useSetAtom } from 'jotai'
import { DevTools } from 'jotai-devtools'
import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router'

import { useVocabRealtimeSync } from '@/api/vocab-api'
import { AppSidebar } from '@/components/app-sidebar'
import { NavActions } from '@/components/nav-actions'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { COLOR_SCHEME_QUERY, isDarkModeAtom, metaThemeColorEffect } from '@/lib/hooks'
import { authChangeEventAtom, isMdScreenAtom, LIGHT_THEME_COLOR, metaThemeColorAtom, prefersDarkAtom, sessionAtom, supabase, useDocumentInit } from '@/store/useVocab'

function useSyncAtomWithHooks() {
  const isMdScreen = useMediaQuery('(min-width: 768px)')
  const setIsMdScreen = useSetAtom(isMdScreenAtom)
  useEffect(() => {
    setIsMdScreen(isMdScreen)
  }, [isMdScreen, setIsMdScreen])
}

function useSyncAtomWithUser() {
  const setAuthChangeEvent = useSetAtom(authChangeEventAtom)
  const setUser = useSetAtom(sessionAtom)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthChangeEvent(event)
      setUser(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setAuthChangeEvent, setUser])
}

function useSyncDarkPreference() {
  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY)
  const [prefersDark, setPrefersDark] = useAtom(prefersDarkAtom)
  useEffect(() => {
    if (prefersDark !== isDarkOS)
      setPrefersDark(isDarkOS)
  }, [prefersDark, isDarkOS, setPrefersDark])
}

function useSyncMuiColorScheme() {
  const [isDarkMode] = useAtom(isDarkModeAtom)
  const { mode, setMode } = useColorScheme()
  useIsomorphicLayoutEffect(() => {
    const nextMode = isDarkMode ? 'dark' : 'light'
    if (nextMode !== mode)
      setMode(nextMode)
  }, [isDarkMode, mode, setMode])
}

function useSyncMetaThemeColor<T extends Element>(ref: React.RefObject<T>) {
  const [isDarkMode] = useAtom(isDarkModeAtom)
  const setMetaThemeColor = useSetAtom(metaThemeColorAtom)

  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    let themeColorContentValue: string
    if (isDarkMode)
      themeColorContentValue = 'black'
    else
      themeColorContentValue = LIGHT_THEME_COLOR

    requestAnimationFrame(() => {
      themeColorContentValue = window.getComputedStyle(ref.current, null).getPropertyValue('background-color')
      if (themeColorContentValue === 'rgb(255, 255, 255)')
        themeColorContentValue = LIGHT_THEME_COLOR

      setMetaThemeColor(themeColorContentValue)
    })
  }, [isDarkMode, ref, setMetaThemeColor])
}

function Header() {
  const isMobile = useIsMobile()
  return (
    <header className="flex h-14 shrink-0 items-center gap-2">
      <div className="flex flex-1 items-center gap-2 px-3">
        {isMobile && <SidebarTrigger />}
      </div>
      <div className="ml-auto px-3 pr-4">
        <NavActions />
      </div>
    </header>
  )
}

export default function RootLayout() {
  const ref = useRef<HTMLDivElement>(null!)
  useSyncMuiColorScheme()
  useSyncDarkPreference()
  useAtom(metaThemeColorEffect)
  useSyncAtomWithHooks()
  useSyncMetaThemeColor(ref)
  useDocumentInit()
  useSyncAtomWithUser()
  useVocabRealtimeSync()

  return (
    <SidebarProvider
      ref={ref}
      className="isolate bg-[--theme-bg] pr-[--pr] antialiased sq:[corner-shape:superellipse(3)]"
      data-vaul-drawer-wrapper=""
    >
      <AppSidebar collapsible="icon" />
      <SidebarInset>
        <Header />
        <div className="z-0 flex flex-col items-center">
          <Outlet />
        </div>
      </SidebarInset>
      <Toaster
        closeButton
        richColors
      />
      <DevTools />
      <ReactQueryDevtools initialIsOpen={false} />
    </SidebarProvider>
  )
}
