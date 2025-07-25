import { Outlet } from 'react-router'

import { ContentRoot } from '@/components/content-root'

export default function MineLayout() {
  return (
    <ContentRoot className="-mt-1 pt-1">
      <div className="size-full max-w-(--breakpoint-xl) px-5 pb-7">
        <Outlet />
      </div>
    </ContentRoot>
  )
}
