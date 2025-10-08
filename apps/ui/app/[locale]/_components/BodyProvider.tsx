'use client'

import { useStore } from 'jotai'
import { useRef } from 'react'

import { bodyBgColorAtom } from '@/atoms'
import { useStyleObserver } from '@sub-vocab/utils/hooks'

export function Body({
  children,
}: {
  children?: React.ReactNode
}) {
  const ref = useRef<HTMLBodyElement>(null)
  const store = useStore()
  useStyleObserver(ref, ([{ value }]) => {
    store.set(bodyBgColorAtom, value)
  }, {
    properties: ['background-color'],
  })
  return (
    <body
      ref={ref}
      className="overflow-y-scroll tracking-[.03em] text-foreground font-stretch-90% antialiased"
    >
      {children}
    </body>
  )
}
