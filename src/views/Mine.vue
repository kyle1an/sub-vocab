<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, nextTick, onBeforeMount, reactive, ref, shallowRef } from 'vue'
import { TransitionPresets, useTransition } from '@vueuse/core'
import Switch from '../components/Switch.vue'
import SegmentedControl from '../components/SegmentedControl.vue'
import { compare, selectWord } from '../utils/utils'
import { useVocabStore } from '../store/useVocab'
import { Sieve, Sorting } from '../types'

const { t } = useI18n()
const rows = shallowRef<Sieve[]>([])
const rowsAcquainted = computed(() => rows.value.filter((r) => r.acquainted))
onBeforeMount(async () => {
  rows.value = (await useVocabStore().getBaseVocab()).map((word) => {
    word.len = word.w.length
    return word
  }).reverse()
})

function onSegmentSwitched(seg: number) {
  disabledTotal.value = true
  selectedSeg.value = seg
  sessionStorage.setItem('prev-segment-mine', String(seg))
  nextTick().then(() => disabledTotal.value = false)
}

const selectedSeg = ref(+(sessionStorage.getItem('prev-segment-mine') || 0))
const rowsSegmented = computed(() => {
  const source = rowsAcquainted.value

  switch (selectedSeg.value) {
    case 1:
      return source.filter((row) => row.is_user)
    case 2:
      return source.filter((row) => !row.is_user)
    default:
      return [...source]
  }
})

const search = ref('')
const rowsSearched = computed(() => {
  const source = rowsSegmented.value

  if (!search.value) {
    return source
  }

  return source.filter((r: Sieve) => r.w.toLowerCase().includes(search.value.toLowerCase()))
})

function sortChange({ prop, order }: Sorting<Sieve>) {
  sortBy.value = { prop, order }
}

const sortBy = shallowRef<Sorting<Sieve>>({ order: null, prop: null, })
const rowsSorted = computed(() => {
  const source = rowsSearched.value
  const { prop, order } = sortBy.value

  if (prop && order) {
    return [...source].sort(compare(prop, order))
  }

  return source
})

const page = reactive({
  curr: 1,
  sizes: [100, 200, 500, 1000, Infinity],
  size: 100,
})
const rowsPaged = computed(() => rowsSorted.value.slice((page.curr - 1) * page.size, page.curr * page.size))

const total = computed(() => rowsSearched.value.length)
const disabledTotal = ref(false)
const totalTransit = useTransition(total, {
  disabled: disabledTotal,
  transition: TransitionPresets.easeOutCirc,
})

const segments = computed(() => [t('all'), t('mine'), t('top')])
</script>

<template>
  <div class="mx-auto max-w-screen-xl">
    <el-container>
      <el-header
        class="relative flex !h-16 items-center"
        height="100%"
      >
        <Switch
          :state="false"
          :text="['off','on']"
        />
      </el-header>
      <el-container class="justify-center">
        <el-aside class="h-[calc(90vh-20px)] !w-full !overflow-visible md:h-[calc(100vh-160px)] md:!w-[44%]">
          <el-card class="table-card mx-5 flex h-full flex-col items-center !rounded-xl !border-0 will-change-transform">
            <segmented-control
              :default="selectedSeg"
              :segments="segments"
              class="grow-0 pt-3 pb-2"
              name="segment-mine"
              @input="onSegmentSwitched"
            />
            <div class="h-px grow">
              <el-table
                :data="rowsPaged"
                class="w-table !h-full !w-full md:w-full"
                fit
                height="200"
                size="small"
                @sort-change="sortChange"
              >
                <el-table-column
                  :label="t('rank')"
                  align="center"
                  class-name="cursor-pointer tabular-nums"
                  header-align="center"
                  min-width="7"
                  prop="rank"
                  sortable="custom"
                >
                  <template #default="props">
                    <div class="select-none font-compact">
                      {{ props.row.rank }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  align="left"
                  class-name="cursor-pointer"
                  label="Vocabulary"
                  min-width="7"
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
                  <template #default="props">
                    <span
                      class="cursor-text font-compact text-[16px] tracking-wide"
                      @mouseover="selectWord"
                      @touchstart.passive="selectWord"
                      @click.stop
                    >{{ props.row.w }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="t('length')"
                  align="left"
                  class-name="cursor-pointer tabular-nums"
                  min-width="5"
                  prop="len"
                  sortable="custom"
                >
                  <template #default="props">
                    <div class="select-none font-compact">
                      {{ props.row.len }}
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <el-pagination
              v-model:currentPage="page.curr"
              v-model:page-size="page.size"
              :background="true"
              :page-sizes="page.sizes"
              :pager-count="5"
              :small="true"
              :total="~~totalTransit"
              class="shrink-0 flex-wrap gap-y-1.5 !px-2 !pt-1 !pb-1.5 tabular-nums"
              layout="prev, pager, next, ->, total, sizes"
            />
          </el-card>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table__expand-icon) {
  -webkit-tap-highlight-color: transparent;
}

.w-table {
  :deep(:is(*, .el-table__body-wrapper)) {
    overscroll-behavior: contain !important;
  }

  :deep(.el-table__inner-wrapper) {
    height: 100% !important;
  }
}

.table-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
}

:deep(.el-pagination__rightwrapper > *) {
  margin: 0;
}

@media only screen and (max-width: 768px) {
  :deep(.el-aside) {
    margin-top: 34px;
    padding-bottom: 20px;
  }
  :deep(.el-container) {
    display: flex;
    flex-direction: column !important;
  }
}
</style>
