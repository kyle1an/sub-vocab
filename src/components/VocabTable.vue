<script lang="tsx" setup>
import { PropType, computed, nextTick, reactive, ref, shallowRef } from 'vue'
import { TransitionPresets, useTransition } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { ElTable } from 'element-plus'
import { LabelRow, Sorting } from '../types'
import { compare, isMobile, selectWord } from '../utils/utils'
import Examples from '../components/Examples'
import SegmentedControl from '../components/SegmentedControl.vue'
import ToggleButton from './ToggleButton.vue'

const { t } = useI18n()
const props = defineProps({
  'data': { type: Array as PropType<LabelRow[]>, default: () => [''] },
  'sentences': { type: Array as PropType<string[]>, default: () => [''] },
})

function onSegmentSwitched(seg: number) {
  disabledTotal.value = true
  selectedSeg.value = seg
  sessionStorage.setItem('prev-segment-select', String(seg))
  nextTick().then(() => disabledTotal.value = false)
}

const selectedSeg = ref(+(sessionStorage.getItem('prev-segment-select') || 0))
const rowsSegmented = computed(() => {
  const source = props.data

  switch (selectedSeg.value) {
    case 1:
      return source.filter((r) => !r?.vocab?.acquainted && r.len > 2)
    case 2:
      return source.filter((r) => r?.vocab?.acquainted || r.len <= 2)
    default:
      return [...source]
  }
})

const search = ref('')
const rowsSearched = computed(() => {
  const source = rowsSegmented.value

  if (!search.value) {
    return source
  }

  return source.filter((r: LabelRow) => r.w.toLowerCase().includes(search.value.toLowerCase()))
})

const sortChange = (p: Sorting<LabelRow>) => sortBy.value = p
const sortBy = shallowRef<Sorting<LabelRow>>({ order: null, prop: null, })
const page = reactive({
  curr: 1,
  sizes: [25, 100, 200, 500, 1000, Infinity],
  size: 100,
})
const rowsPaged = computed(() => {
  const { prop, order } = sortBy.value
  let rowsSorted

  if (prop && order) {
    rowsSorted = [...rowsSearched.value].sort(compare(prop, order))
  } else {
    rowsSorted = rowsSearched.value
  }

  return rowsSorted.slice((page.curr - 1) * page.size, page.curr * page.size)
})

const total = computed(() => rowsSearched.value.length)
const disabledTotal = ref(false)
const totalTransit = useTransition(total, {
  disabled: disabledTotal,
  transition: TransitionPresets.easeOutCirc,
})

const vocabTable = shallowRef<typeof ElTable>()

function handleRowClick(row: LabelRow) {
  vocabTable.value?.toggleRowExpansion(row)
}

const segments = computed(() => [t('all'), t('new'), t('acquainted')])
</script>

<template>
  <div class="mx-5 flex h-full flex-col items-center overflow-hidden rounded-xl border border-inherit bg-white shadow-md will-change-transform md:mx-0">
    <segmented-control
      name="vocab-seg"
      :segments="segments"
      :default="selectedSeg"
      class="w-full grow-0"
      @input="onSegmentSwitched"
    />
    <div class="h-px w-full grow">
      <el-table
        ref="vocabTable"
        class="!h-full [&_th_.cell]:font-compact [&_*]:overscroll-contain [&_.el-table\_\_inner-wrapper]:!h-full [&_.el-table\_\_expand-icon]:tap-transparent [&_.el-icon]:pointer-events-none"
        height="200"
        size="small"
        fit
        :row-class-name="({row})=> row.expanded ? 'expanded' : ''"
        :data="rowsPaged"
        @row-click="handleRowClick"
        @expand-change="(r)=>{r.expanded ^= 1}"
        @sort-change="sortChange"
      >
        <el-table-column
          type="expand"
          class-name="[&_.el-table\_\_expand-icon_i]:text-slate-500"
        >
          <template #default="{row}">
            <Examples
              :sentences="props.sentences"
              :src="row.src"
              class="tracking-wide"
            />
          </template>
        </el-table-column>
        <el-table-column
          :label="t('frequency')"
          prop="freq"
          align="right"
          width="62"
          sortable="custom"
          class-name="cursor-pointer [th&>.cell]:!p-0"
        >
          <template #default="{row}">
            <div class="select-none text-right font-compact tabular-nums text-slate-400">
              {{ row.freq }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="Vocabulary"
          prop="w"
          align="left"
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
            >{{ row.w }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('length')"
          prop="len"
          align="right"
          width="68"
          sortable="custom"
          class-name="cursor-pointer [th&>.cell]:!p-0"
        >
          <template #default="{row}">
            <div class="select-none font-compact tabular-nums">
              {{ row.len }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          width="40"
          class-name="overflow-visible [td&>.cell]:!pl-0"
        >
          <template #default="{row}">
            <toggle-button :row="row" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      v-model:currentPage="page.curr"
      v-model:page-size="page.size"
      :page-sizes="page.sizes"
      :small="true"
      :background="true"
      :pager-count="5"
      layout="prev, pager, next, ->, total, sizes"
      :total="~~totalTransit"
      class="w-full shrink-0 flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.el-pagination\_\_sizes.is-last]:!m-0 [&_.el-pagination\_\_total]:mx-[10px]"
    />
  </div>
</template>

<style lang="scss" scoped>
:deep(.expanded) {
  &:hover > td {
    background-image: linear-gradient(to bottom, var(--el-border-color-lighter), white);
  }

  td {
    border-color: white !important;
  }
}
</style>
