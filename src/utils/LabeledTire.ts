import { Trie, Label, Sieve, TrieNode, Source, Occur } from '../types';
import { caseOr, getNode } from './utils';
import { useTimeStore } from "../store/usePerf";

export default class LabeledTire implements Trie {
  root: TrieNode;
  #sequence: number;
  sentences: Array<string>;
  vocabulary: Array<Label>;

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
      this.vocabulary.push(branch.$ = { w: original, up: isUp, src: [] });
      branch.$.src.push([currentSentenceIndex, index, original.length, ++this.#sequence])
    } else {
      const $ = branch.$;
      branch.$.src.push([currentSentenceIndex, index, original.length, $.src.length ? this.#sequence : ++this.#sequence]);

      if ($.up && !$.vocab) {
        if (isUp) {
          $.w = caseOr($.w, original);
        } else {
          $.w = original;
          $.up = false;
        }
      }
    }
  }

  categorizeVocabulary(): Array<Array<Label>> {
    const __perf = useTimeStore();
    __perf.time.log.mergeStarted = performance.now()
    this.traverseMerge();
    __perf.time.log.mergeEnded = performance.now()
    const lists: Array<Array<Label>> = [[], [], []];

    for (const v of this.vocabulary) {
      if (v.src.length) {
        v.freq = v.src.length;
        v.len = v.w.length;
        v.seq = v.src[0][3];
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
      const next_in = current?.i?.n;
      const next_ing = next_in?.g;
      const suffixesCombined: any = { src: [] };
      const next_Words = words ? [
        current?.e?.s?.$,
        current?.e?.d?.$,
        next_in?.["'"]?.$,
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
        if (next_Word.vocab) continue;
        suffixesCombined.w = suffixesCombined.w ? caseOr(suffixesCombined.w, next_Word.w) : next_Word.w;
        this.mergeSourceFirst(suffixesCombined, next_Word,);
      }

      return suffixesCombined;
    }

    if (currentWord) {
      const suffixesCombined = occurCombined(true);

      if (next_eWord) {
        if (suffixesCombined.w && next_eWord.up && !next_eWord.vocab) {
          next_eWord.w = caseOr(next_eWord.w, suffixesCombined.w.slice(0, next_eWord.w.length - 1));
        }

        this.mergeSourceFirst(next_eWord, suffixesCombined,);
      } else {
        if (suffixesCombined.w && currentWord.up && !currentWord.vocab) {
          currentWord.w = caseOr(currentWord.w, suffixesCombined.w);
        }

        this.mergeSourceFirst(currentWord, suffixesCombined,);
      }

      if (next_sWord && !next_sWord.vocab) {
        if (currentWord.up) {
          if (next_sWord.up) {
            currentWord.w = caseOr(currentWord.w, next_sWord.w);
          } else {
            currentWord.w = next_sWord.w.slice(0, currentWord.w.length);
            currentWord.up = false;
          }
        }

        this.mergeSourceFirst(currentWord, next_sWord,);
      }

      const aposCombined = occurCombined(false, current?.["'"]);

      if (aposCombined.w && currentWord.up && !currentWord.vocab) {
        currentWord.w = caseOr(currentWord.w, aposCombined.w);
      }

      this.mergeSourceFirst(currentWord, aposCombined);
    } else if (next_eWord) {
      const suffixesCombined = occurCombined(true);

      if (suffixesCombined.w && next_eWord.up && !next_eWord.vocab) {
        next_eWord.w = caseOr(next_eWord.w, suffixesCombined.w.slice(0, next_eWord.w.length - 1));
      }

      this.mergeSourceFirst(next_eWord, suffixesCombined,);
    } else if (next_sWord) {
      const suffixesCombined = occurCombined(true, current?.["'"]);
      if (suffixesCombined.src.length) {
        this.vocabulary.push(current.$ = { w: next_sWord.w.slice(0, -1), src: [] })
        this.mergeSourceFirst(<Label>current.$, next_sWord);
        this.mergeSourceFirst(<Label>current.$, suffixesCombined);
      }
    }
  }

  mergeSourceFirst(targetWord: Label, latterWord: Label) {
    if (!latterWord.src.length) return;

    if (!targetWord.src.length) {
      targetWord.src = latterWord.src;
    } else if (targetWord.src[0][0] < latterWord.src[0][0]) {
      targetWord.src = targetWord.src.concat(latterWord.src);
    } else {
      targetWord.src = latterWord.src.concat(targetWord.src);
    }

    latterWord.src = [];
  }
}