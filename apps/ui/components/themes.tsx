import type { ArrayValues } from 'type-fest'

const DEFAULT_MODE = {
  value: 'auto',
  label: 'Auto',
  icon: <svg className="icon-[gg--dark-mode]" />,
} as const

export const COLOR_MODE = {
  DEFAULT: DEFAULT_MODE,
  ALL: [
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
    DEFAULT_MODE,
  ] as const,
}

export type ColorModeValue = ArrayValues<typeof COLOR_MODE['ALL']>['value']
