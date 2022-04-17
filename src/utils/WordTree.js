export default class WordTree {
  root = {};
  #sequence = 1;
  vocabList = [];

  constructor(words) {
    if (words) this.add(words)
  }

  add = (newWords) => {
    for (const sentence of newWords.match(/["'A-Za-z](?:[\w"',:\r \n]*(?:[-.](?=[A-Za-z.])|\.{3} *)*[A-Za-zÀ-ÿ])+[!?.,"']*/mg) || []) {
      for (const m of sentence.matchAll(/((?:[A-Za-z]['-]?)*(?:[A-Z]+[a-z]*)+(?:['-]?[A-Za-z]'?)+)|[a-z]+(?:-?[a-z]'?)+/mg)) {
        this.#insert(m[0], m[1], m.index, sentence)
      }
    }

    return this;
  };

  #insert = (original, upper, index, sentence) => {
    let branch = this.root;
    const word = upper ? original.toLowerCase() : original;
    for (const c of word.split('')) {
      branch = branch[c] ??= {};
    }
    if (!branch.$) {
      this.vocabList.push(branch.$ = { w: original, W: upper, freq: 0, len: word.length, seq: ++this.#sequence, src: [] });
    } else if (branch.$.W) {
      if (upper) {
        branch.$.w = this.caseOr(branch.$.w, original);
      } else {
        branch.$.w = original;
        branch.$.W = upper;
      }
    }

    branch.$.freq += 1
    branch.$.src.push({ sentence, index, len: original.length })
  }

  formLists = (sieve) => {
    if (sieve) {
      debugger
      for (const [...word] of Array.isArray(sieve) ? sieve : sieve.toLowerCase().split(' ')) {
        let branch = this.root
        const lastChar = word.length === 1 ? '' : word.pop();
        if (word.every((c) => branch = branch[c])) {
          this.filterCommonWords(branch, lastChar)
        }
      }
    }

    const lists = [[], [], []];
    for (const v of this.vocabList.sort((a, b) => a.seq - b.seq)) {
      if (v.freq) {
        lists[0].push(v);
        lists[!v.F && v.len > 2 ? 1 : 2].push(v);
      }
    }

    return lists;
  }

  filterCommonWords(O, lastChar) {
    if (lastChar) O = (lastChar === 'e') ? O : O?.[lastChar];

    for (const $ of [
      ...(lastChar === 'e' ? [O?.e?.$] : [O?.$, O?.s?.$]),
      O?.e?.d?.$,
      O?.e?.s?.$,
      O?.i?.n?.g?.$,
      O?.i?.n?.g?.s?.$,
      O?.["'"]?.s?.$,
      O?.["'"]?.l?.l?.$,
      O?.["'"]?.v?.e?.$,
      O?.["'"]?.d?.$,
    ]) if ($) $.F = true
  }

  caseOr = (a, b) => {
    const r = [];
    for (let i = 0; i < a.length; i++) {
      r.push(a.charCodeAt(i) | b.charCodeAt(i));
    }
    return String.fromCharCode(...r);
  }

  mergeSuffixes = (layer = this.root) => {
    for (const key in layer) if (key !== '$') {
      const innerLayer = layer[key]
      this.mergeSuffixes(innerLayer);
      this.mergeVocabOfDifferentSuffixes(innerLayer, key)
    }
  }

  mergeVocabOfDifferentSuffixes = (O, k) => {
    const ing = O?.i?.n?.g;
    const ed$ = O?.e?.d?.$;
    const s$ = O?.s?.$;
    if (s$ && k !== 's') {
      for (const x$ of [ed$, ing?.$, ing?.s?.$,]) {
        if (x$) {
          if (!O.$) this.vocabList.push(O.$ = { w: s$.w.slice(0, -1), freq: 0, len: s$.len - 1, seq: s$.seq, src: [] })
          O.$.freq += x$.freq + s$.freq;
          O.$.src = O.$.src.concat(s$.src, x$.src)
          s$.freq = x$.freq = null;
          s$.src = x$.src = [];
        }
      }
    }

    const e$ = O?.e?.$;
    if (e$) {
      for (const x$ of [ed$, ing?.$,]) if (x$) {
        if (e$.W) {
          if (x$.W) {
            e$.w = this.caseOr(e$.w, x$.W);
          } else {
            e$.w = x$.w.slice(0, e$.len);
            e$.W = undefined;
          }
        }
        e$.freq += x$.freq
        e$.src = e$.src.concat(x$.src)
        x$.freq = null
        x$.src = [];
        if (e$.seq > x$.seq) e$.seq = x$.seq
      }
    }

    const $ = O?.$;
    if ($) {
      for (const x$ of [s$, ed$, ing?.$, ing?.s?.$, O?.["'"]?.s?.$, O?.["'"]?.l?.l?.$, O?.["'"]?.v?.e?.$, O?.["'"]?.d?.$,]) if (x$) {
        if ($.W) {
          if (x$.W) {
            $.w = this.caseOr($.w, x$.W);
          } else {
            $.w = x$.w.slice(0, $.len);
            $.W = undefined;
          }
        }
        $.freq += x$.freq
        $.src = $.src.concat(x$.src)
        x$.src = [];
        x$.freq = null
        if ($.seq > x$.seq) $.seq = x$.seq
      }
    }
  }
}
