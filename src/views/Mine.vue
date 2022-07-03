<script setup lang="ts">
import Switch from '../components/Switch.vue';
import SegmentedControl from '../components/SegmentedControl.vue'
import { computed, onMounted, ref } from 'vue'
import { Segment } from '../types';
import { selectWord, sortByChar, sortByNum } from '../utils/utils';
import { useVocabStore } from '../store/useVocab';
import { useUserStore } from '../store/useState';

const userStore = useUserStore()
const userSegment = computed(() => userStore.user.name ? 'Mine' : 'Common')
const segments: Array<Segment> = [
  { id: 0, title: 'Whole', default: true },
  { id: 11, title: userSegment.value, },
  { id: 2, title: 'Top', },
]
let selected: number = segments.findIndex((o: any) => o.default);
let vocabLists: Array<any>[] = [[], [], []];
const acquaintedVocabTableData = ref<any>([]);

async function loadVocab() {
  const vocabStore = useVocabStore()
  const words = await vocabStore.copyJson()
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
  vocabLists = [all, mine, topWords];
  acquaintedVocabTableData.value = vocabLists[selected];
}

onMounted(() => {
  setTimeout(() => {
    loadVocab()
  }, 0)
})

function switchSegment(v: number) {
  acquaintedVocabTableData.value = vocabLists[selected = v]
}

function sortChange({ prop, order }: any) {
  console.log(prop, order)
  acquaintedVocabTableData.value = [...vocabLists[selected]].sort(compare(prop, order));
}

function compare(propertyName: string, order: string) {
  return function (obj1: any, obj2: any): number {
    const value1 = obj1[propertyName];
    const value2 = obj2[propertyName];
    let res;
    if (typeof value1 === 'string' && typeof value2 === 'string') {
      res = sortByChar(value1, value2)
    } else {
      res = sortByNum(value1, value2)
    }
    return order === 'ascending' ? res : -res
  }
}

const search = ref('');
const tableDataFiltered = computed(() =>
  acquaintedVocabTableData.value.filter(
    (data: any) =>
      !search.value ||
      data.w.toLowerCase().includes(search.value.toLowerCase())
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
      <el-header height="100%" class="relative !h-16 flex items-center">
        <span class="flex-1  text-xs text-indigo-900 truncate tracking-tight font-compact">Common words list DEMO</span>
        <Switch :state="false" :text="['off','on']" />
      </el-header>

      <el-container class="justify-center">
        <el-aside class="!overflow-visible !w-full md:!w-[44%] h-[calc(90vh-20px)] md:h-[calc(100vh-160px)]">
          <el-card class="table-card flex items-center flex-col mx-5 !rounded-xl !border-0 h-full will-change-transform">
            <segmented-control :segments="segments" @input="switchSegment" class="flex-grow-0 pt-3 pb-2" />
            <div class="h-full w-full"><!-- 100% height of its container minus height of siblings -->
              <div class="h-[calc(100%-1px)]">
                <el-table @sort-change="sortChange" fit class="w-table !h-full !w-full md:w-full" height="200" size="small" :data="tableDataDisplay">

                  <el-table-column label="Rank" prop="rank" sortable="custom" header-align="center" align="center" min-width="7" class-name="cursor-pointer tabular-nums">
                    <template #default="props">
                      <div class="font-compact select-none">{{ props.row.rank }}</div>
                    </template>
                  </el-table-column>

                  <el-table-column label="Vocabulary" prop="w" sortable="custom" align="left" min-width="7" class-name="cursor-pointer">
                    <template #header>
                      <el-input @click.stop class="!w-[calc(100%-26px)] !text-base md:!text-xs" v-model="search" size="small" placeholder="Search" />
                    </template>
                    <template #default="props">
                      <span class="cursor-text font-compact text-[16px] tracking-wide" @mouseover="selectWord" @touchstart="selectWord" @click.stop>{{ props.row.w }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column label="Length" prop="len" sortable="custom" align="left" min-width="7" class-name="cursor-pointer tabular-nums">
                    <template #default="props">
                      <div class="font-compact select-none">{{ props.row.len }}</div>
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
              class="!px-2 !pt-1 !pb-1.5 flex-wrap gap-y-1.5 pager-section flex-shrink-0"
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
