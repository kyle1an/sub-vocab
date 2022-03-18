<template>
  <div style="margin: 10px auto;max-width: 1440px;">
    <el-container>
      <el-header height="100%" style="position: relative">
        <label for="file-input" class="word-content s-btn">Browse files</label>
        <input type="file" id="file-input" @change="readSingleFile" />
        <span class="file-info">{{ fileInfo }}</span>
      </el-header>
      <el-container>
        <el-container style="position: relative">
          <el-main>
            <div class="text-input" style="position: relative">
              <div class="submit">
                <el-button class="s-btn" @click="formWords(inputContent)" type="primary" icon="el-icon-check" circle />
              </div>
              <el-input class="input-area" type="textarea" :rows="12" placeholder="input subtitles manually:" v-model="inputContent" />
            </div>
          </el-main>
        </el-container>
        <el-aside width="42%">
          <el-card class="table-card">
            <ios13-segmented-control v-model="value" :segments="segments" />
            <el-table fit class="r-table" height="calc(100vh - 90px)" :data="vocabData" @cell-mouse-enter="selectText" size="mini">
              <el-table-column prop="vocab" label="Vocabulary" sortable :sort-method="sortByChar" class-name="vocab-col" align="right" style="font-size: 14px !important;" />
              <el-table-column prop="info.0" label="Times" sortable align="right" class-name="t-num" />
              <el-table-column prop="info.1" label="Length" sortable align="center" style="width: 100%" />
            </el-table>
          </el-card>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { WordTree } from '@/utils/WordTree.js';
import iOS13SegmentedControl from './segmented-control.vue'

export default {
  name: 'Sub',
  components: {
    'ios13-segmented-control': iOS13SegmentedControl
  },
  data() {
    return {
      value: '1',
      segments: [
        { title: 'Origin', id: '0' },
        { title: 'Filtered', id: '1' },
        { title: 'Common', id: '2' },
      ],
      inputContent: '',
      words: null,
      commonW: '',
      common: {},
      isFilter: true,
      fileInfo: 'No file chosen',
      notFiltered: [],
      hasFiltered: [],
      commonFiltered: [],
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
    const w1k = await fetch('../common-words.txt', init).then((response) => response.text());
    const myW = await fetch('../myWords.txt', init).then((response) => response.text());
    console.time('══ prepare ══')
    this.commonW = w1k.concat(myW);
    this.common = new WordTree(this.commonW, { '@': 1 });
    console.timeEnd('══ prepare ══')

    const t = new WordTree('say ok')
    const t2 = new WordTree('Say Say dd')
    t.add('');
    t.trans(t2)//.flt(t2, 0)
    // console.log(t)
    // console.log(Object.create(null));
    // console.log({})
  },
  watch: {
    value(v) {
      this.toggleFilter(v)
    },
  },
  methods: {
    toggleFilter(v) {
      this.vocabData = v === '0' ? this.notFiltered
          : v === '1' ? this.hasFiltered
              : this.commonFiltered
    },

    selectOnTouch() {
      console.log('listen click')
      this.$el.querySelectorAll('.vocab-col').forEach((e) => {
        e.addEventListener('touchstart', () => {
          console.log(e)
          window.getSelection().selectAllChildren(e);
        });
      })
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
        console.time('╘═ All ═╛')
        this.formWords(this.inputContent)
        console.timeEnd('╘═ All ═╛')
        this.fileInfo = e.target.fileName;
      };
      reader.readAsText(file);
    },

    formWords(content) {
      this.words = new WordTree();
      console.time('--formWords')
      this.words.add(content);
      console.timeEnd('--formWords')

      console.time('--deAffix')
      this.words.deAffix()
      console.timeEnd('--deAffix')

      console.time('--formList')
      const [tar, com] = this.words.formList(this.words, this.commonW);
      this.hasFiltered = tar
      this.commonFiltered = com
      this.notFiltered = this.words.formList(this.words);
      if (this.value === '1' && !this.hasFiltered.length) this.value = '0';
      this.toggleFilter(this.value);
      console.timeEnd('--formList') setTimeout(() => this.selectOnTouch(), 0)
      console.log(`not(${Object.keys(this.notFiltered).length})`, this.notFiltered);
      console.log(`fil(${Object.keys(this.hasFiltered).length})`, this.hasFiltered);
    },
  },
}
</script>

<style>
.r-table *,
.r-table .el-table__body-wrapper {
  overscroll-behavior: contain !important;
}

label.form-switch {
  display: flex;
  justify-content: center;
}

label.form-switch span {
  font-size: 16px;
  letter-spacing: -0.04rem;
  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  margin: 0 10px;
}

.el-card {
  border: 0 !important;
}

.file-info {
  max-width: calc(50vw - 90px);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  box-sizing: border-box;
  color: #29296e;
  display: inline-block;
  font-size: 10px;
  letter-spacing: -0.01rem;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.word-content {
  background: #1a73e8;
  border-radius: 4px;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-size: 14px;
  height: 36px;
  margin: 0 16px 0 16px;
  padding: 10px 12px;
}

.s-btn {
  box-shadow: inset 0 1px 0 0 hsl(0deg 0% 100% / 40%);
  line-height: 14px;
  border: 1px solid transparent;
  background-color: hsl(206, 100%, 52%);
}

/* .s-btn:focus,*/
/* .s-btn:active,*/
.s-btn:hover {
  background-color: hsl(206, 100%, 40%) !important;
  /*box-shadow: 0px 1px 2px 0px rgba(60, 64, 67, .30), 0px 1px 3px 1px rgba(60, 64, 67, .15);*/
  border: 1px solid transparent !important;
}

input#file-input {
  width: 0;
  height: 0;
}

.table-card .el-card__body {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 12px;
}

.table-card {
  margin: 20px 20px 10px 20px;
  border-radius: 12px !important;
}

.t-num {
  font-variant-numeric: tabular-nums !important;
}

.custom-file-upload {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
}

.el-switch__core {
  width: 32px !important;
}

.el-switch__label * {
  font-size: 14px !important;
  letter-spacing: -0.01em;
}

.file-info,
td.vocab-col .cell {
  font-family: 'SF Compact Text', -apple-system, sans-serif !important;
}

td.vocab-col .cell {
  font-size: 16px !important;
  letter-spacing: 0.01rem;
}

#file-content {
  text-align: left;
}

.submit {
  position: absolute;
  top: 30px;
  right: -20px;
  z-index: 100
}

.el-header, .el-footer {
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

body > .el-container {
  margin-bottom: 40px;
}

#vocab-content {
  text-align: left;
  margin: auto;
  width: 300px;
}

.el-table,
.el-table__header-wrapper,
.el-table__body-wrapper {
  margin: auto;
}

table thead {
  font-size: 10px !important;
}

.el-table th.el-table__cell > .cell {
  font-size: 10px;
}

.el-table__empty-block {
  margin: auto;
}

@media only screen
and (min-width: 896px) {
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

@media only screen
and (max-width: 896px) {
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
</style>
