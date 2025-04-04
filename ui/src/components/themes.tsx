/* eslint-disable react-refresh/only-export-components */
import IconAkarIconsMoonFill from '~icons/akar-icons/moon-fill'
import IconGgDarkMode from '~icons/gg/dark-mode'
import IconPhSun from '~icons/ph/sun'

export const DEFAULT_THEME = {
  value: 'auto',
  label: 'Auto',
  icon: <IconGgDarkMode />,
} as const

export const THEMES = [
  {
    value: 'light',
    label: 'Light',
    icon: <IconPhSun />,
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <IconAkarIconsMoonFill />,
  },
  DEFAULT_THEME,
] as const
