<script lang="ts" setup>
import Trie from '../utils/LabeledTire';
import SegmentedControl from './SegmentedControl.vue'
import { Check } from '@element-plus/icons-vue';
import { computed, ref, shallowRef } from 'vue'
import { Segment, Vocab } from '../types';
import { sortByChar } from '../utils/utils';
import { acquainted, revokeWord } from '../api/vocab-service';
import { useVocabStore } from '../store/useVocab';
import { useTimeStore } from '../store/usePerf';

const segments: Array<Segment> = [
  { id: 0, title: 'Original', },
  { id: 11, title: 'Filtered', default: true },
  { id: 2, title: 'Common', },
];
let selectedSeg: number = segments.findIndex((o: any) => o.default);
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

const fileInfo = ref<string>('');
const inputContent = ref<string>('');

function readSingleFile(e: any) {
  const file = e.target.files[0];
  if (!file) return;
  const reader: any = new FileReader();
  reader.fileName = file.name
  reader.onload = (e: any) => {
    fileInfo.value = e.target.fileName;
    inputContent.value = e.target.result
    setTimeout(() => formVocabLists(inputContent.value), 0)
  };
  reader.readAsText(file);
}

const sentences = shallowRef<any[]>([]);
const store = useVocabStore()
const __perf = useTimeStore();

async function formVocabLists(content: string) {
  const trieListPair = await store.getSieve()
  __perf.time.log = {}
  __perf.time.log.start = performance.now()
  const vocab = new Trie(trieListPair).add(content);
  __perf.time.log.wordInitialized = performance.now();
  sentences.value = vocab.sentences;
  __perf.time.log.categorizeStart = performance.now();
  listsOfVocab = vocab.categorizeVocabulary();
  tableDataOfVocab.value = listsOfVocab[selectedSeg]
  __perf.time.log.end = performance.now()
  __perf.logPerf()
  console.log({ root: JSON.stringify(vocab.root) });
  logVocabInfo();
}

const vocabAmountInfo = ref<number[]>([]);

function logVocabInfo() {
  vocabAmountInfo.value = [Object.keys(listsOfVocab[0]).length, Object.keys(listsOfVocab[1]).length, Object.keys(listsOfVocab[2]).length];
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

const loadingStateArray = ref<boolean[]>([]);

async function toggleWordState(row: any, e: any) {
  loadingStateArray.value[row.seq] = true;

  const word = row.w.replace(/'/g, `''`);
  row.vocab ??= { w: row.w, is_user: true, is_valid: false };
  const res = await (row?.vocab?.is_valid ? revokeWord : acquainted)({ word });

  if (res) {
    row.vocab.is_valid = res[res.length - 1].every((r: any) => r.is_valid);
    row.F = row.vocab.is_valid;
    store.updateWord(row);
  }

  loadingStateArray.value[row.seq] = false;
}
</script>

<template>
  <div class="mx-auto max-w-screen-xl">
    <el-container>
      <el-header height="100%" class="relative !h-16 flex items-center">
        <span class="flex-1 text-right text-xs text-indigo-900 truncate tracking-tight font-compact">
          {{ fileInfo || 'No file chosen' }}</span>
        <label class="word-content s-btn grow-0 mx-4" @dragover.prevent @drop.prevent="dropHandler">
          <input type="file" class="hidden" @change="readSingleFile" />Browse files
        </label>
        <span class="flex-1 text-left text-xs text-indigo-900 truncate">{{ vocabAmountInfo.join(', ') || '' }}</span>
      </el-header>
      <el-container>
        <el-container class="relative">
          <el-main class="!py-0 relative">
            <el-input class="input-area h-full font-text-sans" type="textarea" placeholder="input subtitles manually:" v-model.lazy="inputContent" />
          </el-main>
          <div class="submit absolute text-center z-10 md:top-8 md:right-0.5 h-12">
            <el-button class="s-btn" aria-label="submit input text" @click="formVocabLists(inputContent)" type="primary" :icon="Check" circle />
          </div>
        </el-container>

        <el-aside class="!overflow-visible !w-full md:!w-[44%] h-[calc(90vh-20px)] md:h-[calc(100vh-160px)]">
          <el-card class="table-card mx-5 !rounded-xl !border-0 h-full">
            <segmented-control :segments="segments" @input="switchSegment" />

            <el-table
              ref="vocabTable"
              class="r-table md:w-full" height="100%" size="small" fit
              :row-class-name="({row})=> classKeyOfRow(row.seq)"
              :data="tableDataFiltered"
              @row-click="handleRowClick"
              @expand-change="tagExpand">
              <el-table-column type="expand">
                <template #default="props">
                  <div class="mb-1 ml-5 mr-3">
                    <div class="break-words" style="word-break: break-word;" v-for="[no,idx] in props.row.src">
                      <span v-html="example(sentences[no], idx)" />
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="Vocabulary" sortable :sort-method="(a, b) => sortByChar(a.w, b.w)" align="left" min-width="13" class-name="cursor-pointer">
                <template #header>
                  <el-input @click.stop class="!w-[calc(100%-26px)] !text-[10px]" v-model="search" size="small" placeholder="Search vocabulary" />
                </template>
                <template #default="props">
                  <span class="cursor-text font-compact text-[16px] tracking-wide" @mouseover="selectWord" @touchstart.passive="selectWord" @click.stop>{{ props.row.w }}</span>
                </template>
              </el-table-column>

              <el-table-column label="Times" prop="freq" sortable align="right" min-width="7" class-name="cursor-pointer tabular-nums">
                <template #default="props">
                  <div class="font-compact text-right select-none">{{ props.row.freq }}</div>
                </template>
              </el-table-column>

              <el-table-column label="Length" prop="len" sortable align="right" min-width="7" class-name="cursor-pointer tabular-nums">
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
                    @click.stop="toggleWordState(row,$event)"
                    :plain="!row?.vocab?.is_valid"
                    :loading="loadingStateArray[row.seq]"
                    :disabled="row?.vocab && !row?.vocab?.is_user"
                    :text="!row?.vocab?.is_valid" bg
                  />
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
.is-text {
  border: 1px solid transparent !important;

  &:hover {
    background-color: var(--el-color-primary-light-9) !important;
    border-color: var(--el-color-primary-light-5) !important;
  }
}

.el-icon {
  pointer-events: none;
}

thead .is-right:not(:last-child) .cell {
  padding: 0;
}

.el-table__expand-icon {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

.r-table :is(*, .el-table__body-wrapper) {
  overscroll-behavior: contain !important;
}

.s-btn {
  border-radius: 4px;
  box-sizing: border-box;
  display: inline-block;
  font-size: 14px;
  height: 36px;
  padding: 10px 12px;
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

.input-area textarea {
  border-radius: 8px;
  box-shadow: none;
  border: 0;
  padding-left: 30px;
  padding-right: 30px;
  height: 100%;
}


@media only screen and (min-width: 768px) {
  .input-area > textarea {
    overflow: visible;
  }

  body {
    height: 100%;
  }
}

@media only screen and (max-width: 768px) {
  html {
    //overflow: hidden;
    //height: 100%;
    -webkit-overflow-scrolling: touch;
  }

  body {
    //height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0 !important;
  }

  .r-table {
    max-height: calc(99vh);
    width: 100%;
  }

  .submit {
    bottom: -32px;
    width: 100%;
  }

  .input-area > textarea {
    height: 260px;
  }

  .el-container {
    display: flex;
    flex-direction: column !important;
  }

  .el-aside {
    margin-top: 34px;
    padding-bottom: 20px;
  }

  .el-textarea__inner {
    max-height: 360px;
  }
}
</style>
