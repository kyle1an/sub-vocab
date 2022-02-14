<template>
  <div>
    <div>
      <div>
        <input type="file" id="file-input" @change="readSingleFile" />
      </div>
      <br>
      <br>
      <div>
        <span>or input subtitles manually:</span>
        <p style="white-space: pre-line;" />
        <textarea v-model="words" placeholder="Count subtitle words frequency..."></textarea>
        <button style="position: absolute" @click="displayContents(words)">Count</button>
      </div>
    </div>
    <h3>Statistics of the file:</h3>
    <pre id="vocab-content"></pre>
    <h3>Contents of the file:</h3>
    <pre id="file-content"></pre>
  </div>
</template>

<script>
// const natural = require('natural');
// import {stemmer} from 'stemmer';
export default {
  name: "Sub",
  data() {
    return {
      words: '',
    }
  },
  mounted() {
    // console.log(natural.LancasterStemmer.stem("detestable")); // stem a single word
    // stemmer = natural.PorterStemmer;
    // var stem = stemmer.stem('stems');
    // console.log(stem);
  },

  methods: {
    readSingleFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target.result;
        this.displayContents(contents);
        // console.log(contents)
      };
      reader.readAsText(file);
    },

    displayContents(contents) { // getWords
      document.getElementById('file-content').textContent = contents

      let words = this.getWords(contents)
      // document.getElementById('file-content').textContent = words.join(' ')
      console.log(typeof words);

      let freq = this.wordFreq(words)
      console.log('----', freq);
      // str = JSON.stringify(obj);
      let str = JSON.stringify(freq, null, 4); // (Optional) beautiful indented output.
      str = str.replace(/"/mg, "")
      console.log('str', str)
      console.log(str); // Logs output to dev tools console.

      document.getElementById('vocab-content').textContent = str

      console.log(Object.keys(freq).sort((a, b) => a.length - b.length))
      const ordered = Object.keys(freq).sort((a, b) => a.length - b.length).reduce(
          (obj, key) => {
            obj[key] = freq[key];
            return obj;
          }, {}
      );
      console.log('sort', ordered);// → '{"a":"baz","b":"foo","c":"bar"}'
    },

    getWords(content) {
      // const regex = /(?<=^|[\s])[a-zA-Z]{2,}(?=[\s]|$)/mg; new RegExp('ab+c', 'i') // constructor
      // const re = '(?<=^|[\s])[a-zA-Z]+(-?[a-zA-Z]+)+(?=[\s]|$)'
      // const reges = new RegExp(re, 'i')
      const regex = /(?<=^|[\s,.])[a-zA-Z]+(-?[a-zA-Z]+'?)+(?=[\s,.]|$)/mg;

      let words = content.match(regex);
      console.log('filter', words);
      return words;
    },

    wordFreq(words) {
      const freqMap = words.reduce((p, w) => {
        p[w] = (p[w] || 0) + 1;
        return p;
      }, {});

      const reg1 = /^.*[^\s\n](?=(es|ed|ing|ly)$)/mg
      const reg2 = /^.*[^\s\n](?=(s)$)/mg
      const reg3 = /^[A-Z][a-z]+$/mg
      const vocabFreq = {};
      for (let [v, freq] of Object.entries(freqMap)) {
        let w = v
        if (reg3.test(w)) {
          w = w.toLowerCase();
          if (Object.hasOwn(freqMap, w)) {
            if (w.length >= 3) vocabFreq[w] = (vocabFreq[w] || 0) + freq;
            continue
          }
        }

        if (reg1.test(w)) {
          let rt = w.match(reg1)?.[0];
          if (Object.hasOwn(freqMap, rt)) {
            w = rt
          } else if (Object.hasOwn(freqMap, rt + 'e')) {
            w = rt + 'e'
          } else {
            w = v
          }
        } else if (reg2.test(w)) {
          let rt = w.match(reg2)?.[0];
          if (Object.hasOwn(freqMap, rt)) {
            w = rt
          } else {
            w = v
          }
        }

        if (w.length >= 3) vocabFreq[w] = (vocabFreq[w] || 0) + freq;
      }

      return vocabFreq;
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
