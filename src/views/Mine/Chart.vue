<script lang="ts" setup>
import Chart from 'chart.js/auto'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { useVocabStore } from '@/store/useVocab'
import { useStateCallback, watched } from '@/composables/utilities'
import SegmentedControl from '@/components/SegmentedControl.vue'
import { range } from '@/utils/utils'

const rows = $computed(() => baseVocab.filter((r) => r.acquainted))
const map = new Map<string, number>()
const week: Record<string, string> = {}
range(6, -1).forEach((i) => {
  const d = new Date()
  d.setDate(d.getDate() - i)
  const date = format(d, 'yyyy-MM-dd')
  map.set(date, 0)
  week[date] = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : format(d, 'EEE')
})
let ff = ['SF Pro Rounded', 'SF Pro Text', '-apple-system', 'Inter', 'system-ui', 'sans-serif']
if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) ff = ff.slice(1)
Chart.defaults.font.family = ff.join(', ')
Chart.defaults.font.weight = '500'
const { t } = useI18n()
const { baseVocab } = $(useVocabStore())
const groupedRows = $computed(() => {
  rows.forEach(r => {
    const date = r.time_modified?.split('T')[0]
    if (!date || !week[date]) return
    map.set(date, (map.get(date) || 0) + 1)
  })
  return map
})
let myChart: Chart<'bar', number[], string>
const canvas = document.createElement('canvas')
const chartData = $(watched(computed(() => ({
  labels: [...groupedRows.keys()].map(k => week[k]),
  datasets: [{
    borderRadius: {
      topRight: 3,
      topLeft: 3,
    },
    label: 'Acquainted Vocabulary',
    data: [...groupedRows.values()],
    backgroundColor: 'rgba(255, 99, 132, 0.05)',
    borderColor: 'rgba(255, 99, 132, 1)',
    borderWidth: 1,
  }]
})), () => {
  myChart.data = chartData
  myChart.update()
}))

onMounted(() => {
  if (myChart) return
  const root = document.getElementById('chart') as HTMLElement
  root.innerHTML = ''
  root.append(canvas)
  myChart = new Chart(canvas, {
    type: 'bar',
    data: chartData,
    options: {
      plugins: {}
    }
  })
})

onBeforeUnmount(() => {
  myChart.destroy()
})
type ChartSegment = typeof segments[number]['value']
const [seg, setSeg] = $(useStateCallback<ChartSegment>(sessionStorage.getItem('prev-chart-select') as ChartSegment | null || 'W', (v) => {
  sessionStorage.setItem('prev-chart-select', String(v))
}))
const segments = $computed(() => [
  { value: 'W', label: t('W') },
] as const)
</script>

<template>
  <segmented-control
    name="vocab-seg"
    :segments="segments"
    :value="seg"
    class="w-full grow-0"
    :onChoose="setSeg"
  />
  <div
    id="chart"
    class="h-[calc(100vh-160px)] w-full tabular-nums tracking-wide ffs-[normal] md:h-full md:pb-0"
  />
</template>
