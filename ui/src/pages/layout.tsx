import {
  useEffect,
  useRef,
} from 'react'
import { Outlet } from 'react-router-dom'
import './globals.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useAtom } from 'jotai'
import { Toaster } from '@/components/ui/sonner'
import { TopBar } from '@/components/TopBar.tsx'
import { setMetaThemeColorAttribute } from '@/lib/utils'
import { useSyncWordState } from '@/api/vocab-api'
import { useDarkMode } from '@/lib/hooks'
import { LIGHT_THEME_COLOR, metaThemeColorAtom } from '@/store/useVocab'

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

  useSyncWordState()

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
