import { caseOr, hasUppercase, isVowel } from './utils'
import type { Char, Label, Sieve, TrieNode } from '@/types'

export default class LabeledTire {
  root: TrieNode<Label>
  #sequence = 0
  sentences: string[] = []
  wordCount = 0
  vocabulary: Array<Label | null> = []

  constructor(baseTrie: TrieNode<Label> = {}) {
    this.root = baseTrie
    return this
  }

  getNode(word: string) {
    let node = this.root
    for (const c of word.split('')) {
      node = node[c as Char] ??= {}
    }

    return node
  }

  withPaths(vocab: Sieve[]) {
    for (const sieve of vocab) {
      this.createPath(sieve)
    }

    return this
  }

  createPath(sieve: Sieve) {
    const original = sieve.w
    const hasUp = hasUppercase(original)
    const node = this.getNode(hasUp ? original.toLowerCase() : original)
    const $ = node.$

    if (!$) {
      node.$ = {
        w: original,
        up: hasUp,
        src: [],
        vocab: sieve,
      }
    } else if ($.up) {
      if (hasUp) {
        if ($.vocab?.rank) {
          if (sieve.rank && sieve.rank < $.vocab.rank) {
            $.vocab = sieve
          }
        } else if (sieve.rank) {
          $.vocab = sieve
        }
      } else {
        $.w = original
        $.up = false
        $.vocab = sieve
      }
    }
  }

  share(irregularMaps: string[][]) {
    for (const irregulars of irregularMaps) {
      const base = irregulars[0]
      const hasUp = hasUppercase(base)
      const baseNode = this.getNode(hasUp ? base.toLowerCase() : base)
      baseNode.$ ??= {
        w: base,
        up: hasUp,
        src: [],
        vocab: {
          w: base,
          acquainted: false,
          is_user: 0,
          inUpdating: false,
        }
      }
      let i = irregulars.length
      while (--i) {
        this.getNode(irregulars[i]).$ = baseNode.$
      }
    }

    return this
  }

  add(input: string) {
    let previousSize = this.sentences.length
    this.sentences = this.sentences.concat(input.match(/["'@A-Za-zÀ-ÿ](?:[^<>{};.?!]*(?:<[^>]*>|{[^}]*})*[ \n\r]?(?:[-.](?=[A-Za-zÀ-ÿ])|\.{3} *)*["'@A-Za-zÀ-ÿ])+[^<>(){} \r\n]*/mg) || [])
    const totalSize = this.sentences.length

    for (; previousSize < totalSize; ++previousSize) {
      for (const m of this.sentences[previousSize].matchAll(/(?:[A-Za-zÀ-ÿ]['-]?)*(?:[A-ZÀ-Þa-zß-ÿ]+[a-zß-ÿ]*)+(?:['’-]?[A-Za-zÀ-ÿ]'?)+/mg)) {
        const matchedWord = m[0]
        ++this.wordCount
        if (m.index === undefined) continue
        this.#update(matchedWord, hasUppercase(matchedWord), m.index, previousSize)
      }
    }

    return this
  }

  #update(original: string, hasUp: boolean, index: number, currentSentenceIndex: number) {
    const branch = this.getNode(hasUp ? original.toLowerCase() : original)
    const $ = branch.$

    if (!$) {
      branch.$ = {
        w: original, up: hasUp,
        src: [[
          currentSentenceIndex,
          index,
          original.length,
          ++this.#sequence,
        ]]
      }
      this.vocabulary[branch.$.src[0][3]] = branch.$
    } else {
      $.src.push([
        currentSentenceIndex,
        index,
        original.length,
        $.src.length ? this.#sequence : ++this.#sequence,
      ])

      if ($.src.length === 1) {
        this.vocabulary[$.src[0][3]] = $
      }

      if ($.up && !$.vocab) {
        if (hasUp) {
          $.w = caseOr($.w, original)
          $.up = hasUppercase($.w)
        } else {
          $.w = original
          $.up = false
        }
      }
    }
  }

  mergedVocabulary() {
    this.#traverseMerge(this.root)
    return this
  }

  #traverseMerge(layer: TrieNode<Label>) {
    for (const key in layer) {
      if (key === '$') continue
      const innerLayer = layer[key as Char] ?? {}
      // deep first traverse eg: beings(being) vs bee
      this.#traverseMerge(innerLayer)
      this.#mergeVocabOfDifferentSuffixes(innerLayer, key as Char, layer)
    }
  }

  #mergeVocabOfDifferentSuffixes(curr: TrieNode<Label>, previousChar: Char, parentLayer: TrieNode<Label>) {
    const curr_$ = curr.$
    const curr_e$ = curr.e?.$
    const curr_s$ = previousChar === 's' ? undefined : curr.s?.$
    const curr_sApos$ = previousChar === 's' ? undefined : [curr.s?.[`'`]?.$, curr.s?.[`’`]?.$]
    const isTheLastCharConsonant = !isVowel(previousChar)
    const curr_ying$ = isTheLastCharConsonant ? curr.y?.i?.n?.g?.$ : undefined

    function suffixLabels(curr: TrieNode<Label>) {
      const labels = [
        curr.e?.s?.$,
        curr.e?.d?.$
      ]

      const curr_in = curr.i?.n
      if (curr_in) {
        labels.push(
          curr_in[`'`]?.$,
          curr_in[`’`]?.$,
        )
        const curr_ing = curr_in.g
        if (curr_ing) {
          labels.push(
            curr_ing.$,
            curr_ing.s?.$,
          )
        }
      }

      return labels
    }

    const aposSuffixLabels = (curr_apos: TrieNode<Label>) => [
      curr_apos.s?.$,
      curr_apos.l?.l?.$,
      curr_apos.v?.e?.$,
      curr_apos.d?.$,
    ]

    if (curr_$) {
      this.#batchMergeTo(curr_e$ || curr_$, suffixLabels(curr))

      if (isTheLastCharConsonant) {
        if (isVowel(curr_$.w.slice(-2, -1))) {
          // word ends with vowel + consonant
          this.#batchMergeTo(curr_$, [
            curr[previousChar]?.i?.n?.g?.$,
            curr[previousChar]?.e?.d?.$
          ])
        } else if (previousChar === 'y') {
          // word ends with consonant + y(consonant)
          this.#batchMergeTo(curr_$, [
            parentLayer.i?.e?.s?.$,
            parentLayer.i?.e?.d?.$,
          ])
        }
      }

      if (curr_s$) this.#mergeNodes(curr_$, curr_s$)
      if (curr_sApos$) this.#batchMergeTo(curr_$, curr_sApos$)
      if (curr[`'`]) this.#batchMergeTo(curr_$, aposSuffixLabels(curr[`'`]))
      if (curr[`’`]) this.#batchMergeTo(curr_$, aposSuffixLabels(curr[`’`]))
    } else if (curr_e$) {
      this.#batchMergeTo(curr_e$, suffixLabels(curr))
    } else if (curr_s$) {
      const original = curr_s$.w.slice(0, -1)
      const $ = { w: curr_s$.w.slice(0, -1), src: [], up: hasUppercase(original), derive: [] }
      this.#batchMergeTo($, suffixLabels(curr))

      if (curr[`'`]) this.#batchMergeTo($, aposSuffixLabels(curr[`'`]))
      if (curr[`’`]) this.#batchMergeTo($, aposSuffixLabels(curr[`’`]))

      if ($.derive.length) {
        this.#mergeNodes($, curr_s$)
        curr.$ = $
        this.vocabulary.push($)
      }
    } else if (curr_ying$) {
      const original = curr_ying$.w.slice(0, -3)
      const $ = { w: original, src: [], up: hasUppercase(original), derive: [] }
      this.#batchMergeTo($, [
        curr.i?.e?.s?.$,
        curr.i?.e?.d?.$,
      ])

      if ($.derive.length) {
        this.#mergeNodes($, curr_ying$)
        curr.y ??= {}
        curr.y.$ = $
        this.vocabulary.push($)
      }
    }
  }

  #batchMergeTo($: Label, next_$$: Array<Label | undefined>) {
    for (const next_$ of next_$$) {
      if (next_$) {
        this.#mergeNodes($, next_$)
      }
    }
  }

  #mergeNodes(targetWord: Label, latterWord: Label) {
    if (!latterWord.src.length
      || latterWord.vocab
      || latterWord.variant
    ) return

    if (targetWord.up && !targetWord.vocab) {
      targetWord.w = caseOr(targetWord.w, latterWord.w)
      targetWord.up = latterWord.up ? hasUppercase(targetWord.w) : false
    }

    if (!targetWord.derive) {
      targetWord.derive = []

      if (!targetWord.src.length) {
        this.vocabulary[latterWord.src[0][3]] = targetWord
      }
    }

    targetWord.derive.push(latterWord)
    latterWord.variant = true
  }
}
