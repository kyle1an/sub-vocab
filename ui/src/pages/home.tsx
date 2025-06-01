import { Outlet } from 'react-router'

import { ContentRoot } from '@/components/content-root'

export default function Home() {
  return (
    // https://stackoverflow.com/a/78318115
    <ContentRoot className="-mt-1 overflow-hidden pt-1">
      <div className="size-full max-w-(--breakpoint-xl) px-5 pb-7">
        <Outlet />
      </div>
    </ContentRoot>
  )
}
