<script lang="ts" setup>
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { TransitionPresets, until } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { ElInput, ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { pipe } from 'fp-ts/function'
import { filter } from 'fp-ts/Array'
import { Sorting, SourceRow } from '@/types'
import { isMobile, orderBy, paging, selectWord, skip } from '@/utils/utils'
import Examples from '@/components/vocabulary/Examples'
import SegmentedControl from '@/components/SegmentedControl.vue'
import ToggleButton from '@/components/vocabulary/ToggleButton.vue'
import { useVocabStore } from '@/store/useVocab'
import { useDebounceTransition } from '@/composables/useDebounce'
import { useElHover, useStateCallback, watched } from '@/composables/utilities'
import { find } from '@/utils/vocab'

const {
  data = [],
  sentences = [''],
  expand = false,
} = defineProps<{
  data: SourceRow[],
  sentences?: string[]
  expand: boolean,
}>()
const { t } = useI18n()
type TableSegment = typeof segments[number]['value']
const [seg, setSeg] = $(useStateCallback<TableSegment>(sessionStorage.getItem('prev-segment-select') as TableSegment | null || 'all', (v) => {
  disabledTotal = true
  sessionStorage.setItem('prev-segment-select', String(v))
  requestAnimationFrame(() => nextTick().then(() => disabledTotal = false))
}))
let dirty = $ref(true)
const { inUpdating } = $(useVocabStore())
const vocabTable = ref()
const isHovered = $(watched(useElHover('.el-table__body-wrapper'), (isHovered) => {
  if (!dirty) return
  if (!isHovered && !inUpdating) {
    rowsDisplay.value = rows
  } else {
    dirty = true
  }
}))
const search = $ref('')
let sortBy = $ref<Sorting<SourceRow>>({ order: 'ascending', prop: 'src.0.3' })
const setSortBy = (sort: Sorting<SourceRow>) => {
  sortBy = sort.order === null ? { order: 'ascending', prop: 'src.0.3' } : sort
}
const currPage = $ref(1)
const pageSize = $ref(100)
// use shallowRef to avoid issue of cannot expand row
const rowsDisplay = watched(shallowRef<SourceRow[]>([]), () => dirty = false)
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
  } else if (!isHovered && !inUpdating) {
    rowsDisplay.value = v
  } else {
    dirty = true
  }
}, { immediate: true }))
watch($$(inUpdating), () => {
  if (seg === 'all') return
  if (!isHovered && !inUpdating) {
    rowsDisplay.value = rows
  } else {
    dirty = true
  }
}, { immediate: true })

function handleRowClick(row: SourceRow) {
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
      name="vocab-table"
      :segments="segments"
      :value="seg"
      class="w-full grow-0"
      :onChoose="setSeg"
    />
    <div class="h-px w-full grow">
      <el-table
        ref="vocabTable"
        class="!h-full from-[var(--el-border-color-lighter)] to-white [&_.el-table\_\_row:has(+tr:not([class]))>td]:!border-white [&_.el-table\_\_row:has(+tr:not([class]))>td]:bg-gradient-to-b [&_*]:overscroll-contain [&_th_.cell]:font-compact [&_.el-table\_\_inner-wrapper]:!h-full [&_.el-table\_\_expand-icon]:tap-transparent [&_.el-icon]:pointer-events-none"
        size="small"
        :row-class-name="()=>`${expand?'cursor-pointer':''}`"
        :row-key="(row)=>row.src[0][3]"
        :data="rowsDisplay"
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
            <div class="font-compact tabular-nums text-slate-400">
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
            <div class="font-compact tabular-nums">
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
        :small="true"
        :pager-count="5"
        layout="prev, pager, next, ->, total, sizes"
        :total="~~totalTransit"
        class="shrink-0 flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.is-active]:bg-neutral-100 [&_.el-pagination\_\_sizes.is-last]:!m-0 [&_.el-pagination\_\_total]:mx-[10px]"
      />
    </div>
  </div>
</template>
