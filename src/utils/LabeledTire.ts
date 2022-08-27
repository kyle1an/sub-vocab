import { caseOr, hasUppercase, isVowel } from './utils'
import { Char, Label, LabelPre, LabelRow, Sieve, TrieNode } from '@/types'

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
      node = node[(c as Char)] ??= {}
    }

    return node
  }

  path(vocab: Sieve[]) {
    for (const sieve of vocab) {
      const original = sieve.w
      const hasUp = hasUppercase(original)
      const node = this.getNode(hasUp ? original.toLowerCase() : original) as TrieNode<LabelPre>

      if (!node.$) {
        node.$ = {
          w: original,
          up: hasUp,
          src: [],
          vocab: sieve,
        }
      } else {
        const $ = node.$

        if ($.up) {
          if (hasUp) {
            if ($.vocab.rank) {
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
    }

    return this
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
        },
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
    return this.vocabulary
  }

  static formVocabList(vocabulary: Array<Label | null>) {
    const all: LabelRow[] = []

    for (const v of vocabulary) {
      if (!v || v.variant) continue

      all.push({
        src: this.collectNestedSource(v),
        vocab: v.vocab ?? {
          w: v.w,
          acquainted: false,
          is_user: 0,
          invalid: true,
        },
      })
    }

    return all
  }

  static collectNestedSource($: Label) {
    let src: number[][] = [...$.src]

    if ($.derive?.length) {
      for (const d$ of $.derive) {
        const srcFromDerived = this.collectNestedSource(d$)

        if (src.length === 0) {
          src = srcFromDerived
          continue
        }

        if (srcFromDerived[0][3] < src[0][3]) {
          src = srcFromDerived.concat(src)
        } else {
          src = src.concat(srcFromDerived)
        }
      }
    }

    return src
  }

  traverseMerge(layer: TrieNode<Label>) {
    for (const key in layer) {
      if (key === '$') continue
      const innerLayer = layer[key as Char] ?? {}
      // deep first traverse eg: beings(being) vs bee
      this.traverseMerge(innerLayer)
      this.mergeVocabOfDifferentSuffixes(innerLayer, (key as Char), layer)
    }
  }

  mergeVocabOfDifferentSuffixes(current: TrieNode<Label>, previousChar: Char, parentLayer: TrieNode<Label>) {
    const curr_$ = current.$
    const curr_e$ = current.e?.$
    const curr_s$ = previousChar === 's' ? undefined : current.s?.$
    const isTheLastCharConsonant = !isVowel(previousChar)
    const curr_ying$ = isTheLastCharConsonant ? current.y?.i?.n?.g?.$ : undefined

    function followingWords(curr: TrieNode<Label>) {
      const curr_in = curr.i?.n
      const following$ = [
        curr.e?.s?.$,
        curr.e?.d?.$
      ]

      if (curr_in) {
        following$.push(
          curr_in[`'`]?.$,
          curr_in[`’`]?.$,
        )
        const curr_ing = curr_in.g

        if (curr_ing) {
          following$.push(
            curr_ing.$,
            curr_ing.s?.$,
          )
        }
      }

      return following$
    }

    const nextAposWords = (curr_apos: TrieNode<Label>) => [
      curr_apos.s?.$,
      curr_apos.l?.l?.$,
      curr_apos.v?.e?.$,
      curr_apos.d?.$,
    ]

    if (curr_$) {
      this.batchMergeTo(curr_e$ || curr_$, followingWords(current))

      if (isTheLastCharConsonant) {
        if (isVowel(curr_$.w.slice(-2, -1))) {
          // word ends with vowel + consonant
          this.batchMergeTo(curr_$, [
            current[previousChar]?.i?.n?.g?.$,
            current[previousChar]?.e?.d?.$
          ])
        } else if (previousChar === 'y') {
          // word ends with consonant + y
          this.batchMergeTo(curr_$, [
            parentLayer.i?.e?.s?.$,
            parentLayer.i?.e?.d?.$,
          ])
        }
      }

      if (curr_s$) {
        this.mergeNodes(curr_$, curr_s$)
      }

      if (current[`'`]) {
        this.batchMergeTo(curr_$, nextAposWords(current[`'`]))
      }

      if (current[`’`]) {
        this.batchMergeTo(curr_$, nextAposWords(current[`’`]))
      }
    } else if (curr_e$) {
      this.batchMergeTo(curr_e$, followingWords(current))
    } else if (curr_s$) {
      const original = curr_s$.w.slice(0, -1)
      const $ = { w: curr_s$.w.slice(0, -1), src: [], up: hasUppercase(original), derive: [] }
      this.batchMergeTo($, followingWords(current))

      if (current[`'`]) {
        this.batchMergeTo($, nextAposWords(current[`'`]))
      }

      if (current[`’`]) {
        this.batchMergeTo($, nextAposWords(current[`’`]))
      }

      if ($.derive.length) {
        this.mergeNodes($, curr_s$)
        current.$ = $
        this.vocabulary.push($)
      }
    } else if (curr_ying$) {
      const original = curr_ying$.w.slice(0, -3)
      const $ = { w: original, src: [], up: hasUppercase(original), derive: [] }
      this.batchMergeTo($, [
        current.i?.e?.s?.$,
        current.i?.e?.d?.$,
      ])

      if ($.derive.length) {
        this.mergeNodes($, curr_ying$)
        current.y ??= {}
        current.y.$ = $
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
