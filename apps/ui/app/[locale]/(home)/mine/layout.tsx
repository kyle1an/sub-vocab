'use client'

import { ContentRoot } from '@/components/content-root'

export default function MineLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContentRoot className="-mt-1 pt-1">
      <div className="size-full max-w-(--breakpoint-xl) px-5 pb-7">
        {children}
      </div>
    </ContentRoot>
  )
}
