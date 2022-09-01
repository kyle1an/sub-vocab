<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, nextTick, ref, watch } from 'vue'
import { TransitionPresets, until, useElementHover, whenever } from '@vueuse/core'
import { ElInput, ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { logicNot } from '@vueuse/math'
import SegmentedControl from '@/components/SegmentedControl.vue'
import { compare, selectWord, sortByDateISO, useRange } from '@/utils/utils'
import { useVocabStore } from '@/store/useVocab'
import { Sieve, Sorting } from '@/types'
import DateTime from '@/components/DateTime'
import ToggleButton from '@/components/ToggleButton.vue'
import { useDebounceRAF, useDebounceTransition } from '@/composables/useDebounce'

const { t } = useI18n()
const { inUpdating, baseVocab } = $(useVocabStore())
let rows = $shallowRef<Sieve[]>([])
watch($$(baseVocab), () => {
  rows = [...baseVocab]
    .sort((a, b) => sortByDateISO(b.time_modified || '', a.time_modified || ''))
}, { immediate: true })

function onSegmentSwitched(seg: number) {
  disabledTotal = true
  selectedSeg = seg
  sessionStorage.setItem('prev-segment-mine', String(seg))
  refreshTableData()
}

let selectedSeg = $ref(+(sessionStorage.getItem('prev-segment-mine') || 0))
let needRefresh = $ref(false)
const segCb = (id: number): (r: Sieve) => boolean =>
  id === 1 ? (r) => Boolean(r.acquainted && r.is_user) :
    id === 2 ? (r) => Boolean(r.acquainted && !r.is_user) :
      id === 3 ? (r) => Boolean(!r.acquainted && r.is_user !== 2) : (r) => !!r.acquainted

const myVocabTable = ref()
const isHovered = $(useElementHover(myVocabTable))
watch($$(inUpdating), () => {
  if (inUpdating) {
    needRefresh = true
  } else if (!isHovered) {
    refreshTableData()
    needRefresh = false
  }
})
whenever(logicNot($$(isHovered)), () => {
  if (needRefresh && !inUpdating) {
    refreshTableData()
  }
})
const search = $ref('')
const sortChange = (p: Sorting<Sieve>) => sortBy = p
let sortBy = $shallowRef<Sorting<Sieve>>({ order: null, prop: null, })
const currPage = $ref(1)
const pageSize = $ref(100)
let rowsDisplay = $shallowRef<Sieve[]>([])
const refreshTableData = useDebounceRAF(() => {
  const { prop, order } = sortBy
  const rowsSearched = rows
    .filter(segCb(selectedSeg))
    .filter(search ? (r) => r.w.toLowerCase().includes(search.toLowerCase()) : () => true)

  ;(async () => {
    await until($$(inTransition)).toBe(false)
    total = rowsSearched.length
  })()

  if (prop && order) {
    rowsSearched.sort(compare(prop, order))
  }

  rowsDisplay = rowsSearched.slice(...useRange(currPage, pageSize))
  requestAnimationFrame(() => nextTick().then(() => disabledTotal = false))
})
let total = $ref(0)
watch([$$(rows), $$(sortBy), $$(search), $$(currPage), $$(pageSize)], refreshTableData, { immediate: true })
let disabledTotal = $ref(false)
const { output: totalTransit, inTransition } = $(useDebounceTransition($$(total), {
  disabled: $$(disabledTotal),
  transition: TransitionPresets.easeOutCirc,
}))
const segments = computed(() => [t('all'), t('mine'), t('top'), t('recent')])
</script>

<template>
  <div class="h-[calc(100vh-160px)] w-full md:h-full md:pb-0">
    <div class="m-auto h-full max-w-full overflow-visible">
      <div class="flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow will-change-transform md:mx-0">
        <segmented-control
          :init="selectedSeg"
          :segments="segments"
          class="w-full grow-0 pt-3 pb-2"
          name="segment-mine"
          @input="onSegmentSwitched"
        />
        <div class="h-px w-full grow">
          <el-table
            ref="myVocabTable"
            :data="rowsDisplay"
            class="!h-full !w-full md:w-full [&_th_.cell]:font-compact [&_th_.cell]:tracking-normal [&_*]:overscroll-contain [&_.el-table\_\_inner-wrapper]:!h-full"
            size="small"
            @sort-change="sortChange"
          >
            <el-table-column
              :label="t('rank')"
              class-name="cursor-pointer !text-center [th&>.cell]:!pr-0"
              width="64"
              prop="rank"
              sortable="custom"
            >
              <template #default="{row}">
                <div class="select-none tabular-nums text-neutral-500">
                  {{ row.rank }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              class-name="cursor-pointer [&>.cell]:!pr-0"
              :label="t('Vocabulary')"
              min-width="70"
              prop="w"
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
                  {{ row.w }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="t('length')"
              class-name="cursor-pointer !text-right [th&>.cell]:!p-0"
              width="67"
              prop="w.length"
              sortable="custom"
            >
              <template #default="{row}">
                <div class="select-none tabular-nums">
                  {{ row.w.length }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              width="32"
              class-name="overflow-visible !text-center [&_.cell]:!px-0"
            >
              <template #default="{row}">
                <toggle-button :row="row" />
              </template>
            </el-table-column>
            <el-table-column
              :label="t('distance')"
              class-name="cursor-pointer [td&_.cell]:!pr-0"
              width="82"
              prop="time_modified"
              sortable="custom"
            >
              <template #default="{row}">
                <div class="select-none font-compact tabular-nums tracking-normal ffs-[normal]">
                  <date-time :time="row.time_modified" />
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
