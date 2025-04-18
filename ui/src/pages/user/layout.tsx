import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet } from 'react-router'

import { authChangeEventAtom, sessionAtom } from '@/store/useVocab'

export default function User() {
  const { t } = useTranslation()
  const [session] = useAtom(sessionAtom)
  const user = session?.user
  const [authChangeEvent] = useAtom(authChangeEventAtom)
  if (!authChangeEvent)
    return null

  if (!user)
    return <Navigate to="/login" />

  const account = user.user_metadata?.username || user.email || ''
  return (
    <>
      <div className="mx-auto flex size-full max-w-screen-lg grow flex-col p-6">
        <div className="flex w-full grow flex-col gap-6 sm:flex-row md:gap-0">
          <main className="w-full flex-1 md:px-6 md:py-4">
            <div className="pb-6 text-2xl">
              {account}
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
