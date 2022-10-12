<script lang="ts" setup>
import Chart from 'chart.js/auto'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { format } from 'date-fns'
import { rangeRight } from 'lodash-es'
import { t } from '@/i18n'
import { useVocabStore } from '@/store/useVocab'
import { useStateCallback, watched } from '@/composables/utilities'
import SegmentedControl from '@/components/SegmentedControl.vue'

const { baseVocab } = $(useVocabStore())
let fontFamily = ['SF Pro Rounded', 'SF Pro Text', '-apple-system', 'Inter', 'system-ui', 'sans-serif']
if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) fontFamily = fontFamily.slice(1)
Chart.defaults.font.family = fontFamily.join(', ')
Chart.defaults.font.weight = '500'

const map = new Map<string, number>()
const week: Record<string, string> = {}
rangeRight(7).forEach((i) => {
  const day = new Date()
  day.setDate(day.getDate() - i)
  const date = format(day, 'yyyy-MM-dd')
  map.set(date, 0)
  week[date] = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : format(day, 'EEE')
})

const groupedRows = $computed(() => {
  baseVocab.forEach(r => {
    if (!r.acquainted) return
    const date = r.time_modified?.split('T')[0]
    if (!date || !week[date]) return
    map.set(date, (map.get(date) || 0) + 1)
  })
  return map
})

const weekLabels = $computed(() => [...groupedRows.keys()].map(k => week[k]))
const vocabCount = $computed(() => [...groupedRows.values()])
let myChart: Chart<'bar', number[], string>
const chartData = $(watched(computed(() => ({
  labels: weekLabels,
  datasets: [{
    borderRadius: { topRight: 3, topLeft: 3, },
    label: 'Acquainted Vocabulary',
    data: vocabCount,
    backgroundColor: 'rgba(255, 99, 132, 0.05)',
    borderColor: 'rgba(255, 99, 132, 1)',
    borderWidth: 1,
  }]
})), (v) => {
  myChart.data = v
  myChart.update()
}))

onMounted(() => {
  const canvas = document.createElement('canvas')
  if (myChart) return
  const root = document.getElementById('chart') as HTMLElement
  root.innerHTML = ''
  root.append(canvas)
  myChart = new Chart(canvas, {
    type: 'bar',
    data: chartData,
    options: { plugins: {} }
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
  <SegmentedControl
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
