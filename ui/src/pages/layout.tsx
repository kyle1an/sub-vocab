import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useAtom } from 'jotai'
import {
  useEffect,
  useRef,
} from 'react'
import { Outlet } from 'react-router-dom'

import { useSession } from '@/api/vocab-api'
import { TopBar } from '@/components/TopBar.tsx'
import { Toaster } from '@/components/ui/sonner'
import { useDarkMode } from '@/lib/hooks'
import { setMetaThemeColorAttribute } from '@/lib/utils'
import { LIGHT_THEME_COLOR, metaThemeColorAtom, supabase } from '@/store/useVocab'

import './globals.css'

export function RootLayout() {
  const ref = useRef<HTMLDivElement>(null)
  const { isDarkMode } = useDarkMode()
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
      setMetaThemeColorAttribute(themeColorContentValue)
    })
  }, [isDarkMode, setMetaThemeColor])

  const { refetch } = useSession()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      refetch()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refetch])

  return (
    <div
      ref={ref}
      className="isolate flex h-full min-h-full flex-col pr-[--pr] tracking-[.02em] antialiased sq-smooth-[0.6] sq-radius-[5_5_0_0] sq-fill-[red] _bg-[--theme-bg] [&[style*='border-radius:_8px;']]:mask-squircle"
      vaul-drawer-wrapper=""
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
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  )
}
