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
import fp from "lodash/fp";

export default {
  name: "Sub",

  data() {
    return {
      fileContent: '',
      words: '',
      wordsMap: {},
    }
  },

  computed: {
    vocabContent: function () {
      console.log(Object.keys(this.wordsMap).length);
      return JSON.stringify(this.wordsMap, null, 2).replace(/"/mg, "")
    }
  },

  mounted() {
    const object = {
      'e': {
        '$': [1, 1],
        'd': { '$': [1, 2] },
        // 'i': {
        //   '$': []
        // }
      }
    }
    const cc = fp.isMatch({
      'e': {
        '$': [],
        'd': { '$': [] },
      },
    }, object); // => true
    console.log(cc)
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
      this.wordsMap = this.flattenObj(this.wordFreq(contents))
      const freq = this.wordsMap;
      console.log(`(${Object.keys(freq).length})`, freq);
      // this.vocabContent = JSON.stringify(freq, null, 2).replace(/"/mg, "")
    },

    filterNone(wordsMap) {
      Object.filter = (obj, predicate) => Object.fromEntries(Object.entries(obj).filter(predicate));

      const scores = {
        John: 2, Sarah: 3, Janet: 1
      };

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
        id += 1
        try {
          let layer = upper.test(origin) ? upperCase : lowerCase;
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
            return;
          }
          layer = layer[c]
          if (!Object.hasOwn(layer, '$')) {
            layer['$'] = [1, id]
            return;
          }
          // const { $ } = layer
          // $[Object.keys($)] += 1;
          layer.$[0] += 1;
          // console.log(JSON.stringify(lowerCase).replace(/"/mg, ""), '\n', JSON.stringify(layer).replace(/"/mg, ""))
        } catch (e) {
          console.log(id, origin)
          console.log(e)
        }
      })
      // console.log(JSON.stringify(lowerCase).replace(/"/mg, ""), '\n')
      // console.log(JSON.stringify(upperCase).replace(/"/mg, ""), '\n')
      // console.log('_', JSON.stringify(lowerCase, null, 2).replace(/"/mg, ""));
      // this.mergeCases(lowerCase, upperCase)
      return this.mergeCases(lowerCase, upperCase)
    },

    mergeCases(lowerCase, upperCase) {
      // console.log('upperCase', JSON.stringify(upperCase, null, 2).replace(/"/mg, ""));
      // console.log('target', JSON.stringify(lowerCase, null, 2).replace(/"/mg, ""));

      function traverseAndMerge(currentNode, target) {
        for (const k in currentNode) {
          debugger
          const lk = k.toLowerCase()
          if (Object.hasOwn(target, lk)) {
            // console.log('currentNode', JSON.stringify(currentNode, null, 2).replace(/"/mg, ""));
            // console.log('target hasOwn', k, JSON.stringify(target, null, 2).replace(/"/mg, ""));

            if (k === '$') {
              target.$[0] += currentNode.$[0];
              target.$[1] = currentNode.$[1] = Math.min(currentNode.$[1], target.$[1])
              currentNode.$[0] = 0;
              // if (1) {
              //
              // }
            } else {
              traverseAndMerge(currentNode[k], target[lk]);
            }
          } else {
            // console.log('currentNode', JSON.stringify(currentNode, null, 2).replace(/"/mg, ""));
            // console.log('target notOwn', k, JSON.stringify(target, null, 2).replace(/"/mg, ""));
          }
        }
        // console.log('target final', JSON.stringify(target, null, 2).replace(/"/mg, ""));
        // console.log('upperCase final', JSON.stringify(currentNode, null, 2).replace(/"/mg, ""));
        return fp.merge(currentNode, target);
      }

      debugger
      return traverseAndMerge(upperCase, lowerCase);
    },

    flattenObj(test) {
      console.log('trueWords', JSON.stringify(test, null, 2));

      function traverseAndFlatten(currentNode, target, flattenedKey) {
        for (const key in currentNode) {
          if (Object.hasOwn(currentNode, key)) {
            const is$ = key === '$'; // stop at $
            const newKey = (flattenedKey || '') + (is$ ? '' : key);
            const value = currentNode[key];
            mergeFreq(value);

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

      const flattened = flatten(test);
      console.log('flattened', JSON.stringify(flattened, null, 2).replace(/"/mg, ""));
      return flattened;

      function mergeFreq(layer) {
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
      }
    },
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
