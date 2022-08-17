import { Char, Label, LabelRow, TrieNode } from '../types'
import { caseOr, getNode, hasUppercase } from './utils'

export default class LabeledTire {
  root: TrieNode
  #sequence: number
  sentences: string[]
  vocabulary: Array<Label | null> = []

  constructor(baseTrie: TrieNode) {
    this.root = baseTrie
    this.sentences = []
    this.#sequence = 1
  }

  add(input: string) {
    let previousSize = this.sentences.length
    this.sentences = this.sentences.concat(input.match(/["'@A-Za-zÀ-ÿ](?:[^<>{};.?!]*(?:<[^>]*>|{[^}]*})*[ \n\r]?(?:[-.](?=[A-Za-zÀ-ÿ])|\.{3} *)*["'@A-Za-zÀ-ÿ])+[^<>(){} \r\n]*/mg) || [])
    const totalSize = this.sentences.length

    for (; previousSize < totalSize; previousSize++) {
      for (const m of this.sentences[previousSize].matchAll(/(?:[A-Za-zÀ-ÿ]['-]?)*(?:[A-ZÀ-Þa-zß-ÿ]+[a-zß-ÿ]*)+(?:['-]?[A-Za-zÀ-ÿ]'?)+/mg)) {
        const matchedWord = m[0]
        if (m.index === undefined) continue
        this.#update(matchedWord, hasUppercase(matchedWord), m.index, previousSize)
      }
    }

    return this
  }

  #update(original: string, hasUp: boolean, index: number, currentSentenceIndex: number) {
    const branch = getNode(this.root, hasUp ? original.toLowerCase() : original)

    if (!branch.$) {
      branch.$ = { w: original, up: hasUp, src: [] }
      const $ = branch.$
      $.src.push([
        currentSentenceIndex,
        index,
        original.length,
        ++this.#sequence,
      ])
      this.vocabulary[$.src[0][3]] = $
    } else {
      const $ = branch.$
      $.src.push([
        currentSentenceIndex,
        index,
        original.length,
        $.src.length ? this.#sequence : ++this.#sequence,
      ])

      if (branch.$.src.length === 1) {
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
    this.traverseMerge(this.root)
    return this.vocabulary as LabelRow[]
  }

  static formVocabList(vocabulary: LabelRow[]) {
    const all: LabelRow[] = []

    for (const v of vocabulary) {
      if (!v || v.variant) continue

      const $: Label = {
        w: v.w,
        up: v.up,
        len: v.w.length,
        src: [],
      }

      if (v.vocab) {
        $.vocab = v.vocab
      }

      this.collectNestedSource(v)
      $.src = v.src
      $.freq = $.src.length
      $.seq = $.src[0][3]
      all.push($ as LabelRow)
    }

    return all
  }

  static collectNestedSource($: Label) {
    if ($?.derive?.length) {
      for (const d of $.derive) {
        this.collectNestedSource(d)

        if (!$.src.length) {
          $.src = d.src
          continue
        }

        if (d.src[0][3] < $.src[0][3]) {
          $.src = d.src.concat($.src)
        } else {
          $.src = $.src.concat(d.src)
        }
      }
    }
  }

  traverseMerge(layer: TrieNode) {
    for (const key in layer) {
      if (key === '$') continue
      const innerLayer = layer[key as Char] ?? {}
      // deep first traverse eg: beings(being) vs bee
      this.traverseMerge(innerLayer)
      this.mergeVocabOfDifferentSuffixes(innerLayer, (key as Char), layer)
    }
  }

  mergeVocabOfDifferentSuffixes(current: TrieNode, previousChar: Char, parentLayer: TrieNode) {
    const curr_$ = current?.$
    const curr_e$ = current?.e?.$
    const curr_s$ = previousChar === 's' ? undefined : current?.s?.$

    const followingWords = (curr: TrieNode) => {
      const curr_in = curr?.i?.n
      const curr_ing = curr_in?.g
      return [
        curr?.e?.s?.$,
        curr?.e?.d?.$,
        curr_in?.[`'`]?.$,
        curr_ing?.$,
        curr_ing?.s?.$,
      ]
    }

    const irregularEndingDerivatives = ($: Label) => {
      const isTheLastCharVowel = ['a', 'e', 'i', 'o', 'u'].includes(previousChar)

      if (isTheLastCharVowel) {
        return []
      }

      const isThe2ndToLastCharVowel = ['a', 'e', 'i', 'o', 'u'].includes($.w.slice(-2, -1))

      if (isThe2ndToLastCharVowel) {
        return [
          current?.[previousChar]?.i?.n?.g?.$
        ]
      }

      if (previousChar === 'y') {
        return [
          parentLayer?.i?.e?.s?.$,
          parentLayer?.i?.e?.d?.$,
        ]
      }

      return []
    }

    const nextAposWords = (curr_apos: TrieNode) => [
      curr_apos?.s?.$,
      curr_apos?.l?.l?.$,
      curr_apos?.v?.e?.$,
      curr_apos?.d?.$,
    ]

    if (curr_$) {
      this.batchMergeTo(curr_e$ || curr_$, [
        ...followingWords(current),
        ...irregularEndingDerivatives(curr_$)
      ])

      if (curr_s$) {
        this.mergeNodes(curr_$, curr_s$)
      }

      if (current?.[`'`]) {
        this.batchMergeTo(curr_$, nextAposWords(current?.[`'`]))
      }
    } else if (curr_e$) {
      this.batchMergeTo(curr_e$, followingWords(current))
    } else if (curr_s$) {
      const $ = { w: curr_s$.w.slice(0, -1), src: [], derive: [] }
      this.batchMergeTo($, [
        ...followingWords(current),
        ...(current?.[`'`] ? nextAposWords(current?.[`'`]) : []),
      ])

      if ($.derive.length) {
        this.mergeNodes($, curr_s$)
        current.$ = $
        this.vocabulary.push($)
      }
    }
  }

  batchMergeTo($: Label, next_$$: Array<Label | undefined>) {
    for (const next_$ of next_$$) {
      if (next_$) {
        this.mergeNodes($, next_$)
      }
    }
  }

  mergeNodes(targetWord: Label, latterWord: Label) {
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
