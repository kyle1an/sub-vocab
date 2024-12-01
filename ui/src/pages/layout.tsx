import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useMediaQuery } from 'foxact/use-media-query'
import { DevTools } from 'jotai-devtools'
import { Outlet } from 'react-router'

import { useVocabRealtimeSync } from '@/api/vocab-api'
import { TopBar } from '@/components/TopBar.tsx'
import { COLOR_SCHEME_QUERY, isDarkModeAtom, metaThemeColorEffect } from '@/lib/hooks'
import { authChangeEventAtom, isMdScreenAtom, LIGHT_THEME_COLOR, metaThemeColorAtom, prefersDarkAtom, sessionAtom, supabase } from '@/store/useVocab'

import './globals.css'

function useSyncAtomWithHooks() {
  const isMdScreen = useMediaQuery('(min-width: 768px)')
  const [,setIsMdScreen] = useAtom(isMdScreenAtom)
  useEffect(() => {
    setIsMdScreen(isMdScreen)
  }, [isMdScreen, setIsMdScreen])
}

function useSyncAtomWithUser() {
  const [, setAuthChangeEvent] = useAtom(authChangeEventAtom)
  const [, setUser] = useAtom(sessionAtom)
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

export function RootLayout() {
  const ref = useRef<HTMLDivElement>(null)
  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY)
  const [prefersDark, setPrefersDark] = useAtom(prefersDarkAtom)
  const [isDarkMode] = useAtom(isDarkModeAtom)
  useEffect(() => {
    if (prefersDark !== isDarkOS) setPrefersDark(isDarkOS)
  }, [prefersDark, isDarkOS, setPrefersDark])
  useAtom(metaThemeColorEffect)
  useSyncAtomWithHooks()
  const [, setMetaThemeColor] = useAtom(metaThemeColorAtom)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    let themeColorContentValue: string
    if (isDarkMode) {
      themeColorContentValue = 'black'
    } else {
      themeColorContentValue = LIGHT_THEME_COLOR
    }
    const syncElt = ref.current
    requestAnimationFrame(() => {
      if (syncElt) {
        themeColorContentValue = window.getComputedStyle(syncElt, null).getPropertyValue('background-color')
        if (themeColorContentValue === 'rgb(255, 255, 255)') {
          themeColorContentValue = LIGHT_THEME_COLOR
        }
      }
      setMetaThemeColor(themeColorContentValue)
    })
  }, [isDarkMode, setMetaThemeColor])

  useSyncAtomWithUser()
  useVocabRealtimeSync()

  return (
    <div
      ref={ref}
      className="isolate flex h-full min-h-full flex-col bg-[--theme-bg] pr-[--pr] tracking-[.02em] antialiased sq-smooth-[0.6] sq-radius-[5_5_0_0] sq-fill-[red] [--bg-:--theme-bg] [&[style*='border-radius:_8px;']]:mask-squircle"
      data-vaul-drawer-wrapper=""
    >
      <TopBar />
      <div className="ffs-pre flex min-h-svh flex-col items-center pt-11">
        <Outlet />
        {import.meta.env.PROD && <SpeedInsights />}
      </div>
      <Toaster
        closeButton
        richColors
      />
      <DevTools />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  )
}
