<template>
  <div>
    <div>
      <div>
        <input type="file" id="file-input" @change="readSingleFile" />
      </div>
      <br><br>
      <div>
        <span>or input subtitles manually:</span>
        <p style="white-space: pre-line;" />
        <textarea v-model="words" placeholder="Count subtitle words frequency..." />
        <button @click="revealFreq(words)">COUNT!</button>
        <button @click="filterNone(wordsMap)">Filter</button>
      </div>
    </div>
    <h3>Statistics of the file<span style="font-size: 9px">(1 or 2 letter(s) words are ignored)</span>:</h3>
    <pre id="vocab-content">{{ vocabContent }}</pre>
    <h3>Contents of the file:</h3>
    <pre id="file-content">{{ fileContent }}</pre>
  </div>
</template>

<script>
import _ from "lodash";
import fp from "lodash/fp";

export default {
  name: "Sub",

  data() {
    return {
      fileContent: '',
      words: '',
      wordsMap: {},
      upperCase: {},
    }
  },

  computed: {
    vocabContent: function () {
      console.log(Object.keys(this.wordsMap).length);
      return JSON.stringify(this.wordsMap, null, 2).replace(/"/mg, "")
    }
  },


  methods: {
    readSingleFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fileContent = e.target.result
        this.revealFreq(this.fileContent);
      };
      reader.readAsText(file);
    },

    revealFreq(contents) {
      const combined = this.wordFreq(contents)
      const merged = this.mergeCases(this.upperCase, combined);

      this.wordsMap = this.flattenObj(merged)

      const freq = this.wordsMap;
      console.log(`(${Object.keys(freq).length})`, freq);
      // this.vocabContent = JSON.stringify(freq, null, 2).replace(/"/mg, "")


    },

    filterNone(wordsMap) {
      Object.filter = (obj, predicate) => Object.fromEntries(Object.entries(obj).filter(predicate));
      this.wordsMap = Object.filter(wordsMap, ([, [freq, id]]) => freq !== 0);
      console.log(this.wordsMap);
    },

    wordFreq(content) {
      const words = content.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || [];
      console.log('words', words)
      const lowerCase = {};
      const upperCase = {};
      const upper = /[A-Z]/
      // const quote = /['-]/
      let id = 0

      words.forEach((origin) => {
        // id += 1
        // const surface = upper.test(origin) ? upperCase : lowerCase;
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
      console.log('lowerCases', JSON.stringify(lowerCase).replace(/"/mg, ""), '\n')

      lowerCase = this.pruneEmpty(lowerCase)

      console.log('pruneEmpty', JSON.stringify(lowerCase).replace(/"/mg, ""), '\n')
      console.log('upperCases', JSON.stringify(upperCase).replace(/"/mg, ""), '\n')
      console.log('---> merge', JSON.stringify(fp.merge(upperCase, lowerCase)).replace(/"/mg, ""), '\n')

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
            } else {

              if (target.$[0] === layer.$[0]) {
                target.$ = null;
              } else {
                layer.$[0] = 0;
              }

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
              (_.isObject(value) && _.isEmpty(prune(value)))) {

            delete current[key];
          }
        });
        // remove any leftover undefined values from the delete
        // operation on an array
        if (_.isArray(current)) _.pull(current, undefined);

        return current;

      }(_.cloneDeep(obj));  // Do not modify the original object, create a clone instead
    },

    flattenObj(words) {
      console.log('trueWords', JSON.stringify(words, null, 2));

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
              target[newKey] = value;
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
    log4(obj, spc = 2, rpl = "") {
      return JSON.stringify(obj, null, spc).replace(/"/mg, rpl)
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
    // const object = {
    //   'e': {
    //     '$': [1, 1],
    //     'd': { '$': [1, 2] },
    //     // 'i': {
    //     //   '$': []
    //     // }
    //   }
    // }
    // const cc = _.isMatch({
    //   'e': {
    //     '$': [],
    //     'd': { '$': [] },
    //   },
    // }, object); // => true
    // console.log(cc)

    var dirty = {
      key1: 'AAA',
      key2: {
        key21: 'BBB'
      },
      key3: {
        key31: true,
        key32: false
      },
      key4: {
        key41: undefined,
        key42: null,
        key43: [],
        key44: {},
        key45: {
          key451: NaN,
          key452: {
            key4521: {}
          },
          key453: [{ foo: {}, bar: '' }, NaN, null, undefined]
        },
        key46: ''
      },
      key5: {
        key51: 1,
        key52: '  ',
        key53: [1, '2', {}, []],
        key54: [{ foo: { bar: true, baz: null } }, { foo: { bar: '', baz: 0 } }]
      },
      key6: function () {
      }
    };

    function pruneEmpty(obj) {
      return function prune(current) {
        _.forOwn(current, function (value, key) {
          if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) ||
              (_.isString(value) && _.isEmpty(value)) ||
              (_.isObject(value) && _.isEmpty(prune(value)))) {

            delete current[key];
          }
        });
        // remove any leftover undefined values from the delete
        // operation on an array
        if (_.isArray(current)) _.pull(current, undefined);

        return current;

      }(_.cloneDeep(obj));  // Do not modify the original object, create a clone instead
    }

    var clean = pruneEmpty(dirty);
    console.log(JSON.stringify(clean, null, 2));


  },

}
</script>

<style scoped>
#vocab-content {
  text-align: left;
  margin: auto;
  width: 300px;
}
</style>
