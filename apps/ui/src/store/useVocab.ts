import type { ArrayValues } from 'type-fest'

import { getDefaultStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import type { THEMES } from '@/components/themes'

import { atomWithMediaQuery } from '@/atoms/utils'
import { DEFAULT_THEME } from '@/components/themes'
import { THEME_KEY } from '@/constants/keys'
import { LIGHT_THEME_COLOR } from '@/constants/theme'

export const myStore = getDefaultStore()

export const osLanguageAtom = atomWithStorage('osLanguageAtom', 'en')
export const themeAtom = atomWithStorage<ArrayValues<typeof THEMES>['value']>(THEME_KEY, DEFAULT_THEME.value, undefined, { getOnInit: true })
export const bodyBgColorAtom = atomWithStorage('bodyBgColorAtom', LIGHT_THEME_COLOR, undefined, { getOnInit: true })
export const mainBgColorAtom = atomWithStorage('mainBgColorAtom', LIGHT_THEME_COLOR, undefined, { getOnInit: true })
export const prefersDarkAtom = atomWithMediaQuery('(prefers-color-scheme: dark)')
