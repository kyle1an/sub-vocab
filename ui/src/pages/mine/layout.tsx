import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

export default function MineLayout() {
  const { t } = useTranslation()
  return (
    <div className="m-auto h-[calc(100svh-4px*14)] w-full max-w-screen-xl px-5 pb-7">
      <Outlet />
    </div>
  )
}
