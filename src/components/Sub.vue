<template>
  <div style="margin: 10px auto;max-width: 1440px">
    <el-container>
      <el-header>
        <input type="file" id="file-input" @change="readSingleFile" />
      </el-header>
      <el-container>
        <el-container style="position: relative">
          <el-header class="el-card is-always-shadow" style="margin: 20px 20px 0 20px">
            <el-switch v-model="isFilter" active-text="Filter common words" inactive-text="">
            </el-switch>
          </el-header>
          <el-main>
            <div class="text-input" style="position: relative">
              <div class="submit">
                <el-button @click="getFreq(inputContent)" type="primary" icon="el-icon-check" circle />
              </div>
              <el-input class="textarea" type="textarea" :rows="12" placeholder="input subtitles manually:" v-model="inputContent" />
            </div>
          </el-main>
        </el-container>
        <el-aside width="42%">
          <el-card style="margin: 20px 10px 10px 10px;">
            <el-table height="calc(100vh - 182px)" :data="vocabContent" style="width: 100%" size="mini">
              <el-table-column prop="vocab" label="Vocabulary" sortable width="150" align="right" :sort-method="sortByChar" style="font-size: 14px !important;" />
              <el-table-column prop="info.0" label="Times" sortable width="80" align="right" class-name="t-num" />
              <el-table-column prop="info.1" label="Length" sortable width="100" align="center" style="width: 100%" />
            </el-table>
          </el-card>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { WordTree } from "@/utils/WordTree.js";
import { pruneEmpty, deDuplicate, print, stringify } from '@/utils/utils';
import { deAffix, clearSuffix } from "@/components/ignoreSuffix";
import _ from 'lodash/fp';

export default {
  name: 'Sub',
  data() {
    return {
      inputContent: '',
      wordsMap: {},
      wordsJson: {},
      commonList: '',
      commonMap: {},
      seq: 1,
      isFilter: true,
      i: { '@': 1 }
    }
  },

  computed: {
    vocabContent: function () {
      return Object.entries(this.wordsMap)
          .map(([k, v]) => ({ vocab: k, info: [v._, v['~'], v['@']] }))
          .sort((a, b) => a.info[2] - b.info[2])
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
    const myRec = await fetch('../myWords.txt', init).then((response) => response.text());
    // this.commonMap = this.buildMap(w1k.concat(myRec))
    this.commonMap = new WordTree(w1k.concat(myRec), { '@': 1 })

    const newWords = await fetch('../newWords.txt', init).then((response) => response.text());
    // const myArray = deDuplicate(myWords.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg).sort());
    // console.log('myArray');
    // console.log(myArray.join("\r\n"));
    // console.log(this.flattenObj(this.commonMap))
    // this.filter(this.wordsJson, this.commonMap)
    // pruneEmpty(this.commonMap)
    // console.log(this.flattenObj(this.commonMap))
    // const print = (m, space = 0) => console.log(JSON.stringify(m, null, space).replace(/"/mg, ""))
    const id = { '@': 1 }
    const t = new WordTree('say ok', id)
    const t2 = new WordTree('Say Say dd', id)
    t.add('')

    t.trans(t2)
    t.filter(t2, 0)
  },

  methods: {
    sortByChar(a, b) {
      return a['vocab'].localeCompare(b['vocab'], 'en', { sensitivity: 'base' })
    },

    readSingleFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.inputContent = e.target.result
        this.getFreq(this.inputContent);
      };
      reader.readAsText(file);
    },

    getFreq(contents) {
      const freqTree = this.formTree(contents)
      console.log('freqTree', stringify(freqTree));
      this.wordsMap = freqTree.flatten()
      // console.log('Before', stringify(this.wordsMap));
      this.filterWords(this.wordsMap)
      // console.log('After', stringify(this.wordsMap));

      console.log(`(${Object.keys(this.wordsMap).length})`, this.wordsMap);
    },

    filterWords(wordsMap) {
      Object.filter = (obj, predicate) => Object.fromEntries(Object.entries(obj).filter(predicate));
      this.wordsMap = Object.filter(wordsMap, ([key, i]) => i._ !== 0 && key.length >= 3);
      console.log(Object.keys(this.wordsMap).length);
      console.log(this.wordsMap);
    },

    formTree(content) {
      const i = { '@': 1 }
      const words = content.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || [];
      const tl = new WordTree('', i)
      const tU = new WordTree('', i)
      words.forEach((origin) => {
        if (/[A-Z']/.test(origin)) {
          tU.add(origin)
          origin = origin.toLowerCase()
        }
        tl.add(origin)
      })
      tl.deAffix()
      if (this.isFilter) tl.filter(this.commonMap)
      tl.trans(tU)
      tl.pruneEmpty()
      tU.pruneEmpty()
      i['@'] = 1
      tl.merge(tU)
      return tl
    },
  },
}
</script>

<style>
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
  width: 33px !important;
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

.el-card__body {
  padding-left: 10px !important;
  padding-right: 10px !important;
}

.el-table__empty-block {
  margin: auto;
}

@media only screen  and (min-width: 896px) {
  .textarea,
  .textarea > textarea,
  .text-input {
    height: 100vh;
    max-height: calc(100vh - 220px);
    overflow: visible;
  }
}

@media only screen  and (max-width: 896px) {
  .submit {
    top: unset;
    right: unset;
    bottom: -20px;
    width: 100%;
  }

  .textarea > textarea,
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
