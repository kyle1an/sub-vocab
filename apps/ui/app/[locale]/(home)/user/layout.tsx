'use client'

import { useAtom } from 'jotai'

import { authChangeEventAtom, sessionAtom } from '@/atoms/auth'
import { ContentRoot } from '@/components/content-root'
import Navigate from '@/components/Navigate'

export default function User({ children }: { children: React.ReactNode }) {
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  const [authChangeEvent] = useAtom(authChangeEventAtom)
  if (!authChangeEvent) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  const account = user.user_metadata?.username || user.email || ''
  return (
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
  )
}
