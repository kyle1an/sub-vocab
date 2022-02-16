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
        <button style="position: absolute" @click="displayContents(words)">Count</button>
      </div>
    </div>
    <h3>Statistics of the file<span style="font-size: 9px">(1 or 2 letter(s) words are ignored)</span>:</h3>
    <pre id="vocab-content"></pre>
    <h3>Contents of the file:</h3>
    <pre id="file-content"></pre>
  </div>
</template>

<script>
export default {
  name: "Sub",
  data() {
    return {
      words: '',
    }
  },

  mounted() {
  },

  methods: {
    readSingleFile(e) {

      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target.result;
        this.displayContents(contents);
      };
      reader.readAsText(file);
    },

    displayContents(contents) { // getWords
      document.getElementById('file-content').textContent = contents
      let freq = this.wordFreq(contents)
      console.log(`(${Object.keys(freq).length})`, freq);

      let str = JSON.stringify(freq, null, 2); // (Optional) beautiful indented output.
      document.getElementById('vocab-content').textContent = str.replace(/"/mg, "")
    },

    wordFreq(content) {
      const words = content.match(/[a-zA-Z]+(?:-?[a-zA-Z]+'?)+/mg) || [];

      console.log('words', words)
      // const upper = /^[a-z]*(?:[A-Z][a-z]*)+$/mg
      const upper = /[A-Z]/
      const quote = /['-]/
      const lowerCase = {};
      const upperCase = {};
      const quoteCase = {};
      let id = 0

      words.forEach((origin) => {
        const inCase = upper.test(origin) ? upperCase :
            quote.test(origin) ? quoteCase : lowerCase;
        if (!Object.hasOwn(inCase, origin)) {
          inCase[origin] = [id + 1, 1]
        } else {
          inCase[origin][1] += 1
        }
        id += 1;
      })

      console.log('======= GOT IT =======')
      for (const [Key, Info] of Object.entries(upperCase)) {
        for (const [key, info] of Object.entries(lowerCase)) {
          if (Key.toLowerCase() === key) {
            const [ID, Freq] = Info
            const [id,] = info
            info[1] += Freq
            if (ID < id) info[0] = ID
            delete upperCase[Key]
          }
        }
      }

      const result = [];
      for (const [key, [id, freq]] of Object.entries(upperCase)) {
        result[id] = [key, freq]
      }
      for (const [key, [id, freq]] of Object.entries(lowerCase)) {
        result[id] = [key, freq]
      }
      for (const [key, [, freq]] of Object.entries(quoteCase)) {
        result.push([key, freq])
      }

      return this.array2Obj(result.filter(n => n[0].length >= 3));
    },

    array2Obj(array) {
      const obj = {}
      array.forEach(([key, freq]) => {
        obj[key] = freq
      })
      return obj
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
