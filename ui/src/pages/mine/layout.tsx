import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { SideNav } from '@/components/side-nav'

export default function MineLayout() {
  const { t } = useTranslation()
  const subNav = [
    {
      title: t('Vocabulary'),
      to: '/mine/vocabulary',
    },
    {
      title: t('Chart'),
      to: '/mine/chart',
    },
  ] as const
  return (
    <main className="mx-auto flex w-full max-w-screen-lg grow flex-col">
      <div className="flex w-full grow flex-col px-5 pt-6 md:flex-row md:gap-6 md:pt-0">
        <div>
          <SideNav
            nav={subNav}
            className="sticky top-20"
          />
        </div>
        <main className="w-full flex-1 md:h-[calc(100vh-4px*11)]">
          <Outlet />
        </main>
      </div>
    </main>
  )
}
