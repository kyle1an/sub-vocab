<script setup lang="ts">
import Switch from '../components/Switch.vue';
import SegmentedControl from '../components/SegmentedControl.vue'
import { computed, onMounted, ref } from 'vue'
import { Segment } from '../types';
import { sortByChar } from '../utils/utils';
import { useVocabStore } from '../store/useVocab';
import { useUserStore } from '../store/useState';

const userStore = useUserStore()
const userSegment = computed(() => userStore.user.name ? 'Mine' : 'Common')
const segments: Array<Segment> = [
  { id: 0, title: 'Whole', },
  { id: 11, title: userSegment.value, default: true },
  { id: 2, title: 'Top', },
]
let selected: number = segments.findIndex((o: any) => o.default);
let vocabLists: Array<any>[] = [[], [], []];
const acquaintedVocabTableData = ref<any>([]);

async function loadVocab() {
  const vocabStore = useVocabStore()
  const words = await vocabStore.copyJson()
  let rank = 1
  const mineWords = []
  for (const word of words) {
    if (word.acquainted) {
      mineWords.push({
        w: word.w,
        is_user: word.is_user,
        len: word.w.length,
        rank: rank++
      })
    }
  }
  const common = mineWords.slice(1000);
  const top1k = mineWords.slice(0, 1000);
  vocabLists = [mineWords, common, top1k];
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

function selectWord(e: any) {
  window.getSelection()?.selectAllChildren(e.target);
}
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
          <el-card class="table-card mx-5 !rounded-xl !border-0 h-full will-change-transform">
            <segmented-control :segments="segments" @input="switchSegment" />
            <el-table fit class="r-table md:w-full" height="100%" size="small" :data="acquaintedVocabTableData">
              <el-table-column label="Rank" prop="rank" sortable header-align="center" align="center" min-width="7" class-name="cursor-pointer tabular-nums">
                <template #default="props">
                  <div class="font-compact select-none">{{ props.row.rank }}</div>
                </template>
              </el-table-column>

              <el-table-column label="Vocabulary" sortable :sort-method="(a, b) => sortByChar(a.w, b.w)" align="left" min-width="7" class-name="cursor-pointer">
                <template #default="props">
                  <span class="cursor-text font-compact text-[16px] tracking-wide" @mouseover="selectWord" @touchstart="selectWord" @click.stop>{{ props.row.w }}</span>
                </template>
              </el-table-column>

              <el-table-column label="Length" prop="len" sortable align="left" min-width="7" class-name="cursor-pointer tabular-nums">
                <template #default="props">
                  <div class="font-compact select-none">{{ props.row.len }}</div>
                </template>
              </el-table-column>

            </el-table>
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

.r-table :deep(:is(*, .el-table__body-wrapper)) {
  overscroll-behavior: contain !important;
}

.table-card :deep(.el-card__body) {
  height: calc(100% - 7px);
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 12px;
}

@media only screen and (max-width: 768px) {
  .r-table {
    max-height: calc(99vh);
    width: 100%;
  }
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
