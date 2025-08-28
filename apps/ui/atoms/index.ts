import type { ArrayValues } from 'type-fest'

import { atomWithStorage } from 'jotai/utils'

import type { THEMES } from '@/components/themes'

import { myStore } from '@/atoms/store'
import { DEFAULT_THEME } from '@/components/themes'
import { THEME_KEY } from '@/constants/keys'
import { LIGHT_THEME_COLOR } from '@/constants/theme'
import { atomFamilyFactory, atomWithMediaQuery } from '@sub-vocab/utils/atoms'

export const myAtomFamily = atomFamilyFactory(myStore)

export const osLanguageAtom = atomWithStorage('osLanguageAtom', 'en')
export const themeAtom = atomWithStorage<ArrayValues<typeof THEMES>['value']>(THEME_KEY, DEFAULT_THEME.value, undefined, { getOnInit: true })
export const bodyBgColorAtom = atomWithStorage('bodyBgColorAtom', LIGHT_THEME_COLOR, undefined, { getOnInit: true })
export const mainBgColorAtom = atomWithStorage('mainBgColorAtom', LIGHT_THEME_COLOR, undefined, { getOnInit: true })
export const prefersDarkAtom = atomWithMediaQuery('(prefers-color-scheme: dark)')
