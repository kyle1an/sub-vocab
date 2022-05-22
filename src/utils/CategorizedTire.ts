import { STEMS } from './shortWordsSuffixMapping';
import { Trie, Label } from '../types';

export default class CategorizedTire implements Trie {
  root: Record<string, Record<string, any>> = {};
  #sequence: number = 1;
  sentences: string[] = [];
  vocabList: Label[] = [];
  revoked: any = [];

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
      this.vocabList.push(branch.$ = { w: original, up: !!upper, freq: 0, len: word.length, seq: ++this.#sequence, src: [] });
    } else {
      if (branch.$.up) {
        if (upper) {
          branch.$.w = this.caseOr(branch.$.w, original);
        } else {
          branch.$.w = original;
          branch.$.up = false;
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

  extractStems() {
    for (const stem of STEMS) {
      const word = stem[0];
      let stemWord = this.revokeAccess(word);

      if (stem.length === 1) continue;

      if (!stemWord) {
        this.vocabList.push(stemWord = { w: word, freq: 0, len: word.length, seq: ++this.#sequence, src: [] });
      }

      let i = stem.length;
      while (i--) {
        const derivedBranch = this.findWord(stem[i]);
        if (derivedBranch) {
          this.mergeProps(derivedBranch.$, stemWord);
        }
      }
    }
  }

  findWord(word: string) {
    const chars = word.split('');
    let branch: any = this.root;
    const doesExist = chars.every((c: string) => branch = branch[c]) && branch.$
    return doesExist ? branch : null;
  }

  revokeAccess(word: string) {
    const branch = this.findWord(word);
    let vocab;
    if (branch) {
      this.revoked.push([branch, branch.$]);
      vocab = branch.$;
      branch.$ = null;
      return vocab;
    } else {
      return null;
    }
  }

  mergeSuffixes = (layer: any = this.root) => {
    this.extractStems();
    this.traverseMerge(layer);
    for (const item of this.revoked) {
      item[0].$ = item[1];
    }
  }

  traverseMerge = (layer: any = this.root) => {
    for (const key in layer) {
      if (key === '$') continue;
      const innerLayer = layer[key]
      this.traverseMerge(innerLayer);
      this.mergeVocabOfDifferentSuffixes(innerLayer, key)
    }
  }

  mergeVocabOfDifferentSuffixes = (current: any, previousChar: string) => {
    const next_ing = current?.i?.n?.g;
    const next_ingWord = next_ing?.$;
    const next_ingsWord = next_ing?.s?.$;
    const next_edWord = current?.e?.d?.$;
    const next_esWord = current?.e?.s?.$;
    const next_sWord = previousChar === 's' ? undefined : current?.s?.$;
    const next_eWord = current?.e?.$;
    const next_apos = current?.["'"];
    const currentWord = current?.$;
    let target: any;

    const suffixesPropCombined = () => {
      let suffixesCombined: any = { freq: 0, src: [], seq: Infinity };
      for (const latterWord of [
        next_esWord,
        next_edWord,
        next_ingWord,
        next_ingsWord,
        next_apos?.s?.$,
        next_apos?.l?.l?.$,
        next_apos?.v?.e?.$,
        next_apos?.d?.$,
      ]) {
        if (!latterWord) continue;
        suffixesCombined.w = suffixesCombined.w ? this.caseOr(suffixesCombined.w, latterWord.w) : latterWord.w;
        this.mergeProps(latterWord, suffixesCombined);
      }
      return suffixesCombined;
    }

    if (currentWord) {
      const suffixesCombined = suffixesPropCombined();
      target = currentWord;
      const len = target.len;
      for (const latterWord of [
        next_sWord,
      ]) {
        if (!latterWord) continue;
        if (target.up) {
          if (latterWord.up) {
            target.w = this.caseOr(target.w, latterWord.w);
          } else {
            target.w = latterWord.w.slice(0, len);
            target.up = false;
          }
        }
        this.mergeProps(latterWord, target);
      }
      if (suffixesCombined.w) target.w = this.caseOr(target.w, suffixesCombined.w.slice(0, target.len));
      this.mergeProps(suffixesCombined, target);
    } else if (next_sWord) {
      const suffixesCombined = suffixesPropCombined();
      if (suffixesCombined.freq) {
        this.vocabList.push(target = current.$ = { w: next_sWord.w.slice(0, -1), freq: 0, len: next_sWord.len - 1, seq: next_sWord.seq, src: [] })
        this.mergeProps(next_sWord, target);
        this.mergeProps(suffixesCombined, target);
      }
    } else if (next_eWord) {
      const suffixesCombined = suffixesPropCombined();
      target = next_eWord;
      if (suffixesCombined.w) target.w = this.caseOr(target.w, suffixesCombined.w.slice(0, target.len - 1));
      this.mergeProps(suffixesCombined, target);
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
