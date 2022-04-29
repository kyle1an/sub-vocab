import shortWords from "./shortWords";
import { Vocab } from "../types";

export default class WordTree {
  root: Record<string, Record<string, any>> = {};
  #sequence: number = 1;
  sentences: string[] = [];
  vocabList: Vocab[] = [];

  constructor(words: any) {
    if (words) {
      this.add(words)
    }
  }

  add = (newWords: string) => {
    // match include tags: /["'(<@A-Za-zÀ-ÿ[{](?:[^;.?!；。\n\r]*[\n\r]?["'(<@A-Za-zÀ-ÿ[{]*(?:[-.](?=[A-Za-zÀ-ÿ.])|\.{3} *)*[A-Za-zÀ-ÿ])+[^ \r\n]*/mg

    let i = this.sentences.length;
    this.sentences = this.sentences.concat(newWords.match(/["'@]?[A-Za-zÀ-ÿ](?:[^<>{};.?!]*(?:<[^>]*>|{[^}]*})*[ \n\r]?(?:[-.](?=[A-Za-zÀ-ÿ.])|\.{3} *)*["'@A-Za-zÀ-ÿ])+[^<>{} \r\n]*/mg) || [])
    const len = this.sentences.length;
    for (; i < len; i++) {
      for (const m of this.sentences[i].matchAll(/((?:[A-Za-zÀ-ÿ]['-]?)*(?:[A-ZÀ-Þ]+[a-zß-ÿ]*)+(?:['-]?[A-Za-zÀ-ÿ]'?)+)|[a-zß-ÿ]+(?:-?[a-zß-ÿ]'?)+/mg)) {
        this.#insert(m[0], m[1], m.index!, i);
      }
    }

    return this;
  };

  #insert = (original: string, upper: string, index: number, i: number) => {
    let branch: any = this.root;
    const word: string = upper ? original.toLowerCase() : original;
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
    const sources = branch.$.src;
    const last = sources[sources.length - 1];
    if (last?.[0] === i) {
      last[1].push([index, word.length])
    } else {
      sources.push([i, [[index, word.length]]])
    }
  }

  formLists = (sieve?: any): Array<object>[] => {
    if (sieve) {
      for (const [...word] of Array.isArray(sieve) ? sieve : sieve.toLowerCase().split(' ')) {
        let branch: any = this.root;
        const lastChar = word.length === 1 ? '' : word.pop();
        if (word.every((c: string) => branch = branch[c])) {
          this.filterCommonWords(branch, lastChar)
        }
      }
    }

    const lists: Array<object>[] = [[], [], []];
    for (const v of this.vocabList.sort((a, b) => a.seq - b.seq)) {
      if (v.freq) {
        lists[0].push(v);
        lists[!v.F && v.len > 2 ? 1 : 2].push(v);
      }
    }

    return lists;
  }

  filterCommonWords(O: Record<string, Record<string, any>>, lastChar: string) {
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

  caseOr = (a: string, b: string): string => {
    const r = [];
    for (let i = 0; i < a.length; i++) {
      r.push(a.charCodeAt(i) | b.charCodeAt(i));
    }
    return String.fromCharCode(...r);
  }

  mergeSorted = (a: Array<any>, b: Array<any>): Array<any> => {
    const merged = [];
    let i = 0;
    let j = 0;
    const lenA = a.length;
    const lenB = b.length;
    while (i < lenA && j < lenB) {
      const ai0 = a[i][0];
      const bj0 = b[j][0];
      merged.push(
        ai0 < bj0 ? a[i++]
          : ai0 > bj0 ? b[j++]
            : [ai0, this.mergeSorted(a[i++][1], b[j++][1])]
      );
    }
    return merged.concat(a.slice(i)).concat(b.slice(j));
  }

  mergeSuffixes = (layer: any = this.root) => {
    for (const key in layer) if (key !== '$') {
      const innerLayer = layer[key]
      this.mergeSuffixes(innerLayer);
      this.mergeVocabOfDifferentSuffixes(innerLayer, key)
    }
  }

  mergeVocabOfDifferentSuffixes = (O: any, k: string) => {
    const ing = O?.i?.n?.g;
    const ed$ = O?.e?.d?.$;
    const s$ = k === 's' ? undefined : O?.s?.$;
    if (s$) {
      for (const x$ of [ed$, ing?.$, ing?.s?.$,]) {
        if (x$) {
          if (!O.$) this.vocabList.push(O.$ = { w: s$.w.slice(0, -1), freq: 0, len: s$.len - 1, seq: s$.seq, src: [] })
          O.$.freq += x$.freq + s$.freq;
          O.$.src = this.mergeSorted(O.$.src, this.mergeSorted(s$.src, x$.src));
          s$.freq = x$.freq = null;
          s$.src = x$.src = [];
        }
      }
    }

    const e$ = O?.e?.$ && (O.e.$.len > 3 || shortWords.d[O.e.$.w]) ? O.e.$ : undefined;
    if (e$) {
      for (const x$ of [ed$, ing?.$,]) if (x$) {
        if (e$.W) {
          if (x$.W) {
            e$.w = this.caseOr(e$.w, x$.W.slice(0, e$.len - 1));
          } else {
            e$.w = this.caseOr(e$.w, x$.w.slice(0, e$.len - 1));
            e$.W = undefined;
          }
        }
        e$.freq += x$.freq
        e$.src = this.mergeSorted(e$.src, x$.src);
        x$.freq = null
        x$.src = [];
        if (e$.seq > x$.seq) e$.seq = x$.seq
      }
    }

    const $ = O?.$;
    if ($) {
      const len = $.len;
      for (const x$ of [
        ...(len > 2 || shortWords.s[$.w]) ? [s$] : [],
        ...(len > 2) ? [ed$] : [],
        ...(len > 2 || shortWords.ing[$.w]) ? [ing?.$, ing?.s?.$] : [],
        O?.["'"]?.s?.$,
        O?.["'"]?.l?.l?.$,
        O?.["'"]?.v?.e?.$,
        O?.["'"]?.d?.$,
      ]) if (x$) {
        if ($.W) {
          if (x$.W) {
            $.w = this.caseOr($.w, x$.W);
          } else {
            $.w = x$.w.slice(0, len);
            $.W = undefined;
          }
        }
        $.freq += x$.freq
        $.src = this.mergeSorted($.src, x$.src);
        x$.src = [];
        x$.freq = null
        if ($.seq > x$.seq) $.seq = x$.seq
      }
    }
  }
}
