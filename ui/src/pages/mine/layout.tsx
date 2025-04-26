import { Outlet } from 'react-router'

import { ContentRoot } from '@/components/content-root'

export default function MineLayout() {
  return (
    <ContentRoot className="-mt-1 overflow-hidden pt-1">
      <div className="m-auto size-full max-w-screen-xl px-5 pb-7">
        <Outlet />
      </div>
    </ContentRoot>
  )
}
