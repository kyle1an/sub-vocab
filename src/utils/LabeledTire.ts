import { Trie, Label, Occur, Char, TrieNodeMap } from '../types';
import { caseOr, getNodeByPath } from './utils';
import { useTimeStore } from "../store/usePerf";

export default class LabeledTire implements Trie {
  root: TrieNodeMap;
  #sequence: number;
  sentences: Array<string>;
  vocabulary: Array<Label>;

  constructor(trieListPair: [TrieNodeMap, Array<Label>]) {
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
    const branch = getNodeByPath(this.root, isUp ? original.toLowerCase() : original);

    if (!branch.has('$')) {
      const $: Label = { w: original, up: isUp, src: [] };
      this.vocabulary.push($);
      $.src.push([currentSentenceIndex, index, original.length, ++this.#sequence])
      branch.set('$', $);
    } else {
      const $ = branch.get('$')!;
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

  traverseMerge(layer: TrieNodeMap = this.root) {
    for (const key of layer.keys()) {
      if (<Char | '$'>key === '$') continue;
      const innerLayer = <TrieNodeMap>layer.get(key as Char)
      this.traverseMerge(innerLayer);
      this.mergeVocabOfDifferentSuffixes(innerLayer, (key as Char), layer)
    }
  }

  mergeVocabOfDifferentSuffixes(current: TrieNodeMap, previousChar: Char, parentLayer: TrieNodeMap) {
    const next_sWord = previousChar === 's' ? undefined : current?.get('s')?.get('$')
    const next_eWord = current?.get('e')?.get('$')
    const currentWord = <Label | undefined>current?.get('$')

    const words_Occur = (baseWords: boolean, next_apos?: TrieNodeMap) => {
      const next_in = current?.get('i')?.get('n')
      const next_ing = next_in?.get('g');
      const next_Words = baseWords ? [
        current?.get('e')?.get('s')?.get('$'),
        current?.get('e')?.get('d')?.get('$'),
        next_in?.get("'")?.get('$'),
        next_ing?.get('$'),
        next_ing?.get('s')?.get('$'),
      ] : [];

      if (currentWord) {
        const vowel2nd2Last = ['a', 'e', 'i', 'o', 'u'].includes(currentWord.w.slice(-2, -1))
        const vowelLast = ['a', 'e', 'i', 'o', 'u'].includes(previousChar)
        if (!vowelLast) {
          if (vowel2nd2Last) {
            next_Words.push(
              current?.get(previousChar)?.get('i')?.get('n')?.get('g')?.get('$'),
            )
          } else {
            if (previousChar === 'y') {
              next_Words.push(
                parentLayer?.get('i')?.get('e')?.get('s')?.get('$'),
                parentLayer?.get('i')?.get('e')?.get('d')?.get('$'),
              )
            }
          }
        }
      }

      if (next_apos) {
        next_Words.push(
          next_apos?.get('s')?.get('$'),
          next_apos?.get('l')?.get('l')?.get('$'),
          next_apos?.get('v')?.get('e')?.get('$'),
          next_apos?.get('d')?.get('$'),
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

      const aposCombined = occurCombined(words_Occur(false, current?.get("'")))

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
      const suffixesCombined = occurCombined(words_Occur(true, current?.get("'")))
      if (suffixesCombined.src.length) {
        const $ = { w: next_sWord.w.slice(0, -1), src: [] }
        current.set('$', $)
        this.vocabulary.push($)
        this.mergeSourceFirst($, next_sWord);
        this.mergeSourceFirst($, suffixesCombined);
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
