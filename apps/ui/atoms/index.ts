import type { Atom } from 'jotai'
import type { Store } from 'jotai/vanilla/store'
import type { ArrayValues } from 'type-fest'

import { pipe } from 'effect'
import { atom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'

import type { THEMES } from '@/components/themes'

import { myStore } from '@/atoms/store'
import { DEFAULT_THEME } from '@/components/themes'
import { THEME_KEY } from '@/constants/keys'
import { LIGHT_THEME_COLOR } from '@/constants/theme'
import { atomWithMediaQuery, withReadOnlyMount } from '@sub-vocab/utils/atoms'
import { tap } from '@sub-vocab/utils/lib'

const createMyAtomFamily = (store: Store) => <Param, AtomType extends Atom<unknown>>(label: string, initializeAtom: (param: Param) => AtomType, areEqual?: (a: Param, b: Param) => boolean) => {
  const paramsAtom = atom([] as Param[])
  paramsAtom.debugLabel = `${label}.paramsAtom`
  return pipe(
    atomFamily((param: NonNullable<Param>) => pipe(
      initializeAtom(param),
      tap((x) => {
        const key = Array.isArray(param) ? param[0] : typeof param === 'object' && 'key' in param ? param.key : param
        x.debugLabel = `${label}-${key}`
      }),
    ), areEqual),
    tap(({ unstable_listen, getParams }) => {
      let latestEvent: Parameters<Parameters<typeof unstable_listen>[0]>[0]
      unstable_listen((event) => {
        latestEvent = event
        queueMicrotask(() => {
          if (event === latestEvent) {
            store.set(paramsAtom, [...getParams()])
          }
        })
      })
    }),
    (x) => Object.assign(x, { paramsAtom }),
  )
}

export const _myAtomFamily = createMyAtomFamily(myStore)

export const osLanguageAtom = atomWithStorage('osLanguageAtom', 'en')
export const themeAtom = atomWithStorage<ArrayValues<typeof THEMES>['value']>(THEME_KEY, DEFAULT_THEME.value, undefined, { getOnInit: true })
export const bodyBgColorAtom = atomWithStorage('bodyBgColorAtom', LIGHT_THEME_COLOR, undefined, { getOnInit: true })
export const mainBgColorAtom = atomWithStorage('mainBgColorAtom', LIGHT_THEME_COLOR, undefined, { getOnInit: true })

export const mediaQueryFamily = pipe(atomFamily((query: string) => {
  let isMounted = false
  return pipe(
    atomWithMediaQuery(query),
    (x) => withReadOnlyMount(x, () => {
      isMounted = true
      return () => {
        isMounted = false
        queueMicrotask(() => {
          if (!isMounted) {
            mediaQueryFamily.remove(query)
          }
        })
      }
    }),
    tap((x) => {
      x.debugLabel = `mediaQueryAtomFamily-${query}`
    }),
  )
}), (x) => Object.assign(x, {
  useA: x,
}))
