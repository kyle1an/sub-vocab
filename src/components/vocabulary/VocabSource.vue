<script lang="ts" setup>
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { TransitionPresets, until } from '@vueuse/core'
import { ElInput, ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { pipe } from 'fp-ts/function'
import { filter } from 'fp-ts/Array'
import { t } from '@/i18n'
import type { Sorting, SourceRow } from '@/types'
import { isMobile, orderBy, paging, selectWord, skip } from '@/utils/utils'
import Examples from '@/components/vocabulary/Examples'
import SegmentedControl from '@/components/SegmentedControl.vue'
import ToggleButton from '@/components/vocabulary/ToggleButton.vue'
import { useDebounceTransition } from '@/composables/useDebounce'
import { useElHover, useStateCallback, watched } from '@/composables/utilities'
import { find } from '@/utils/vocab'

const {
  data = [],
  sentences = [''],
  expand = false,
  tableName,
} = defineProps<{
  data: SourceRow[],
  sentences?: string[],
  expand: boolean,
  tableName: string,
}>()
type RowData = typeof data[number]
type TableSegment = typeof segments[number]['value']
const [seg, setSeg] = $(useStateCallback<TableSegment>(sessionStorage.getItem(`${tableName}-segment`) as TableSegment | null || 'all', (v) => {
  disabledTotal = true
  sessionStorage.setItem(`${tableName}-segment`, String(v))
  requestAnimationFrame(() => nextTick().then(() => disabledTotal = false))
}))
let dirty = $ref(false)
const vocabTable = ref()
const isHovered = $(watched(useElHover('.el-table__body-wrapper'), (isHovered) => {
  if (dirty && !isHovered) {
    rowsDisplay.value = rows
    dirty = false
  }
}))
const search = $ref('')
const defaultSort: Sorting = { order: 'ascending', prop: 'src.0.3' }
let sortBy = $ref(defaultSort)
const setSortBy = ({ order, prop }: Sorting) => sortBy = order && prop ? { order, prop } : defaultSort
const currPage = $ref(1)
const pageSize = $ref(100)
// use shallowRef to avoid issue of cannot expand row
const rowsDisplay = shallowRef<RowData[]>([])
let total = $ref(0)
let disabledTotal = $ref(false)
const { output: totalTransit, inTransition } = $(useDebounceTransition($$(total), {
  disabled: $$(disabledTotal),
  transition: TransitionPresets.easeOutCirc,
}))
let inputDirty = $ref(false)
watch($$(data), () => inputDirty = true)
const rowsSearched = $(watched(computed(() => pipe(data,
  seg === 'new' ? filter((r) => !r.vocab.acquainted && r.vocab.w.length > 2) :
    seg === 'acquainted' ? filter((r) => Boolean(r.vocab.acquainted || r.vocab.w.length <= 2)) : skip,
  find(search),
)), (newSearched) => until($$(inTransition)).toBe(false).then(() => total = newSearched.length)))
const rows = $(watched(computed(() => pipe(rowsSearched,
  orderBy(sortBy.prop, sortBy.order),
  paging(currPage, pageSize),
)), (v) => {
  if (inputDirty) {
    rowsDisplay.value = v
    inputDirty = false
  } else if (!isHovered) {
    rowsDisplay.value = v
  } else {
    dirty = true
  }
}, { immediate: true }))

function handleRowClick(row: RowData) {
  (vocabTable.value as typeof ElTable).toggleRowExpansion(row)
}

const segments = $computed(() => [
  { value: 'all', label: t('all') },
  { value: 'new', label: t('new') },
  { value: 'acquainted', label: t('acquainted') },
] as const)
</script>

<template>
  <div class="mx-5 flex h-full flex-col items-center overflow-hidden rounded-xl border border-inherit bg-white shadow-sm will-change-transform md:mx-0">
    <segmented-control
      :name="tableName"
      :segments="segments"
      :value="seg"
      class="w-full grow-0"
      :onChoose="setSeg"
    />
    <div class="h-px w-full grow">
      <el-table
        ref="vocabTable"
        :data="rowsDisplay"
        :row-key="(row)=>row.src[0][3]"
        class="!h-full from-[var(--el-border-color-lighter)] to-white [&_th_.cell]:font-compact [&_*]:overscroll-contain [&_.el-table\_\_inner-wrapper]:!h-full [&_.el-table\_\_row:has(+tr:not([class]))>td]:!border-white [&_.el-table\_\_row:has(+tr:not([class]))>td]:bg-gradient-to-b [&_.el-table\_\_expand-icon]:tap-transparent [&_.el-icon]:pointer-events-none"
        size="small"
        :row-class-name="()=>`${expand?'cursor-pointer':''}`"
        v-on="expand ? { 'row-click': handleRowClick } : {}"
        @sort-change="setSortBy"
      >
        <el-table-column
          v-if="expand"
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
          :width="`${expand?62:72}`"
          sortable="custom"
          class-name="!text-right [th&>.cell]:!p-0"
        >
          <template #default="{row}">
            <div class="tabular-nums text-slate-400">
              {{ row.src.length }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="Vocabulary"
          prop="vocab.w"
          min-width="16"
          sortable="custom"
          class-name="select-none [td&>.cell]:!pr-0"
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
              class="cursor-text select-text font-compact text-[16px] tracking-wide text-neutral-900"
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
          class-name="!text-right [th&>.cell]:!p-0"
        >
          <template #default="{row}">
            <div class="tabular-nums">
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
    <div class="min-h-9 w-full">
      <el-pagination
        v-model:currentPage="currPage"
        v-model:page-size="pageSize"
        :page-sizes="[25, 100, 200, 500, 1000, Infinity]"
        :pager-count="5"
        :small="true"
        :total="~~totalTransit"
        class="shrink-0 flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.is-active]:bg-neutral-100 [&_.el-pagination\_\_sizes.is-last]:!m-0 [&_.el-pagination\_\_total]:mx-[10px]"
        layout="prev, pager, next, ->, total, sizes"
      />
    </div>
  </div>
</template>
