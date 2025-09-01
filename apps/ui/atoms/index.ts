import type { ArrayValues } from 'type-fest'

import { isSafari } from 'foxact/is-safari'
import { atom } from 'jotai'
import { withAtomEffect } from 'jotai-effect'
import { atomWithStorage } from 'jotai/utils'
import ms from 'ms'

import type { THEMES } from '@/components/themes'

import { DEFAULT_THEME } from '@/components/themes'
import { isAnyDrawerOpenAtom } from '@/components/ui/drawer'
import { COLOR_THEME_SETTING_KEY } from '@/constants/keys'
import { LIGHT_THEME_COLOR } from '@/constants/theme'
import { mediaQueryFamily } from '@sub-vocab/utils/atoms'
import { isServer } from '@sub-vocab/utils/lib'

export const osLanguageAtom = atomWithStorage('osLanguageAtom', 'en')
export const colorThemeSettingAtom = withAtomEffect(
  atomWithStorage<ArrayValues<typeof THEMES>['value']>(COLOR_THEME_SETTING_KEY, DEFAULT_THEME.value, undefined, { getOnInit: true }),
  (get) => {
    if (isServer) return
    cookieStore.set({
      name: COLOR_THEME_SETTING_KEY,
      value: get(colorThemeSettingAtom),
      expires: Date.now() + ms('400d'),
    })
    document.documentElement.setAttribute('data-color-theme', get(colorThemeSettingAtom))
  },
)
export const isDarkModeAtom = atom((get) => {
  const setting = get(colorThemeSettingAtom)
  return setting === 'dark' || (setting === 'auto' && get(mediaQueryFamily('(prefers-color-scheme: dark)')))
})

export const bodyBgColorAtom = atomWithStorage('bodyBgColorAtom', LIGHT_THEME_COLOR, undefined, { getOnInit: true })
export const mainBgColorAtom = atomWithStorage('mainBgColorAtom', LIGHT_THEME_COLOR, undefined, { getOnInit: true })

const isSafariAtom = atomWithStorage('isSafariAtom', isSafari())
export const metaThemeColorAtom = withAtomEffect(
  atom((get) => {
    if (get(isAnyDrawerOpenAtom)) {
      if (get(isSafariAtom) && !get(isDarkModeAtom)) {
        return 'transparent'
      }
      return get(bodyBgColorAtom)
    }
    return get(mainBgColorAtom)
  }),
  (get) => {
    if (isServer) return
    for (const e of document.querySelectorAll('meta[name="theme-color"]')) {
      e.setAttribute('content', get(metaThemeColorAtom))
    }
  },
)
