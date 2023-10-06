import React from 'react'
import { Outlet } from 'react-router-dom'
import './globals.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TopBar } from '@/components/TopBar.tsx'
import { queryClient } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'

const ReactQueryDevtoolsProduction = React.lazy(() => import('@tanstack/react-query-devtools/production').then((d) => ({
  default: d.ReactQueryDevtools,
})))

export function RootLayout() {
  const [showDevtools, setShowDevtools] = React.useState(false)

  React.useEffect(() => {
    // @ts-ignore ReactQueryDevtools is not typed
    window.toggleDevtools = () => setShowDevtools((old) => !old)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-full min-h-full flex-col bg-white tracking-[.02em] antialiased">
        <TopBar className="fixed h-11" />
        <div className="ffs-pre flex flex-col items-center pt-11 md:px-5 xl:px-0">
          <Outlet />
        </div>
      </div>
      <Toaster />
      <ReactQueryDevtools initialIsOpen />
      {showDevtools && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </React.Suspense>
      )}
    </QueryClientProvider>
  )
}
