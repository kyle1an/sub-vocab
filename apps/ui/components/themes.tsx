/* eslint-disable react-refresh/only-export-components */

export const DEFAULT_THEME = {
  value: 'auto',
  label: 'Auto',
  icon: <svg className="icon-[gg--dark-mode]" />,
} as const

export const THEMES = [
  {
    value: 'light',
    label: 'Light',
    icon: <svg className="icon-[ph--sun]" />,
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <svg className="icon-[akar-icons--moon-fill]" />,
  },
  DEFAULT_THEME,
] as const
