export default class WordTree {
  root = {};
  #wordsOfUppercase = {};
  #sequence = 1;
  wordsList = [];

  constructor(words) {
    if (words) this.add(words)
  }

  add = (newWords) => {
    if (Array.isArray(newWords)) {
      newWords.reduce((collection, word) => this.#insert(word, collection), this.root);
    } else {
      for (const m of newWords.matchAll(/((?:[A-Za-z]['-]?)*(?:[A-Z]+[a-z]*)+(?:-?[A-Za-z]'?)+)|[a-z]+(?:-?[a-z]'?)+/mg)) {
        if (m[1]) {
          this.#insert(m[1].toLowerCase(), this.root);
          this.#wordsOfUppercase[m[1]] = (this.#wordsOfUppercase[m[1]] ??= 0) + 1;
        } else {
          this.#insert(m[0], this.root)
        }
      }
    }

    return this;
  };

  #insert = ([...word], branch) => {
    for (const c of word) {
      branch = branch[c] ??= {};
    }
    (branch.$ ??= { freq: 0, len: word.length, seq: ++this.#sequence }).freq += 1
  }

  formLists = (sieve) => {
    if (sieve) {
      for (const [...word] of Array.isArray(sieve) ? sieve : sieve.toLowerCase().split(' ')) {
        let branch = this.root
        const l = word.pop();
        if (word.every((c) => branch = branch[c])) {
          this.filterCommonWords(branch, l)
        }
      }
    }

    const filtered = [];
    const common = [];
    this.#extractUppercaseAndFlattenLowercase();
    for (const v of this.wordsList.sort((a, b) => a.seq - b.seq)) {
      (!v.F && v.len > 2 ? filtered : common).push(v)
    }
    return [this.wordsList, filtered, common];
  }

  #extractUppercaseAndFlattenLowercase = (uppercase = this.#wordsOfUppercase) => {
    for (const key in uppercase) {
      let branch = this.root;

      for (const c of [...key.toLowerCase()]) {
        branch = branch[c]
      }

      if (branch.$.freq === uppercase[key]) {
        this.wordsList.push({ w: key, ...branch.$ })
        branch.$ = false;
      }
    }
    this.#traverseAndFlattenLowercase(this.root, '');
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
    for (const k in layer) if (k !== '$') {
      const value = layer[k]
      this.mergeSuffixes(value);
      this.mergeVocabOfDifferentSuffixes(value)
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
          (O.$ ??= { freq: 0, len: s$.len - 1, seq: s$.seq }).freq += x$.freq + s$.freq;
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
        x$.freq = null
        if (x$.seq < e$.seq) e$.seq = x$.seq
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
        x$.freq = null
        if (x$.seq < $.seq) $.seq = x$.seq
      }
    }
  }
}
