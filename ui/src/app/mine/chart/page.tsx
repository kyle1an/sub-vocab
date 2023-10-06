import { useMemo } from 'react'
import { useSessionStorage } from 'react-use'
import { rangeRight } from 'lodash-es'
import {
  type ChartData, Chart as ChartJS,
} from 'chart.js'
import { format } from 'date-fns'
import 'chart.js/auto'
import { Bar, Chart as ReactChartJs } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useVocabularyQuery } from '@/lib/composables'
import { LEARNING_PHASE } from '@/lib/LabeledTire'

const mapWeek = () => {
  const map = new Map<string, number>()
  const week: Record<string, string> = {}
  rangeRight(6).forEach((i) => {
    const day = new Date()
    day.setDate(day.getDate() - i)
    const date = format(day, 'yyyy-MM-dd')
    map.set(date, 0)
    week[date] = i === 0 ? 'Today' : i === 1 ? 'Yesterday'
      : format(day, 'EEE')
  })
  return { map, week }
}

const SEG = 'prev-chart-select'
export function Chart() {
  const { t } = useTranslation()
  const { data: userWords = [] } = useVocabularyQuery()
  const { map, week } = mapWeek()

  ChartJS.defaults.font.family = [
    ...(navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? [] : ['SF Pro Rounded']),
    ...['SF Pro Text', '-apple-system', 'Inter', 'system-ui', 'sans-serif'],
  ].join(', ')
  ChartJS.defaults.font.weight = '500'

  const groupedRows = useMemo(() => {
    userWords.filter((v) => v.learningPhase === LEARNING_PHASE.ACQUAINTED && v.timeModified).forEach((v) => {
      const date = v.timeModified!.split('T')[0]
      if (week[date]) {
        map.set(date, (map.get(date) || 0) + 1)
      }
    })
    return map
  }, [userWords, map, week])

  const chartData = useMemo(() => ({
    labels: [...groupedRows.keys()].map((k) => week[k]),
    datasets: [
      {
        borderRadius: { topRight: 3, topLeft: 3 },
        label: 'Acquainted Vocabulary',
        data: [...groupedRows.values()],
        backgroundColor: 'rgba(255, 99, 132, 0.05)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  } satisfies ChartData<'bar', number[], string>), [groupedRows, week])

  const segments = () => [
    { value: '6M', label: t('6M') },
    { value: 'M', label: t('M') },
    { value: 'W', label: t('W') },
  ] as const
  const [seg, setSeg] = useSessionStorage<ReturnType<typeof segments>[number]['value']>(`${SEG}`, 'W')

  return (
    <div className="pt-8">
      <SegmentedControl
        name={SEG}
        segments={segments()}
        value={seg}
        onChoose={setSeg}
      />
      <Bar
        options={{ plugins: {} }}
        data={chartData}
        className="w-full tabular-nums tracking-wide ffs-[normal] md:pb-0"
      />
    </div>
  )
}
