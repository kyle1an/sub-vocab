<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, nextTick, shallowRef, watch } from 'vue'
import { TransitionPresets, until } from '@vueuse/core'
import { ElInput, ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { pipe } from 'fp-ts/function'
import { filter } from 'fp-ts/Array'
import SegmentedControl from '@/components/SegmentedControl.vue'
import { orderBy, paging, selectWord, sortByDateISO } from '@/utils/utils'
import { useVocabStore } from '@/store/useVocab'
import { MyVocabRow, Sieve, Sorting } from '@/types'
import DateTime from '@/components/DateTime'
import ToggleButton from '@/components/ToggleButton.vue'
import { useDebounceTransition } from '@/composables/useDebounce'
import { useElHover, useStateCallback, watched } from '@/composables/utilities'
import { find } from '@/utils/vocab'

const { t } = useI18n()
const { inUpdating, baseVocab } = $(useVocabStore())
type MyVocabSegment = typeof segments[number]['value']
const [seg, setSeg] = $(useStateCallback<MyVocabSegment>(sessionStorage.getItem('prev-segment-mine') as MyVocabSegment | null || 'all', (v) => {
  disabledTotal = true
  sessionStorage.setItem('prev-segment-mine', String(v))
  requestAnimationFrame(() => nextTick().then(() => disabledTotal = false))
}))
let dirty = $ref(false)
const isHovered = $(watched(useElHover('.el-table__body-wrapper'), (isHovered) => {
  if ((isHovered && rowsDisplay.value.length !== 0) || !dirty || inUpdating) return
  rowsDisplay.value = rows
}))
const search = $ref('')
let sortBy = $ref<Sorting<Sieve>>({ order: 'descending', prop: 'vocab.time_modified' })
const setSortBy = (sort: Sorting<Sieve>) => {
  sortBy = sort.order === null ? { order: 'descending', prop: 'vocab.time_modified' } : sort
}
const currPage = $ref(1)
const pageSize = $ref(100)
let rowsDisplay = watched(shallowRef<MyVocabRow[]>([]), () => dirty = false)
let total = $ref(0)
let disabledTotal = $ref(false)
const { output: totalTransit, inTransition } = $(useDebounceTransition($$(total), {
  disabled: $$(disabledTotal),
  transition: TransitionPresets.easeOutCirc,
}))
const rowsSearched = $(watched(computed(() => pipe(
  [...baseVocab].sort((a, b) => sortByDateISO(b.time_modified || '', a.time_modified || '')).map((r) => ({ vocab: r })),
  seg === 'mine' ? filter((r) => Boolean(r.vocab.acquainted && r.vocab.is_user)) :
    seg === 'top' ? filter((r) => Boolean(r.vocab.acquainted && !r.vocab.is_user)) :
      seg === 'recent' ? filter((r) => !r.vocab.acquainted && r.vocab.is_user !== 2) : filter((r) => !!r.vocab.acquainted),
  find(search),
)), (newSearched) => until($$(inTransition)).toBe(false).then(() => total = newSearched.length), { immediate: true }))
const rows = $computed(() => pipe(rowsSearched,
  orderBy(sortBy.prop, sortBy.order),
  paging(currPage, pageSize),
))
watch([$$(inUpdating), $$(rows)], () => {
  dirty = true
  if (inUpdating || (isHovered && rowsDisplay.value.length !== 0)) return
  rowsDisplay.value = rows
}, { immediate: true })
const segments = $computed(() => [
  { value: 'all', label: t('all') },
  { value: 'mine', label: t('mine') },
  { value: 'top', label: t('top') },
  { value: 'recent', label: t('recent') },
] as const)
</script>

<template>
  <div class="h-[calc(100vh-160px)] w-full md:h-full md:pb-0">
    <div class="m-auto h-full max-w-full overflow-visible">
      <div class="flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow will-change-transform md:mx-0">
        <segmented-control
          :value="seg"
          :segments="segments"
          class="w-full grow-0 pt-3 pb-2"
          name="segment-mine"
          :onChoose="setSeg"
        />
        <div class="h-px w-full grow">
          <el-table
            :data="rowsDisplay"
            class="!h-full !w-full md:w-full [&_th_.cell]:font-compact [&_th_.cell]:tracking-normal [&_*]:overscroll-contain [&_.el-table\_\_inner-wrapper]:!h-full"
            size="small"
            @sort-change="setSortBy"
          >
            <el-table-column
              :label="t('rank')"
              class-name="cursor-pointer !text-center [th&>.cell]:!pr-0"
              width="64"
              prop="vocab.rank"
              sortable="custom"
            >
              <template #default="{row}">
                <div class="select-none tabular-nums text-neutral-500">
                  {{ row.vocab.rank }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              class-name="cursor-pointer [&>.cell]:!pr-0"
              :label="t('Vocabulary')"
              min-width="70"
              prop="vocab.w"
              sortable="custom"
            >
              <template #header>
                <el-input
                  v-model="search"
                  :placeholder="t('search')"
                  class="!w-[calc(100%-26px)] !text-base md:!text-xs"
                  size="small"
                  @click.stop
                />
              </template>
              <template #default="{row}">
                <span
                  class="cursor-text text-[16px] tracking-wide text-neutral-800"
                  @mouseover="selectWord"
                  @touchstart.passive="selectWord"
                  @click.stop
                >
                  {{ row.vocab.w }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="t('length')"
              class-name="cursor-pointer !text-right [th&>.cell]:!p-0"
              width="67"
              prop="vocab.w.length"
              sortable="custom"
            >
              <template #default="{row}">
                <div class="select-none tabular-nums">
                  {{ row.vocab.w.length }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              width="32"
              class-name="overflow-visible !text-center [&_.cell]:!px-0"
            >
              <template #default="{row}">
                <toggle-button :row="row.vocab" />
              </template>
            </el-table-column>
            <el-table-column
              :label="t('distance')"
              class-name="cursor-pointer [td&_.cell]:!pr-0"
              width="82"
              prop="vocab.time_modified"
              sortable="custom"
            >
              <template #default="{row}">
                <div class="select-none font-compact tabular-nums tracking-normal ffs-[normal]">
                  <date-time :time="row.vocab.time_modified" />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination
          v-model:currentPage="currPage"
          v-model:page-size="pageSize"
          :page-sizes="[100, 200, 500, 1000, Infinity]"
          :pager-count="5"
          :small="true"
          :total="~~totalTransit"
          class="w-full shrink-0 flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.is-active]:bg-neutral-100 [&_.el-pagination\_\_sizes.is-last]:!m-0 [&_.el-pagination\_\_total]:mx-[10px]"
          layout="prev, pager, next, ->, total, sizes"
        />
      </div>
    </div>
  </div>
</template>
