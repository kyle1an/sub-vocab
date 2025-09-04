import { isSafari } from 'foxact/is-safari'
import { atom } from 'jotai'
import { withAtomEffect } from 'jotai-effect'
import { atomWithStorage } from 'jotai/utils'
import ms from 'ms'

import type { ColorModeValue } from '@/components/themes'

import { COLOR_MODE } from '@/components/themes'
import { isAnyDrawerOpenAtom } from '@/components/ui/drawer'
import { COLOR_MODE_SETTING_KEY } from '@/constants/keys'
import { LIGHT_THEME_COLOR } from '@/constants/theme'
import { mediaQueryFamily } from '@sub-vocab/utils/atoms'
import { isServer } from '@sub-vocab/utils/lib'

export const colorModeSettingAtom = withAtomEffect(
  atomWithStorage<ColorModeValue>(COLOR_MODE_SETTING_KEY, COLOR_MODE.DEFAULT.value, undefined, { getOnInit: true }),
  (get) => {
    if (isServer) return
    cookieStore.set({
      name: COLOR_MODE_SETTING_KEY,
      value: get(colorModeSettingAtom),
      expires: Date.now() + ms('400d'),
    })
    document.documentElement.setAttribute('data-color-mode', get(colorModeSettingAtom))
  },
)
const isDarkModeAtom = atom((get) => {
  const setting = get(colorModeSettingAtom)
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
