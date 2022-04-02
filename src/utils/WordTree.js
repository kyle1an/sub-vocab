export default class WordTree {
  root = {};
  #tUpper = {};
  #i = 1;
  list = [];

  constructor(words) {
    if (words) this.add(words)
  }

  add = (neW) => {
    if (Array.isArray(neW)) {
      neW.reduce((col, word) => this.#insert(word, col), this.root);
    } else {
      for (const m of neW.matchAll(/((?:[A-Za-z]['-]?)*(?:[A-Z]+[a-z]*)+(?:-?[A-Za-z]'?)+)|[a-z]+(?:-?[a-z]'?)+/mg)) {
        if (m[1]) {
          this.#insert(m[1].toLowerCase(), this.root);
          this.#tUpper[m[1]] = (this.#tUpper[m[1]] ??= 0) + 1;
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
    (branch.$ ??= { _: 0, '~': word.length, '@': ++this.#i })._ += 1
  }

  formList = (sieve) => {
    if (sieve) {
      for (const [...word] of Array.isArray(sieve) ? sieve : sieve.toLowerCase().split(' ')) {
        let branch = this.root
        const l = word.pop();
        if (word.every((c) => branch = branch[c])) {
          this.resetSuffix(branch, l)
        }
      }
    }

    const target = [];
    const common = [];
    this.#trans();
    for (const v of this.list.sort((a, b) => a['@'] - b['@'])) {
      (!v.F && v['~'] > 2 ? target : common).push(v)
    }
    return [this.list, target, common];
  }

  #trans = (upper = this.#tUpper) => {
    for (const key in upper) {
      let branch = this.root;

      for (const c of [...key.toLowerCase()]) {
        branch = branch[c]
      }

      if (branch.$._ === upper[key]) {
        this.list.push({ w: key, ...branch.$ })
        branch.$ = false;
      }
    }
    this.#traverseAndFlatten(this.root, '');
  }

  #traverseAndFlatten = (node, concatKey) => {
    for (const k in node) {
      if (k !== '$') {
        this.#traverseAndFlatten(node[k], concatKey + k);
      } else if (node.$._) {
        this.list.push({ w: concatKey, ...node.$ })
      }
    }
  }

  resetSuffix(O, last) {
    O = (last === 'e') ? O : O?.[last];

    for (const $ of [
      ...(last === 'e' ? [O?.e?.$] : [O?.$, O?.s?.$]),
      O?.e?.d?.$,
      O?.e?.s?.$,
      O?.i?.n?.g?.$,
      O?.i?.n?.g?.s?.$,
    ]) if ($) $.F = true
  }

  deAffix = (layer = this.root) => {
    for (const k in layer) if (k !== '$') {
      const value = layer[k]
      this.deAffix(value);
      this.deSuffix(value)
    }
  }

  deSuffix = (O) => {
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
          (O.$ ??= { _: 0, '~': s$['~'] - 1, '@': s$['@'] })._ += x$._ + s$._;
          s$._ = x$._ = null;
        }
      }
    }

    const e$ = O?.e?.$;
    if (e$) {
      for (const x$ of [
        ed$,
        ing?.$,
      ]) if (x$) {
        e$._ += x$._
        x$._ = null
        if (x$['@'] < e$['@']) e$['@'] = x$['@']
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
        $._ += x$._
        x$._ = null
        if (x$['@'] < $['@']) $['@'] = x$['@']
      }
    }
  }
}
