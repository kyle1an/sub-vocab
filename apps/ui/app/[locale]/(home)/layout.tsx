import { cookies } from 'next/headers'
import { Suspense, use } from 'react'

import { AppSidebarInset } from '@/app/[locale]/(home)/_components/app-sidebar-inset'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

export default function Root({ children }: { children: React.ReactNode }) {
  const cookieStore = use(cookies())
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'
  const user_id = cookieStore.get('user_id')?.value ?? ''
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="isolate h-svh pr-(--pr) antialiased sq:superellipse-[1.5]"
      data-vaul-drawer-wrapper=""
    >
      <AppSidebar
        collapsible="icon"
        user_id={user_id}
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
