import { SHORT_WORDS_SUFFIX_MAPPING } from './shortWordsSuffixMapping';
import { Trie, Label } from '../types';

export default class CategorizedTire implements Trie {
  root: Record<string, Record<string, any>> = {};
  #sequence: number = 1;
  sentences: string[] = [];
  vocabList: Label[] = [];

  constructor(words: any) {
    if (words) {
      this.add(words)
    }
  }

  add = (newWords: string) => {
    // match include tags: /["'(<@A-Za-zÀ-ÿ[{](?:[^;.?!；。\n\r]*[\n\r]?["'(<@A-Za-zÀ-ÿ[{]*(?:[-.](?=[A-Za-zÀ-ÿ.])|\.{3} *)*[A-Za-zÀ-ÿ])+[^ \r\n]*/mg
    let i = this.sentences.length;
    this.sentences = this.sentences.concat(newWords.match(/["'@A-Za-zÀ-ÿ](?:[^<>{};.?!]*(?:<[^>]*>|{[^}]*})*[ \n\r]?(?:[-.](?=[A-Za-zÀ-ÿ.])|\.{3} *)*["'@A-Za-zÀ-ÿ])+[^<>(){} \r\n]*/mg) || [])
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
      this.vocabList.push(branch.$ = { w: original, up: upper ? true : undefined, freq: 0, len: word.length, seq: ++this.#sequence, src: [] });
    } else {
      if (branch.$.up) {
        if (upper) {
          branch.$.w = this.caseOr(branch.$.w, original);
        } else {
          branch.$.w = original;
          branch.$.up = undefined;
        }
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

  formLists = (sieves?: any): Array<any> => {
    if (sieves) {
      for (const sieve of sieves) {
        const sieveArray = sieve.w.split('');
        let branch: any = this.root;
        const lastChar = sieveArray.length === 1 ? '' : sieveArray.pop();
        if (sieveArray.every((c: string) => branch = branch[c])) {
          this.filterCommonWords(branch, lastChar, sieve)
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

  filterCommonWords(O: Record<string, Record<string, any>>, lastChar: string, vocab: any) {
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
    ]) {
      if (!$) continue;
      $.vocab = vocab;
      $.F = vocab.is_valid;
    }
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
    for (const key in layer) {
      if (key === '$') continue;
      const innerLayer = layer[key]
      this.mergeSuffixes(innerLayer);
      this.mergeVocabOfDifferentSuffixes(innerLayer, key)
    }
  }

  mergeVocabOfDifferentSuffixes = (current: any, previousChar: string) => {
    const next_ing = current?.i?.n?.g;
    const next_edWord = current?.e?.d?.$;
    const next_sWord = previousChar === 's' ? undefined : current?.s?.$;
    const next_eWord = current?.e?.$ && (current.e.$.len > 3 || SHORT_WORDS_SUFFIX_MAPPING.d[current.e.$.w]) ? current.e.$ : undefined;
    const currentWord = current?.$;

    if (next_sWord) {
      for (const latterWord of [
        next_edWord,
        next_ing?.$,
        next_ing?.s?.$,
      ]) {
        if (!latterWord) continue;
        if (!current.$) this.vocabList.push(current.$ = { w: next_sWord.w.slice(0, -1), freq: 0, len: next_sWord.len - 1, seq: next_sWord.seq, src: [] })
        current.$.freq += latterWord.freq + next_sWord.freq;
        current.$.src = this.mergeSorted(current.$.src, this.mergeSorted(next_sWord.src, latterWord.src));
        next_sWord.freq = latterWord.freq = null;
        next_sWord.src = latterWord.src = [];
      }
    }

    if (next_eWord) {
      for (const latterWord of [next_edWord, next_ing?.$,]) {
        if (!latterWord) continue;
        if (next_eWord.up) {
          if (latterWord.up) {
            next_eWord.w = this.caseOr(next_eWord.w, latterWord.w.slice(0, next_eWord.len - 1));
          } else {
            next_eWord.w = latterWord.w.slice(0, next_eWord.len - 1) + 'e';
            next_eWord.up = undefined;
          }
        }
        this.mergeProps(latterWord, next_eWord);
      }
    }

    if (currentWord) {
      const len = currentWord.len;
      for (const latterWord of [
        len > 2 || SHORT_WORDS_SUFFIX_MAPPING.s[currentWord.w] ? next_sWord : null,
        len > 2 ? next_edWord : null,
        ...len > 2 || SHORT_WORDS_SUFFIX_MAPPING.ing[currentWord.w] ? [next_ing?.$, next_ing?.s?.$] : [],
        current?.["'"]?.s?.$,
        current?.["'"]?.l?.l?.$,
        current?.["'"]?.v?.e?.$,
        current?.["'"]?.d?.$,
      ]) {
        if (!latterWord) continue;
        if (currentWord.up) {
          if (latterWord.up) {
            currentWord.w = this.caseOr(currentWord.w, latterWord.w);
          } else {
            currentWord.w = latterWord.w.slice(0, len);
            currentWord.up = undefined;
          }
        }
        this.mergeProps(latterWord, currentWord);
      }
    }
  }

  mergeProps(latterWord: any, targetWord: any) {
    targetWord.freq += latterWord.freq
    targetWord.src = this.mergeSorted(targetWord.src, latterWord.src);
    latterWord.freq = null
    latterWord.src = [];
    if (targetWord.seq > latterWord.seq) targetWord.seq = latterWord.seq
  }
}
