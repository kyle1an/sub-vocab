<script setup lang="ts">
import Switch from '../components/Switch.vue'
import SegmentedControl from '../components/SegmentedControl.vue'
import { computed, onMounted, ref, Ref } from 'vue'
import { compare, jsonClone, selectWord } from '../utils/utils'
import { useVocabStore } from '../store/useVocab'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const segments = computed(() => [t('all'), t('mine'), t('top')])
const selected: Ref<number> = ref(0)
let vocabLists: Array<any>[] = [[], [], []]
const acquaintedVocabTableData = ref<any[]>([])

async function loadVocab() {
  const vocabStore = useVocabStore()
  const words = jsonClone(await vocabStore.fetchVocab())
  const all = []
  const mine = []
  const topWords = []
  for (const word of words) {
    if (word.acquainted) {
      const row = {
        w: word.w,
        is_user: word.is_user,
        len: word.w.length,
        rank: word.rank,
      }
      if (word.is_user) {
        mine.push(row)
      } else {
        topWords.push(row)
      }
      all.push(row)
    }
  }
  return [all, mine, topWords]
}

const sortBy = ref({})

function refreshVocab() {
  acquaintedVocabTableData.value = vocabLists[selected.value]
  sortChange(sortBy.value)
}

onMounted(() => {
  setTimeout(async () => {
    vocabLists = await loadVocab()
    if (vocabLists[1].length) {
      selected.value = 1
    }
    refreshVocab()
  }, 0)
})

function onSegmentSwitched(v: number) {
  selected.value = v
  acquaintedVocabTableData.value = vocabLists[selected.value]
  sortChange(sortBy.value)
}

function sortChange({ prop, order }: any) {
  sortBy.value = { prop, order }
  acquaintedVocabTableData.value = [...vocabLists[selected.value]].sort(compare(prop, order))
}

const search = ref('')
const tableDataFiltered = computed(() =>
  acquaintedVocabTableData.value.filter((data: any) =>
    !search.value || data.w.toLowerCase().includes(search.value.toLowerCase())
  )
)

const tableDataDisplay = computed(() =>
  tableDataFiltered.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
)
const currentPage = ref(1)
const pageSizes = [100, 200, 500, 1000, Infinity]
const pageSize = ref(pageSizes[0])
const total = computed(() => tableDataFiltered.value.length)
</script>

<template>
  <div class="mx-auto max-w-screen-xl">
    <el-container>
      <el-header
        height="100%"
        class="relative flex !h-16 items-center"
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
              :segments="segments"
              :default="selected"
              class="grow-0 pt-3 pb-2"
              @input="onSegmentSwitched"
            />
            <div class="h-full w-full">
              <!-- 100% height of its container minus height of siblings -->
              <div class="h-[calc(100%-1px)]">
                <el-table
                  fit
                  class="w-table !h-full !w-full md:w-full"
                  height="200"
                  size="small"
                  :data="tableDataDisplay"
                  @sort-change="sortChange"
                >
                  <el-table-column
                    :label="t('rank')"
                    prop="rank"
                    sortable="custom"
                    header-align="center"
                    align="center"
                    min-width="7"
                    class-name="cursor-pointer tabular-nums"
                  >
                    <template #default="props">
                      <div class="select-none font-compact">
                        {{ props.row.rank }}
                      </div>
                    </template>
                  </el-table-column>

                  <el-table-column
                    label="Vocabulary"
                    prop="w"
                    sortable="custom"
                    align="left"
                    min-width="7"
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
                    prop="len"
                    sortable="custom"
                    align="left"
                    min-width="5"
                    class-name="cursor-pointer tabular-nums"
                  >
                    <template #default="props">
                      <div class="select-none font-compact">
                        {{ props.row.len }}
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
              :total="total"
              class="pager-section shrink-0 flex-wrap gap-y-1.5 !px-2 !pt-1 !pb-1.5"
            />
          </el-card>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table__expand-icon) {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

.w-table :deep(:is(*, .el-table__body-wrapper)) {
  overscroll-behavior: contain !important;
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
