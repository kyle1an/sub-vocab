<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { TransitionPresets, useSessionStorage, useTransition } from '@vueuse/core'
import { ElInput, ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { pipe } from 'fp-ts/function'
import { formatDistanceToNowStrict } from 'date-fns'
import { t } from '@/i18n'
import SegmentedControl from '@/components/SegmentedControl.vue'
import { isMobile, orderBy, paging, selectWord } from '@/utils/utils'
import type { MyVocabRow, Sorting } from '@/types'
import { ToggleButton } from '@/components/vocabulary/ToggleButton'
import { useElHover, useStateCallback, watched } from '@/composables/utilities'
import { handleVocabToggle } from '@/utils/vocab'
import { useVocabStore } from '@/store/useVocab'

const {
  tableName,
} = defineProps<{
  tableName: string,
}>()
const { baseVocab } = $(useVocabStore())
const segments = $computed(() => [
  { value: 'all', label: t('all') },
  { value: 'mine', label: t('mine') },
  { value: 'top', label: t('top') },
  { value: 'recent', label: t('recent') },
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
  if (!dirty) return
  if (!isHovered || rowsDisplay.length === 0) {
    rowsDisplay = rows
    dirty = false
  }
}))
const search = $ref('')
const defaultSort: Sorting = { order: 'descending', prop: 'vocab.time_modified' }
let sortBy = $ref(defaultSort)
const setSortBy = ({ order, prop }: Sorting) => sortBy = order && prop ? { order, prop } : defaultSort
const currPage = $ref(1)
const pageSize = $ref(100)
watch($$(currPage), () => {
  vocabTable.value.setScrollTop(0)
})
let rowsDisplay = $shallowRef<MyVocabRow[]>([])
let disabledTotal = $ref(true)
const srcRows = $computed(() => {
  disabledTotal = false
  return baseVocab.map((r) => ({ vocab: r }))
})
const rowsSegmented = $computed(() => srcRows.filter(
  seg === 'mine' ? (r) => Boolean(r.vocab.acquainted && r.vocab.is_user)
    : seg === 'top' ? (r) => Boolean(r.vocab.acquainted && !r.vocab.is_user)
      : seg === 'recent' ? (r) => !r.vocab.acquainted && r.vocab.is_user !== 2
        : (r) => !!r.vocab.acquainted
))
const searched = $computed(() => {
  const searching = search.trim().toLowerCase()
  if (!searching) {
    return rowsSegmented
  } else {
    return rowsSegmented.filter((r) => r.vocab.w.toLowerCase().includes(searching))
  }
})
const rows = $(watched(computed(() => pipe(searched,
  orderBy(sortBy.prop, sortBy.order),
  paging(currPage, pageSize),
)), (v) => {
  if (!isHovered || rowsDisplay.length === 0) {
    rowsDisplay = v
  } else {
    dirty = true
  }
}, { immediate: true }))
const totalTransit = $(useTransition(computed(() => searched.length), {
  disabled: $$(disabledTotal),
  transition: TransitionPresets.easeOutCirc,
}))
</script>

<template>
  <div class="flex grow flex-col overflow-hidden rounded-xl border bg-white shadow will-change-transform md:mx-0">
    <SegmentedControl
      :name="tableName"
      :segments="segments"
      :value="seg"
      class="pt-3 pb-2"
      :onChoose="setSeg"
    />
    <div class="h-px w-full grow">
      <ElTable
        ref="vocabTable"
        :data="rowsDisplay"
        :row-key="(row:MyVocabRow)=>'_'+row.vocab.w"
        class="!h-full !w-full md:w-full [&_*]:overscroll-contain [&_th_.cell]:font-compact [&_th_.cell]:tracking-normal [&_.el-table\_\_inner-wrapper]:!h-full"
        size="small"
        @sort-change="setSortBy"
      >
        <ElTableColumn
          v-slot="{row}"
          :label="t('rank')"
          class-name="!text-center [&>.cell]:stretch-[condensed] [&>.cell]:!font-pro [th&>.cell]:!pr-0"
          width="64"
          prop="vocab.rank"
          sortable="custom"
        >
          <div class="tabular-nums text-neutral-500">
            {{ row.vocab.rank }}
          </div>
        </ElTableColumn>
        <ElTableColumn
          :label="t('Vocabulary')"
          prop="vocab.w"
          min-width="70"
          sortable="custom"
          class-name="select-none [&>.cell]:!pr-0"
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
              class="cursor-text select-text text-[16px] tracking-wide text-neutral-800"
              v-on="isMobile ? {} : { mouseover: selectWord }"
              @click.stop
            >
              {{ row.vocab.w }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          v-slot="{row}"
          :label="t('length')"
          prop="vocab.w.length"
          width="62"
          sortable="custom"
          class-name="!text-right [th&>.cell]:stretch-[condensed] [th&>.cell]:!font-pro [th&>.cell]:!p-0"
        >
          <div class="tabular-nums">
            {{ row.vocab.w.length }}
          </div>
        </ElTableColumn>
        <ElTableColumn
          v-slot="{row}"
          width="32"
          class-name="overflow-visible !text-center [&_.cell]:!px-0"
        >
          <ToggleButton
            :row="row.vocab"
            :handleVocabToggle="handleVocabToggle"
          />
        </ElTableColumn>
        <ElTableColumn
          v-slot="{row}"
          :label="t('distance')"
          class-name="[th&>.cell]:stretch-[condensed] [th&>.cell]:!font-pro [td&_.cell]:!pr-0"
          width="82"
          prop="vocab.time_modified"
          sortable="custom"
        >
          <div
            v-if="row.vocab.time_modified"
            class="flex flex-row gap-0.5 font-compact tabular-nums tracking-normal text-neutral-900 ffs-[normal]"
          >
            {{ formatDistanceToNowStrict(new Date(row.vocab.time_modified)) }}
          </div>
        </ElTableColumn>
      </ElTable>
    </div>
    <div class="min-h-9 w-full">
      <ElPagination
        v-model:currentPage="currPage"
        v-model:page-size="pageSize"
        :page-sizes="[100, 200, 500, 1000, Infinity]"
        :pager-count="5"
        small
        :total="~~totalTransit"
        class="shrink-0 select-none flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.is-active]:bg-neutral-100 [&_.el-pagination\_\_sizes.is-last]:!m-0 [&_.el-pagination\_\_total]:mx-[10px]"
        layout="prev, pager, next, ->, total, sizes"
      />
    </div>
  </div>
</template>
