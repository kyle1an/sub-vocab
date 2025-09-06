import { pipe } from 'effect'
import { atomFamily } from 'jotai/utils'

import { atomWithMediaQuery, withUnmountCallbackAtom, withUseA } from './utils'

export const mediaQueryFamily = withUseA(atomFamily((query: string) => {
  return pipe(
    atomWithMediaQuery(query),
    (x) => withUnmountCallbackAtom(x, () => {
      mediaQueryFamily.remove(query)
    }),
  )
}))
