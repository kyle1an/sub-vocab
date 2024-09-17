import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useMediaQuery } from 'foxact/use-media-query'
import { DevTools } from 'jotai-devtools'

import type { SessionWithUserMetadata } from '@/api/vocab-api'

import { TopBar } from '@/components/TopBar.tsx'
import { COLOR_SCHEME_QUERY, isDarkModeAtom, metaThemeColorEffect } from '@/lib/hooks'
import { LIGHT_THEME_COLOR, metaThemeColorAtom, prefersDarkAtom, sessionAtom, supabase } from '@/store/useVocab'

import './globals.css'

export function RootLayout() {
  const ref = useRef<HTMLDivElement>(null)
  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY)
  const [prefersDark, setPrefersDark] = useAtom(prefersDarkAtom)
  const [isDarkMode] = useAtom(isDarkModeAtom)
  useEffect(() => {
    if (prefersDark !== isDarkOS) setPrefersDark(isDarkOS)
  }, [prefersDark, isDarkOS, setPrefersDark])
  useAtom(metaThemeColorEffect)
  const [, setMetaThemeColor] = useAtom(metaThemeColorAtom)
  const [, setUser] = useAtom(sessionAtom)

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session as SessionWithUserMetadata | null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser])

  return (
    <div
      ref={ref}
      className="isolate flex h-full min-h-full flex-col pr-[--pr] tracking-[.02em] antialiased sq-smooth-[0.6] sq-radius-[5_5_0_0] sq-fill-[red] _bg-[--theme-bg] [&[style*='border-radius:_8px;']]:mask-squircle"
      data-vaul-drawer-wrapper=""
    >
      <TopBar />
      <div className="ffs-pre flex min-h-svh flex-col items-center pt-11">
        <Outlet />
        <SpeedInsights />
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
