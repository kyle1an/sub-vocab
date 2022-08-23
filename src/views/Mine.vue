<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, nextTick, onBeforeMount, reactive, ref, shallowRef } from 'vue'
import { TransitionPresets, useTransition } from '@vueuse/core'
import { ElInput, ElPagination, ElTable, ElTableColumn } from 'element-plus'
import SegmentedControl from '@/components/SegmentedControl.vue'
import { compare, selectWord, sortByDateISO } from '@/utils/utils'
import { useVocabStore } from '@/store/useVocab'
import { Sieve, Sorting } from '@/types'
import DateTime from '@/components/DateTime'
import ToggleButton from '@/components/ToggleButton.vue'

const { t } = useI18n()
const vocabStore = useVocabStore()
const rows = shallowRef<Sieve[]>([])
onBeforeMount(async () => {
  rows.value = (await vocabStore.getBaseVocab()).map((word) => {
    word.len = word.w.length
    return word
  }).sort(sortByTimeModified)

  await vocabStore.getPreBuiltTrie()
})

function sortByTimeModified(a: Sieve, b: Sieve) {
  const aDate = a.time_modified || ''
  const bDate = b.time_modified || ''
  return sortByDateISO(bDate, aDate)
}

function onSegmentSwitched(seg: number) {
  disabledTotal.value = true
  selectedSeg.value = seg
  sessionStorage.setItem('prev-segment-mine', String(seg))
  nextTick().then(() => disabledTotal.value = false)
}

const selectedSeg = ref(+(sessionStorage.getItem('prev-segment-mine') || 0))
const rowsSegmented = computed(() => {
  const source = rows.value

  switch (selectedSeg.value) {
    case 1:
      return source.filter((row) => row.acquainted && row.is_user)
    case 2:
      return source.filter((row) => row.acquainted && !row.is_user)
    case 3:
      return source.filter((row) => !row.acquainted && row.is_user !== 2)
    default:
      return source.filter((row) => row.acquainted)
  }
})

const search = ref('')
const rowsSearched = computed(() => {
  if (!search.value) {
    return rowsSegmented.value
  }

  return rowsSegmented.value.filter((r: Sieve) => r.w.toLowerCase().includes(search.value.toLowerCase()))
})

const sortChange = (p: Sorting<Sieve>) => sortBy.value = p
const sortBy = shallowRef<Sorting<Sieve>>({ order: null, prop: null, })
const page = reactive({
  curr: 1,
  sizes: [100, 200, 500, 1000, Infinity],
  size: 100,
})
const rowsDisplay = computed(() => {
  const { prop, order } = sortBy.value
  let rowsSorted = rowsSearched.value

  if (prop && order) {
    rowsSorted = [...rowsSorted].sort(compare(prop, order))
  }

  return rowsSorted.slice((page.curr - 1) * page.size, page.curr * page.size)
})

const total = computed(() => rowsSearched.value.length)
const disabledTotal = ref(false)
const totalTransit = useTransition(total, {
  disabled: disabledTotal,
  transition: TransitionPresets.easeOutCirc,
})

const segments = computed(() => [t('all'), t('mine'), t('top'), t('recent')])
</script>

<template>
  <div class="w-full max-w-screen-xl pb-5 md:pb-0">
    <div class="relative flex h-10 items-center" />
    <div class="m-auto h-full max-w-2xl overflow-visible">
      <div class="mx-5 flex h-[calc(100vh-200px)] flex-col overflow-hidden rounded-xl border border-inherit bg-white shadow-lg will-change-transform md:mx-0 md:h-[calc(100vh-150px)]">
        <segmented-control
          :default="selectedSeg"
          :segments="segments"
          class="w-full grow-0 pt-3 pb-2"
          name="segment-mine"
          @input="onSegmentSwitched"
        />
        <div class="h-px w-full grow">
          <el-table
            :data="rowsDisplay"
            class="!h-full !w-full md:w-full [&_th_.cell]:font-compact [&_th_.cell]:tracking-normal [&_*]:overscroll-contain [&_.el-table\_\_inner-wrapper]:!h-full"
            fit
            height="200"
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
              label="Vocabulary"
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
                >{{ row.w }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="t('length')"
              class-name="cursor-pointer !text-right [th&>.cell]:!p-0"
              width="67"
              prop="len"
              sortable="custom"
            >
              <template #default="{row}">
                <div class="select-none tabular-nums">
                  {{ row.len }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              width="32"
              class-name="overflow-visible !text-center [&_.cell]:!px-0"
            >
              <template #default="{row}">
                <toggle-button :row="{w:row.w, vocab:row}" />
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
                <div class="select-none font-compact tabular-nums tracking-normal ffs-normal">
                  <date-time :time="row?.time_modified" />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination
          v-model:currentPage="page.curr"
          v-model:page-size="page.size"
          :page-sizes="page.sizes"
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
