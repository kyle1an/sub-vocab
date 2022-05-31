import { EXTRACT, IRREGULAR } from './stemsMapping';
import { Trie, Label, Sieve, TrieNode, Source, Occur } from '../types';
import { getNode } from './utils';
import { useTimeStore } from "../store/usePerf";

export default class LabeledTire implements Trie {
  root: TrieNode;
  #sequence: number;
  sentences: Array<string>;
  vocabulary: Array<Label>;
  revoked: Array<Array<any>> = [];

  constructor([trie, list]: [TrieNode, Array<Label>]) {
    [this.root, this.vocabulary] = [trie, list];
    this.sentences = [];
    this.#sequence = 1;
  }

  add(input: string) {
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

  #update(original: string, isUp: boolean, index: number, currentSentenceIndex: number) {
    const branch = getNode(isUp ? original.toLowerCase() : original, this.root);

    if (!branch.$) {
      this.vocabulary.push(branch.$ = { w: original, up: isUp, freq: 1, src: [] });
      ++this.#sequence;
    } else {
      const $ = branch.$;
      if (!$.freq) ++this.#sequence;
      $.freq += 1

      if ($.up) {
        if (isUp) {
          $.w = this.caseOr($.w, original);
        } else {
          $.w = original;
          $.up = false;
        }
      }
    }

    const sources = branch.$.src;
    const lastSentence = sources[sources.length - 1];

    if (lastSentence?.[0] === currentSentenceIndex) {
      // store this word's first occurrence sequence or last random word's sequence
      lastSentence[1].push([index, original.length, this.#sequence])
    } else {
      sources.push([currentSentenceIndex, [[index, original.length, this.#sequence]]])
    }
  }

  categorizeVocabulary(): Array<Array<Label>> {
    const __perf = useTimeStore();
    __perf.time.log.mergeStarted = performance.now()
    this.merge();
    __perf.time.log.mergeEnded = performance.now()
    const lists: Array<Array<Label>> = [[], [], []];

    for (const v of this.vocabulary) {
      if (v.freq) {
        v.len = v.w.length;
        v.seq = v.src[0][1][0][2];
        lists[0][v.seq!] = v;
      }
    }

    lists[0] = lists[0].filter(Boolean);

    for (const v of lists[0]) {
      lists[!v.F && v.len! > 2 ? 1 : 2].push(v);
    }

    __perf.time.log.formLabelEnded = performance.now()
    return lists;
  }

  caseOr(a: string, b: string): string {
    const r = [];

    for (let i = 0; i < a.length; i++) {
      r.push(a.charCodeAt(i) | b.charCodeAt(i));
    }

    return String.fromCharCode(...r);
  }

  mergeSorted(a: Source, b: Source): Source {
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
        this.vocabulary.push(irregularWord = { w: word, freq: 0, src: [] });
      }

      let i = irregularCollect.length;
      while (--i) {
        const wordBranch = this.findNode(irregularCollect[i]);
        if (wordBranch) {
          this.mergeProps(<Label>irregularWord, <Label>wordBranch.$,);
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
        this.vocabulary.push(stemWord = { w: word, freq: 0, src: [] });
      }

      let i = stemCollect.length;
      while (--i) {
        const wordBranch = this.findNode(stemCollect[i]);
        if (wordBranch) {
          this.mergeProps(<Label>stemWord, <Label>wordBranch.$,);
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

  merge(layer: TrieNode = this.root) {
    this.mergeIrregular();
    this.extractObscure();
    this.traverseMerge(layer);
    for (const item of this.revoked) {
      item[0].$ = item[1];
    }
  }

  traverseMerge(layer: TrieNode = this.root) {
    for (const key in layer) {
      if (key === '$') continue;
      const innerLayer = layer[key]
      this.traverseMerge(innerLayer);
      this.mergeVocabOfDifferentSuffixes(innerLayer, key)
    }
  }

  mergeVocabOfDifferentSuffixes(current: TrieNode, previousChar: string) {
    const next_sWord = previousChar === 's' ? undefined : current?.s?.$;
    const next_eWord = current?.e?.$;
    const currentWord = <Label | undefined>current?.$;
    const occurCombined = (words: boolean, next_apos?: any): Occur => {
      const next_ing = current?.i?.n?.g;
      const suffixesCombined: any = { freq: 0, src: [] };
      const next_Words = words ? [
        current?.e?.s?.$,
        current?.e?.d?.$,
        next_ing?.$,
        next_ing?.s?.$,
      ] : [];

      if (next_apos) {
        next_Words.push(
          next_apos?.s?.$,
          next_apos?.l?.l?.$,
          next_apos?.v?.e?.$,
          next_apos?.d?.$,
        )
      }

      for (const next_Word of next_Words) {
        if (!next_Word) continue;
        suffixesCombined.w = suffixesCombined.w ? this.caseOr(suffixesCombined.w, next_Word.w) : next_Word.w;
        this.mergeProps(suffixesCombined, next_Word,);
      }

      return suffixesCombined;
    }

    if (currentWord) {
      const suffixesCombined = occurCombined(true);

      if (next_eWord) {
        if (suffixesCombined.w) next_eWord.w = this.caseOr(next_eWord.w, suffixesCombined.w.slice(0, next_eWord.w.length - 1));
        this.mergeProps(next_eWord, suffixesCombined,);
      } else {
        if (suffixesCombined.w) currentWord.w = this.caseOr(currentWord.w, suffixesCombined.w);
        this.mergeProps(currentWord, suffixesCombined,);
      }

      if (next_sWord) {
        if (currentWord.up) {
          if (next_sWord.up) {
            currentWord.w = this.caseOr(currentWord.w, next_sWord.w);
          } else {
            currentWord.w = next_sWord.w.slice(0, currentWord.w.length);
            currentWord.up = false;
          }
        }

        this.mergeProps(currentWord, next_sWord,);
      }

      const aposCombined = occurCombined(false, current?.["'"]);
      if (aposCombined.w) currentWord.w = this.caseOr(currentWord.w, aposCombined.w);
      this.mergeProps(currentWord, aposCombined);
    } else if (next_eWord) {
      const suffixesCombined = occurCombined(true);
      if (suffixesCombined.w) next_eWord.w = this.caseOr(next_eWord.w, suffixesCombined.w.slice(0, next_eWord.w.length - 1));
      this.mergeProps(next_eWord, suffixesCombined,);
    } else if (next_sWord) {
      const suffixesCombined = occurCombined(true, current?.["'"]);
      if (suffixesCombined.freq) {
        this.vocabulary.push(current.$ = { w: next_sWord.w.slice(0, -1), freq: 0, src: [] })
        this.mergeProps(<Label>current.$, next_sWord);
        this.mergeProps(<Label>current.$, suffixesCombined);
      }
    }
  }

  mergeProps(targetWord: Label, latterWord: Label) {
    if (!targetWord.vocab && latterWord.vocab) {
      targetWord.vocab = latterWord.vocab;
    }

    if (!latterWord.freq) return;
    targetWord.freq += latterWord.freq
    latterWord.freq = 0
    targetWord.src = this.mergeSorted(targetWord.src, latterWord.src);
    latterWord.src = [];
  }
}
