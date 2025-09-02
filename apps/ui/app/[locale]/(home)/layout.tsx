import { cookies } from 'next/headers'
import { Suspense, use } from 'react'

import { AppSidebarInset } from '@/app/[locale]/(home)/_components/app-sidebar-inset'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

export default function Root({ children }: LayoutProps<'/[locale]'>) {
  const cookieStore = use(cookies())
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="isolate h-svh pr-(--pr) antialiased sq:superellipse-[1.5]"
      data-vaul-drawer-wrapper=""
    >
      <AppSidebar
        collapsible="icon"
      />
      <AppSidebarInset>
        {children}
      </AppSidebarInset>
      <Suspense fallback={null}>
        <Toaster
          closeButton
          richColors
        />
      </Suspense>
    </SidebarProvider>
  )
}
