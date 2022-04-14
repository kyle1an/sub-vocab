<template>
  <div class="my-2.5 mx-auto max-w-screen-xl">
    <el-container>
      <el-header height="100%" class="relative flex items-center mt-2.5">
        <span class="flex-1 text-right text-xs text-indigo-900">{{ vocabAmountInfo.join(', ') || '' }}</span>
        <label class="word-content s-btn grow-0 mx-4"><input type="file" class="hidden" @change="readSingleFile" />Browse files</label>
        <span class="flex-1 text-left text-[10px] truncate tracking-tight text-indigo-900">{{ fileInfo || 'No file chosen' }}</span>
      </el-header>
      <el-container>
        <el-container class="relative">
          <el-main>
            <div class="relative">
              <div class="submit absolute z-10 md:top-8 md:-right-5">
                <el-button class="s-btn" @click="formVocabLists(inputContent)" type="primary" icon="el-icon-check" circle />
              </div>
              <el-input class="input-area" type="textarea" :rows="12" placeholder="input subtitles manually:" v-model="inputContent" />
            </div>
          </el-main>
        </el-container>
        <el-aside width="44%">
          <el-card class="table-card mx-5 mt-5 mb-2.5 !rounded-xl !border-0">
            <ios13-segmented-control :segments="segments" @input="switchSegment" />
            <el-table fit class="r-table md:w-full md:max-h-[calc(100vh-180px)]" height="calc(100vh - 90px)" :data="vocabData" @cell-mouse-enter="selectText" size="small">
              <el-table-column prop="w" label="Vocabulary" sortable :sort-method="sortByChar" min-width="13" class-name="vocab-col" align="right" />
              <el-table-column prop="freq" label="Times" sortable align="right" min-width="7" class-name="tabular-nums" />
              <el-table-column prop="len" label="Length" sortable align="center" min-width="7" />
              <el-table-column type="expand">
                <template #default="props">
                  <div class="mx-2.5">
                    <p v-for="line in props.row.src">{{ line }}<br></p>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Trie from '../utils/WordTree.js';
import iOS13SegmentedControl from './segmented-control.vue'

export default {
  name: 'Sub',
  components: {
    'ios13-segmented-control': iOS13SegmentedControl
  },
  data() {
    return {
      selected: null,
      segments: [
        {
          id: 0, title: 'Origin',
        },
        {
          id: 11, title: 'Filtered', default: true
        },
        {
          id: 2, title: 'Common',
        },
      ],
      inputContent: '',
      commonWords: '',
      fileInfo: '',
      vocabAmountInfo: [],
      vocabLists: [[], [], []],
      vocabData: [],
    }
  },

  async mounted() {
    const init = {
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      }
    }
    this.commonWords = await fetch('../sieve.txt', init).then((response) => response.text());
    const t = new Trie('say ok Say tess')
    t.add('').mergeSuffixes();
    const test = t.formLists('say');
    console.log(test)
    this.selected = this.segments.findIndex((o => o.default));
  },

  methods: {
    switchSegment(v) {
      this.vocabData = this.vocabLists[this.selected = v]
    },

    selectOnTouch() {
      for (const e of this.$el.querySelectorAll('.vocab-col')) {
        e.addEventListener('touchstart', () => window.getSelection().selectAllChildren(e), { passive: true });
      }
    },

    selectText: (row, column, cell,) => cell.classList.contains('vocab-col') && window.getSelection().selectAllChildren(cell),

    sortByChar: (a, b) => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' }),

    readSingleFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.fileName = file.name
      reader.onload = (e) => {
        this.inputContent = e.target.result
        this.formVocabLists(this.inputContent)
        this.fileInfo = e.target.fileName;
      };
      reader.readAsText(file);
    },

    formVocabLists(content) {
      console.time('╘═ All ═╛')
      console.time('--initWords')
      const words = new Trie(content);
      console.timeEnd('--initWords')

      console.time('--deAffixes')
      words.mergeSuffixes()
      console.timeEnd('--deAffixes')

      console.time('--formLists');
      this.vocabLists = words.formLists(this.commonWords);
      this.vocabData = this.vocabLists[this.selected]
      console.timeEnd('--formLists');
      console.timeEnd('╘═ All ═╛')
      setTimeout(() => this.selectOnTouch(), 0);
      this.logVocabInfo();
    },

    logVocabInfo() {
      this.vocabAmountInfo = [Object.keys(this.vocabLists[0]).length, Object.keys(this.vocabLists[1]).length, Object.keys(this.vocabLists[2]).length];
      const untouchedVocabList = [...this.vocabLists[0]].sort((a, b) => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' }));
      const lessCommonWordsList = [...this.vocabLists[1]].sort((a, b) => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' }));
      const commonWordsList = [...this.vocabLists[2]].sort((a, b) => a.w.localeCompare(b.w, 'en', { sensitivity: 'base' }));
      console.log(`not(${this.vocabAmountInfo[0]})`, untouchedVocabList);
      console.log(`fil(${this.vocabAmountInfo[1]})`, lessCommonWordsList);
      console.log(`com(${this.vocabAmountInfo[2]})`, commonWordsList);
    },
  },
}
</script>

<style lang="scss">
.r-table :is(*,  .el-table__body-wrapper) {
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

.table-card .el-card__body {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 12px;
}

.input-area textarea {
  border-radius: 8px;
  box-shadow: none;
  border: 0;
  padding-left: 30px;
  padding-right: 30px;
}

.el-switch__core {
  width: 32px !important;
}

.el-switch__label * {
  font-size: 14px !important;
  letter-spacing: -0.01em;
}

td.vocab-col .cell {
  font-family: 'SF Compact Text', -apple-system, sans-serif !important;
  font-size: 16px !important;
  letter-spacing: 0.01rem;
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

@media only screen and (min-width: 768px) {
  .input-area > textarea {
    height: 100vh;
    max-height: calc(100vh - 120px) !important;
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
    max-height: calc(100vh - 172px);
    width: 100%;
  }

  .submit {
    bottom: -20px;
    width: 100%;
  }

  .input-area > textarea {
    max-height: 260px;
  }

  .el-container {
    display: flex;
    flex-direction: column !important;
  }

  .el-aside {
    width: 100% !important;
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
