<template>
  <div class="my-2.5 mx-auto max-w-screen-xl">
    <el-container>
      <el-header height="100%" class="relative flex items-center">
        <span class="flex-1 text-right text-xs text-indigo-900">{{ vocabInfo.join(', ') || '' }}</span>
        <label class="word-content s-btn grow-0 mx-4"><input type="file" class="hidden" @change="readSingleFile" />Browse files</label>
        <span class="flex-1 text-left text-[10px] truncate tracking-tight text-indigo-900">{{ fileInfo || 'No file chosen' }}</span>
      </el-header>
      <el-container>
        <el-container class="relative">
          <el-main>
            <div class="text-input relative">
              <div class="submit">
                <el-button class="s-btn" @click="formWords(inputContent)" type="primary" icon="el-icon-check" circle />
              </div>
              <el-input class="input-area" type="textarea" :rows="12" placeholder="input subtitles manually:" v-model="inputContent" />
            </div>
          </el-main>
        </el-container>
        <el-aside width="42%">
          <el-card class="table-card">
            <ios13-segmented-control :segments="segments" @input="switchSec" />
            <el-table fit class="r-table" height="calc(100vh - 90px)" :data="vocabData" @cell-mouse-enter="selectText" size="small">
              <el-table-column prop="vocab" label="Vocabulary" sortable :sort-method="sortByChar" min-width="14" class-name="vocab-col" align="right" />
              <el-table-column prop="info.0" label="Times" sortable align="right" min-width="7" class-name="tabular-nums" />
              <el-table-column prop="info.1" label="Length" sortable align="center" min-width="9" />
            </el-table>
          </el-card>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { WordTree } from '../utils/WordTree.js';
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
        { id: 0, title: 'Origin', },
        { id: 11, title: 'Filtered', default: true },
        { id: 2, title: 'Common', },
      ],
      inputContent: '',
      words: null,
      commonW: '',
      fileInfo: '',
      vocabInfo: [],
      vocabs: [[], [], []],
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
    const w1k = await fetch('../1kCommonW.txt', init).then((response) => response.text());
    const myW = await fetch('../myWords.txt', init).then((response) => response.text());
    console.time('══ prepare ══')
    this.commonW = w1k.concat(myW);
    console.timeEnd('══ prepare ══')
    const t = new WordTree('say ok Say tess')
    t.add('').deAffix();
    const test = t.formList('say');
    console.log(test)
    // console.log(t)
    // console.log(Object.create(null));
    // console.log({})
    this.selected = this.segments.findIndex((o => o.default));
  },

  methods: {
    switchSec(v) {
      this.selected = v;
      this.vocabData = this.vocabs[v]
    },
    selectOnTouch() {
      console.log('listen click')
      for (const e of this.$el.querySelectorAll('.vocab-col')) {
        e.addEventListener('touchstart', () => window.getSelection().selectAllChildren(e));
      }
    },

    selectText: (row, column, cell,) => cell.classList.contains('vocab-col') && window.getSelection().selectAllChildren(cell),

    sortByChar: (a, b) => a['vocab'].localeCompare(b['vocab'], 'en', { sensitivity: 'base' }),

    readSingleFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.fileName = file.name
      reader.onload = (e) => {
        this.inputContent = e.target.result
        this.formWords(this.inputContent)
        this.fileInfo = e.target.fileName;
      };
      reader.readAsText(file);
    },

    formWords(content) {
      console.time('╘═ All ═╛')
      console.time('--formWords')
      this.words = new WordTree(content);
      console.timeEnd('--formWords')

      console.time('--deAffix')
      this.words.deAffix()
      console.timeEnd('--deAffix')

      console.time('--formList');
      this.vocabs = this.words.formList(this.commonW);
      // if (!this.vocabs[this.value].length) this.value = 0;
      this.vocabData = this.vocabs[this.selected]
      console.timeEnd('--formList');
      console.timeEnd('╘═ All ═╛')
      setTimeout(() => {
        this.selectOnTouch();
        this.logVocab();
      }, 0)
    },

    logVocab() {
      this.vocabInfo = [Object.keys(this.vocabs[0]).length, Object.keys(this.vocabs[1]).length, Object.keys(this.vocabs[2]).length];
      const not = [...this.vocabs[0]].sort((a, b) => a['vocab'].localeCompare(b['vocab'], 'en', { sensitivity: 'base' }));
      const fil = [...this.vocabs[1]].sort((a, b) => a['vocab'].localeCompare(b['vocab'], 'en', { sensitivity: 'base' }));
      const com = [...this.vocabs[2]].sort((a, b) => a['vocab'].localeCompare(b['vocab'], 'en', { sensitivity: 'base' }));
      console.log(`not(${this.vocabInfo[0]})`, not);
      console.log(`fil(${this.vocabInfo[1]})`, fil);
      console.log(`com(${this.vocabInfo[2]})`, com);
    },
  },
}
</script>

<style lang="scss">
html > body {
  background-color: rgb(243 241 246);

  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
}

.r-table *,
.r-table .el-table__body-wrapper {
  overscroll-behavior: contain !important;
}

.el-card {
  border: 0 !important;
}

.word-content {
  background: #1a73e8;
  border-radius: 4px;
  box-sizing: border-box;
  display: inline-block;
  font-size: 14px;
  height: 36px;
  padding: 10px 12px;
}

.s-btn {
  color: #fff;
  cursor: pointer;
  box-shadow: inset 0 1px 0 0 hsl(0deg 0% 100% / 40%);
  line-height: 14px;
  border: 1px solid transparent;
  background-color: hsl(206, 100%, 52%);
  /* .s-btn:focus,*/
  /* .s-btn:active,*/
  &:hover {
    background-color: hsl(206, 100%, 40%) !important;
    /*box-shadow: 0px 1px 2px 0px rgba(60, 64, 67, .30), 0px 1px 3px 1px rgba(60, 64, 67, .15);*/
    border: 1px solid transparent !important;
  }
}

.table-card {
  margin: 20px 20px 10px 20px;
  border-radius: 12px !important;

  .el-card__body {
    padding-left: 0 !important;
    padding-right: 0 !important;
    padding-top: 12px;
  }
}

.input-area textarea {
  border-radius: 8px;
  //box-shadow: 0 2px 2px 0 rgb(0 0 0 / 4%);
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

.submit {
  position: absolute;
  top: 30px;
  right: -20px;
  z-index: 100
}

.el-header,
.el-footer {
  text-align: center;
  line-height: 60px;
}

.el-aside {
  text-align: center;
  /*line-height: 200px;*/
}

.el-main {
  text-align: center;
  /*line-height: 160px;*/
}

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

@media only screen and (min-width: 896px) {
  .input-area > textarea,
  .text-input {
    height: 100vh;
    max-height: calc(100vh - 120px) !important;
    overflow: visible;
  }

  .r-table {
    max-height: calc(100vh - 180px);
    width: 100%;
  }
}

@media only screen and (max-width: 896px) {
  html {
    overflow: hidden;
    height: 100%;
    -webkit-overflow-scrolling: touch;
  }

  /*.r-table *,*/
  /*.r-table .el-table__body-wrapper,*/
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
    top: unset;
    right: unset;
    bottom: -20px;
    width: 100%;
  }

  .input-area > textarea,
  .text-input {
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

@media only screen and (max-width: 428px) {
  .el-main {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
  .input-area textarea {
    border-radius: 12px;
  }
}
</style>
