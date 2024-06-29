import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react'
import { lazily } from 'react-lazily'
import { Outlet } from 'react-router-dom'
import './globals.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useAtom } from 'jotai'
import { Toaster } from '@/components/ui/sonner'
import { TopBar } from '@/components/TopBar.tsx'
import { getScrollbarWidth, queryClient, setMetaThemeColorAttribute } from '@/lib/utils'
import { useSyncWordState } from '@/api/vocab-api'
import { useDarkMode } from '@/lib/hooks'
import { LIGHT_THEME_COLOR, metaThemeColorAtom } from '@/store/useVocab'

const ReactQueryDevtoolsProduction = lazily(() => import('@tanstack/react-query-devtools/production')).ReactQueryDevtools

const isChromium = Boolean(window.chrome)
if (
  CSS.supports('background:paint(squircle)')
  && isChromium
) {
  document.documentElement.classList.add('sq')
}

const scrollbarWidth = getScrollbarWidth()
document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)

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

  const [showDevtools, setShowDevtools] = useState(false)

  useEffect(() => {
    window.toggleDevtools = () => setShowDevtools((old) => !old)
  }, [])

  useSyncWordState()

  return (
    <QueryClientProvider client={queryClient}>
      <div
        ref={ref}
        className="isolate flex h-full min-h-full flex-col tracking-[.02em] antialiased sq-smooth-[0.6] sq-radius-[5_5_0_0] sq-fill-[red] _bg-[--theme-bg] [&[style*='border-radius:_8px;']]:mask-squircle"
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
        {showDevtools ? (
          <Suspense fallback={null}>
            <ReactQueryDevtoolsProduction />
          </Suspense>
        ) : null}
      </div>
    </QueryClientProvider>
  )
}
