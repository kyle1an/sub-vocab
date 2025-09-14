'use client'

import 'jotai-devtools/styles.css'
import { Provider, useAtomValue } from 'jotai'
import { DevTools } from 'jotai-devtools'
import { atomWithStorage } from 'jotai/utils'
import dynamic from 'next/dynamic'
import { Fragment } from 'react'

import { Body } from '@/app/[locale]/_components/BodyProvider'
import { myStore } from '@/atoms/store'
import { isServer, omitUndefined } from '@sub-vocab/utils/lib'

const StyleComponent = dynamic(() => import('./devtools-styles'))

const jotaiDevtoolsIsShellOpenAtom = atomWithStorage(`jotai-devtools-is-shell-open-V0`, false, undefined, { getOnInit: true })
jotaiDevtoolsIsShellOpenAtom.debugLabel = 'jotaiDevtoolsIsShellOpenAtom'

export const JotaiProvider = ({ children }: { children?: React.ReactNode }) => {
  const store = isServer ? undefined : myStore
  const jotaiDevtoolsIsShellOpen = useAtomValue(jotaiDevtoolsIsShellOpenAtom)
  return (
    // https://github.com/pmndrs/jotai/discussions/3052
    <Provider {...omitUndefined({ store })}>
      <Body>
        {process.env.NODE_ENV !== 'production' ? (
          <Fragment>
            <StyleComponent />
            <DevTools
              store={store}
              isInitialOpen={jotaiDevtoolsIsShellOpen}
            />
          </Fragment>
        ) : null}
        {children}
      </Body>
    </Provider>
  )
}
