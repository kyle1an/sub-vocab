import {
  Suspense, lazy, useEffect, useState,
} from 'react'
import { Outlet } from 'react-router-dom'
import './globals.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Toaster } from '@/components/ui/sonner'
import { TopBar } from '@/components/TopBar.tsx'
import { queryClient } from '@/lib/utils'

const ReactQueryDevtoolsProduction = lazy(() => import('@tanstack/react-query-devtools/production').then((d) => ({
  default: d.ReactQueryDevtools,
})))

export function RootLayout() {
  const [showDevtools, setShowDevtools] = useState(false)

  useEffect(() => {
    // @ts-ignore ReactQueryDevtools is not typed
    window.toggleDevtools = () => setShowDevtools((old) => !old)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-full min-h-full flex-col bg-white tracking-[.02em] antialiased">
        <TopBar className="fixed h-11" />
        <div className="ffs-pre flex min-h-[100svh] flex-col items-center pt-11">
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
