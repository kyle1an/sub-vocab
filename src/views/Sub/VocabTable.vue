<script lang="ts" setup>
import { computed, nextTick, reactive, ref, shallowRef, watch } from 'vue'
import { TransitionPresets, useTransition } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { ElInput, ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { LabelRow, Sorting } from '@/types'
import { compare, isMobile, removeClass, selectWord } from '@/utils/utils'
import Examples from '@/components/Examples'
import SegmentedControl from '@/components/SegmentedControl.vue'
import ToggleButton from '@/components/ToggleButton.vue'

const { t } = useI18n()
const props = withDefaults(defineProps<{
  data: LabelRow[],
  sentences: string[]
}>(), {
  data: () => [],
  sentences: () => ['']
})

function onSegmentSwitched(seg: number) {
  disabledTotal.value = true
  selectedSeg.value = seg
  sessionStorage.setItem('prev-segment-select', String(seg))
  nextTick().then(() => disabledTotal.value = false)
}

const selectedSeg = ref(+(sessionStorage.getItem('prev-segment-select') || 0))
const rowsSegmented = computed(() => {
  switch (selectedSeg.value) {
    case 1:
      return props.data.filter((r) => !r.vocab.acquainted && r.vocab.w.length > 2)
    case 2:
      return props.data.filter((r) => r.vocab.acquainted || r.vocab.w.length <= 2)
    default:
      return [...props.data]
  }
})

const search = ref('')
const rowsSearched = computed(() => {
  if (!search.value) {
    return rowsSegmented.value
  }

  return rowsSegmented.value.filter((r: LabelRow) => r.vocab.w.toLowerCase().includes(search.value.toLowerCase()))
})

const sortChange = (p: Sorting<LabelRow>) => sortBy.value = p
const sortBy = shallowRef<Sorting<LabelRow>>({ order: null, prop: null, })
const page = reactive({
  curr: 1,
  sizes: [25, 100, 200, 500, 1000, Infinity],
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

const vocabTable = shallowRef<typeof ElTable>()

function handleRowClick(row: LabelRow) {
  vocabTable.value?.toggleRowExpansion(row)
}

watch(rowsDisplay, () => {
  removeClass('xpd')
})

function handleExpand(row: LabelRow) {
  document.getElementsByClassName(`v-${row.src[0][3]}`)[0].classList.toggle('xpd')
}

const segments = computed(() => [t('all'), t('new'), t('acquainted')])
</script>

<template>
  <div class="mx-5 flex h-full flex-col items-center overflow-hidden rounded-xl border border-inherit bg-white shadow-sm will-change-transform md:mx-0">
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
          prop="src.length"
          width="62"
          sortable="custom"
          class-name="cursor-pointer [th&>.cell]:!p-0"
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
      v-model:currentPage="page.curr"
      v-model:page-size="page.size"
      :page-sizes="page.sizes"
      :small="true"
      :pager-count="5"
      layout="prev, pager, next, ->, total, sizes"
      :total="~~totalTransit"
      class="w-full shrink-0 flex-wrap gap-y-1.5 !p-1.5 tabular-nums [&_*]:!rounded-md [&_.is-active]:bg-neutral-100 [&_.el-pagination\_\_sizes.is-last]:!m-0 [&_.el-pagination\_\_total]:mx-[10px]"
    />
  </div>
</template>
