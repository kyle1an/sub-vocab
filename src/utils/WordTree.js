export default class WordTree {
  root = {};
  #wordsOfUppercase = {};
  #sequence = 1;
  wordsList = [];

  constructor(words) {
    if (words) this.add(words)
  }

  add = (newWords) => {
    for (const sentence of newWords.match(/["'A-Za-z](?:[\w"',:\r \n]*(?:[-.](?=[A-Za-z.])|\.{3} *)*[A-Za-zÀ-ÿ])+[!?.,"']*/mg) || []) {
      for (const m of sentence.matchAll(/((?:[A-Za-z]['-]?)*(?:[A-Z]+[a-z]*)+(?:-?[A-Za-z]'?)+)|[a-z]+(?:-?[a-z]'?)+/mg)) {
        this.#insert(m[1] ? m[1].toLowerCase() : m[0], this.root, sentence)
        if (m[1]) this.#wordsOfUppercase[m[1]] = (this.#wordsOfUppercase[m[1]] ??= 0) + 1;
      }
    }

    return this;
  };

  #insert = (word, branch, sentence) => {
    for (const c of word.split('')) {
      branch = branch[c] ??= {};
    }
    (branch.$ ??= { freq: 0, len: word.length, seq: ++this.#sequence, src: [] }).freq += 1
    branch.$.src.push(sentence);
  }

  formLists = (sieve) => {
    if (sieve) {
      for (const [...word] of Array.isArray(sieve) ? sieve : sieve.toLowerCase().split(' ')) {
        let branch = this.root
        const lastChar = word.pop();
        if (word.every((c) => branch = branch[c])) {
          this.filterCommonWords(branch, lastChar)
        }
      }
    }

    const filtered = [];
    const common = [];
    this.#extractUppercase();
    this.#traverseAndFlattenLowercase(this.root, '');
    for (const v of this.wordsList.sort((a, b) => a.seq - b.seq)) {
      (!v.F && v.len > 2 ? filtered : common).push(v)
    }
    return [this.wordsList, filtered, common];
  }

  #extractUppercase = (uppercase = this.#wordsOfUppercase) => {
    for (const key in uppercase) {
      let branch = this.root;

      for (const c of key.toLowerCase().split('')) {
        branch = branch[c]
      }

      if (branch.$.freq === uppercase[key]) {
        this.wordsList.push({ w: key, ...branch.$ })
        branch.$ = false;
      }
    }
  }

  #traverseAndFlattenLowercase = (node, concatKey) => {
    for (const k in node) {
      if (k !== '$') {
        this.#traverseAndFlattenLowercase(node[k], concatKey + k);
      } else if (node.$.freq) {
        this.wordsList.push({ w: concatKey, ...node.$ })
      }
    }
  }

  filterCommonWords(O, lastChar) {
    O = (lastChar === 'e') ? O : O?.[lastChar];

    for (const $ of [
      ...(lastChar === 'e' ? [O?.e?.$] : [O?.$, O?.s?.$]),
      O?.e?.d?.$,
      O?.e?.s?.$,
      O?.i?.n?.g?.$,
      O?.i?.n?.g?.s?.$,
    ]) if ($) $.F = true
  }

  mergeSuffixes = (layer = this.root) => {
    for (const key in layer) if (key !== '$') {
      const innerLayer = layer[key]
      this.mergeSuffixes(innerLayer);
      this.mergeVocabOfDifferentSuffixes(innerLayer)
    }
  }

  mergeVocabOfDifferentSuffixes = (O) => {
    const ing = O?.i?.n?.g;
    const ed$ = O?.e?.d?.$;
    const s$ = O?.s?.$;
    if (s$) {
      for (const x$ of [
        ed$,
        ing?.$,
        ing?.s?.$,
      ]) {
        if (x$) {
          (O.$ ??= { freq: 0, len: s$.len - 1, seq: s$.seq, src: [] }).freq += x$.freq + s$.freq;
          O.$.src = O.$.src.concat(s$.src, x$.src)
          s$.freq = x$.freq = null;
        }
      }
    }

    const e$ = O?.e?.$;
    if (e$) {
      for (const x$ of [
        ed$,
        ing?.$,
      ]) if (x$) {
        e$.freq += x$.freq
        e$.src = e$.src.concat(x$.src)
        x$.freq = null
        if (e$.seq > x$.seq) e$.seq = x$.seq
      }
    }

    const $ = O?.$;
    if ($) {
      for (const x$ of [
        s$,
        ed$,
        ing?.$,
        ing?.s?.$,
        O?.["'"]?.s?.$,
        O?.["'"]?.l?.l?.$,
        O?.["'"]?.v?.e?.$,
        O?.["'"]?.d?.$,
      ]) if (x$) {
        $.freq += x$.freq
        $.src = $.src.concat(x$.src)
        x$.freq = null
        if ($.seq > x$.seq) $.seq = x$.seq
      }
    }
  }
}
