// https://github.com/date-fns/date-fns/blob/313b902b9a72c64501074db9bc2b9897d2db5140/src/formatDistanceStrict/index.ts
import type { ContextFn, DateArg, FormatDistanceStrictOptions, FormatDistanceStrictUnit, FormatDistanceToNowStrictOptions, RoundingMethod } from 'date-fns'

import { compareAsc, constructFrom, constructNow, toDate } from 'date-fns'
import { millisecondsInMinute, minutesInDay, minutesInMonth, minutesInYear } from 'date-fns/constants'
import { enUS } from 'date-fns/locale'

import { omitUndefined } from './utilities'

const minutesInWeek = 7 * minutesInDay

function normalizeDates<T extends (DateArg<Date> & {})[]>(
  context: ContextFn<Date> | undefined,
  ...dates: T
) {
  const normalize = constructFrom.bind(
    null,
    context || dates.find((date) => typeof date === 'object'),
  )
  return dates.map(normalize) as { [K in keyof T]: Date }
}

function getRoundingMethod(method: RoundingMethod | undefined) {
  return (number: number) => {
    const round = method ? Math[method] : Math.trunc
    const result = round(number)
    // Prevent negative zero
    return result === 0 ? 0 : result
  }
}

function getTimezoneOffsetInMilliseconds(
  date: DateArg<Date> & {},
) {
  const _date = toDate(date)
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds(),
    ),
  )
  utcDate.setUTCFullYear(_date.getFullYear())
  return +date - +utcDate
}

function customFormatDistanceStrict(
  laterDate: DateArg<Date> & {},
  earlierDate: DateArg<Date> & {},
  options: FormatDistanceStrictOptions = {},
) {
  const comparison = compareAsc(laterDate, earlierDate) as -1 | 0 | 1

  if (Number.isNaN(comparison)) {
    throw new RangeError('Invalid time value')
  }

  const [laterDate_, earlierDate_] = normalizeDates(
    options.in,
    ...(comparison > 0 ? [earlierDate, laterDate] as const : [laterDate, earlierDate] as const),
  )

  const milliseconds = earlierDate_.getTime() - laterDate_.getTime()
  const minutes = milliseconds / millisecondsInMinute
  const timezoneOffset = getTimezoneOffsetInMilliseconds(earlierDate_) - getTimezoneOffsetInMilliseconds(laterDate_)

  // Use DST-normalized difference in minutes for years, months and days;
  // use regular difference in minutes for hours, minutes and seconds.
  const dstNormalizedMinutes = (milliseconds - timezoneOffset) / millisecondsInMinute

  const defaultUnit = options.unit
  let unit: FormatDistanceStrictUnit | 'week'
  if (defaultUnit) {
    unit = defaultUnit
  } else {
    if (minutes < 1) {
      unit = 'second'
    } else if (minutes < 60) {
      unit = 'minute'
    } else if (minutes < minutesInDay) {
      unit = 'hour'
    } else if (dstNormalizedMinutes < minutesInWeek) {
      unit = 'day'
    } else if (dstNormalizedMinutes < minutesInMonth) {
      unit = 'week'
    } else if (dstNormalizedMinutes < minutesInYear) {
      unit = 'month'
    } else {
      unit = 'year'
    }
  }

  const { formatDistance } = options.locale ?? enUS
  const roundingMethod = getRoundingMethod(options.roundingMethod ?? 'round')
  const localizeOptions = omitUndefined(Object.assign({}, options, {
    addSuffix: options.addSuffix,
    comparison,
  }))

  // 0 up to 60 seconds
  if (unit === 'second') {
    const seconds = roundingMethod(milliseconds / 1000)
    return formatDistance('xSeconds', seconds, localizeOptions)
  }
  // 1 up to 60 mins
  else if (unit === 'minute') {
    const roundedMinutes = roundingMethod(minutes)
    return formatDistance('xMinutes', roundedMinutes, localizeOptions)
  }
  // 1 up to 24 hours
  else if (unit === 'hour') {
    const hours = roundingMethod(minutes / 60)
    return formatDistance('xHours', hours, localizeOptions)
  }
  // 1 up to 7 days
  else if (unit === 'day') {
    const days = roundingMethod(dstNormalizedMinutes / minutesInDay)
    return formatDistance('xDays', days, localizeOptions)
  }
  // 1 up to 30 days
  else if (unit === 'week') {
    const weeks = roundingMethod(dstNormalizedMinutes / minutesInWeek)
    return formatDistance('xWeeks', weeks, localizeOptions)
  }
  // 1 up to 12 months
  else if (unit === 'month') {
    const months = roundingMethod(dstNormalizedMinutes / minutesInMonth)
    if (months === 12 && defaultUnit !== 'month') {
      return formatDistance('xYears', 1, localizeOptions)
    } else {
      return formatDistance('xMonths', months, localizeOptions)
    }
  }
  // 1 year up to max Date
  else {
    const years = roundingMethod(dstNormalizedMinutes / minutesInYear)
    return formatDistance('xYears', years, localizeOptions)
  }
}

export function customFormatDistanceToNowStrict(
  date: DateArg<Date> & {},
  options?: FormatDistanceToNowStrictOptions,
) {
  return customFormatDistanceStrict(date, constructNow(date), options)
}
