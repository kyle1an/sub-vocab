<script lang="tsx" setup>
import { Check } from '@element-plus/icons-vue'
import { computed, nextTick, PropType, ref, shallowRef, watch } from 'vue'
import { LabelRow, Sorting } from '../types'
import { classKeyOfRow, compare, removeClass, selectWord } from '../utils/utils'
import { acquaint, revokeWord } from '../api/vocab-service'
import { useVocabStore } from '../store/useVocab'
import { useUserStore } from '../store/useState'
import { ElNotification } from 'element-plus'
import router from '../router'
import { TransitionPresets, useTransition } from '@vueuse/core'
import Examples from '../components/Examples'
import { useI18n } from 'vue-i18n'
import SegmentedControl from '../components/SegmentedControl.vue'
import { ElTable } from 'element-plus'

const { t } = useI18n()
const userStore = useUserStore()
const props = defineProps({
  'data': { type: Array as PropType<LabelRow[]>, default: () => [''] },
  'sentences': { type: Array as PropType<string[]>, default: () => [''] },
})

const tableDataOfVocab = shallowRef<LabelRow[]>(props.data)
watch(() => props.data, () => {
  removeClass('expanded')
  onSegmentSwitched(selectedSeg.value)
})
const vocabTable = shallowRef<typeof ElTable>()
let sortBy: Sorting<LabelRow> = { order: null, prop: null, }
const vocabStore = useVocabStore()
const selectedSeg = ref(Number(sessionStorage.getItem('prev-segment-select')) || 0)

function onSegmentSwitched(v: number) {
  disabledTotal.value = true
  selectedSeg.value = v
  sessionStorage.setItem('prev-segment-select', String(v))
  if (v === 0) {
    tableDataOfVocab.value = [...props.data]
  } else if (v === 1) {
    tableDataOfVocab.value = [...props.data].filter((r) => !r.F && r.len > 2)
  } else if (v === 2) {
    tableDataOfVocab.value = [...props.data].filter((r) => r.F || r.len <= 2)
  }

  sortChange(sortBy)
  nextTick().then(() => disabledTotal.value = false)
}

const search = ref('')
const tableDataFiltered = computed(() => {
    if (search.value) {
      return tableDataOfVocab.value.filter((row: LabelRow) => row.w.toLowerCase().includes(search.value.toLowerCase()))
    } else {
      return tableDataOfVocab.value
    }
  }
)
const currentPage = ref(1)
const pageSizes = [100, 200, 500, 1000, Infinity]
const pageSize = ref(pageSizes[0])
const tableDataDisplay = computed(() =>
  tableDataFiltered.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
)
const loadingStateArray = ref<boolean[]>([])

async function toggleWordState(row: LabelRow) {
  loadingStateArray.value[row.seq] = true

  if (userStore.user.name) {
    const word = row.w.replace(/'/g, '\'\'')
    row.vocab ??= { w: row.w, is_user: true, acquainted: false }
    const vocabInfo = {
      word,
      user: userStore.user.name,
    }
    const acquainted = row?.vocab?.acquainted
    const res = await (acquainted ? revokeWord : acquaint)(vocabInfo)

    if (res?.affectedRows) {
      row.F = row.vocab.acquainted = !acquainted
      vocabStore.updateWord(row)
    }
  } else {
    ElNotification({
      message: (
        <span style={{ color: 'teal' }}>
          {t('please')}
          {' '}<i onClick={() => router.push('/login')}>{t('login')}</i>{' '}
          {t('to mark words')}
        </span>
      )
    })
  }

  loadingStateArray.value[row.seq] = false
}

function sortChange({ prop, order }: Sorting<LabelRow>) {
  sortBy = { prop, order }
  if (prop && order) {
    tableDataOfVocab.value = [...tableDataOfVocab.value].sort(compare(prop, order))
  }
}

const total = computed(() => tableDataFiltered.value.length)
const disabledTotal = ref(false)
const totalTransit = useTransition(total, {
  disabled: disabledTotal,
  transition: TransitionPresets.easeOutCirc,
})

function handleRowClick(row: LabelRow) {
  vocabTable.value?.toggleRowExpansion(row)
}

function onExpandChange(row: LabelRow) {
  document.getElementsByClassName(classKeyOfRow(row.seq))[0].classList.toggle('expanded')
}

const segments = computed(() => [t('all'), t('new'), t('acquainted')])
</script>

<template>
  <segmented-control
    name="vocab-seg"
    :segments="segments"
    :default="selectedSeg"
    class="grow-0"
    @input="onSegmentSwitched"
  />
  <div class="h-full w-full">
    <!-- 100% height of its container minus height of siblings -->
    <div class="h-[calc(100%-1px)]">
      <el-table
        ref="vocabTable"
        class="w-table !h-full !w-full md:w-full"
        height="200"
        size="small"
        fit
        :row-class-name="({row})=> classKeyOfRow(row.seq)"
        :data="tableDataDisplay"
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
              @mouseover="selectWord"
              @touchstart.passive="selectWord"
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
          align="right"
          min-width="5"
        >
          <template #default="{row}">
            <div class="text-center">
              <el-button
                size="small"
                type="primary"
                :icon="Check"
                :plain="!row?.vocab?.acquainted"
                :loading="loadingStateArray[row.seq]"
                :disabled="row?.vocab && !row?.vocab?.is_user"
                :text="!row?.vocab?.acquainted"
                @click.stop="toggleWordState(row)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <el-pagination
    v-model:currentPage="currentPage"
    v-model:page-size="pageSize"
    :page-sizes="pageSizes"
    :small="true"
    :background="true"
    :pager-count="5"
    layout="prev, pager, next, ->, total, sizes"
    :total="~~totalTransit"
    class="pager-section shrink-0 flex-wrap gap-y-1.5 !px-2 !pt-1 !pb-1.5 tabular-nums"
  />
</template>

<style lang="scss" scoped>
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
    height: 100%;
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
