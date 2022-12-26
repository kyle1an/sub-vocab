<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { TransitionPresets, useSessionStorage, useTransition } from '@vueuse/core'
import { ElInput, ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { pipe } from 'fp-ts/function'
import { t } from '@/i18n'
import type { MyVocabRow, RowDisplay, Sorting } from '@/types'
import { isMobile, orderBy, paging, selectWord } from '@/utils/utils'
import { Examples } from '@/components/vocabulary/Examples'
import SegmentedControl from '@/components/SegmentedControl.vue'
import ToggleButton from '@/components/vocabulary/ToggleButton.vue'
import { useElHover, useStateCallback, watched } from '@/composables/utilities'
import { handleVocabToggle } from '@/utils/vocab'

const {
  data = [],
  sentences = [''],
  expand = false,
  tableName,
} = defineProps<{
  data: RowDisplay[],
  sentences?: string[],
  expand?: boolean,
  tableName: string,
}>()
const segments = $computed(() => [
  { value: 'all', label: t('all') },
  { value: 'new', label: t('new') },
  { value: 'acquainted', label: t('acquainted') },
] as const)
type TableSegment = typeof segments[number]['value']
let prevSeg = $(useSessionStorage(`${tableName}-segment`, 'all'))
const [seg, setSeg] = $(useStateCallback<TableSegment>(segments.find((s) => s.value === prevSeg)?.value ?? 'all', (v) => {
  disabledTotal = true
  prevSeg = v
}))
let dirty = $ref(false)
const vocabTable = ref()
const isHovered = $(watched(useElHover('.el-table__body-wrapper'), (isHovered) => {
  if (dirty && !isHovered) {
    rowsDisplay = rows
    dirty = false
  }
}))
const search = $ref('')
const defaultSort: Sorting = { order: 'ascending', prop: 'src.0.3' }
let sortBy = $ref(defaultSort)
const setSortBy = ({ order, prop }: Sorting) => sortBy = order && prop ? { order, prop } : defaultSort
const currPage = $ref(1)
const pageSize = $ref(100)
watch($$(currPage), () => {
  vocabTable.value.setScrollTop(0)
})
let rowsDisplay = $shallowRef<typeof data[number][]>([])
let disabledTotal = $ref(true)
let inputDirty = $ref(false)
watch($$(data), () => {
  disabledTotal = false
  inputDirty = true
})
const rowsSegmented = $computed(() =>
  seg === 'new' ? data.filter((r) => !r.vocab.acquainted && r.vocab.w.length > 2)
    : seg === 'acquainted' ? data.filter((r) => Boolean(r.vocab.acquainted || r.vocab.w.length <= 2))
      : data,
)
const searched = $computed(() => {
  const searching = search.trim().toLowerCase()
  if (!searching) {
    return rowsSegmented
  } else {
    return rowsSegmented.filter((r) => r.vocab.wFamily.some((w) => w.toLowerCase().includes(searching)))
  }
})
const rows = $(watched(computed(() => pipe(searched,
  orderBy(sortBy.prop, sortBy.order),
  paging(currPage, pageSize),
)), (v) => {
  if (inputDirty) {
    rowsDisplay = v
    inputDirty = false
  } else if (!isHovered) {
    rowsDisplay = v
  } else {
    dirty = true
  }
}, { immediate: true }))
const totalTransit = $(useTransition(computed(() => searched.length), {
  disabled: $$(disabledTotal),
  transition: TransitionPresets.easeOutCirc,
}))

function expandRow(row: RowDisplay, col: unknown, event: Event) {
  for (const el of event.composedPath()) {
    if ((el as HTMLElement).tagName.toLowerCase() === 'button') {
      return
    }

    if (el === event.currentTarget) {
      break
    }
  }
  vocabTable.value?.toggleRowExpansion(row)
}
</script>

<template>
  <div class="mx-5 flex h-full flex-col items-center overflow-hidden rounded-xl border border-inherit bg-white shadow-sm will-change-transform md:mx-0">
    <SegmentedControl
      :name="tableName"
      :segments="segments"
      :value="seg"
      class="w-full grow-0"
      :onChoose="setSeg"
    />
    <div class="h-px w-full grow">
      <ElTable
        ref="vocabTable"
        :data="rowsDisplay"
        :row-key="(row:MyVocabRow)=>row.vocab.w"
        class="!h-full from-[var(--el-border-color-lighter)] to-white [&_*]:overscroll-contain [&_th_.cell]:font-compact [&_.el-table\_\_inner-wrapper]:!h-full [&_.el-table\_\_row:has(+tr:not([class]))>td]:!border-white [&_.el-table\_\_row:has(+tr:not([class]))>td]:bg-gradient-to-b [&_.el-table\_\_expand-icon]:tap-transparent [&_.el-icon]:pointer-events-none"
        size="small"
        :row-class-name="()=>`${expand?'cursor-pointer':''}`"
        v-on="expand ? { 'row-click': expandRow } : {}"
        @sort-change="setSortBy"
      >
        <ElTableColumn
          v-if="expand"
          v-slot="{row}"
          type="expand"
          width="30"
          class-name="[&_i]:text-slate-500 [&>.cell]:!p-0 [&_.el-table\_\_expand-icon]:float-right"
        >
          <Examples
            :sentences="sentences"
            :src="row.src"
            class="tracking-wide"
          />
        </ElTableColumn>
        <ElTableColumn
          v-slot="{row}"
          :label="t('frequency')"
          class-name="!text-right [&>.cell]:stretch-[condensed] [&>.cell]:!font-pro [th&>.cell]:!p-0"
          :width="`${expand?58:68}`"
          prop="src.length"
          sortable="custom"
        >
          <div class="tabular-nums text-slate-400">
            {{ row.src.length }}
          </div>
        </ElTableColumn>
        <ElTableColumn
          label="Vocabulary"
          prop="vocab.w"
          min-width="16"
          sortable="custom"
          class-name="select-none [td&>.cell]:!pr-0"
        >
          <template #header>
            <ElInput
              v-model="search"
              class="!w-[calc(100%-26px)] !text-base md:!text-xs"
              size="small"
              :placeholder="t('search')"
              @click.stop
            />
          </template>
          <template #default="{row}">
            <span
              v-for="(w,i) in row.vocab.wFamily"
              :key="w"
              class="cursor-text select-text font-compact text-[16px] tracking-wide text-black"
              @click.stop
            >
              <span
                :class="`${i!==0? 'text-neutral-500':''}`"
                v-on="isMobile ? {} : { mouseover: selectWord }"
              >{{ w }}</span>
              <span
                v-if="i!==row.vocab.wFamily.length-1"
                class="text-neutral-300"
              >, </span>
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          v-slot="{row}"
          :label="t('length')"
          prop="vocab.w.length"
          width="62"
          sortable="custom"
          class-name="[th&>.cell]:stretch-[condensed] [th&>.cell]:!font-pro !text-right [th&>.cell]:!p-0"
        >
          <div class="tabular-nums">
            {{ row.vocab.w.length }}
          </div>
        </ElTableColumn>
        <ElTableColumn
          v-slot="{row}"
          width="40"
          class-name="overflow-visible !text-center"
        >
          <ToggleButton
            :row="row.vocab"
            :handleVocabToggle="handleVocabToggle"
          />
        </ElTableColumn>
        <ElTableColumn
          v-slot="{row}"
          :label="t('rank')"
          class-name="[&>.cell]:stretch-[condensed] [&>.cell]:!font-pro !text-center [th&>.cell]:!p-0"
          width="52"
          prop="vocab.rank"
          sortable="custom"
        >
          <div class="tabular-nums">
            {{ row.vocab.rank }}
          </div>
        </ElTableColumn>
      </ElTable>
    </div>
    <div class="min-h-9 w-full">
      <ElPagination
        v-model:currentPage="currPage"
        v-model:page-size="pageSize"
        :page-sizes="[25, 100, 200, 500, 1000, Infinity]"
        :pager-count="5"
        small
        :total="~~totalTransit"
        class="shrink-0 select-none flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.is-active]:bg-neutral-100 [&_.el-pagination\_\_sizes.is-last]:!m-0 [&_.el-pagination\_\_total]:mx-[10px]"
        layout="prev, pager, next, ->, total, sizes"
      />
    </div>
  </div>
</template>
