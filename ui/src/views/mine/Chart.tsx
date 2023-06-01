// eslint-disable-next-line import/no-named-as-default
import Chart, { type ChartData } from 'chart.js/auto'
import { computed, defineComponent, onBeforeUnmount, onMounted, watch } from 'vue'
import { format } from 'date-fns'
import { t } from '@/i18n'
import { useVocabStore } from '@/store/useVocab'
import { createSignal } from '@/composables/utilities'
import { SegmentedControl } from '@/components/SegmentedControl'

const SEG = 'prev-chart-select'
export const VChart = defineComponent(() => {
  const map = new Map<string, number>()
  const week: Record<string, string> = {}
  Array.from({ length: 7 }, (v, i) => 6 - i).forEach((i) => {
    const day = new Date()
    day.setDate(day.getDate() - i)
    const date = format(day, 'yyyy-MM-dd')
    map.set(date, 0)
    week[date] = i === 0 ? 'Today'
      : i === 1 ? 'Yesterday'
        : format(day, 'EEE')
  })

  Chart.defaults.font.family = [
    ...(navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? [] : ['SF Pro Rounded']),
    ...['SF Pro Text', '-apple-system', 'Inter', 'system-ui', 'sans-serif'],
  ].join(', ')
  Chart.defaults.font.weight = '500'

  const store = useVocabStore()

  const groupedRows = computed(() => {
    store.baseVocab.filter(v => v.acquainted && v.time_modified).forEach((v) => {
      const date = v.time_modified!.split('T')[0]
      if (week[date]) {
        map.set(date, (map.get(date) || 0) + 1)
      }
    })
    return map
  })

  let myChart: Chart<'bar', number[], string>
  const chartData = computed(() => ({
    labels: [...groupedRows.value.keys()].map(k => week[k]),
    datasets: [
      {
        borderRadius: { topRight: 3, topLeft: 3 },
        label: 'Acquainted Vocabulary',
        data: [...groupedRows.value.values()],
        backgroundColor: 'rgba(255, 99, 132, 0.05)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ]
  } satisfies ChartData<'bar', number[], string>))
  watch(chartData, (v) => {
    myChart.data = v
    myChart.update()
  })

  onMounted(() => {
    const canvas = document.createElement('canvas')
    if (myChart) return
    const root = document.getElementById('chart') as HTMLElement
    root.innerHTML = ''
    root.append(canvas)
    myChart = new Chart(canvas, {
      type: 'bar',
      data: chartData.value,
      options: { plugins: {} }
    })
  })

  onBeforeUnmount(() => {
    myChart.destroy()
  })
  const segments = () => [
    { value: '6M', label: t('6M') },
    { value: 'M', label: t('M') },
    { value: 'W', label: t('W') },
  ] as const
  const [seg, setSeg] = createSignal(sessionStorage.getItem(`${SEG}`) as ReturnType<typeof segments>[number]['value'] | null || 'W')
  watch(seg, (v) => {
    sessionStorage.setItem(`${SEG}`, String(v))
  })
  return () => (
    <div class="h-[calc(100vh-160px)]">
      <SegmentedControl
        name={SEG}
        segments={segments()}
        value={seg()}
        onChoose={setSeg}
      />
      <div
        id="chart"
        class="w-full tabular-nums tracking-wide ffs-[normal] md:pb-0"
      />
    </div>
  )
})
