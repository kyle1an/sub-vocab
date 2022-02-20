<template>
  <div style="margin-top: 10px">
    <el-container>
      <el-header>
        <input type="file" id="file-input" @change="readSingleFile" />
      </el-header>

      <el-container>
        <el-container>
          <el-main>
            <div style="position: relative">
              <div class="submit">
                <el-button @click="revealFreq(inputContent)" type="primary" icon="el-icon-check" circle />
              </div>
              <el-input type="textarea" :rows="2" :autosize="{ minRows: 10, maxRows: 100}" placeholder="input subtitles manually:" v-model="inputContent" />
            </div>
          </el-main>
        </el-container>

        <el-aside width="42%">
          <div style="margin: 20px 10px 10px 10px">
            <el-card>
              <el-table :data="vocabContent" style="width: 100%" size="mini" :default-sort="{prop: 'info.1', order: 'ascending'}">
                <el-table-column prop="vocab" label="Vocabulary" sortable width="150" align="right" :sort-method="sortByChar" style="font-size: 14px !important;" />
                <el-table-column prop="info.0" label="Frequency" sortable width="100" align="right" />
                <el-table-column prop="info.1" label="Sequence" sortable width="100" align="center" style="width: 100%" />
              </el-table>
            </el-card>
          </div>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import _ from "lodash";
import fp from "lodash/fp";

export default {
  name: "Sub",
  data() {
    return {
      inputContent: '',
      wordsMap: {},
      upperCase: {},
      tableData: [],
    }
  },

  computed: {
    vocabContent: function () {
      return this.obj2Array(this.wordsMap, 'vocab', 'info').sort((a, b) => a.info[1] - b.info[1])
    }
  },

  methods: {
    sortByChar: function (a, b) {
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
      const combined = this.wordFreq(contents)
      const merged = this.mergeCases(this.upperCase, combined);
      this.wordsMap = this.flattenObj(merged)
      this.filterWords(this.wordsMap)
      const freq = this.wordsMap;
      console.log(`(${Object.keys(freq).length})`, freq);
    },

    obj2Array(obj, key = 'key', value = 'value') {
      let a = [], info;
      for (const k in obj) {
        info = {};
        info[key] = k;
        info[value] = obj[k];
        a.push(info);
      }
      return a;
    },

    filterWords(wordsMap) {
      Object.filter = (obj, predicate) => Object.fromEntries(Object.entries(obj).filter(predicate));
      this.wordsMap = Object.filter(wordsMap, ([key, [freq,]]) => freq !== 0 && key.length >= 3);
      console.log(Object.keys(this.wordsMap).length);
      console.log(this.wordsMap);
    },

    wordFreq(content) {
      const words = content.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || [];
      console.log('words', words)
      const lowerCase = {};
      const upperCase = {};
      const upper = /[A-Z]/
      let id = 1
      words.forEach((origin) => {
        if (upper.test(origin)) {
          wrapLayer(origin, upperCase)
          origin = origin.toLowerCase()
        }
        wrapLayer(origin, lowerCase)
      })
      this.upperCase = upperCase;
      console.log(JSON.stringify(lowerCase).replace(/"/mg, ""), '\n')
      console.log(JSON.stringify(upperCase).replace(/"/mg, ""), '\n')
      // console.log('_', JSON.stringify(lowerCase, null, 2).replace(/"/mg, ""));
      // this.mergeCases(lowerCase, upperCase)
      return lowerCase;

      function wrapLayer(origin, layer) {
        const chars = [...origin].reverse();
        const l = chars.length;
        // console.log('----- chars:', JSON.stringify(chars).replace(/"/mg, ""))
        for (let i = 0; i < l - 1; i++) {
          const c = chars.pop()
          if (!Object.hasOwn(layer, c)) layer[c] = {}
          layer = layer[c]
        }
        // console.log(JSON.stringify(layer),'\n','----- chars:', JSON.stringify(chars).replace(/"/mg, ""),'\n',JSON.stringify(chars))
        const c = chars.pop()
        if (!Object.hasOwn(layer, c)) {
          layer[c] = { $: [1, id] }
          id += 1
          return;
        }
        layer = layer[c]
        if (!Object.hasOwn(layer, '$')) {
          layer['$'] = [1, id]
          id += 1
          return;
        }
        // const { $ } = layer
        // $[Object.keys($)] += 1;
        layer.$[0] += 1;
        // console.log(JSON.stringify(lowerCase).replace(/"/mg, ""), '\n', JSON.stringify(layer).replace(/"/mg, ""))
      }
    },

    mergeCases(upperCase, lowerCase) {
      const vm = this;
      deAffix(lowerCase)
      lookupWrap(upperCase, lowerCase)
      // console.log('lowerCases', JSON.stringify(lowerCase).replace(/"/mg, ""), '\n')
      lowerCase = this.pruneEmpty(lowerCase)
      // console.log('pruneEmpty', JSON.stringify(lowerCase).replace(/"/mg, ""), '\n')
      // console.log('upperCases', JSON.stringify(upperCase).replace(/"/mg, ""), '\n')
      // console.log('---> merge', JSON.stringify(fp.merge(upperCase, lowerCase)).replace(/"/mg, ""), '\n')
      return fp.merge(upperCase, lowerCase)

      function deAffix(layer) {
        for (const k in layer) {
          const value = layer[k]
          vm.mergeFreq(value)
          deAffix(value, layer);
        }
      }

      function lookupWrap(layer, target) {
        for (const key in layer) {
          const k = key.toLowerCase();
          if (Object.hasOwn(target, k)) {
            if (k !== '$') {
              lookupWrap(layer[key], target[k])
            } else if (target.$[0] === layer.$[0]) {
              target.$ = null;
            } else {
              target.$[1] = Math.min(layer.$[1], target.$[1])
              layer.$[0] = 0;
            }
          }
        }
      }
    },

    pruneEmpty(obj) {
      return function prune(current) {
        _.forOwn(current, function (value, key) {
          if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) ||
              (_.isString(value) && _.isEmpty(value)) ||
              (_.isObject(value) && _.isEmpty(prune(value)))
          ) {
            delete current[key];
          }
        });
        // remove any leftover undefined values from the delete operation on an array
        if (_.isArray(current)) _.pull(current, undefined);
        return current;
      }(_.cloneDeep(obj));  // Do not modify the original object, create a clone instead
    },

    flattenObj(words) {
      // console.log('trueWords', JSON.stringify(words, null, 2));

      function traverseAndFlatten(currentNode, target, flattenedKey) {
        for (const key in currentNode) {
          if (Object.hasOwn(currentNode, key)) {
            const is$ = key === '$'; // stop at $
            const newKey = (flattenedKey || '') + (is$ ? '' : key);
            const value = currentNode[key];
            // mergeFreq(value);
            if (typeof value === 'object' && !is$) {
              traverseAndFlatten(value, target, newKey);
            } else {
              target[newKey] = value; // $:[] -> $: Frequency
            }
          }
        }
      }

      function flatten(obj) {
        const flattenedObject = {};
        traverseAndFlatten(obj, flattenedObject);
        return flattenedObject;
      }

      const flattened = flatten(words);
      console.log('flattened', JSON.stringify(flattened, null, 0).replace(/"/mg, ""));
      return flattened;
    },

    mergeFreq(layer) {
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
        if (fp.isMatch(ed[0], l)) {
          l.$[0] += l.e.d.$[0]
          l.e.d.$[0] = 0
        } else if (fp.isMatch(ed[1], l)) {
          l.e.$[0] += l.e.d.$[0]
          l.e.d.$[0] = 0
        }
      }
      const ingMod = (l) => {
        if (fp.isMatch(ing[0], l)) {
          l.$[0] += l.i.n.g.$[0]
          l.i.n.g.$[0] = 0
        } else if (fp.isMatch(ing[1], l)) {
          l.$[0] += l.i.n.g.$[0] + l.e.d.$[0]
          l.i.n.g.$[0] = 0
          l.e.d.$[0] = 0
        } else if (fp.isMatch(ing[2], l)) {
          l.e.$[0] += l.i.n.g.$[0] + l.e.d.$[0]
          l.i.n.g.$[0] = 0
          l.e.d.$[0] = 0
        }
      }
      const sMod = (l) => {
        if (fp.isMatch({
          ...$,
          's': $
        }, l)) {
          l.$[0] += l.s.$[0]
          l.s.$[0] = 0
        }
      }
      sMod(layer)
      edMod(layer)
      ingMod(layer)
    },
  },

  mounted() {
  },

}
</script>

<style>
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
  font-variant-numeric: tabular-nums;
}

el-table, el-table * {
  font-variant-numeric: tabular-nums;
}

table thead {
  font-size: 10px !important;
}

.el-table th.el-table__cell > .cell {
  font-size: 10px;
}

.el-card__body {
  padding: 10px !important;
}

.el-table__empty-block {
  margin: auto;
}

@media only screen  and (max-width: 800px) {
  .submit {
    top: unset;
    right: unset;
    bottom: -20px;
    width: 100%;
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
