import { EXTRACT, IRREGULAR } from './stemsMapping';
import { Trie, Label, Sieve, TrieNode, Source, Occur } from '../types';
import { getNode } from './utils';
import { useTimeStore } from "../store/usePerf";

export default class LabeledTire implements Trie {
  root: TrieNode;
  #sequence: number;
  sentences: Array<string>;
  vocabularyOfInput: Array<Label>;
  revoked: Array<Array<any>> = [];

  constructor([trie, list]: [TrieNode, Array<Label>]) {
    [this.root, this.vocabularyOfInput] = [trie, list];
    this.sentences = [];
    this.#sequence = 1;
  }

  add = (input: string) => {
    let previousSize = this.sentences.length;
    this.sentences = this.sentences.concat(input.match(/["'@A-Za-zÀ-ÿ](?:[^<>{};.?!]*(?:<[^>]*>|{[^}]*})*[ \n\r]?(?:[-.](?=[A-Za-zÀ-ÿ.])|\.{3} *)*["'@A-Za-zÀ-ÿ])+[^<>(){} \r\n]*/mg) || [])
    const totalSize = this.sentences.length;
    for (; previousSize < totalSize; previousSize++) {
      for (const m of this.sentences[previousSize].matchAll(/((?:[A-Za-zÀ-ÿ]['-]?)*(?:[A-ZÀ-Þ]+[a-zß-ÿ]*)+(?:['-]?[A-Za-zÀ-ÿ]'?)+)|[a-zß-ÿ]+(?:-?[a-zß-ÿ]'?)+/mg)) {
        this.#update(m[0], !!m[1], m.index!, previousSize);
      }
    }

    return this;
  }

  #update = (original: string, isUp: boolean, index: number, currentSentenceIndex: number) => {
    const branch = getNode(isUp ? original.toLowerCase() : original, this.root);
    this.setDefault(branch, original, isUp);
    branch.$.freq += 1
    const sources = branch.$.src;
    const lastSentence = sources[sources.length - 1];
    if (lastSentence?.[0] === currentSentenceIndex) {
      lastSentence[1].push([index, original.length, this.#sequence])
    } else {
      sources.push([currentSentenceIndex, [[index, original.length, this.#sequence]]])
    }
  }

  categorizeVocabulary = (sievesList?: Array<Sieve>): Array<Array<Label>> => {
    const __perf = useTimeStore();
    __perf.time.log ??= {};
    __perf.time.log.mergeStarted = performance.now()
    this.merge();
    __perf.time.log.mergeEnded = performance.now()
    const lists: Array<Array<Label>> = [[], [], []];

    for (const v of this.vocabularyOfInput) {
      v.seq = v.src?.[0]?.[1]?.[0]?.[2];

      if (v.freq) {
        lists[0][v.seq!] = v;
      }
    }

    lists[0] = lists[0].filter(Boolean);

    for (const v of lists[0]) {
      lists[!v.F && v.len > 2 ? 1 : 2].push(v);
    }

    __perf.time.log.formLabelEnded = performance.now()
    return lists;
  }

  caseOr = (a: string, b: string): string => {
    const r = [];
    for (let i = 0; i < a.length; i++) {
      r.push(a.charCodeAt(i) | b.charCodeAt(i));
    }
    return String.fromCharCode(...r);
  }

  mergeSorted = (a: Source, b: Source): Source => {
    if (!a.length) {
      return b;
    } else if (!b.length) {
      return a;
    }
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

  mergeIrregular() {
    for (const irregularCollect of IRREGULAR) {
      const word = irregularCollect[0];
      let irregularWord = this.findNode(word)?.$;

      if (irregularCollect.length === 1) continue;

      if (!irregularWord) {
        this.vocabularyOfInput.push(irregularWord = { w: word, freq: 0, len: word.length, src: [] });
        ++this.#sequence;
      }

      let i = irregularCollect.length;
      while (--i) {
        const wordBranch = this.findNode(irregularCollect[i]);
        if (wordBranch) {
          this.mergeProps(<Label>wordBranch.$, <Label>irregularWord);
        }
      }
    }
  }

  extractObscure() {
    for (const stemCollect of EXTRACT) {
      const word = stemCollect[0];
      let stemWord = this.revokeAccess(word);

      if (stemCollect.length === 1) continue;

      if (!stemWord) {
        this.vocabularyOfInput.push(stemWord = { w: word, freq: 0, len: word.length, src: [] });
        ++this.#sequence;
      }

      let i = stemCollect.length;
      while (--i) {
        const wordBranch = this.findNode(stemCollect[i]);
        if (wordBranch) {
          this.mergeProps(<Label>wordBranch.$, <Label>stemWord);
        }
      }
    }
  }

  findNode(word: string): TrieNode | undefined {
    const chars = word.split('');
    let branch: TrieNode = this.root;
    const has$ = chars.every((c: string) => branch = branch[c]) && branch.$
    return has$ ? branch : undefined;
  }

  setDefault(branch: TrieNode, original: string, isUp: boolean) {
    if (!branch.$) {
      this.vocabularyOfInput.push(branch.$ = { w: original, up: isUp, freq: 0, len: original.length, src: [] });
      ++this.#sequence;
    } else {
      if (branch.$.freq === 0) ++this.#sequence;

      if (branch.$.up) {
        if (isUp) {
          branch.$.w = this.caseOr(branch.$.w, original);
        } else {
          branch.$.w = original;
          branch.$.up = false;
        }
      }
    }

  }

  revokeAccess(word: string) {
    const branch = this.findNode(word);
    let vocab;
    if (branch) {
      this.revoked.push([branch, branch.$]);
      vocab = branch.$;
      // @ts-ignore
      branch.$ = null;
      return vocab;
    } else {
      return null;
    }
  }

  merge = (layer: TrieNode = this.root) => {
    this.mergeIrregular();
    this.extractObscure();
    this.traverseMerge(layer);
    for (const item of this.revoked) {
      item[0].$ = item[1];
    }
  }

  traverseMerge = (layer: TrieNode = this.root) => {
    for (const key in layer) {
      if (key === '$') continue;
      const innerLayer = layer[key]
      this.traverseMerge(innerLayer);
      this.mergeVocabOfDifferentSuffixes(innerLayer, key)
    }
  }

  mergeVocabOfDifferentSuffixes = (current: TrieNode, previousChar: string) => {
    const next_ing = current?.i?.n?.g;
    const next_ingWord = next_ing?.$;
    const next_ingsWord = next_ing?.s?.$;
    const next_edWord = current?.e?.d?.$;
    const next_esWord = current?.e?.s?.$;
    const next_sWord = previousChar === 's' ? undefined : current?.s?.$;
    const next_eWord = current?.e?.$;
    const next_apos = current?.["'"];
    const currentWord = <Label | undefined>current?.$;
    let target: Label;

    const occurCombined = (): Occur => {
      let suffixesCombined: any = { freq: 0, src: [] };
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
      const suffixesCombined = occurCombined();
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
      const suffixesCombined = occurCombined();
      if (suffixesCombined.freq) {
        this.vocabularyOfInput.push(target = current.$ = { w: next_sWord.w.slice(0, -1), freq: 0, len: next_sWord.len - 1, src: [] })
        this.mergeProps(next_sWord, target);
        this.mergeProps(suffixesCombined, target);
      }
    } else if (next_eWord) {
      const suffixesCombined = occurCombined();
      target = next_eWord;
      if (suffixesCombined.w) target.w = this.caseOr(target.w, suffixesCombined.w.slice(0, target.len - 1));
      this.mergeProps(suffixesCombined, target);
    }
  }

  mergeProps(latterWord: Label, targetWord: Label) {
    targetWord.freq += latterWord.freq
    targetWord.src = this.mergeSorted(targetWord.src, latterWord.src);
    latterWord.freq = 0
    latterWord.src = [];
    if (!targetWord.vocab && latterWord.vocab) targetWord.vocab = latterWord.vocab;
  }
}
