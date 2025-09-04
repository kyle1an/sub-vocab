'use client'

import { Provider } from 'jotai'

import { myStore } from '@/atoms/store'
import { isServer, omitUndefined } from '@sub-vocab/utils/lib'

export const JotaiProvider = ({ children }: { children?: React.ReactNode }) => {
  const store = isServer ? undefined : myStore
  return (
    // https://github.com/pmndrs/jotai/discussions/3052
    <Provider {...omitUndefined({ store })}>
      {children}
    </Provider>
  )
}
