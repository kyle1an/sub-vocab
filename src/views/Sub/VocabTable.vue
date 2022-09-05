<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue'
import { TransitionPresets, until, useElementHover } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { ElInput, ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { LabelRow, Sorting } from '@/types'
import { compare, isMobile, removeClass, selectWord, useRange } from '@/utils/utils'
import Examples from '@/components/Examples'
import SegmentedControl from '@/components/SegmentedControl.vue'
import ToggleButton from '@/components/ToggleButton.vue'
import { useVocabStore } from '@/store/useVocab'
import { useDebounceRAF, useDebounceTransition } from '@/composables/useDebounce'
import { watched } from '@/composables/watch'

const {
  data = [],
  sentences = ['']
} = defineProps<{
  data: LabelRow[],
  sentences: string[]
}>()
const { t } = useI18n()

function onSegmentSwitched(seg: number) {
  disabledTotal = true
  selectedSeg = seg
  sessionStorage.setItem('prev-segment-select', String(selectedSeg))
  refreshTableData()
}

let selectedSeg = $ref(+(sessionStorage.getItem('prev-segment-select') || 0))
let dirty = $ref(true)
const { inUpdating } = $(useVocabStore())
const segCb = (id: number): (r: LabelRow) => boolean =>
  id === 1 ? (r) => Boolean(!r.vocab.acquainted && r.vocab.w.length > 2) :
    id === 2 ? (r) => Boolean(r.vocab.acquainted || r.vocab.w.length <= 2) : () => true
const vocabTable = ref()
watch($$(inUpdating), () => {
  if (selectedSeg !== 0) dirty = true
  if (inUpdating) return
  requestAnimationFrame(() => removeClass('xpd'))
  if (isHovered || selectedSeg === 0) return
  refreshTableData()
})
const isHovered = $(watched(useElementHover(vocabTable), (isHovered) => {
  if (isHovered || !dirty || inUpdating || selectedSeg === 0) return
  refreshTableData()
}))
const search = $ref('')
const sortChange = (p: Sorting<LabelRow>) => sortBy = p
let sortBy = $shallowRef<Sorting<LabelRow>>({ order: null, prop: null, })
const currPage = $ref(1)
const pageSize = $ref(100)
// use shallowRef to avoid issue of cannot expand row
let rowsDisplay = $shallowRef<LabelRow[]>([])

const refreshTableData = useDebounceRAF(() => {
  const { prop, order } = sortBy
  const rowsSearched = data
    .filter(segCb(selectedSeg))
    .filter(search ? (r) => r.vocab.w.toLowerCase().includes(search.toLowerCase()) : () => true)
  until($$(inTransition)).toBe(false).then(() => total = rowsSearched.length)

  if (prop && order) {
    rowsSearched.sort(compare(prop, order))
  }

  rowsDisplay = rowsSearched.slice(...useRange(currPage, pageSize))
  dirty = false
  requestAnimationFrame(() => {
    removeClass('xpd')
    nextTick().then(() => disabledTotal = false)
  })
})

let total = $ref(0)
watch([$$(data), $$(sortBy), $$(search), $$(currPage), $$(pageSize)], refreshTableData, { immediate: true })
let disabledTotal = $ref(false)
const { output: totalTransit, inTransition } = $(useDebounceTransition($$(total), {
  disabled: $$(disabledTotal),
  transition: TransitionPresets.easeOutCirc,
}))

function handleRowClick(row: LabelRow) {
  (vocabTable.value as typeof ElTable).toggleRowExpansion(row)
}

function handleExpand(row: LabelRow) {
  document.getElementsByClassName(`v-${row.src[0][3]}`)[0].classList.toggle('xpd')
}
</script>

<template>
  <div class="mx-5 flex h-full flex-col items-center overflow-hidden rounded-xl border border-inherit bg-white shadow-sm will-change-transform md:mx-0">
    <segmented-control
      name="vocab-seg"
      :segments="[t('all'), t('new'), t('acquainted')]"
      :init="selectedSeg"
      class="w-full grow-0"
      @input="onSegmentSwitched"
    />
    <div class="h-px w-full grow">
      <el-table
        ref="vocabTable"
        class="!h-full from-[var(--el-border-color-lighter)] to-white [&_th_.cell]:font-compact [&_*]:overscroll-contain [&_.el-table\_\_inner-wrapper]:!h-full [&_.xpd_td]:!border-white [&_.xpd_td]:!bg-white [&_.xpd:hover>td]:bg-gradient-to-b [&_.el-table\_\_expand-icon]:tap-transparent [&_.el-icon]:pointer-events-none"
        size="small"
        :row-class-name="({row})=>`v-${row.src[0][3]}`"
        :data="rowsDisplay"
        @row-click="handleRowClick"
        @expand-change="handleExpand"
        @sort-change="sortChange"
      >
        <el-table-column
          type="expand"
          class-name="[&_i]:text-slate-500"
        >
          <template #default="{row}">
            <Examples
              :sentences="sentences"
              :src="row.src"
              class="tracking-wide"
            />
          </template>
        </el-table-column>
        <el-table-column
          :label="t('frequency')"
          prop="src.length"
          width="62"
          sortable="custom"
          class-name="cursor-pointer !text-right [th&>.cell]:!p-0"
        >
          <template #default="{row}">
            <div class="select-none text-right font-compact tabular-nums text-slate-400">
              {{ row.src.length }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="Vocabulary"
          prop="vocab.w"
          min-width="16"
          sortable="custom"
          class-name="cursor-pointer [td&>.cell]:!pr-0"
        >
          <template #header>
            <el-input
              v-model="search"
              class="!w-[calc(100%-26px)] !text-base md:!text-xs"
              size="small"
              :placeholder="t('search')"
              @click.stop
            />
          </template>
          <template #default="{row}">
            <span
              class="cursor-text font-compact text-[16px] tracking-wide text-neutral-900"
              v-on="isMobile ? {} : { mouseover: selectWord }"
              @click.stop
            >
              {{ row.vocab.w }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('length')"
          prop="vocab.w.length"
          width="68"
          sortable="custom"
          class-name="cursor-pointer !text-right [th&>.cell]:!p-0"
        >
          <template #default="{row}">
            <div class="select-none font-compact tabular-nums">
              {{ row.vocab.w.length }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          width="40"
          class-name="overflow-visible !text-center [td&>.cell]:!pl-0"
        >
          <template #default="{row}">
            <toggle-button :row="row.vocab" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      v-model:currentPage="currPage"
      v-model:page-size="pageSize"
      :page-sizes="[25, 100, 200, 500, 1000, Infinity]"
      :small="true"
      :pager-count="5"
      layout="prev, pager, next, ->, total, sizes"
      :total="~~totalTransit"
      class="w-full shrink-0 flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.is-active]:bg-neutral-100 [&_.el-pagination\_\_sizes.is-last]:!m-0 [&_.el-pagination\_\_total]:mx-[10px]"
    />
  </div>
</template>
