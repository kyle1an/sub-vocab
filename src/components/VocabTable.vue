<script lang="tsx" setup>
import { PropType, computed, nextTick, reactive, ref, shallowRef, watch } from 'vue'
import { TransitionPresets, useTransition } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { ElTable } from 'element-plus'
import { LabelRow, Sorting } from '../types'
import { classKeyOfRow, compare, isMobile, removeClass, selectWord } from '../utils/utils'
import Examples from '../components/Examples'
import SegmentedControl from '../components/SegmentedControl.vue'
import ToggleButton from './ToggleButton.vue'

const { t } = useI18n()
const props = defineProps({
  'data': { type: Array as PropType<LabelRow[]>, default: () => [''] },
  'sentences': { type: Array as PropType<string[]>, default: () => [''] },
})

watch(() => props.data, () => {
  removeClass('expanded')
})

function onSegmentSwitched(seg: number) {
  disabledTotal.value = true
  selectedSeg.value = seg
  sessionStorage.setItem('prev-segment-select', String(seg))
  nextTick().then(() => disabledTotal.value = false)
}

const selectedSeg = ref(+(sessionStorage.getItem('prev-segment-select') || 0))
const rowsSegmented = computed(() => {
  if (selectedSeg.value === 1) {
    return props.data.filter((r) => !r?.vocab?.acquainted && r.len > 2)
  }

  if (selectedSeg.value === 2) {
    return props.data.filter((r) => r?.vocab?.acquainted || r.len <= 2)
  }

  return [...props.data]
})

const search = ref('')
const rowsSearched = computed(() => {
  if (!search.value) {
    return rowsSegmented.value
  }

  return rowsSegmented.value.filter((r: LabelRow) => r.w.toLowerCase().includes(search.value.toLowerCase()))
})

function sortChange({ prop, order }: Sorting<LabelRow>) {
  sortBy.value = { prop, order }
}

const sortBy = shallowRef<Sorting<LabelRow>>({ order: null, prop: null, })
const rowsSorted = computed(() => {
  const { prop, order } = sortBy.value
  if (prop && order) {
    return [...rowsSearched.value].sort(compare(prop, order))
  }

  return rowsSearched.value
})

const page = reactive({
  curr: 1,
  sizes: [25, 100, 200, 500, 1000, Infinity],
  size: 100,
})
const rowsPaged = computed(() => rowsSorted.value.slice((page.curr - 1) * page.size, page.curr * page.size))

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

function onExpandChange(r: LabelRow) {
  document.getElementsByClassName(classKeyOfRow(r.seq))[0].classList.toggle('expanded')
}

const segments = computed(() => [t('all'), t('new'), t('acquainted')])
</script>

<template>
  <el-card class="table-card mx-5 flex h-full flex-col items-center !rounded-xl !border-0 will-change-transform md:mx-0">
    <segmented-control
      name="vocab-seg"
      :segments="segments"
      :default="selectedSeg"
      class="grow-0"
      @input="onSegmentSwitched"
    />
    <div class="h-px grow">
      <el-table
        ref="vocabTable"
        class="w-table !h-full !w-full md:w-full"
        height="200"
        size="small"
        fit
        :row-class-name="({row})=> classKeyOfRow(row.seq)"
        :data="rowsPaged"
        @row-click="handleRowClick"
        @expand-change="onExpandChange"
        @sort-change="sortChange"
      >
        <el-table-column type="expand">
          <template #default="{row}">
            <Examples
              :sentences="props.sentences"
              :src="row.src"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="Vocabulary"
          prop="w"
          align="left"
          min-width="16"
          sortable="custom"
          class-name="cursor-pointer"
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
              class="cursor-text font-compact text-[16px] tracking-wide"
              v-on="isMobile ? {} : { mouseover: selectWord }"
              @click.stop
            >{{ row.w }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('frequency')"
          prop="freq"
          align="right"
          min-width="9"
          sortable="custom"
          class-name="cursor-pointer tabular-nums"
        >
          <template #default="{row}">
            <div class="select-none text-right font-compact">
              {{ row.freq }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('length')"
          prop="len"
          align="right"
          min-width="10"
          sortable="custom"
          class-name="cursor-pointer tabular-nums"
        >
          <template #default="{row}">
            <div class="select-none font-compact">
              {{ row.len }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          min-width="5"
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
      class="shrink-0 flex-wrap gap-y-1.5 !px-2 !pt-1 !pb-1.5 tabular-nums"
    />
  </el-card>
</template>

<style lang="scss" scoped>
.table-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0;
}

:deep(.el-pagination__rightwrapper) {
  .el-pagination__sizes.is-last {
    margin: 0 !important;
  }

  .el-pagination__total {
    margin-left: 10px !important;
    margin-right: 10px !important;
  }
}

:deep(.is-text) {
  border: 1px solid transparent !important;

  &:hover {
    background-color: var(--el-color-primary-light-9) !important;
    border-color: var(--el-color-primary-light-5) !important;
  }
}

:deep(thead .is-right:not(:last-child) .cell) {
  padding: 0;
}

.w-table {
  :deep(tr :last-child) {
    overflow: visible !important;
  }

  :deep(.el-icon) {
    pointer-events: none;
  }

  :deep(:is(*, .el-table__body-wrapper)) {
    overscroll-behavior: contain !important;
  }

  :deep(.el-table__inner-wrapper) {
    height: 100% !important;
  }

  :deep(.el-table__expand-icon) {
    -webkit-tap-highlight-color: transparent;
  }
}

:deep(.expanded) {
  &:hover > td {
    background-image: linear-gradient(to bottom, var(--el-border-color-lighter), white);
  }

  td {
    border-color: white !important;
  }
}
</style>
