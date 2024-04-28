import {
  Suspense, lazy, useEffect, useState,
} from 'react'
import { Outlet } from 'react-router-dom'
import './globals.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { atom, useAtom } from 'jotai'
import { useDarkMode } from 'usehooks-ts'
import { atomEffect } from 'jotai-effect'
import { Toaster } from '@/components/ui/sonner'
import { TopBar } from '@/components/TopBar.tsx'
import { queryClient } from '@/lib/utils'
import { themeAtom } from '@/store/useVocab'

const ReactQueryDevtoolsProduction = lazy(() => import('@tanstack/react-query-devtools/production').then((d) => ({
  default: d.ReactQueryDevtools,
})))

const systemIsDarkModeAtom = atom(window.matchMedia('(prefers-color-scheme: dark)').matches)
const switchThemeEffectAtom = atomEffect((get, set) => {
  let isDark: boolean
  const themePreference = get(themeAtom)
  if (themePreference === 'auto') {
    const systemIsDark = get(systemIsDarkModeAtom)
    isDark = systemIsDark
  } else {
    isDark = themePreference === 'dark'
  }
  let themeColorContentValue: string
  if (isDark) {
    document.documentElement.classList.add('dark')
    themeColorContentValue = 'black'
  } else {
    document.documentElement.classList.remove('dark')
    themeColorContentValue = 'white'
  }
  const themeColorMeta = document.querySelector('meta[name="theme-color"]')
  if (themeColorMeta) {
    const syncElt = document.querySelector('.sync-meta')
    if (syncElt) {
      themeColorContentValue = window.getComputedStyle(syncElt, null).getPropertyValue('background-color')
    }
    themeColorMeta.setAttribute('content', themeColorContentValue)
  }
})

export function RootLayout() {
  const [showDevtools, setShowDevtools] = useState(false)

  useEffect(() => {
    // @ts-ignore ReactQueryDevtools is not typed
    window.toggleDevtools = () => setShowDevtools((old) => !old)
  }, [])

  useAtom(switchThemeEffectAtom)
  const { isDarkMode } = useDarkMode()
  const [systemIsDarkMode, setSystemIsDarkMode] = useAtom(systemIsDarkModeAtom)

  useEffect(() => {
    if (isDarkMode !== systemIsDarkMode) {
      setSystemIsDarkMode(isDarkMode)
    }
  }, [isDarkMode, setSystemIsDarkMode, systemIsDarkMode])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="sync-meta flex h-full min-h-full flex-col bg-white tracking-[.02em] antialiased dark:bg-slate-900">
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
