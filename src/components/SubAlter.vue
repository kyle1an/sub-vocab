<template>
  <div style="margin: 10px auto;max-width: 1440px">
    <el-container>
      <el-header>
        <!--        <label for="file-input" class="custom-file-upload">-->
        <!--          Custom Upload-->
        <!--        </label>-->
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
                <el-button @click="revealFreq(inputContent)" type="primary" icon="el-icon-check" circle />
              </div>
              <el-input class="textarea" type="textarea" :rows="12" placeholder="input subtitles manually:" v-model="inputContent" />
            </div>
          </el-main>
        </el-container>

        <el-aside width="42%">
          <el-card style="margin: 20px 10px 10px 10px;">
            <el-table height="calc(100vh - 182px)" :data="vocabContent" style="width: 100%" size="mini" :default-sort="{prop: 'info.1', order: 'ascending'}">
              <el-table-column prop="vocab" label="Vocabulary" sortable width="150" align="right" :sort-method="sortByChar" style="font-size: 14px !important;" />
              <el-table-column prop="info.0" label="Times" sortable width="80" align="right" class-name="t-num" />
              <el-table-column prop="info.1" label="Sequence" sortable width="100" align="center" style="width: 100%" />
            </el-table>
          </el-card>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { pruneEmpty, obj2Array, deDuplicate } from './utils';
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
      isFilter: true
    }
  },

  computed: {
    vocabContent: function () {
      return obj2Array(this.wordsMap, 'vocab', 'info').sort((a, b) => a.info[1] - b.info[1])
    }
  },

  async mounted() {
    this.wordsJson = await fetch('../words.json', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then((response) => response.json());
    console.log('wordsJson', this.wordsJson);

    this.wordsList = (await fetch('../common-words.txt', {
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      }
    }).then((response) => response.text()))
        .concat(await fetch('../myWords.txt', {
          headers: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json'
          }
        }).then((response) => response.text()))

    // console.log('wordsJson', this.wordsList);
    this.commonMap = this.buildMap(this.wordsList)
    // console.log(this.commonMap)

    const myWords = await fetch('../myWords.txt', {
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      }
    }).then((response) => response.text());
    const myArray = deDuplicate(myWords.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg).sort());
    console.log('myArray');
    console.log(myArray.join("\r\n"));
    // console.log(this.flattenObj(this.commonMap))
    // this.filter(this.wordsJson, this.commonMap)
    // pruneEmpty(this.commonMap)
    // console.log(this.flattenObj(this.commonMap))
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
        this.revealFreq(this.inputContent);
      };
      reader.readAsText(file);
    },

    revealFreq(contents) {
      const freqTree = this.freqTree(contents)
      this.wordsMap = this.flattenObj(freqTree);
      this.filterWords(this.wordsMap)
      const freq = this.wordsMap;
      console.log(`(${Object.keys(freq).length})`, freq);
    },

    filterWords(wordsMap) {
      Object.filter = (obj, predicate) => Object.fromEntries(Object.entries(obj).filter(predicate));
      this.wordsMap = Object.filter(wordsMap, ([key, [freq,]]) => freq !== 0 && key.length >= 3);
      console.log(Object.keys(this.wordsMap).length);
      console.log(this.wordsMap);
    },

    freqTree(content) {
      const words = content.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || [];
      console.log('words', words)
      const loweredCase = {};
      const upperCase = {};
      const upper = /[A-Z]/
      words.forEach((origin) => {
        if (upper.test(origin)) {
          this.wrapLayer(origin, upperCase)
          origin = origin.toLowerCase()
        }
        this.wrapLayer(origin, loweredCase)
      })
      console.log(JSON.stringify(loweredCase).replace(/"/mg, ""), '\n')
      console.log(JSON.stringify(upperCase).replace(/"/mg, ""), '\n')
      this.deAffix(loweredCase)
      if (this.isFilter) {
        // this.filterCommon(this.wordsJson, loweredCase)
        this.filterCommon(this.commonMap, loweredCase, '$')
      }
      this.emigrate(upperCase, loweredCase)
      pruneEmpty(loweredCase, true)
      this.seq = 1;
      return _.merge(upperCase, loweredCase)
    },

    wrapLayer(origin, layer) {
      const chars = [...origin].reverse();
      while (chars.length > 0) {
        const c = chars.pop()
        if (!Object.hasOwn(layer, c)) layer[c] = {}
        layer = layer[c]
      }
      if (!Object.hasOwn(layer, '$')) {
        layer.$ = [1, this.seq]
        this.seq += 1
        return;
      }
      layer.$[0] += 1;
    },

    buildMap(list) {
      const words = list.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || [];
      const layer = {};
      words.forEach((origin) => this.buildLayer(origin, layer))
      return layer;
    },

    buildLayer(origin, layer) {
      const chars = [...origin].reverse();
      while (chars.length > 0) {
        const c = chars.pop()
        if (!Object.hasOwn(layer, c)) layer[c] = {}
        layer = layer[c]
      }
      if (!Object.hasOwn(layer, '$')) {
        layer.$ = [1,]
        // this.seq += 1
        return;
      }
      layer.$[0] += 1;
    },

    filterCommon(layer, target, TER = 'end') {
      this.clearSuffix(target, layer, TER);
      for (const key in layer) {
        const k = key === TER ? '$' : key
        if (Object.hasOwn(target, k)) {
          if (key !== TER) {
            this.filterCommon(layer[key], target[key], TER)
          } else {
            target.$[0] = 0;
          }
        }
      }
    },

    emigrate(layer, target) {
      for (const key in layer) {
        const k = key.toLowerCase();
        if (Object.hasOwn(target, k)) {
          if (k !== '$') {
            this.emigrate(layer[key], target[k])
          } else if (target.$[0] === layer.$[0]) {
            target.$ = null;
          } else {
            target.$[1] = Math.min(layer.$[1], target.$[1])
            layer.$[0] = 0;
          }
        }
      }
    },

    flattenObj(tree) {
      const flattenedObject = {};
      console.log('flatten', JSON.stringify(tree, null, 0).replace(/"/mg, ""));
      this.traverseAndFlatten(tree, flattenedObject);
      console.log('flattened', JSON.stringify(flattenedObject, null, 0).replace(/"/mg, ""));
      return flattenedObject;
    },

    traverseAndFlatten(currentNode, target, flattenedKey) {
      for (const key in currentNode) {
        if (Object.hasOwn(currentNode, key)) {
          const is$ = key === '$'; // stop at $
          const newKey = (flattenedKey || '') + (is$ ? '' : key);
          const value = currentNode[key];
          // mergeSuffix(value);
          if (typeof value === 'object' && !is$) {
            this.traverseAndFlatten(value, target, newKey);
          } else {
            target[newKey] = value; // $:[] -> $: Frequency
          }
        }
      }
    },

    clearSuffix(layer, base, TER = 'end') {
      if (base?.[TER]) {
        const w = layer
        if (w?.$) w.$[0] = 0
        if (w?.e?.d?.$) w.e.d.$[0] = 0
        if (w?.e?.s?.$) w.e.s.$[0] = 0
        if (w?.i?.n?.g?.$) w.i.n.g.$[0] = 0
        if (w?.s?.$) w.s.$[0] = 0
      }

      if (base?.e?.[TER]) {
        const e = layer?.e;
        if (e) {
          if (e?.$) e.$[0] = 0
          if (e?.d?.$) e.d.$[0] = 0
          if (e?.s?.$) e.s.$[0] = 0
        }
        const ing = layer?.i?.n?.g
        if (ing) {
          if (ing?.$) ing.$[0] = 0
          if (ing?.s?.$) ing.s.$[0] = 0
        }
      }
    },

    deAffix(layer) {
      for (const k in layer) {
        const value = layer[k]
        this.mergeSuffix(value)
        this.deAffix(value, layer);
      }
    },

    mergeSuffix(layer) {
      const $ = { '$': [] }
      const ed = [{
        ...$,
        'e': { 'd': $ },
      }, {
        'e': {
          ...$,
          'd': $,
        },
      },]
      const ing = [{
        ...$,
        'i': { 'n': { 'g': $ } },
      }, {
        ...ed[0],
        'i': { 'n': { 'g': $ } },
      }, {
        ...ed[1],
        'i': { 'n': { 'g': $ } },
      }]
      const edMod = (l) => {
        if (_.isMatch(ed[0], l)) {
          l.$[0] += l.e.d.$[0]
          l.e.d.$[0] = 0
        } else if (_.isMatch(ed[1], l)) {
          l.e.$[0] += l.e.d.$[0]
          l.e.d.$[0] = 0
        }
      }
      const ingMod = (l) => {
        if (_.isMatch(ing[0], l)) {
          l.$[0] += l.i.n.g.$[0]
          l.i.n.g.$[0] = 0
        } else if (_.isMatch(ing[1], l)) {
          l.$[0] += l.i.n.g.$[0] + l.e.d.$[0]
          l.i.n.g.$[0] = 0
          l.e.d.$[0] = 0
        } else if (_.isMatch(ing[2], l)) {
          l.e.$[0] += l.i.n.g.$[0] + l.e.d.$[0]
          l.i.n.g.$[0] = 0
          l.e.d.$[0] = 0
        }
      }
      const sMod = (l) => {
        if (_.isMatch({
          ...$,
          's': $
        }, l)) {
          l.$[0] += l.s.$[0]
          l.s.$[0] = 0
        }
      }
      const merge = () => {
        sMod(layer);
        edMod(layer);
        ingMod(layer);
      }
      merge();
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
