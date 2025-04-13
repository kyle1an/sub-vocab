import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet } from 'react-router'

import { Footer } from '@/components/Footer'
import { SideNav } from '@/components/side-nav'
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
  const subNav = [
    {
      title: t('Profile'),
      to: '/user/profile',
    },
    {
      title: t('Password'),
      to: '/user/password',
    },
  ] as const
  return (
    <>
      <main className="mx-auto flex size-full max-w-screen-lg grow flex-col p-6">
        <div className="pb-5">
          <div className="text-2xl">
            {account}
          </div>
        </div>
        <div className="flex w-full grow flex-col gap-6 sm:flex-row md:gap-0">
          <div>
            <SideNav
              nav={subNav}
              className="sticky top-28"
            />
          </div>
          <main className="w-full flex-1 md:px-6 md:py-4">
            <Outlet />
          </main>
        </div>
      </main>
      <Footer />
    </>
  )
}
