import { useMemo } from 'react'
import { useSessionStorage } from 'react-use'
import { groupBy, rangeRight } from 'lodash-es'
import {
  type ChartData, Chart as ChartJS,
  type ChartOptions,
} from 'chart.js'
import {
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  format, subDays, subMonths,
} from 'date-fns'
import 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useVocabularyQuery } from '@/api/vocab-api'
import { LEARNING_PHASE, type VocabState } from '@/lib/LabeledTire'

const mapWeek = (userWords: VocabState[]) => {
  const today = new Date()
  const preset: Record<string, []> = {}
  rangeRight(2, 7).forEach((i) => {
    preset[format(subDays(today, i), 'EEE')] = []
  })
  Object.assign(preset, {
    Yesterday: [],
    Today: [],
  })

  const inScope = userWords.filter((v) => v.learningPhase === LEARNING_PHASE.ACQUAINTED && v.timeModified)
  const { Earlier, ...groupedVocab } = groupBy(inScope, (v) => {
    const label = format(new Date(v.timeModified!), 'EEE')
    const differences = differenceInCalendarWeeks(today, new Date(v.timeModified!))
    if (label in preset && differences <= 1) {
      return label
    }
    return 'Earlier'
  })

  return {
    ...preset,
    ...groupedVocab,
  }
}

const mapMonth = (userWords: VocabState[]) => {
  const today = new Date()
  const preset: Record<string, []> = {}
  rangeRight(0, 30).forEach((i) => {
    preset[format(subDays(today, i), 'do')] = []
  })

  const inScope = userWords.filter((v) => v.learningPhase === LEARNING_PHASE.ACQUAINTED && v.timeModified)
  const { Earlier, ...groupedVocab } = groupBy(inScope, (v) => {
    const label = format(new Date(v.timeModified!), 'do')
    const differences = differenceInCalendarMonths(today, new Date(v.timeModified!))
    if (label in preset && differences <= 1) {
      return label
    }
    return 'Earlier'
  })

  return {
    ...preset,
    ...groupedVocab,
  }
}

const map6M = (userWords: VocabState[]) => {
  const today = new Date()
  const preset: Record<string, []> = {}
  rangeRight(0, 6).forEach((i) => {
    preset[format(subMonths(today, i), 'LLL')] = []
  })

  const inScope = userWords.filter((v) => v.learningPhase === LEARNING_PHASE.ACQUAINTED && v.timeModified)
  const { Earlier, ...groupedVocab } = groupBy(inScope, (v) => {
    const label = format(new Date(v.timeModified!), 'LLL')
    const differences = differenceInCalendarMonths(today, new Date(v.timeModified!))
    if (label in preset && differences <= 6) {
      return label
    }
    return 'Earlier'
  })

  return {
    ...preset,
    ...groupedVocab,
  }
}

const SEGMENT_NAME = 'prev-chart-select'
export function Chart() {
  const { t } = useTranslation()
  const { data: userWords = [] } = useVocabularyQuery()

  const segments = [
    { value: '6M', label: t('6M') },
    { value: 'M', label: t('M') },
    { value: 'W', label: t('W') },
  ] as const
  type Segment = typeof segments[number]['value']
  const [segment, setSegment] = useSessionStorage<Segment>(`${SEGMENT_NAME}-value`, 'W')

  ChartJS.defaults.font.family = [
    ...(navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? [] : ['SF Pro Rounded']),
    ...['SF Pro Text', '-apple-system', 'Inter', 'system-ui', 'sans-serif'],
  ].join(', ')
  ChartJS.defaults.font.weight = 500

  const groupedRows = useMemo(() => {
    if (segment === 'W') {
      return mapWeek(userWords)
    }
    if (segment === 'M') {
      return mapMonth(userWords)
    }
    return map6M(userWords)
  }, [userWords, segment])

  const chartData = useMemo(() => ({
    labels: Object.keys(groupedRows),
    datasets: [
      {
        borderRadius: {
          topRight: 3,
          topLeft: 3,
        },
        label: 'Acquainted Vocabulary',
        data: Object.values(groupedRows).map((v) => v.length),
        backgroundColor: 'rgba(255, 99, 132, 0.05)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  } satisfies ChartData<'bar', number[], string>), [groupedRows])

  const options = {
    plugins: {},
    scales: {
      y: {
        ticks: {
          precision: 0,
        },
      },
    },
  } satisfies ChartOptions<'bar'>

  return (
    <div className="pt-8">
      <SegmentedControl
        name={SEGMENT_NAME}
        segments={segments}
        value={segment}
        onChoose={setSegment}
      />
      <Bar
        options={options}
        data={chartData}
        className="w-full tabular-nums tracking-wide ffs-[normal] md:pb-0"
      />
    </div>
  )
}
