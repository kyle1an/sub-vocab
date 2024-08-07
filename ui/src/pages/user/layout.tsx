import { Navigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Footer } from '@/components/Footer'
import { useVocabStore } from '@/store/useVocab'
import { SideNav } from '@/components/SideNav'

export function User() {
  const { t } = useTranslation()
  const username = useVocabStore((state) => state.username)
  if (!username) {
    return <Navigate to="/login" />
  }

  const subNav = [
    {
      title: t('Profile'),
      to: '/user',
    },
    {
      title: t('Password'),
      to: '/user/password',
    },
  ] as const
  return (
    <>
      <div className="mx-auto flex size-full max-w-screen-lg grow flex-col p-6">
        <div className="pb-5">
          <div className="text-2xl">
            {username}
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
      </div>
      <Footer />
    </>
  )
}
