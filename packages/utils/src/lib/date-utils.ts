import type { FormatDistanceFn, FormatDistanceLocale } from 'date-fns'

import { enUS } from 'date-fns/locale/en-US'

import { hasKey } from './utilities'

type FormatDistanceTokenValue =
  | string
  | {
    one: string
    other: string
  }

type DistanceLocale = FormatDistanceLocale<FormatDistanceTokenValue>

export const formatIntervalLocale: Partial<DistanceLocale> = {
  xMinutes: '{{count}} min',
  xHours: '{{count}} hr',
}

export const formatDistanceLocale: Partial<DistanceLocale> = {
  xSeconds: '{{count}} s',
  xMinutes: '{{count}} min',
  xHours: '{{count}} h',
  xDays: '{{count}} d',
  xWeeks: '{{count}} w',
  xMonths: '{{count}} mo',
  xYears: '{{count}} y',
}

export function customFormatDistance(locale: Partial<DistanceLocale>): FormatDistanceFn {
  return (token, count, options) => {
    if (hasKey(locale, token)) {
      const tokenValue = locale[token]
      if (tokenValue) {
        let result
        if (typeof tokenValue === 'string') {
          result = tokenValue
        } else if (count === 1) {
          result = tokenValue.one
        } else {
          result = tokenValue.other
        }

        result = result.replace('{{count}}', String(count))

        if (options?.addSuffix) {
          if (options.comparison && options.comparison > 0) {
            return `in ${result}`
          } else {
            return `${result} ago`
          }
        }

        return result
      }
    }

    return enUS.formatDistance(token, count, options)
  }
}
