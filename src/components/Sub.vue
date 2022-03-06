<template>
  <div style="margin: 10px auto;max-width: 1440px">
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
            <el-switch v-model="isFilter" active-text="Hide Common" inactive-text="" style="font-size: 18px !important; letter-spacing: -0.02em" />
            <el-table fit class="r-table" height="calc(100vh - 90px)" :data="vocabData" size="mini">
              <el-table-column prop="vocab" label="Vocabulary" sortable align="right" :sort-method="sortByChar" style="font-size: 14px !important;" />
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
import { WordTree } from "@/utils/WordTree.js";

export default {
  name: 'Sub',
  data() {
    return {
      inputContent: '',
      UPPER: {},
      words: {},
      wordsMap: {},
      commonMap: {},
      isFilter: true,
      i: { '@': 1 },
      fileInfo: 'No file chosen',
      vocabData: [],
    }
  },

  watch: {
    isFilter() {
      this.vocabData = this.formList(this.words, this.isFilter);
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
    this.commonMap = new WordTree(w1k.concat(myW), { '@': 1 })
    // const myArray = deDuplicate(myWords.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg).sort());
    // const print = (m, space = 0) => console.log(JSON.stringify(m, null, space).replace(/"/mg, ""))
    const id = { '@': 1 }
    const t = new WordTree('say ok', id)
    const t2 = new WordTree('Say Say dd', id)
    t.add('')
    t.trans(t2)
    t.filter(t2, 0)

    const me = Object.create(null);
    const aaa = {}
    console.log(me)
    console.log(aaa)
  },

  methods: {
    sortByChar(a, b) {
      return a['vocab'].localeCompare(b['vocab'], 'en', { sensitivity: 'base' })
    },

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
      console.time('formWords')
      const { i } = this
      this.UPPER = new WordTree('', i);
      this.words = new WordTree('', i);
      (content.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || []).forEach((origin) => {
        if (/[A-Z']/.test(origin)) {
          this.UPPER.add(origin)
          origin = origin.toLowerCase()
        }
        this.words.add(origin)
      })
      console.timeEnd('formWords')

      console.time('deAffix')
      this.words.deAffix()
      console.timeEnd('deAffix')
//
      console.time('formList')
      const vocabData = this.formList(this.words, 1);
      console.timeEnd('formList')
      console.log(this.words.trunk)
      this.vocabData = vocabData;
    },

    formList(words, isFilter = false) {
      const { i } = this;
      const vocab = words.cloneTree();
      if (isFilter) vocab.filter(this.commonMap)
      i['@'] = 1
      vocab.trans(this.UPPER)
      vocab.merge(this.UPPER)
      const vocabData = this.map2Array(vocab.flatten()).sort((a, b) => a.info[2] - b.info[2])
      console.log(`(${Object.keys(vocabData).length})`, vocabData);
      return vocabData;
    },

    map2Array(words) {
      const array = [];
      for (const [key, value] of Object.entries(words)) {
        if (key.length >= 3 && value._) {
          array.push({ vocab: key, info: [value._, value['~'], value['@']] })
        }
      }
      return array;
    },
  },
}
</script>

<style>
.file-info {
  max-width: calc(50vw - 90px);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  box-sizing: border-box;
  color: #29296e;
  display: inline-block;
  font-size: 10px;
  font-weight: 500;
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
  font-family: 'Google Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.3px;
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

tbody .el-table_1_column_1 {
  font-size: 14px !important;
  font-weight: 500;
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
  /*background-color: #B3C0D1;*/
  /*color: #333;*/
  text-align: center;
  line-height: 60px;
}

.el-aside {
  /*background-color: #D3DCE6;*/
  /*color: #333;*/
  text-align: center;
  /*line-height: 200px;*/
}

.el-main {
  /*background-color: #E9EEF3;*/
  /*color: #333;*/
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

@media only screen  and (min-width: 896px) {
  .input-area > textarea,
  .text-input {
    height: 100vh;
    max-height: calc(100vh - 120px) !important;
    overflow: visible;
  }

  .r-table {
    max-height: calc(100vh - 176px);
    width: 100%;
  }
}

@media only screen  and (max-width: 896px) {
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
