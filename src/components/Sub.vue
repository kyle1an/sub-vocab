<script lang="ts" setup>
import Trie from '../utils/WordTree';
import SegmentedControl from './SegmentedControl.vue'
import { Check } from '@element-plus/icons-vue';
import { ref, onMounted, shallowRef, toRefs } from 'vue'
import { Segment, Vocab } from '../types';

const segments: Array<Segment> = [
  {
    id: 0, title: 'Original',
  },
  {
    id: 11, title: 'Filtered', default: true
  },
  {
    id: 2, title: 'Common',
  },
];
let selected: number = 0;
const props = defineProps({
  commonWords: String,
});
const { commonWords } = toRefs(props);
onMounted(async () => {
  const t = new Trie('say ok Say tess')
  t.add('').mergeSuffixes();
  const test = t.formLists('say');
  console.log(test)
  selected = segments.findIndex((o: any) => o.default);
})

let vocabLists: Array<any>[] = [[], [], []];
const vocabData = shallowRef<Vocab[]>([]);
const vocabTable = shallowRef<any>(null);
const handleRowClick = (row: any) => vocabTable.value.toggleRowExpansion(row, row.expanded);
const switchSegment = (v: number) => vocabData.value = vocabLists[selected = v];
const rowClassKey = (seq: string | number) => `v-${seq}`;
const expandChanged = (row: any) => document.getElementsByClassName(rowClassKey(row.seq))[0].classList.toggle('expanded');
const selectWord = (e: any) => window.getSelection()?.selectAllChildren(e.target);
const sortByChar = (a: any, b: any): boolean => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' });
const example = (str: string, idxes: Array<number>[]): string => {
  const lines = [];
  let position = 0;
  for (const [idx, len] of idxes) {
    lines.push(`${str.slice(position, idx)}<span class="italic underline">${str.slice(idx, position = idx + len)}</span>`)
  }
  return lines.concat(str.slice(position)).join('');
};

const fileInfo = ref<string>('');
const inputContent = ref<string>('');
const readSingleFile = (e: any) => {
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
const formVocabLists = (content: string) => {
  console.time('╘═ All ═╛')
  console.time('--initWords')
  const words = new Trie(content);
  console.timeEnd('--initWords')
  sentences.value = words.sentences;
  console.time('-deSuffixes')
  words.mergeSuffixes()
  console.timeEnd('-deSuffixes')
  console.time('--formLists');
  vocabLists = words.formLists(commonWords!.value);
  vocabData.value = vocabLists[selected]
  console.timeEnd('--formLists');
  console.timeEnd('╘═ All ═╛')
  logVocabInfo();
}

let vocabAmountInfo = ref<number[]>([]);
const logVocabInfo = () => {
  vocabAmountInfo.value = [Object.keys(vocabLists[0]).length, Object.keys(vocabLists[1]).length, Object.keys(vocabLists[2]).length];
  const untouchedVocabList = [...vocabLists[0]].sort((a, b) => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' }));
  const lessCommonWordsList = [...vocabLists[1]].sort((a, b) => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' }));
  const commonWordsList = [...vocabLists[2]].sort((a, b) => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' }));
  console.log(`sen(${sentences.value.length})`, sentences);
  console.log(`not(${vocabAmountInfo.value[0]})`, untouchedVocabList);
  console.log(`fil(${vocabAmountInfo.value[1]})`, lessCommonWordsList);
  console.log(`com(${vocabAmountInfo.value[2]})`, commonWordsList);
}

const dropHandler = (ev: any) => {
  // TODO: get dropped files
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
</script>

<template>
  <div class="mx-auto max-w-screen-xl">
    <el-container>
      <el-header height="100%" class="relative !h-16 flex items-center">
        <span class="flex-1 text-right text-xs text-indigo-900 truncate tracking-tight font-compact">{{ fileInfo || 'No file chosen' }}</span>
        <label class="word-content s-btn grow-0 mx-4" @dragover.prevent @drop.prevent="dropHandler"><input type="file" class="hidden" @change="readSingleFile" />Browse files</label>
        <span class="flex-1 text-left text-xs text-indigo-900 truncate">{{ vocabAmountInfo.join(', ') || '' }}</span>
      </el-header>
      <el-container>
        <el-container class="relative">
          <el-main class="!py-0 relative">
            <el-input class="input-area h-full font-compact" type="textarea" placeholder="input subtitles manually:" v-model="inputContent" />
          </el-main>
          <div class="submit absolute text-center z-10 md:top-8 md:right-0.5 h-12">
            <el-button class="s-btn" aria-label="submit input text" @click="formVocabLists(inputContent)" type="primary" :icon="Check" circle />
          </div>
        </el-container>

        <el-aside class="!overflow-visible !w-full md:!w-[44%] h-[calc(90vh-20px)] md:h-[calc(100vh-160px)]">
          <el-card class="table-card mx-5 !rounded-xl !border-0 h-full">
            <segmented-control :segments="segments" @input="switchSegment" />
            <el-table fit class="r-table md:w-full" height="100%" size="small"
                      :data="vocabData" ref="vocabTable" @row-click="handleRowClick" @expand-change="expandChanged"
                      :row-class-name="({row})=> rowClassKey(row.seq)">
              <el-table-column type="expand">
                <template #default="props">
                  <div class="mb-1 ml-5 mr-3">
                    <div class="break-words" style="word-break: break-word;" v-for="[no,idx] in props.row.src">
                      <span v-html="example(sentences[no], idx)" />
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Vocabulary" sortable :sort-method="sortByChar" align="left" min-width="13" class-name="cursor-pointer">
                <template #default="props">
                  <span class="cursor-text font-compact text-[16px] tracking-wide" @mouseover="selectWord" @touchstart="selectWord" @click.stop>{{ props.row.w }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Times" prop="freq" sortable align="right" min-width="7" class-name="cursor-pointer tabular-nums">
                <template #default="props">
                  <div class="font-compact text-right select-none">{{ props.row.freq }}</div>
                </template>
              </el-table-column>
              <el-table-column label="Length" prop="len" sortable align="center" min-width="7" class-name="cursor-pointer tabular-nums">
                <template #default="props">
                  <div class="font-compact w-4 text-right m-auto select-none">{{ props.row.len }}</div>
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

@media only screen and (min-width: 768px) {
  .input-area > textarea {
    overflow: visible;
  }
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
    padding-bottom: 10px;
  }

  .el-textarea__inner {
    max-height: 360px;
  }
}

@media only screen and (max-width: 640px) {
  .el-main {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
  .input-area textarea {
    border-radius: 12px;
  }
}
</style>
