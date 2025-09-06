import { atom } from 'jotai'
import { atomWithImmer } from 'jotai-immer'

import { withParamsAtomFamily } from '@/atoms/store'
import { equalBy } from '@sub-vocab/utils/lib'

export const drawerStateFamily = withParamsAtomFamily(
  ([
    ,
    initialValue = {
      open: false,
      shouldScaleBackground: false,
    },
  ]: [
    key: string,
    initialValue?: {
      open: boolean
      openAnimationEnd?: boolean
      shouldScaleBackground: boolean
    },
  ]) => atomWithImmer(initialValue),
  equalBy(([key]) => key),
)

export const isAnyDrawerOpenAtom = atom((get) => {
  return get(drawerStateFamily.paramsAtom)
    .map((p) => get(drawerStateFamily(p)))
    .some(({ shouldScaleBackground, open, openAnimationEnd }) => shouldScaleBackground && (open || openAnimationEnd))
})
