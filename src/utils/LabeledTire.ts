import { Trie, Label, TrieNode, Occur, Char } from '../types';
import { caseOr, getNode } from './utils';
import { useTimeStore } from "../store/usePerf";

export default class LabeledTire implements Trie {
  root: TrieNode;
  #sequence: number;
  sentences: Array<string>;
  vocabulary: Array<Label>;

  constructor(trieListPair: [TrieNode, Array<Label>]) {
    [this.root, this.vocabulary] = trieListPair
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
    const branch = getNode(this.root, isUp ? original.toLowerCase() : original);

    if (!branch.$) {
      this.vocabulary.push(branch.$ = { w: original, up: isUp, src: [] });
      branch.$.src.push([currentSentenceIndex, index, original.length, ++this.#sequence])
    } else {
      const $ = branch.$;
      $.src.push([currentSentenceIndex, index, original.length, $.src.length ? this.#sequence : ++this.#sequence]);

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

  categorizeVocabulary() {
    const __perf = useTimeStore();
    __perf.time.log.mergeStarted = performance.now()
    this.traverseMerge();
    __perf.time.log.mergeEnded = performance.now()
    const lists: [Label[], Label[], Label[]] = [[], [], []];

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
      const innerLayer = layer[key as Char]!
      this.traverseMerge(innerLayer);
      this.mergeVocabOfDifferentSuffixes(innerLayer, (key as Char), layer)
    }
  }

  mergeVocabOfDifferentSuffixes(current: TrieNode, previousChar: Char, parentLayer: TrieNode) {
    const next_sWord = previousChar === 's' ? undefined : current?.s?.$;
    const next_eWord = current?.e?.$;
    const currentWord = current?.$;

    const words_Occur = (baseWords: boolean, next_apos?: TrieNode) => {
      const next_in = current?.i?.n;
      const next_ing = next_in?.g;
      const next_Words = baseWords ? [
        current?.e?.s?.$,
        current?.e?.d?.$,
        next_in?.["'"]?.$,
        next_ing?.$,
        next_ing?.s?.$,
      ] : [];

      if (currentWord) {
        const vowel2nd2Last = ['a', 'e', 'i', 'o', 'u'].includes(currentWord.w.slice(-2, -1))
        const vowelLast = ['a', 'e', 'i', 'o', 'u'].includes(previousChar)
        if (!vowelLast) {
          if (vowel2nd2Last) {
            next_Words.push(
              current?.[previousChar]?.i?.n?.g?.$,
            )
          } else {
            if (previousChar === 'y') {
              next_Words.push(
                parentLayer?.i?.e?.s?.$,
                parentLayer?.i?.e?.d?.$,
              )
            }
          }
        }
      }

      if (next_apos) {
        next_Words.push(
          next_apos?.s?.$,
          next_apos?.l?.l?.$,
          next_apos?.v?.e?.$,
          next_apos?.d?.$,
        )
      }

      return next_Words;
    }

    const occurCombined = (next_Words: Array<Label | undefined>): Occur => {
      const suffixesCombined: any = { src: [] };

      for (const next_Word of next_Words) {
        if (!next_Word) continue;
        if (next_Word.vocab) continue;
        suffixesCombined.w = suffixesCombined.w ? caseOr(suffixesCombined.w, next_Word.w) : next_Word.w;
        this.mergeSourceFirst(suffixesCombined, next_Word,);
      }

      return suffixesCombined;
    }

    if (currentWord) {
      const suffixesCombined = occurCombined(words_Occur(true))

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

      const aposCombined = occurCombined(words_Occur(false, current?.["'"]))

      if (aposCombined.w && currentWord.up && !currentWord.vocab) {
        currentWord.w = caseOr(currentWord.w, aposCombined.w);
      }

      this.mergeSourceFirst(currentWord, aposCombined);
    } else if (next_eWord) {
      const suffixesCombined = occurCombined(words_Occur(true))

      if (suffixesCombined.w && next_eWord.up && !next_eWord.vocab) {
        next_eWord.w = caseOr(next_eWord.w, suffixesCombined.w.slice(0, next_eWord.w.length - 1));
      }

      this.mergeSourceFirst(next_eWord, suffixesCombined,);
    } else if (next_sWord) {
      const suffixesCombined = occurCombined(words_Occur(true, current?.["'"]))
      if (suffixesCombined.src.length) {
        const currentWord = current.$ = { w: next_sWord.w.slice(0, -1), src: [] }
        this.vocabulary.push(currentWord)
        this.mergeSourceFirst(currentWord, next_sWord);
        this.mergeSourceFirst(currentWord, suffixesCombined);
      }
    }
  }

  mergeSourceFirst(targetWord: Label, latterWord: Label) {
    if (!latterWord.src.length) return;

    if (!targetWord.src.length) {
      targetWord.src = latterWord.src;
    } else {
      if (targetWord.src === latterWord.src) return;

      if (targetWord.src[0][0] <= latterWord.src[0][0]) {
        targetWord.src = targetWord.src.concat(latterWord.src);
      } else {
        targetWord.src = latterWord.src.concat(targetWord.src);
      }
    }

    latterWord.src = [];
  }
}
