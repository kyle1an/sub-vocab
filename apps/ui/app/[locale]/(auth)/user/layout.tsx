import { use } from 'react'

import { ProtectedRoute } from '@/app/[locale]/(auth)/_components/ProtectedRoute'
import { ContentRoot } from '@/components/content-root'
import { getUser } from '@/lib/supabase/server'

export default function User({ children }: LayoutProps<'/[locale]/user'>) {
  const { data: { user } } = use(getUser())
  const account = user?.user_metadata?.username || user?.email || ''
  return (
    <ProtectedRoute>
      <ContentRoot>
        <div className="mx-auto flex size-full max-w-(--breakpoint-lg) grow flex-col p-6">
          <div className="flex w-full grow flex-col gap-6 sm:flex-row md:gap-0">
            <main className="w-full flex-1 md:px-6 md:py-4">
              <div className="pb-6 text-2xl">
                {account}
              </div>
              {children}
            </main>
          </div>
        </div>
      </ContentRoot>
    </ProtectedRoute>
  )
}
