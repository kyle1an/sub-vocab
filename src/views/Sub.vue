<script lang="ts" setup xmlns="http://www.w3.org/1999/html">
import Trie from '../utils/LabeledTire';
import SegmentedControl from '../components/SegmentedControl.vue'
import { Check } from '@element-plus/icons-vue';
import { computed, h, nextTick, ref, shallowRef } from 'vue'
import { Segment, Source, Vocab } from '../types';
import { sortByChar } from '../utils/utils';
import { acquaint, revokeWord } from '../api/vocab-service';
import { useVocabStore } from '../store/useVocab';
import { useTimeStore } from '../store/usePerf';
import { useUserStore } from '../store/useState';
import { ElNotification } from 'element-plus';
import router from '../router';

const userStore = useUserStore()
const segments: Array<Segment> = [
  { id: 0, title: 'Original', },
  { id: 11, title: 'Filtered', default: true },
  { id: 2, title: 'Common', },
];
let selectedSeg = segments.findIndex((o) => o.default);
let listsOfVocab: Array<any>[] = [[], [], []];
const tableDataOfVocab = shallowRef<Vocab[]>([]);
const vocabTable = shallowRef<any>(null);

function handleRowClick(row: any) {
  return vocabTable.value.toggleRowExpansion(row, row.expanded);
}

function tagExpand(row: any) {
  document.getElementsByClassName(classKeyOfRow(row.seq))[0].classList.toggle('expanded');
}

function switchSegment(v: number) {
  tableDataOfVocab.value = listsOfVocab[selectedSeg = v];
}

function classKeyOfRow(seq: string | number) {
  return `v-${seq}`;
}

function selectWord(e: any) {
  window.getSelection()?.selectAllChildren(e.target);
}

function example(str: string, idxes: Array<number>[]): string {
  const lines = [];
  let position = 0;
  for (const [idx, len] of idxes) {
    lines.push(`${str.slice(position, idx)}<span class="italic underline">${str.slice(idx, position = idx + len)}</span>`)
  }
  return lines.concat(str.slice(position)).join('');
}

function source(src: Source) {
  const lines = [];
  src.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const source: any = src.map(([sentenceId, start, len, sequence]) => [
    sentenceId,
    [[start, len, sequence]],
  ]);

  for (let i = 0; i < source.length; i++) {
    if (source[i][0] === source?.[i + 1]?.[0]) {
      lines.push([
        source[i][0],
        source[i][1].concat(source[i + 1][1])
      ]);
      i++;
    } else {
      lines.push(source[i]);
    }
  }

  return lines;
}

const fileInfo = ref<string>('');
const inputContent = ref<string>('');

function readSingleFile(e: any) {
  const file = e.target.files[0];
  if (!file) return;
  const reader: any = new FileReader();
  reader.fileName = file.name
  reader.onload = async (e: any) => {
    fileInfo.value = e.target.fileName;
    inputContent.value = e.target.result
    await nextTick()
    setTimeout(() => formVocabLists(inputContent.value), 0)
  };
  reader.readAsText(file);
}

const sentences = shallowRef<any[]>([]);
const vocabStore = useVocabStore()
const __perf = useTimeStore();
const vocabAmountInfo = ref<number[]>([]);

async function formVocabLists(content: string) {
  const trieListPair = await vocabStore.getSieve()
  __perf.time.log = {}
  __perf.time.log.start = performance.now()
  const vocab = new Trie(trieListPair).add(content);
  __perf.time.log.wordInitialized = performance.now();
  sentences.value = vocab.sentences;
  __perf.time.log.categorizeStart = performance.now();
  listsOfVocab = vocab.categorizeVocabulary();
  vocabAmountInfo.value = [listsOfVocab[0].length, listsOfVocab[1].length, listsOfVocab[2].length]
  setTimeout(() => {
    setTimeout(() => {
      tableDataOfVocab.value = listsOfVocab[selectedSeg]
    }, 0)
  }, 0)
  __perf.time.log.end = performance.now()
  console.log({ root: JSON.stringify(vocab.root) });
  logVocabInfo();
  __perf.logPerf()
}

function logVocabInfo() {
  const untouchedVocabList = [...listsOfVocab[0]].sort((a, b) => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' }));
  const lessCommonWordsList = [...listsOfVocab[1]].sort((a, b) => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' }));
  const commonWordsList = [...listsOfVocab[2]].sort((a, b) => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' }));
  console.log(`sentences(${sentences.value.length})`, sentences);
  console.log(`original(${vocabAmountInfo.value[0]})`, untouchedVocabList);
  console.log(`filtered(${vocabAmountInfo.value[1]})`, lessCommonWordsList);
  console.log(`common(${vocabAmountInfo.value[2]})`, commonWordsList);
}

function dropHandler(ev: any) {
  // TODO get dropped files
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    console.log('dataTransfer.items')
    // Use DataTransferItemList interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        const file = ev.dataTransfer.items[i].getAsFile();
        console.log(`... file[${i}].name = ` + file.name, file);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log(`... file[${i}].name = ` + ev.dataTransfer.files[i].name, ev.dataTransfer.files[i]);
    }
  }
}

const search = ref('');
const tableDataFiltered = computed(() =>
  tableDataOfVocab.value.filter(
    (data: any) =>
      !search.value ||
      data.w.toLowerCase().includes(search.value.toLowerCase())
  )
)
const tableDataDisplay = computed(() =>
  tableDataFiltered.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
)
const loadingStateArray = ref<boolean[]>([]);

async function toggleWordState(row: any) {
  loadingStateArray.value[row.seq] = true;

  if (userStore.user.name) {
    const word = row.w.replace(/'/g, `''`);
    row.vocab ??= { w: row.w, is_user: true, acquainted: false };
    const vocabInfo = {
      word,
      user: userStore.user.name,
    }
    const acquainted = row?.vocab?.acquainted
    const res = await (acquainted ? revokeWord : acquaint)(vocabInfo);

    if (res?.affectedRows) {
      row.F = row.vocab.acquainted = !acquainted;
      vocabStore.updateWord(row);
    }
  } else {
    ElNotification({
      // title: 'Mark',
      message: h(
        'span',
        { style: 'color: teal' },
        [
          'Please ',
          h('i', { onClick: () => router.push('/login') }, 'Log in'),
          ' to mark words.'
        ]
      )
    })
  }

  loadingStateArray.value[row.seq] = false;
}

const currentPage = ref(1)
const pageSizes = [100, 200, 500, 1000, Infinity]
const pageSize = ref(pageSizes[0])
const total = computed(() => tableDataFiltered.value.length)
</script>

<template>
  <div class="mx-auto max-w-screen-xl">
    <el-container>
      <el-header height="100%" class="relative !h-16 flex items-center">
        <span class="flex-1 text-right text-xs text-indigo-900 truncate tracking-tight font-compact">
          {{ fileInfo || 'No file chosen' }}</span>
        <label class="s-btn text-sm px-3 py-2.5 rounded-full grow-0 mx-4" @dragover.prevent @drop.prevent="dropHandler">
          <input type="file" hidden @change="readSingleFile" />Browse files
        </label>
        <span class="flex-1 text-left text-xs text-indigo-900 truncate">{{ vocabAmountInfo.join(', ') || '' }}</span>
      </el-header>
      <el-container>
        <el-container class="relative">
          <el-main class="!py-0 relative">
            <el-input class="input-area h-full !text-base md:!text-sm font-text-sans" type="textarea" placeholder="input subtitles manually:" v-model.lazy="inputContent" />
          </el-main>
          <div class="submit absolute text-center z-10 md:top-8 md:right-0.5 h-12">
            <el-button class="s-btn" aria-label="submit input text" @click="formVocabLists(inputContent)" type="primary" :icon="Check" circle />
          </div>
        </el-container>

        <el-aside class="!overflow-visible !w-full md:!w-[44%] h-[calc(90vh-20px)] md:h-[calc(100vh-160px)]">
          <el-card class="table-card flex items-center flex-col mx-5 !rounded-xl !border-0 h-full will-change-transform">
            <segmented-control :segments="segments" @input="switchSegment" class="flex-grow-0 pt-3 pb-2" />
            <div class="h-full w-full"><!-- 100% height of its container minus height of siblings -->
              <div class="h-[calc(100%-1px)]">
                <el-table
                  ref="vocabTable"
                  class="w-table !h-full !w-full md:w-full" height="200" size="small" fit
                  :row-class-name="({row})=> classKeyOfRow(row.seq)"
                  :data="tableDataDisplay"
                  @row-click="handleRowClick"
                  @expand-change="tagExpand"
                >
                  <el-table-column type="expand">
                    <template #default="props">
                      <div class="mb-1 ml-5 mr-3">
                        <div class="break-words" style="word-break: break-word;" v-for="[no,idx] in source(props.row.src)">
                          <span v-html="example(sentences[no], idx)" />
                        </div>
                      </div>
                    </template>
                  </el-table-column>

                  <el-table-column label="Vocabulary" align="left" min-width="16" sortable :sort-method="(a, b) => sortByChar(a.w, b.w)" class-name="cursor-pointer">
                    <template #header>
                      <el-input @click.stop class="!w-[calc(100%-26px)] !text-base md:!text-xs" v-model="search" size="small" placeholder="Search" />
                    </template>
                    <template #default="props">
                      <span class="cursor-text font-compact text-[16px] tracking-wide" @mouseover="selectWord" @touchstart.passive="selectWord" @click.stop>{{ props.row.w }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column label="Times" prop="freq" align="right" min-width="9" sortable class-name="cursor-pointer tabular-nums">
                    <template #default="props">
                      <div class="font-compact text-right select-none">{{ props.row.freq }}</div>
                    </template>
                  </el-table-column>

                  <el-table-column label="Length" prop="len" align="right" min-width="10" sortable class-name="cursor-pointer tabular-nums">
                    <template #default="props">
                      <div class="font-compact select-none">{{ props.row.len }}</div>
                    </template>
                  </el-table-column>

                  <el-table-column align="right" min-width="5">
                    <template #default="{row}">
                      <el-button
                        size="small"
                        type="primary"
                        :icon="Check"
                        @click.stop="toggleWordState(row)"
                        :plain="!row?.vocab?.acquainted"
                        :loading="loadingStateArray[row.seq]"
                        :disabled="row?.vocab && !row?.vocab?.is_user"
                        :text="!row?.vocab?.acquainted" bg
                      />
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
:deep(.el-pagination__rightwrapper > *) {
  margin: 0;
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
  :deep(.el-icon) {
    pointer-events: none;
  }

  :deep(:is(*, .el-table__body-wrapper)) {
    overscroll-behavior: contain !important;
  }

  :deep(.el-table__inner-wrapper) {
    height: 100%;
  }
}

.s-btn {
  box-sizing: border-box;
  display: inline-block;
  color: #fff;
  cursor: pointer;
  box-shadow: inset 0 1px 0 0 hsl(0deg 0% 100% / 40%);
  line-height: 14px;
  border: 1px solid transparent;
  background-color: hsl(206, 100%, 52%);

  &:hover {
    background-color: hsl(206, 100%, 40%) !important;
    /*box-shadow: 0px 1px 2px 0px rgba(60, 64, 67, .30), 0px 1px 3px 1px rgba(60, 64, 67, .15);*/
    border: 1px solid transparent !important;
  }
}

.table-card {
  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 0;
  }

  :deep(.el-table__expand-icon) {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
}

.input-area :deep(textarea) {
  border-radius: 8px;
  box-shadow: none;
  border: 0;
  padding-left: 30px;
  padding-right: 30px;
  height: 100%;
}

:deep(.expanded td) {
  border-bottom: 0 !important;
}

:deep(.expanded:hover > td.el-table__cell) {
  background-image: linear-gradient(to bottom, var(--el-border-color-lighter), white);
}

@media only screen and (min-width: 768px) {
  .input-area > :deep(textarea) {
    overflow: visible;
  }
}

@media only screen and (max-width: 768px) {
  .submit {
    bottom: -32px;
    width: 100%;
  }

  .input-area :deep(textarea) {
    height: 260px;
  }

  :deep(.el-container) {
    display: flex;
    flex-direction: column !important;
  }

  :deep(.el-aside) {
    margin-top: 34px;
    padding-bottom: 20px;
  }

  :deep(.el-textarea__inner) {
    max-height: 360px;
  }
}

@media only screen and (max-width: 640px) {
  .input-area :deep(textarea) {
    border-radius: 12px;
  }
}
</style>
