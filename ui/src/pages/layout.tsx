import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Outlet } from 'react-router-dom'
import './globals.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Toaster } from '@/components/ui/sonner'
import { TopBar } from '@/components/TopBar.tsx'
import { queryClient } from '@/lib/utils'
import { useSyncWordState } from '@/api/vocab-api'
import { useDarkMode } from '@/lib/hooks'

const ReactQueryDevtoolsProduction = lazy(() => import('@tanstack/react-query-devtools/production').then((d) => ({
  default: d.ReactQueryDevtools,
})))

export function RootLayout() {
  const ref = useRef<HTMLDivElement>(null)
  const isDarkMode = useDarkMode()

  useEffect(() => {
    let themeColorContentValue: string
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      themeColorContentValue = 'black'
    } else {
      document.documentElement.classList.remove('dark')
      themeColorContentValue = 'white'
    }
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (themeColorMeta) {
      const syncElt = ref.current
      if (syncElt) {
        themeColorContentValue = window.getComputedStyle(syncElt, null).getPropertyValue('background-color')
      }
      const themeColorMetaValue = themeColorMeta.getAttribute('content')
      if (themeColorMetaValue !== themeColorContentValue) {
        themeColorMeta.setAttribute('content', themeColorContentValue)
      }
    }
  }, [isDarkMode])

  const [showDevtools, setShowDevtools] = useState(false)

  useEffect(() => {
    // @ts-expect-error
    window.toggleDevtools = () => setShowDevtools((old) => !old)
  }, [])

  useSyncWordState()

  return (
    <QueryClientProvider client={queryClient}>
      <div
        ref={ref}
        className="flex h-full min-h-full flex-col bg-white tracking-[.02em] antialiased dark:bg-slate-900"
      >
        <TopBar />
        <div className="ffs-pre flex min-h-svh flex-col items-center pt-11">
          <Outlet />
          <SpeedInsights />
        </div>
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
    </QueryClientProvider>
  )
}
