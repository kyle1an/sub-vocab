'use client'

import { useIsClient } from 'foxact/use-is-client'
import { Provider } from 'jotai'

import { myStore } from '@/atoms/store'
import { omitUndefined } from '@sub-vocab/utils/lib'

export const JotaiProvider = ({ children }: { children?: React.ReactNode }) => {
  const isClient = useIsClient()
  const store = isClient ? myStore : undefined
  return (
    // https://github.com/pmndrs/jotai/discussions/3052
    <Provider {...omitUndefined({ store })}>
      {children}
    </Provider>
  )
}
