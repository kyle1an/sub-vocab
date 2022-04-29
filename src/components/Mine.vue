<script setup lang="ts">
import Trie from '../utils/WordTree';
import Switch from './Switch.vue';
import SegmentedControl from './SegmentedControl.vue'
import { nextTick, ref, toRefs, watch } from 'vue'
import { Segment } from '../types';

const segments: Array<Segment> = [
  {
    id: 0, title: 'Whole',
  },
  {
    id: 11, title: 'Common', default: true
  },
  {
    id: 2, title: 'Top',
  },
]
let selected: number = segments.findIndex((o: any) => o.default);
let vocabLists: Array<any>[] = [[], [], []];
const vocabData = ref<any>([]);
const props = defineProps({
  commonWords: String,
});
const loadVocab = (value: any) => {
  if (value) {
    const words = new Trie(commonWords!.value);
    console.log(words)
    vocabLists = words.formLists();
    console.log(vocabLists)
    vocabData.value = vocabLists[selected];
  }
}

const { commonWords } = toRefs(props);
console.log(commonWords)
nextTick(() => {
  setTimeout(() => {
    loadVocab(commonWords!.value);
  }, 0);
})

watch(() => commonWords!.value, (value) => {
  loadVocab(value)
})
const switchSegment = (v: number) => vocabData.value = vocabLists[selected = v];
const selectWord = (e: any) => window.getSelection()?.selectAllChildren(e.target);
const sortByChar = (a: any, b: any): boolean => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' });
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
          <el-card class="table-card mx-5 !rounded-xl !border-0 h-full">
            <segmented-control :segments="segments" @input="switchSegment" />
            <el-table fit class="r-table md:w-full" height="100%" size="small" :data="vocabData">

              <el-table-column label="Vocabulary" sortable :sort-method="sortByChar" align="left" min-width="7" class-name="cursor-pointer">
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

<style lang="scss">
.el-table__expand-icon {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

.r-table :is(*, .el-table__body-wrapper) {
  overscroll-behavior: contain !important;
}

.table-card {
  //-webkit-backface-visibility: hidden;
  //-moz-backface-visibility: hidden;
  //-webkit-transform: translate3d(0, 0, 0);
  //-moz-transform: translate3d(0, 0, 0);
  will-change: transform;

  .el-card__body {
    height: calc(100% - 7px);
    padding-left: 0 !important;
    padding-right: 0 !important;
    padding-top: 12px;
  }
}

.el-switch__core {
  width: 32px !important;
}

.el-switch__label * {
  font-size: 14px !important;
  letter-spacing: -0.01em;
}

table,
.el-table,
.el-table__header-wrapper,
.el-table__body-wrapper,
.el-table__empty-block {
  margin: auto;
}

table thead {
  font-size: 10px !important;
}

.el-table th.el-table__cell > .cell {
  font-size: 10px;
}

.expanded:hover > td.el-table__cell {
  background-image: linear-gradient(to bottom, var(--el-border-color-lighter), white);
}

.expanded td {
  border-bottom: 0 !important;
}

@media only screen and (max-width: 768px) {
  html {
    overflow: hidden;
    height: 100%;
    -webkit-overflow-scrolling: touch;
  }

  body {
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0 !important;
  }

  .r-table {
    max-height: calc(99vh);
    width: 100%;
  }

  .el-container {
    display: flex;
    flex-direction: column !important;
  }

  .el-aside {
    margin-top: 34px;
    padding-bottom: 10px;
  }
}

@media only screen and (max-width: 640px) {
  .el-main {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
}
</style>
