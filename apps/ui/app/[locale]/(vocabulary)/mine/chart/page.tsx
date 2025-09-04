'use client'

import type { ChartData, ChartOptions } from 'chart.js'

import 'chart.js/auto'
import { useIsomorphicLayoutEffect } from '@react-hookz/web'
import {
  Chart as ChartJS,
} from 'chart.js'
import { endOfWeek, format, getMonth, isFirstDayOfMonth, isSunday, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns'
import { rangeRight } from 'es-toolkit'
import { useSessionStorage } from 'foxact/use-session-storage'
import { useAtom } from 'jotai'
import { Fragment } from 'react'
import { Bar } from 'react-chartjs-2'
import colors from 'tailwindcss/colors'

import type { TrackedWord } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'

import { baseVocabAtom } from '@/app/[locale]/(vocabulary)/_api'
import { LEARNING_PHASE } from '@/app/[locale]/(vocabulary)/_lib/LexiconTrie'
import { SegmentedControl, SegmentItem } from '@/components/ui/segmented-control'
import { useI18n } from '@/locales/client'
import { createFactory } from '@sub-vocab/utils/lib'
import { narrow } from '@sub-vocab/utils/types'

type DataSet = {
  groupName: string
  groupKey: string
  tooltipFooter: string
  range: [Date, Date]
  groupValue: TrackedWord[]
}

function mapWeek(userWords: TrackedWord[]) {
  const today = new Date()
  const preset: Record<string, TrackedWord[]> = {}
  const dataPreset: DataSet[] = []
  const getGroupKey = (date: Date) => date.toDateString()
  rangeRight(0, 7).forEach((i) => {
    const subDay = subDays(today, i)
    const groupName = format(subDay, 'EEE')
    const groupKey = getGroupKey(subDay)
    const groupValue: TrackedWord[] = []
    dataPreset.push({
      groupName,
      tooltipFooter: format(subDay, 'LLL d, yyyy'),
      groupKey,
      range: [subDay, subDay],
      groupValue,
    })
    preset[groupKey] = groupValue
  })

  userWords.forEach((v) => {
    if (v.learningPhase === LEARNING_PHASE.ACQUAINTED && v.timeModified) {
      const label = getGroupKey(new Date(v.timeModified))
      const group = preset[label]
      if (group) {
        group.push(v)
      }
    }
  })

  return dataPreset
}

function mapMonth(userWords: TrackedWord[]) {
  const today = new Date()
  const preset: Record<string, TrackedWord[]> = {}
  const dataPreset: DataSet[] = []
  const getGroupKey = (date: Date) => date.toDateString()
  rangeRight(0, 31).forEach((i) => {
    const subDay = subDays(today, i)
    let groupName = ''
    if (isSunday(subDay)) {
      groupName = format(subDay, 'd')
    }

    const groupKey = getGroupKey(subDay)
    const groupValue: TrackedWord[] = []
    dataPreset.push({
      groupName,
      tooltipFooter: '',
      groupKey,
      range: [subDay, subDay],
      groupValue,
    })
    preset[groupKey] = groupValue
  })

  userWords.forEach((v) => {
    if (v.learningPhase === LEARNING_PHASE.ACQUAINTED && v.timeModified) {
      const label = getGroupKey(new Date(v.timeModified))
      const group = preset[label]
      if (group) {
        group.push(v)
      }
    }
  })

  return dataPreset
}

function map6M(userWords: TrackedWord[]) {
  const today = new Date()
  const preset: Record<string, TrackedWord[]> = {}
  const dataPreset: DataSet[] = []
  const getGroupKey = (date: Date) => format(date, 'w, yyyy')
  rangeRight(0, 25).forEach((i) => {
    const subWeek = subWeeks(today, i)
    let groupName = ''
    const weekStart = startOfWeek(subWeek)
    const weekEnd = endOfWeek(subWeek)
    const monthStart = startOfMonth(weekEnd)
    if (monthStart >= weekStart && monthStart <= weekEnd) {
      groupName = format(weekEnd, 'MMM')
    }

    const groupKey = getGroupKey(subWeek)
    const groupValue: TrackedWord[] = []
    dataPreset.push({
      groupName,
      groupKey,
      tooltipFooter: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}, ${format(subWeek, 'yyyy')}`,
      range: [weekStart, weekEnd],
      groupValue,
    })
    preset[groupKey] = groupValue
  })

  userWords.forEach((v) => {
    if (v.learningPhase === LEARNING_PHASE.ACQUAINTED && v.timeModified) {
      const label = getGroupKey(new Date(v.timeModified))
      const group = preset[label]
      if (group) {
        group.push(v)
      }
    }
  })

  return dataPreset
}

function mapY(userWords: TrackedWord[]) {
  const today = new Date()
  const preset: Record<string, TrackedWord[]> = {}
  const dataPreset: DataSet[] = []
  const getGroupKey = (date: Date) => format(date, 'LLL')
  rangeRight(0, 12).forEach((i) => {
    const subMonth = subMonths(today, i)
    const groupName = format(subMonth, 'LLLLL')

    const groupKey = getGroupKey(subMonth)
    const groupValue: TrackedWord[] = []
    dataPreset.push({
      groupName,
      groupKey,
      tooltipFooter: format(subMonth, 'MMM yyyy'),
      range: [subMonth, subMonth],
      groupValue,
    })
    preset[groupKey] = groupValue
  })

  userWords.forEach((v) => {
    if (v.learningPhase === LEARNING_PHASE.ACQUAINTED && v.timeModified) {
      const label = getGroupKey(new Date(v.timeModified))
      const group = preset[label]
      if (group) {
        group.push(v)
      }
    }
  })

  return dataPreset
}

const buildBarOptions = createFactory<ChartOptions<'bar'>>()(() => ({
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      displayColors: false,
      yAlign: 'bottom',
      callbacks: {
        title() {
          return 'TOTAL'
        },
        label(context) {
          const value = context.parsed.y || 0
          return `${value} Vocabulary`
        },
      },
    },
  },
  scales: {
    x: {
      border: {
        dash(scaleContext) {
          const label = scaleContext?.tick?.label
          if (label === '1' || label === 'Sun') {
            return [0, 0]
          }

          return [2, 2]
        },
      },
      ticks: {
        maxRotation: 0,
        autoSkip: false,
      },
    },
    y: {
      position: 'right',
      ticks: {
        precision: 0,
      },
      border: {
        display: false,
      },
    },
  },
  layout: {
    padding: {
      left: 24,
    },
  },
}))

const SEGMENT_NAME = 'prev-chart-select'
export default function Chart() {
  const t = useI18n()
  const [userWords] = useAtom(baseVocabAtom)

  const segments = narrow([
    { value: 'W', label: t('W') },
    { value: 'M', label: t('M') },
    { value: '6M', label: t('6M') },
    { value: 'Y', label: t('Y') },
  ])
  type Segment = typeof segments[number]['value']
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'W')

  useIsomorphicLayoutEffect(() => {
    ChartJS.defaults.font.family = [
      '-apple-system', 'SF Compact Text', 'BlinkMacSystemFont', 'sans-serif',
    ].join(', ')
    ChartJS.defaults.font.weight = 500
  }, [])

  let groupedRows: DataSet[] = []
  if (segment === 'W') {
    groupedRows = mapWeek(userWords)
  } else if (segment === 'M') {
    groupedRows = mapMonth(userWords)
  } else if (segment === '6M') {
    groupedRows = map6M(userWords)
  } else if (segment === 'Y') {
    groupedRows = mapY(userWords)
  }

  const barColor = colors.red[400]

  let data = groupedRows.map((v) => v.groupValue.length)
  if (segment === '6M') {
    data = data.map((v) => {
      const daily = v / 7
      return daily
    })
  }

  const chartData = {
    labels: groupedRows.map((v) => v.groupName),
    datasets: [
      {
        borderRadius: {
          topRight: 3,
          topLeft: 3,
        },
        label: 'Acquainted Vocabulary',
        data,
        backgroundColor: barColor,
      },
    ],
  } satisfies ChartData<'bar', number[], string>

  let options: ChartOptions<'bar'>

  if (segment === 'W') {
    options = buildBarOptions({
      plugins: {
        tooltip: {
          callbacks: {
            footer(context) {
              if (context[0]) {
                const { dataIndex } = context[0]
                const bar = groupedRows[dataIndex]
                if (bar) {
                  return bar.tooltipFooter
                }
              }
            },
          },
        },
      },
    })
  } else if (segment === 'M') {
    options = buildBarOptions({
      plugins: {
        tooltip: {
          callbacks: {
            footer(context) {
              if (context[0]) {
                const { dataIndex } = context[0]
                const bar = groupedRows[dataIndex]
                if (bar) {
                  return format(new Date(bar.groupKey), 'MMM d, yyyy')
                }
              }
            },
          },
        },
      },
      scales: {
        x: {
          border: {
            dash(scaleContext) {
              const { index: dataIndex } = scaleContext
              const bar = groupedRows[dataIndex]
              const groupDate = new Date(bar?.range[0] ?? '')
              if (isFirstDayOfMonth(groupDate)) {
                return [0, 0]
              }

              if (bar) {
                if (isSunday(new Date(bar.groupKey))) {
                  return [2, 2]
                }
              }
              return [0, 1] // hide
            },
          },
        },
      },
    })
  } else if (segment === '6M') {
    options = buildBarOptions({
      plugins: {
        tooltip: {
          callbacks: {
            title() {
              return 'DAILY AVERAGE'
            },
            label(context) {
              const value = context.parsed.y || 0
              return `${value.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 0 })} Vocabulary`
            },
            footer(context) {
              if (context[0]) {
                const { dataIndex } = context[0]
                const bar = groupedRows[dataIndex]
                if (bar) {
                  return bar.tooltipFooter
                }
              }
            },
          },
        },
      },
      scales: {
        x: {
          border: {
            dash(scaleContext) {
              const { index: dataIndex } = scaleContext
              const bar = groupedRows[dataIndex]
              if (bar?.groupName) {
                return [2, 2]
              }

              return [0, 1]
            },
          },
        },
      },
    })
  } else if (segment === 'Y') {
    options = buildBarOptions({
      plugins: {
        tooltip: {
          callbacks: {
            footer(context) {
              if (context[0]) {
                const { dataIndex } = context[0]
                const bar = groupedRows[dataIndex]
                if (bar) {
                  return bar.tooltipFooter
                }
              }
            },
          },
        },
      },
      scales: {
        x: {
          border: {
            dash(scaleContext) {
              const { index: dataIndex } = scaleContext
              const bar = groupedRows[dataIndex]
              const groupDate = new Date(bar?.range[0] ?? '')
              if (getMonth(groupDate) === 0) {
                return [0, 0]
              }

              return [2, 2]
            },
          },
        },
      },
    })
  } else {
    options = buildBarOptions()
  }

  return (
    <Fragment>
      <SegmentedControl
        value={segment}
        onValueChange={setSegment}
      >
        {segments.map((segment) => (
          <SegmentItem
            key={segment.value}
            segment={segment}
          />
        ))}
      </SegmentedControl>
      <Bar
        options={options}
        data={chartData}
        className="w-full tabular-nums md:pb-0"
      />
    </Fragment>
  )
}
